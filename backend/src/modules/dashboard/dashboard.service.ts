import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Course } from '../courses/entities/course.entity';
import { Pdf } from '../pdfs/entities/pdf.entity';
import { ChatHistory } from '../chat/entities/chat-history.entity';
import { Event } from '../events/entities/event.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Pdf)
    private readonly pdfRepo: Repository<Pdf>,

    @InjectRepository(ChatHistory)
    private readonly chatRepo: Repository<ChatHistory>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Main Dashboard Statistics
   */
  async getDashboardStats(userId: string) {
    const [
      totalSubjects,
      totalCourses,
      totalPdfs,
      totalChats,
      totalEvents,
      unreadNotifications,
      recentActivity,
      upcomingEvents,
      studyStats,
    ] = await Promise.all([
      this.getTotalSubjects(userId),
      this.getTotalCourses(userId),
      this.getTotalPdfs(userId),
      this.getTotalChats(userId),
      this.getTotalEvents(userId),
      this.getUnreadNotifications(userId),
      this.getRecentActivity(userId, 5),
      this.getUpcomingItems(userId, 7),
      this.getStudyStats(userId, 30),
    ]);

    return {
      overview: {
        subjects: totalSubjects,
        courses: totalCourses,
        pdfs: totalPdfs,
        chatMessages: totalChats,
        events: totalEvents,
        unreadNotifications,
      },
      recentActivity,
      upcomingEvents,
      studyStats,
      features: this.getAvailableFeatures(),
    };
  }

  /**
   * Quick Overview Stats
   */
  async getOverview(userId: string) {
    const [subjects, courses, pdfs, chats, events, notifications] =
      await Promise.all([
        this.getTotalSubjects(userId),
        this.getTotalCourses(userId),
        this.getTotalPdfs(userId),
        this.getTotalChats(userId),
        this.getTotalEvents(userId),
        this.getUnreadNotifications(userId),
      ]);

    return {
      subjects,
      courses,
      pdfs,
      chatMessages: chats,
      events,
      unreadNotifications: notifications,
    };
  }

  /**
   * Get total subjects count
   */
  private async getTotalSubjects(userId: string): Promise<number> {
    return this.subjectRepo.count({
      where: { user: { id: userId } },
    });
  }

  /**
   * Get total courses count
   */
  private async getTotalCourses(userId: string): Promise<number> {
    return this.courseRepo.count({
      where: { subject: { user: { id: userId } } },
    });
  }

  /**
   * Get total PDFs count
   */
  private async getTotalPdfs(userId: string): Promise<number> {
    return this.pdfRepo.count({
      where: { course: { subject: { user: { id: userId } } } },
    });
  }

  /**
   * Get total chat messages count
   */
  private async getTotalChats(userId: string): Promise<number> {
    return this.chatRepo.count({
      where: { userId },
    });
  }

  /**
   * Get total events count
   */
  private async getTotalEvents(userId: string): Promise<number> {
    return this.eventRepo.count({
      where: { userId },
    });
  }

  /**
   * Get unread notifications count
   */
  private async getUnreadNotifications(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Get recent activity across all features
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    const activities: any[] = [];

    // Recent PDFs uploaded
    const recentPdfs = await this.pdfRepo.find({
      where: { course: { subject: { user: { id: userId } } } },
      relations: ['course', 'course.subject'],
      order: { uploadDate: 'DESC' },
      take: limit,
    });

    recentPdfs.forEach((pdf) => {
      activities.push({
        type: 'pdf_upload',
        title: `Uploaded PDF: ${pdf.fileName}`,
        description: `To course: ${pdf.course.name}`,
        timestamp: pdf.uploadDate,
        icon: '📄',
      });
    });

    // Recent chat sessions
    const recentChats = await this.chatRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    recentChats.forEach((chat) => {
      activities.push({
        type: 'chat',
        title: 'AI Chat Interaction',
        description: chat.message.substring(0, 50) + '...',
        timestamp: chat.createdAt,
        icon: '💬',
      });
    });

    // Recent events created
    const recentEvents = await this.eventRepo.find({
      where: { userId },
      relations: ['subject'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    recentEvents.forEach((event) => {
      activities.push({
        type: 'event',
        title: `Event: ${event.title}`,
        description: `${event.type} on ${event.date}`,
        timestamp: event.createdAt,
        icon: event.type === 'exam' ? '📝' : '📅',
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get upcoming events and deadlines
   */
  async getUpcomingItems(userId: string, days: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    const upcomingEvents = await this.eventRepo.find({
      where: {
        userId,
        date: Between(todayStr, futureStr),
      },
      relations: ['subject'],
      order: { date: 'ASC' },
    });

    return upcomingEvents.map((event) => {
      const daysUntil = this.calculateDaysUntil(event.date);
      return {
        id: event.id,
        title: event.title,
        type: event.type,
        date: event.date,
        daysUntil,
        subject: event.subject
          ? {
              id: event.subject.id,
              name: event.subject.name,
              color: event.subject.color,
            }
          : null,
        urgency: this.getUrgencyLevel(daysUntil),
      };
    });
  }

  /**
   * Get study statistics for a given period
   */
  async getStudyStats(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [chatsInPeriod, pdfsInPeriod, eventsInPeriod, subjects] =
      await Promise.all([
        this.chatRepo.count({
          where: {
            userId,
            createdAt: MoreThanOrEqual(since),
          },
        }),
        this.pdfRepo.count({
          where: {
            course: { subject: { user: { id: userId } } },
            uploadDate: MoreThanOrEqual(since),
          },
        }),
        this.eventRepo.count({
          where: {
            userId,
            createdAt: MoreThanOrEqual(since),
          },
        }),
        this.subjectRepo.find({
          where: { user: { id: userId } },
          relations: ['courses', 'courses.pdfs'],
        }),
      ]);

    // Calculate subject breakdown
    const subjectBreakdown = subjects.map((subject) => ({
      name: subject.name,
      color: subject.color,
      coursesCount: subject.courses?.length || 0,
      pdfsCount:
        subject.courses?.reduce((acc, course) => {
          return acc + (course.pdfs?.length || 0);
        }, 0) || 0,
    }));

    // Get event type breakdown
    const events = await this.eventRepo.find({
      where: { userId },
    });

    const eventTypeBreakdown = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      period: `Last ${days} days`,
      aiChatInteractions: chatsInPeriod,
      pdfsUploaded: pdfsInPeriod,
      eventsCreated: eventsInPeriod,
      subjectBreakdown,
      eventTypeBreakdown,
      averagePerDay: {
        chats: (chatsInPeriod / days).toFixed(2),
        pdfs: (pdfsInPeriod / days).toFixed(2),
        events: (eventsInPeriod / days).toFixed(2),
      },
    };
  }

  /**
   * Get list of available features in the backend
   */
  private getAvailableFeatures() {
    return [
      {
        name: 'Authentication & Authorization',
        description: 'JWT-based user authentication with secure login/signup',
        endpoint: '/auth',
        icon: '🔐',
        features: ['Login', 'Signup', 'JWT Tokens', 'Password Hashing'],
      },
      {
        name: 'User Management',
        description: 'Complete user profile management system',
        endpoint: '/user',
        icon: '👤',
        features: [
          'Profile Management',
          'Update Password',
          'Delete Account',
          'User Info',
        ],
      },
      {
        name: 'Subjects Management',
        description: 'Organize your study materials by subject',
        endpoint: '/subjects',
        icon: '📚',
        features: ['Create Subjects', 'Edit Subjects', 'Delete Subjects'],
      },
      {
        name: 'Courses Management',
        description: 'Manage courses within subjects',
        endpoint: '/courses',
        icon: '📖',
        features: [
          'Create Courses',
          'Update Courses',
          'Delete Courses',
          'Course Ordering',
        ],
      },
      {
        name: 'PDF Management',
        description: 'Upload, organize and manage study PDFs',
        endpoint: '/pdfs',
        icon: '📄',
        features: [
          'Upload PDFs',
          'Download PDFs',
          'PDF Metadata',
          'Tag System',
          'File Storage',
        ],
      },
      {
        name: 'AI Chat Assistant',
        description:
          'Powered by Groq AI - Ask questions, generate quizzes, summarize PDFs',
        endpoint: '/chat',
        icon: '🤖',
        features: [
          'AI-Powered Conversations',
          'PDF Context Analysis',
          'Quiz Generation',
          'Study Summaries',
          'Chat History',
          'Session Management',
        ],
        aiModel: 'llama-3.3-70b-versatile',
      },
      {
        name: 'Events & Calendar',
        description: 'Track exams, assignments, and study deadlines',
        endpoint: '/events',
        icon: '📅',
        features: [
          'Create Events',
          'Event Types (Exam/Assignment/Other)',
          'Date Filters',
          'Upcoming Events',
          'Subject Association',
        ],
      },
      {
        name: 'Notifications System',
        description: 'Real-time notifications with WebSocket support',
        endpoint: '/notifications',
        icon: '🔔',
        features: [
          'Real-time WebSocket Notifications',
          'Notification Types',
          'Read/Unread Status',
          'Event Reminders',
          'Mark as Read',
        ],
      },
      {
        name: 'Dashboard & Analytics',
        description: 'Comprehensive dashboard with statistics and insights',
        endpoint: '/dashboard',
        icon: '📊',
        features: [
          'Usage Statistics',
          'Recent Activity',
          'Upcoming Events',
          'Study Analytics',
          'Subject Breakdown',
        ],
      },
    ];
  }

  /**
   * Calculate days until a date
   */
  private calculateDaysUntil(date: string): number {
    const eventDate = new Date(date);
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get urgency level based on days until
   */
  private getUrgencyLevel(daysUntil: number): string {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil === 0) return 'today';
    if (daysUntil === 1) return 'tomorrow';
    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  }
}
