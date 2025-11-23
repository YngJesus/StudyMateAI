import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { User } from '../../../user/entities/user.entity';
import { Pdf } from '../../pdfs/entities/pdf.entity';

@Entity('chat_history')
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'uuid', nullable: true })
  pdfFileId: string | null;

  @ApiHideProperty()
  @ManyToOne(() => Pdf, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'pdfFileId' })
  pdfFile: Pdf | null;

  @Column({ type: 'uuid' })
  userId: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
