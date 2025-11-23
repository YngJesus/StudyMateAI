import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Course } from '../../courses/entities/course.entity';

@Entity({ name: 'pdfs' })
export class Pdf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  fileName: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  // Use string because many DB drivers return BIGINT as string
  @Column({ type: 'bigint' })
  fileSize: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb" })
  tags?: string[];

  @Column({ type: 'uuid' })
  courseId: string;

  @ApiHideProperty()
  @ManyToOne(() => Course, (course) => course.pdfs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  uploadDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAccessed?: Date;
}
