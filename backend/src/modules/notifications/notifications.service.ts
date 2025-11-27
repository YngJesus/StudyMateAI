import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { Event } from '../events/entities/event.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    private readonly gateway: NotificationsGateway,
  ) {}

  // -------------------------------------------------------
  // CREATE NOTIFICATION
  // -------------------------------------------------------
  async create(userId: string, dto: CreateNotificationDto) {
    let event: Event | null = null;

    if (dto.eventId) {
      event = await this.eventRepo.findOne({
        where: { id: dto.eventId, userId },
      });

      if (!event) {
        throw new BadRequestException(
          'Event not found or does not belong to this user',
        );
      }
    }

    const notif = this.notificationRepo.create({
      userId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      eventId: dto.eventId ?? null,
    } as Partial<Notification>);

    const saved = await this.notificationRepo.save(notif);
    this.gateway.emitToUser(userId, 'notification:new', saved);

    return saved;
  }

  // -------------------------------------------------------
  // GET ALL NOTIFICATIONS (WITH FILTERS)
  // -------------------------------------------------------
  async getAll(userId: string, filters: NotificationFiltersDto) {
    const where: any = { userId };

    if (filters.unreadOnly === true) where.isRead = false;

    if (filters.type) where.type = filters.type;

    const queryOptions: any = {
      where,
      order: { createdAt: 'DESC' },
    };

    if (filters.limit) queryOptions.take = filters.limit;

    queryOptions.relations = ['event', 'event.subject']; // ✅ Load event details

    return this.notificationRepo.find(queryOptions);
  }

  // -------------------------------------------------------
  // MARK AS READ
  // -------------------------------------------------------
  async markAsRead(userId: string, id: string) {
    const notif = await this.notificationRepo.findOne({
      where: { id },
    });

    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.userId !== userId) throw new ForbiddenException();

    notif.isRead = true;

    return this.notificationRepo.save(notif);
  }

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------
  async delete(userId: string, id: string) {
    const notif = await this.notificationRepo.findOne({
      where: { id },
    });

    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.userId !== userId) throw new ForbiddenException();

    await this.notificationRepo.remove(notif);

    return { message: 'Notification deleted successfully' };
  }

  // -------------------------------------------------------
  // GET UNREAD COUNT
  // -------------------------------------------------------
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  // -------------------------------------------------------
  // MARK ALL AS READ
  // -------------------------------------------------------
  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }

  // -------------------------------------------------------
  // CLEAR ALL NOTIFICATIONS
  // -------------------------------------------------------
  async clearAll(userId: string) {
    await this.notificationRepo.delete({ userId });
    return { message: 'All notifications cleared' };
  }
}
