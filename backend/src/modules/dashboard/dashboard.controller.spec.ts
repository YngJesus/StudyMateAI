import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getDashboardStats: jest.fn(),
    getOverview: jest.fn(),
    getRecentActivity: jest.fn(),
    getStudyStats: jest.fn(),
    getUpcomingItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard stats', async () => {
      const userId = 'test-user-id';
      const mockStats = {
        overview: {
          subjects: 5,
          courses: 10,
          pdfs: 15,
          chatMessages: 20,
          events: 8,
          unreadNotifications: 3,
        },
        recentActivity: [],
        upcomingEvents: [],
        studyStats: {},
        features: [],
      };

      mockDashboardService.getDashboardStats.mockResolvedValue(mockStats);

      const req = { user: { userId } };
      const result = await controller.getDashboard(req);

      expect(result).toEqual(mockStats);
      expect(service.getDashboardStats).toHaveBeenCalledWith(userId);
    });
  });

  describe('getOverview', () => {
    it('should return overview stats', async () => {
      const userId = 'test-user-id';
      const mockOverview = {
        subjects: 5,
        courses: 10,
        pdfs: 15,
        chatMessages: 20,
        events: 8,
        unreadNotifications: 3,
      };

      mockDashboardService.getOverview.mockResolvedValue(mockOverview);

      const req = { user: { userId } };
      const result = await controller.getOverview(req);

      expect(result).toEqual(mockOverview);
      expect(service.getOverview).toHaveBeenCalledWith(userId);
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity with default limit', async () => {
      const userId = 'test-user-id';
      const mockActivity = [
        {
          type: 'pdf_upload',
          title: 'Uploaded PDF',
          description: 'Test PDF',
          timestamp: new Date(),
          icon: '📄',
        },
      ];

      mockDashboardService.getRecentActivity.mockResolvedValue(mockActivity);

      const req = { user: { userId } };
      const result = await controller.getRecentActivity(req, '10');

      expect(result).toEqual(mockActivity);
      expect(service.getRecentActivity).toHaveBeenCalledWith(userId, 10);
    });

    it('should accept custom limit', async () => {
      const userId = 'test-user-id';
      mockDashboardService.getRecentActivity.mockResolvedValue([]);

      const req = { user: { userId } };
      await controller.getRecentActivity(req, '20');

      expect(service.getRecentActivity).toHaveBeenCalledWith(userId, 20);
    });
  });

  describe('getStudyStats', () => {
    it('should return study stats with default days', async () => {
      const userId = 'test-user-id';
      const mockStats = {
        period: 'Last 30 days',
        aiChatInteractions: 45,
        pdfsUploaded: 12,
        eventsCreated: 8,
        subjectBreakdown: [],
        eventTypeBreakdown: {},
        averagePerDay: {
          chats: '1.50',
          pdfs: '0.40',
          events: '0.27',
        },
      };

      mockDashboardService.getStudyStats.mockResolvedValue(mockStats);

      const req = { user: { userId } };
      const result = await controller.getStudyStats(req, '30');

      expect(result).toEqual(mockStats);
      expect(service.getStudyStats).toHaveBeenCalledWith(userId, 30);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming events with default days', async () => {
      const userId = 'test-user-id';
      const mockUpcoming = [
        {
          id: 'event-1',
          title: 'Final Exam',
          type: 'exam',
          date: '2025-12-01',
          daysUntil: 3,
          subject: {
            id: 'subject-1',
            name: 'Mathematics',
            color: '#FF5733',
          },
          urgency: 'urgent',
        },
      ];

      mockDashboardService.getUpcomingItems.mockResolvedValue(mockUpcoming);

      const req = { user: { userId } };
      const result = await controller.getUpcoming(req, '7');

      expect(result).toEqual(mockUpcoming);
      expect(service.getUpcomingItems).toHaveBeenCalledWith(userId, 7);
    });
  });
});
