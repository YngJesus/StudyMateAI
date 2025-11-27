import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Event } from 'src/modules/events/entities/event.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @Column()
  fullName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  longestStreak: number;

  @ApiHideProperty()
  @OneToMany(() => Subject, (subject) => subject.user)
  subjects: Subject[];

  @ApiHideProperty()
  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
