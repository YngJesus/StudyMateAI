import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, Notifications],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  pageTitle = signal('Dashboard');
  currentTime = signal(new Date());

  constructor(private router: Router) {
    // Update page title based on route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.getPageTitle(this.router.url))
      )
      .subscribe((title) => this.pageTitle.set(title));

    // Update time every second
    setInterval(() => this.currentTime.set(new Date()), 1000);
  }

  private getPageTitle(url: string): string {
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('subjects')) return 'My Subjects';
    if (url.includes('chat')) return 'AI Chat';
    if (url.includes('calendar')) return 'Calendar';
    if (url.includes('profile')) return 'Profile';
    return 'StudyMate AI';
  }

  get formattedTime(): string {
    const date = this.currentTime();
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get formattedDate(): string {
    const date = this.currentTime();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
