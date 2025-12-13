import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface DashboardStats {
  overview: {
    subjects: number;
    courses: number;
    pdfs: number;
    chatMessages: number;
    events: number;
    unreadNotifications: number;
  };
  recentActivity: any[];
  upcomingEvents: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  statCards = [
    { label: 'Subjects', key: 'subjects', icon: '📚', color: 'bg-blue-500' },
    { label: 'Courses', key: 'courses', icon: '📖', color: 'bg-green-500' },
    { label: 'PDFs', key: 'pdfs', icon: '📄', color: 'bg-purple-500' },
    { label: 'Chat Messages', key: 'chatMessages', icon: '💬', color: 'bg-pink-500' },
    { label: 'Events', key: 'events', icon: '📅', color: 'bg-yellow-500' },
    { label: 'Notifications', key: 'unreadNotifications', icon: '🔔', color: 'bg-red-500' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.http.get<DashboardStats>(`${environment.Backend}/api/dashboard`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.isLoading.set(false);
      },
    });
  }

  getStatValue(key: string): number {
    return (this.stats()?.overview as any)?.[key] || 0;
  }
}
