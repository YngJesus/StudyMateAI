import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
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
  async create(dto: CreateEventDto) {
    // Validate subject exists
    const subject = await this.subjectRepo.findOne({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    // Validate title
    if (dto.title.length < 3 || dto.title.length > 200) {
      throw new BadRequestException(
        'Title must be between 3 and 200 characters',
      );
    }

    // Validate type
    if (!['exam', 'ds', 'assignment'].includes(dto.type)) {
      throw new BadRequestException('Invalid event type');
    }

    // Validate date
    const eventDate = new Date(dto.date);
    if (isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const event = this.eventRepo.create({
      ...dto,
      subject,
    });

    await this.eventRepo.save(event);

    // Return with computed fields
    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // GET ALL WITH FILTERS
  // ------------------------------------------------------------------
  async getAll(filters: EventFiltersDto) {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.subjectId) where.subject = { id: filters.subjectId };

    if (filters.from && filters.to) {
      where.date = Between(filters.from, filters.to);
    }

    const events = await this.eventRepo.find({
      where,
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // GET SINGLE EVENT
  // ------------------------------------------------------------------
  async findOne(id: string) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['subject'],
    });

    if (!event) throw new NotFoundException('Event not found');

    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // UPCOMING EVENTS (NEXT 7 DAYS)
  // ------------------------------------------------------------------
  async getUpcoming() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const events = await this.eventRepo.find({
      where: {
        date: Between(
          today.toISOString().split('T')[0],
          nextWeek.toISOString().split('T')[0],
        ),
      },
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // DATE RANGE FILTER
  // ------------------------------------------------------------------
  async getRange(from: string, to: string) {
    const events = await this.eventRepo.find({
      where: { date: Between(from, to) },
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['subject'],
    });

    if (!event) throw new NotFoundException('Event not found');

    // Validate subject if changed
    if (dto.subjectId) {
      const subject = await this.subjectRepo.findOne({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new BadRequestException('Subject not found');
      }
      event.subject = subject;
    }

    // Update fields
    Object.assign(event, dto);

    await this.eventRepo.save(event);

    return this.formatEvent(event);
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const event = await this.eventRepo.findOne({ where: { id } });

    if (!event) throw new NotFoundException('Event not found');

    await this.eventRepo.delete(id);

    return { message: 'Event deleted successfully' };
  }

  // ------------------------------------------------------------------
  // Helper: Calculate Days Until
  // ------------------------------------------------------------------
  private calculateDaysUntil(date: string) {
    const eventDate = new Date(date);
    const today = new Date();

    const diffTime =
      eventDate.getTime() - new Date(today.toDateString()).getTime();

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
      description: event.description,
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
