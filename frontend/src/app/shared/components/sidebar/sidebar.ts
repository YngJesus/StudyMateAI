import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

interface NavItem {
  label: string;
  icon: string;
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
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Subjects', icon: '📚', route: '/subjects' },
    { label: 'AI Chat', icon: '🤖', route: '/chat' },
    { label: 'Calendar', icon: '📅', route: '/calendar' },
    { label: 'Profile', icon: '👤', route: '/profile' },
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
