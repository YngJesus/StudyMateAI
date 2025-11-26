import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFiltersDto } from './dto/event-filters.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  // ------------------------------------------------------------------
  // CREATE EVENT
  // ------------------------------------------------------------------
  async create(userId: string, dto: CreateEventDto) {
    // ✅ FIXED: Query through relation
    const subject = await this.subjectRepo.findOne({
      where: {
        id: dto.subjectId,
        user: { id: userId },
      },
    });

    if (!subject) {
      throw new BadRequestException(
        'Subject not found or does not belong to you',
      );
    }

    // Validate date format
    const eventDate = new Date(dto.date);
    if (isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const event = this.eventRepo.create({
      ...dto,
      userId,
      subject,
    });

    await this.eventRepo.save(event);

    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // GET ALL WITH FILTERS
  // ------------------------------------------------------------------
  async getAll(userId: string, filters: EventFiltersDto) {
    const where: any = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.subjectId) where.subject = { id: filters.subjectId };
    if (filters.date) where.date = filters.date;

    if (filters.from && filters.to) {
      where.date = Between(filters.from, filters.to);
    }

    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      where.date = Between(today, '2099-12-31');
    }

    const queryOptions: any = {
      where,
      relations: ['subject'],
      order: { date: 'ASC' },
    };

    if (filters.limit) {
      queryOptions.take = filters.limit;
    }

    const events = await this.eventRepo.find(queryOptions);

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // GET SINGLE EVENT
  // ------------------------------------------------------------------
  async findOne(userId: string, id: string) {
    const event = await this.eventRepo.findOne({
      where: { id, userId },
      relations: ['subject'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // UPCOMING EVENTS (NEXT 7 DAYS)
  // ------------------------------------------------------------------
  async getUpcoming(userId: string, days: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    const events = await this.eventRepo.find({
      where: {
        userId,
        date: Between(todayStr, futureStr),
      },
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // DATE RANGE FILTER
  // ------------------------------------------------------------------
  async getRange(userId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('"from" date must be before "to" date');
    }

    const events = await this.eventRepo.find({
      where: {
        userId,
        date: Between(from, to),
      },
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(userId: string, id: string, dto: UpdateEventDto) {
    const event = await this.eventRepo.findOne({
      where: { id, userId },
      relations: ['subject'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // ✅ FIXED: Query through relation
    if (dto.subjectId && dto.subjectId !== event.subjectId) {
      const subject = await this.subjectRepo.findOne({
        where: {
          id: dto.subjectId,
          user: { id: userId },
        },
      });
      if (!subject) {
        throw new BadRequestException(
          'Subject not found or does not belong to you',
        );
      }
      event.subject = subject;
    }

    if (dto.date) {
      const eventDate = new Date(dto.date);
      if (isNaN(eventDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    Object.assign(event, dto);

    await this.eventRepo.save(event);

    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async remove(userId: string, id: string) {
    const event = await this.eventRepo.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventRepo.remove(event);

    return { message: 'Event deleted successfully' };
  }

  // ------------------------------------------------------------------
  // Helper: Calculate Days Until
  // ------------------------------------------------------------------
  private calculateDaysUntil(date: string): number {
    const eventDate = new Date(date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ------------------------------------------------------------------
  // Helper: Format Returned Event
  // ------------------------------------------------------------------
  private formatEvent(event: Event) {
    const daysUntil = this.calculateDaysUntil(event.date);
    const isPast = daysUntil < 0;

    return {
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date,
      description: event.description || null,
      subject: {
        id: event.subject.id,
        name: event.subject.name,
        color: event.subject.color,
      },
      daysUntil,
      isPast,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
