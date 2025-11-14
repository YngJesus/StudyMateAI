import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
  ) {}

  async create(userId: string, createCourseDto: CreateCourseDto) {
    const subject = await this.subjectRepository.findOne({
      where: { id: createCourseDto.subjectId },
      relations: ['user'],
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this subject');
    }
    const course = this.courseRepository.create({
      ...createCourseDto,
      subject,
    });
    return await this.courseRepository.save(course);
  }

  async findAll(userId: string, subjectId: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: ['user'],
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this subject');
    }
    return await this.courseRepository.find({
      where: { subject: { id: subjectId } },
      order: { orderNumber: 'ASC', createdAt: 'DESC' },
    });
  }

  async update(userId: string, id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['subject', 'subject.user'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this course');
    }

    // If subject change is requested, validate ownership of the new subject
    if (
      updateCourseDto.subjectId &&
      updateCourseDto.subjectId !== course.subject.id
    ) {
      const newSubject = await this.subjectRepository.findOne({
        where: { id: updateCourseDto.subjectId },
        relations: ['user'],
      });
      if (!newSubject) {
        throw new NotFoundException('Subject not found');
      }
      if (newSubject.user.id !== userId) {
        throw new ForbiddenException(
          'You do not have access to the new subject',
        );
      }
      course.subject = newSubject;
    }

    // Apply other updates
    Object.assign(course, updateCourseDto);
    // Ensure we don't accidentally set a raw subjectId property on the entity
    if ((course as any).subjectId) {
      delete (course as any).subjectId;
    }

    return await this.courseRepository.save(course);
  }

  async remove(userId: string, id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['subject', 'subject.user'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.subject.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this course');
    }

    await this.courseRepository.remove(course);
    return { success: true };
  }
}
