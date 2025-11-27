export class DashboardOverviewDto {
  subjects: number;
  courses: number;
  pdfs: number;
  chatMessages: number;
  events: number;
  unreadNotifications: number;
}

export class ActivityItemDto {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export class UpcomingEventDto {
  id: string;
  title: string;
  type: string;
  date: string;
  daysUntil: number;
  subject: {
    id: string;
    name: string;
    color: string;
  } | null;
  urgency: string;
}

export class StudyStatsDto {
  period: string;
  aiChatInteractions: number;
  pdfsUploaded: number;
  eventsCreated: number;
  subjectBreakdown: Array<{
    name: string;
    color: string;
    coursesCount: number;
    pdfsCount: number;
  }>;
  eventTypeBreakdown: Record<string, number>;
  averagePerDay: {
    chats: string;
    pdfs: string;
    events: string;
  };
}

export class FeatureDto {
  name: string;
  description: string;
  endpoint: string;
  icon: string;
  features: string[];
  aiModel?: string;
}

export class DashboardStatsDto {
  overview: DashboardOverviewDto;
  recentActivity: ActivityItemDto[];
  upcomingEvents: UpcomingEventDto[];
  studyStats: StudyStatsDto;
  features: FeatureDto[];
}
