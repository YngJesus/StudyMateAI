import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * Runs every day at 8:00 AM
   * Creates notifications for events at different intervals:
   * - 7 days before (INFO)
   * - 3 days before (WARNING)
   * - 1 day before (WARNING)
   * - Day of event (URGENT)
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkUpcomingEvents() {
    this.logger.log('🔔 Running notification cron job...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate target dates
    const tomorrow = this.addDays(today, 1);
    const threeDays = this.addDays(today, 3);
    const sevenDays = this.addDays(today, 7);

    try {
      let totalCreated = 0;

      // Events happening TODAY (URGENT)
      const todayEvents = await this.findEventsByDate(today);
      for (const event of todayEvents) {
        const created = await this.createNotification(
          event,
          NotificationType.URGENT,
          '🔴 TODAY',
          'is happening TODAY!',
          0,
        );
        if (created) totalCreated++;
      }

      // Events happening TOMORROW (WARNING)
      const tomorrowEvents = await this.findEventsByDate(tomorrow);
      for (const event of tomorrowEvents) {
        const created = await this.createNotification(
          event,
          NotificationType.WARNING,
          '⚠️ TOMORROW',
          'is happening TOMORROW! Final preparations!',
          1,
        );
        if (created) totalCreated++;
      }

      // Events happening in 3 DAYS (WARNING)
      const threeDaysEvents = await this.findEventsByDate(threeDays);
      for (const event of threeDaysEvents) {
        const created = await this.createNotification(
          event,
          NotificationType.WARNING,
          '📌 IN 3 DAYS',
          'is in 3 days. Time to prepare intensively!',
          3,
        );
        if (created) totalCreated++;
      }

      // Events happening in 7 DAYS (INFO)
      const sevenDaysEvents = await this.findEventsByDate(sevenDays);
      for (const event of sevenDaysEvents) {
        const created = await this.createNotification(
          event,
          NotificationType.INFO,
          '📅 IN 1 WEEK',
          'is in 1 week. Start preparing now!',
          7,
        );
        if (created) totalCreated++;
      }

      this.logger.log(
        `✅ Created ${totalCreated} notifications: ` +
          `Today: ${todayEvents.length}, ` +
          `Tomorrow: ${tomorrowEvents.length}, ` +
          `+3 days: ${threeDaysEvents.length}, ` +
          `+7 days: ${sevenDaysEvents.length}`,
      );
    } catch (error) {
      this.logger.error('❌ Error in notification cron job:', error);
    }
  }

  /**
   * Find events by specific date
   */
  private async findEventsByDate(date: Date): Promise<Event[]> {
    const dateStr = this.formatDate(date);
    return await this.eventRepo.find({
      where: { date: dateStr },
      relations: ['subject', 'user'],
    });
  }

  /**
   * Create notification for an event
   * Returns true if created, false if duplicate
   */
  private async createNotification(
    event: Event,
    type: NotificationType,
    timingLabel: string,
    messageEnding: string,
    daysAhead: number,
  ): Promise<boolean> {
    // Check if this exact notification was already created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.eventId = :eventId', { eventId: event.id })
      .andWhere('notification.userId = :userId', { userId: event.userId })
      .andWhere('notification.type = :type', { type })
      .andWhere('notification.createdAt >= :start', { start: todayStart })
      .andWhere('notification.createdAt <= :end', { end: todayEnd })
      .getOne();

    if (existing) {
      this.logger.debug(
        `⏭️  Skipping duplicate notification for event ${event.id} (${timingLabel})`,
      );
      return false;
    }

    // Construct notification
    const eventTypeEmoji = this.getEventTypeEmoji(event.type);
    const title = `${timingLabel}: ${eventTypeEmoji} ${event.type.toUpperCase()}`;
    const message = `${event.title} (${event.subject?.name || 'Subject'}) ${messageEnding}`;

    const notification = this.notificationRepo.create({
      userId: event.userId,
      title,
      message,
      type,
      eventId: event.id,
    });

    const saved = await this.notificationRepo.save(notification);

    // Emit real-time notification via WebSocket
    this.gateway.emitToUser(event.userId, 'notification:new', {
      ...saved,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        subject: event.subject
          ? {
              id: event.subject.id,
              name: event.subject.name,
              color: event.subject.color,
            }
          : null,
      },
    });

    this.logger.debug(
      `✅ Created notification for user ${event.userId}: ${title}`,
    );

    return true;
  }

  /**
   * Get emoji for event type
   */
  private getEventTypeEmoji(type: string): string {
    switch (type.toLowerCase()) {
      case 'exam':
        return '📝';
      case 'ds':
        return '📋';
      case 'assignment':
        return '📄';
      default:
        return '📅';
    }
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Manual trigger for testing
   */
  async triggerManually() {
    this.logger.log('🔧 Manually triggering notification check...');
    await this.checkUpcomingEvents();
    return { message: 'Cron job executed manually', timestamp: new Date() };
  }
}
