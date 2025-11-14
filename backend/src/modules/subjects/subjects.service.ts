import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
  ) {}
  /**
   * Create a subject attached to a user
   * @param userId id of the owner
   */
  async create(userId: string, createSubjectDto: CreateSubjectDto) {
    const subject = this.subjectRepository.create({
      ...createSubjectDto,
      user: { id: userId } as any,
    });

    return this.subjectRepository.save(subject);
  }

  /**
   * Find all subjects owned by a user
   */
  async findAll(userId: string) {
    return this.subjectRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one subject by id (only used internally / for completeness)
   */
  async findOne(id: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  /**
   * Update a subject only if it belongs to the user
   */
  async update(userId: string, updateSubjectDto: UpdateSubjectDto, id: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subject) throw new NotFoundException('Subject not found');
    if (!subject.user || subject.user.id !== userId)
      throw new ForbiddenException('You do not own this subject');

    Object.assign(subject, updateSubjectDto);

    return this.subjectRepository.save(subject);
  }

  /**
   * Remove a subject only if it belongs to the user
   */
  async remove(userId: string, id: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subject) throw new NotFoundException('Subject not found');
    if (!subject.user || subject.user.id !== userId)
      throw new ForbiddenException('You do not own this subject');

    await this.subjectRepository.remove(subject);
    return { success: true };
  }
}
