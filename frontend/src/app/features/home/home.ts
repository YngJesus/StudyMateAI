import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly environment = environment;
  showUserMenu = signal(false);

  constructor(public authService: AuthService) {}

  toggleUserMenu(): void {
    this.showUserMenu.update((value) => !value);
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
  }
}
