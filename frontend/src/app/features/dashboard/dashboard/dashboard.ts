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
    {
      label: 'Subjects',
      key: 'subjects',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconPath:
        'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      label: 'Courses',
      key: 'courses',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      iconPath:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'PDFs',
      key: 'pdfs',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconPath:
        'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    },
    {
      label: 'Chat Messages',
      key: 'chatMessages',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      iconPath:
        'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      label: 'Events',
      key: 'events',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      iconPath:
        'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      label: 'Notifications',
      key: 'unreadNotifications',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      iconPath:
        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
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
