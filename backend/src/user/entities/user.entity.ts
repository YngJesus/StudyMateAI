import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { ApiHideProperty } from '@nestjs/swagger';

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
}
