import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, CreateNotificationDto } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.Backend}/api/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  isLoading = signal(false);

  constructor(private http: HttpClient) {
    // Poll for new notifications every 30 seconds
    interval(30000).subscribe(() => {
      this.loadNotifications().subscribe();
      this.loadUnreadCount().subscribe();
    });
  }

  /**
   * Load all notifications
   */
  loadNotifications(limit?: number, unreadOnly?: boolean): Observable<Notification[]> {
    this.isLoading.set(true);
    let url = this.apiUrl;
    const params: string[] = [];

    if (limit) params.push(`limit=${limit}`);
    if (unreadOnly) params.push('unreadOnly=true');

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<Notification[]>(url).pipe(
      tap((notifications) => {
        this.notifications.set(notifications);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Load unread count
   */
  loadUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      tap((result) => {
        this.unreadCount.set(result.count);
      })
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap((updated) => {
        this.notifications.update((current) => current.map((n) => (n.id === id ? updated : n)));
        this.unreadCount.update((count) => Math.max(0, count - 1));
      })
    );
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update((current) => current.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      })
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notifications.update((current) => current.filter((n) => n.id !== id));
      })
    );
  }

  /**
   * Clear all notifications
   */
  clearAll(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      })
    );
  }
}
