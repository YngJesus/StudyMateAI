import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Particle {
  x: number;
  y: number;
  delay: number;
}

interface Benefit {
  emoji: string;
  title: string;
  desc: string;
}

interface Stat {
  number: string;
  label: string;
}

interface PasswordStrength {
  percentage: number;
  level: 'weak' | 'medium' | 'strong';
  text: string;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('personalCard') personalCard!: ElementRef;
  @ViewChild('educationCard') educationCard!: ElementRef;
  @ViewChild('passwordCard') passwordCard!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Personal Information
  firstName: string = 'John';
  lastName: string = 'Doe';
  email: string = 'john.doe@university.edu';
  phoneNumber: string = '+216 XX XXX XXX';
  location: string = 'Tunis';
  dateOfBirth: string = '2000-01-01';
  profileImage: string = '';

  // Education
  university: string = 'Stanford University';
  fieldOfStudy: string = 'Computer Science';
  gradeLevel: string = "Bachelor's";
  expectedGraduation: string = '2025-06';

  // Password
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Editing states
  editingSections: { [key: string]: boolean } = {
    personal: false,
    education: false,
    password: false,
  };

  // Backup data for cancel
  backupData: any = {};

  // Password validation
  passwordStrength: PasswordStrength = {
    percentage: 0,
    level: 'weak',
    text: 'Weak',
  };

  passwordRequirements: PasswordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
  };

  passwordErrors: { [key: string]: string } = {};

  // Messages
  successMessage: string = '';
  errorMessage: string = '';

  // Particles
  particles: Particle[] = [];

  // Benefits for left side
  benefits: Benefit[] = [
    {
      emoji: '🎯',
      title: 'Personalized Learning',
      desc: 'Tailored content based on your profile and preferences',
    },
    {
      emoji: '📊',
      title: 'Track Progress',
      desc: 'Monitor your academic journey and achievements',
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      desc: 'Your data is encrypted and protected',
    },
  ];

  // Stats
  stats: Stat[] = [
    { number: '150+', label: 'Courses' },
    { number: '50K+', label: 'Students' },
    { number: '4.9★', label: 'Rating' },
  ];

  private animationId: number | null = null;
  private resizeListener?: () => void;

  ngOnInit(): void {
    this.generateParticles();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.clearMessages();
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
  }

  initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    const animate = () => {
      time += 0.003;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(${(time * 50) % 360}, 80%, 20%)`);
      gradient.addColorStop(0.5, `hsl(${(time * 50 + 120) % 360}, 70%, 15%)`);
      gradient.addColorStop(1, `hsl(${(time * 50 + 240) % 360}, 80%, 20%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 5; i++) {
        const x = canvas.width / 2 + Math.sin(time + i) * 300;
        const y = canvas.height / 2 + Math.cos(time + i * 1.5) * 200;
        const radius = 150 + Math.sin(time * 2 + i) * 50;

        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        orbGradient.addColorStop(0, `hsla(${(time * 100 + i * 60) % 360}, 100%, 60%, 0.3)`);
        orbGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();

    this.resizeListener = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', this.resizeListener);
  }

  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.profileImage = e.target.result as string;
          this.showSuccess('Profile picture updated successfully!');
        }
      };

      reader.readAsDataURL(file);
    }
  }

  toggleEdit(section: string): void {
    if (!this.editingSections[section]) {
      this.backupData[section] = this.getSectionData(section);
    }
    this.editingSections[section] = true;
    this.clearMessages();
  }

  cancelEdit(section: string): void {
    if (this.backupData[section]) {
      this.restoreSectionData(section, this.backupData[section]);
    }

    this.editingSections[section] = false;
    this.clearMessages();

    if (section === 'password') {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.passwordErrors = {};
      this.passwordRequirements = {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
      };
    }
  }

  saveSection(section: string): void {
    this.clearMessages();

    if (!this.validateSection(section)) return;

    setTimeout(() => {
      this.editingSections[section] = false;
      delete this.backupData[section];
      this.showSuccess(`${this.getSectionName(section)} updated successfully!`);
    }, 500);
  }

  getSectionData(section: string): any {
    switch (section) {
      case 'personal':
        return {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          phoneNumber: this.phoneNumber,
          location: this.location,
          dateOfBirth: this.dateOfBirth,
        };
      case 'education':
        return {
          university: this.university,
          fieldOfStudy: this.fieldOfStudy,
          gradeLevel: this.gradeLevel,
          expectedGraduation: this.expectedGraduation,
        };
      default:
        return {};
    }
  }

  restoreSectionData(section: string, data: any): void {
    switch (section) {
      case 'personal':
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phoneNumber = data.phoneNumber;
        this.location = data.location;
        this.dateOfBirth = data.dateOfBirth;
        break;
      case 'education':
        this.university = data.university;
        this.fieldOfStudy = data.fieldOfStudy;
        this.gradeLevel = data.gradeLevel;
        this.expectedGraduation = data.expectedGraduation;
        break;
    }
  }

  validateSection(section: string): boolean {
    switch (section) {
      case 'personal':
        if (!this.firstName || !this.lastName) {
          this.showError('First name and last name are required');
          return false;
        }
        if (!this.isValidEmail(this.email)) {
          this.showError('Please enter a valid email address');
          return false;
        }
        return true;

      case 'education':
        if (!this.university || !this.fieldOfStudy || !this.gradeLevel) {
          this.showError('Please fill in all required fields');
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  getSectionName(section: string): string {
    const names: { [key: string]: string } = {
      personal: 'Personal Information',
      education: 'Education',
      password: 'Password',
    };
    return names[section] || section;
  }

  // Password functions
  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkNewPasswordStrength(): void {
    const password = this.newPassword;

    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
    };

    const metRequirements = Object.values(this.passwordRequirements).filter(Boolean).length;
    const percentage = (metRequirements / 4) * 100;

    if (percentage <= 50) {
      this.passwordStrength = { percentage, level: 'weak', text: 'Weak' };
    } else if (percentage <= 75) {
      this.passwordStrength = { percentage, level: 'medium', text: 'Medium' };
    } else {
      this.passwordStrength = { percentage, level: 'strong', text: 'Strong' };
    }
  }

  updatePassword(): void {
    this.passwordErrors = {};
    this.clearMessages();

    if (!this.currentPassword) {
      this.passwordErrors['currentPassword'] = 'Current password is required';
      return;
    }

    if (!this.newPassword) {
      this.passwordErrors['newPassword'] = 'New password is required';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordErrors['newPassword'] = 'Password must be at least 8 characters';
      return;
    }

    const allRequirementsMet = Object.values(this.passwordRequirements).every(Boolean);
    if (!allRequirementsMet) {
      this.passwordErrors['newPassword'] = 'Password does not meet all requirements';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordErrors['confirmPassword'] = 'Passwords do not match';
      return;
    }

    setTimeout(() => {
      this.editingSections['password'] = false;

      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.passwordRequirements = {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
      };
      this.showSuccess('Password updated successfully!');
    }, 500);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
