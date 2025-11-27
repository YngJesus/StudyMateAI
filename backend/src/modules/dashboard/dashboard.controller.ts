import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard) // ✅ Apply guard to entire controller
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard
   * Returns comprehensive dashboard statistics
   */
  @Get()
  async getDashboard(@Request() req) {
    const userId = req.user.userId;
    return this.dashboardService.getDashboardStats(userId);
  }

  /**
   * GET /dashboard/overview
   * Returns quick overview stats
   */
  @Get('overview')
  async getOverview(@Request() req) {
    const userId = req.user.userId;
    return this.dashboardService.getOverview(userId);
  }

  /**
   * GET /dashboard/activity
   * Returns recent activity across all features
   */
  @Get('activity')
  async getRecentActivity(
    @Request() req,
    @Query('limit') limit: string = '10',
  ) {
    const userId = req.user.userId;
    return this.dashboardService.getRecentActivity(userId, parseInt(limit));
  }

  /**
   * GET /dashboard/study-stats
   * Returns study-related statistics
   */
  @Get('study-stats')
  async getStudyStats(@Request() req, @Query('days') days: string = '30') {
    const userId = req.user.userId;
    return this.dashboardService.getStudyStats(userId, parseInt(days));
  }

  /**
   * GET /dashboard/upcoming
   * Returns upcoming events and deadlines
   */
  @Get('upcoming')
  async getUpcoming(@Request() req, @Query('days') days: string = '7') {
    const userId = req.user.userId;
    return this.dashboardService.getUpcomingItems(userId, parseInt(days));
  }
}
