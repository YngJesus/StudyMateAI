import { Pdf } from 'src/modules/pdfs/entities/pdf.entity';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  orderNumber: number;

  @ApiHideProperty()
  @ManyToOne(() => Subject, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  subject: Subject;

  @ApiHideProperty()
  @OneToMany(() => Pdf, (pdf) => pdf.course)
  pdfs: Pdf[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastStudied: Date;
}
