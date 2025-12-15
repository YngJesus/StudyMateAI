import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  showDropdown = signal(false);

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.loadNotifications(10, false).subscribe();
    this.notificationService.loadUnreadCount().subscribe();
  }

  toggleDropdown(): void {
    this.showDropdown.update((v) => !v);
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe();
  }

  clearAll(): void {
    if (confirm('Clear all notifications?')) {
      this.notificationService.clearAll().subscribe();
    }
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'event-reminder': '📅',
      deadline: '⏰',
      assignment: '📝',
      system: '⚙️',
      achievement: '🏆',
    };
    return icons[type] || '📌';
  }
}
