import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsCronService } from './notifications-cron.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsCronService: NotificationsCronService,
  ) {}

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Create a notification manually' })
  create(@Req() req, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.userId, dto);
  }

  // -------------------------------------------------------
  // GET ALL (WITH FILTERS)
  // -------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Get all notifications (with filters)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'unreadOnly', required: false })
  @ApiQuery({ name: 'type', required: false })
  getAll(@Req() req, @Query() filters: NotificationFiltersDto) {
    return this.notificationsService.getAll(req.user.userId, filters);
  }

  // -------------------------------------------------------
  // MARK AS READ
  // -------------------------------------------------------
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  delete(@Req() req, @Param('id') id: string) {
    return this.notificationsService.delete(req.user.userId, id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Req() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications' })
  clearAll(@Req() req) {
    return this.notificationsService.clearAll(req.user.userId);
  }

  // -------------------------------------------------------
  // TRIGGER CRON JOB MANUALLY (FOR TESTING)
  // -------------------------------------------------------
  @Post('cron/trigger')
  @ApiOperation({
    summary: 'Manually trigger the cron job to check for upcoming events',
  })
  triggerCron() {
    return this.notificationsCronService.triggerManually();
  }
}
