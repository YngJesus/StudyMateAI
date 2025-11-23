import { Course } from 'src/modules/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '#3498db' })
  color: string;

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  professor: string;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.subjects, { onDelete: 'CASCADE' })
  user: User;

  @ApiHideProperty()
  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];

  @CreateDateColumn()
  createdAt: Date;
}
