import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/modules/events/entities/event.entity';

export enum NotificationType {
  URGENT = 'urgent', // 🔴 Event TODAY
  WARNING = 'warning', // ⚠️ Event TOMORROW
  INFO = 'info', // ℹ️ General info
}

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  // --- USER RELATION ---

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // --- EVENT RELATION (optional) ---

  @Column({ type: 'uuid', nullable: true })
  eventId?: string;

  @ManyToOne(() => Event, (event) => event.notifications, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event?: Event;

  @CreateDateColumn()
  createdAt: Date;
}
