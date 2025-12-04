import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Feature {
  emoji: string;
  title: string;
  desc: string;
}

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('loginCard') loginCard!: ElementRef;
  @ViewChild('brandingSection') brandingSection!: ElementRef;

  // Form data
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  // Features for the left side
  features: Feature[] = [
    { 
      emoji: '🎯', 
      title: 'Smart AI Assistant', 
      desc: 'Personalized learning paths powered by advanced AI' 
    },
    { 
      emoji: '📚', 
      title: 'Organize Everything', 
      desc: 'All your subjects, notes, and resources in one place' 
    },
    { 
      emoji: '⚡', 
      title: 'Lightning Fast', 
      desc: 'Instant summaries, quizzes, and insights' 
    },
  ];

  // Particles data
  particles: Particle[] = [];

  private animationId: number | null = null;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private resizeListener?: () => void;

  ngOnInit(): void {
    // Generate particles on init
    this.generateParticles();
  }

  ngAfterViewInit(): void {
    // Initialize all animations after view is ready
    this.initCanvas();
    this.init3DTilt();
    this.initParallax();
  }

  ngOnDestroy(): void {
    // Clean up
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
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

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    const animate = () => {
      time += 0.003;

      // Create animated gradient mesh
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(${(time * 50) % 360}, 80%, 20%)`);
      gradient.addColorStop(0.5, `hsl(${(time * 50 + 120) % 360}, 70%, 15%)`);
      gradient.addColorStop(1, `hsl(${(time * 50 + 240) % 360}, 80%, 20%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated orbs
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

    // Handle window resize
    this.resizeListener = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', this.resizeListener);
  }

  init3DTilt(): void {
    if (!this.loginCard) return;

    const card = this.loginCard.nativeElement;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  }

  initParallax(): void {
    if (!this.brandingSection) return;

    const branding = this.brandingSection.nativeElement;

    this.mouseMoveListener = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      branding.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
      branding.style.transition = 'transform 0.2s ease-out';
    };

    document.addEventListener('mousemove', this.mouseMoveListener);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInputFocus(field: string): void {
    // You can add additional focus effects here if needed
    console.log(`${field} input focused`);
  }

  onInputBlur(): void {
    // You can add additional blur effects here if needed
    console.log('Input blurred');
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Invalid email address';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    // Start loading
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;

      // Demo credentials check
      if (this.email === 'demo@university.edu' && this.password === 'password123') {
        this.successMessage = 'Welcome back! 🚀';
        
        // Redirect after success (implement your routing here)
        setTimeout(() => {
          // Example: this.router.navigate(['/dashboard']);
          console.log('Redirecting to dashboard...');
        }, 1500);
      } else {
        this.errorMessage = 'Invalid credentials';
      }
    }, 1500);
  }
}