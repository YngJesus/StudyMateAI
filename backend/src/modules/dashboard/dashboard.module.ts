import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'src/user/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Course } from '../courses/entities/course.entity';
import { Pdf } from '../pdfs/entities/pdf.entity';
import { ChatHistory } from '../chat/entities/chat-history.entity';
import { Event } from '../events/entities/event.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Subject,
      Course,
      Pdf,
      ChatHistory,
      Event,
      Notification,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
