// frontend/src/app/features/profile/profile/profile.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private apiUrl = `${environment.Backend}/api/profile`;

  showEditModal = signal(false);
  showPasswordModal = signal(false);

  // Form data
  editFormData = {
    fullName: '',
    email: '',
  };

  passwordFormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(public authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.editFormData.fullName = user.fullName;
      this.editFormData.email = user.email;
    }
  }

  openEditModal(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.editFormData.fullName = user.fullName;
      this.editFormData.email = user.email;
    }
    this.errorMessage.set(null);
    this.showEditModal.set(true);
  }

  openPasswordModal(): void {
    this.passwordFormData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.errorMessage.set(null);
    this.showPasswordModal.set(true);
  }

  closeModals(): void {
    this.showEditModal.set(false);
    this.showPasswordModal.set(false);
    this.errorMessage.set(null);
  }

  updateProfile(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http.patch(this.apiUrl, this.editFormData).subscribe({
      next: (updatedUser: any) => {
        // Update local user data
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updated = { ...currentUser, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(updated));
          this.authService.currentUser.set(updated);
        }

        this.isSubmitting.set(false);
        this.successMessage.set('Profile updated successfully!');
        this.closeModals();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update profile');
      },
    });
  }

  changePassword(): void {
    if (this.passwordFormData.newPassword !== this.passwordFormData.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.passwordFormData.newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.http
      .patch(`${this.apiUrl}/password`, {
        currentPassword: this.passwordFormData.currentPassword,
        newPassword: this.passwordFormData.newPassword,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set('Password changed successfully!');
          this.closeModals();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to change password');
        },
      });
  }

  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const password = prompt('Enter your password to confirm deletion:');
    if (!password) return;

    this.http.delete(this.apiUrl, { body: { password } }).subscribe({
      next: () => {
        alert('Account deleted successfully');
        this.authService.logout();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete account');
      },
    });
  }
}
