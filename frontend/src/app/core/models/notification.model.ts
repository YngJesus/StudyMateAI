export interface Notification {
  id: string;
  userId: string;
  type: 'event-reminder' | 'deadline' | 'assignment' | 'system' | 'achievement';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface CreateNotificationDto {
  type: Notification['type'];
  title: string;
  message: string;
  relatedId?: string;
}
