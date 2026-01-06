import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

interface NavItem {
  label: string;
  iconPath: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  currentUser = computed(() => this.authService.currentUser());

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      iconPath:
        'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/dashboard',
    },
    {
      label: 'Subjects',
      iconPath:
        'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      route: '/subjects',
    },
    {
      label: 'AI Chat',
      iconPath:
        'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      route: '/chat',
    },
    {
      label: 'Calendar',
      iconPath:
        'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      route: '/calendar',
    },
    {
      label: 'Profile',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      route: '/profile',
    },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }

  trackByRoute(index: number, item: NavItem): string {
    return item.route;
  }
}
