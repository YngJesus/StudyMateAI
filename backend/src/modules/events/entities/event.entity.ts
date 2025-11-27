import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum EventType {
  EXAM = 'exam',
  DS = 'ds',
  ASSIGNMENT = 'assignment',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  // stores only the date (no time)
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // explicit FK columns
  @Column('uuid')
  subjectId: string;

  @ManyToOne(() => Subject, (subject) => subject.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Notification, (notification) => notification.event)
  notifications: Notification[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
