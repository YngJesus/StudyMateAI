import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsCronService } from './notifications-cron.service';
import { Notification } from './entities/notification.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Event, User]),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsCronService,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
