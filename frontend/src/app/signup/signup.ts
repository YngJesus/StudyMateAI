import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('loginCard') loginCard!: ElementRef;
  @ViewChild('brandingSection') brandingSection!: ElementRef;

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  isLoading = false;
  errorMessage = '';

  particles: Particle[] = [];
  private animationId: number | null = null;
  private resizeListener?: () => void;

  ngOnInit() {
    this.generateParticles();
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.init3DTilt();
    this.initParallax();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
  }

  generateParticles() {
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
  }

  onSubmit() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      alert('Account created successfully!');
    }, 1500);
  }

  /* Background + animations (same as login) */

  initCanvas() {
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

        const orb = ctx.createRadialGradient(x, y, 0, x, y, radius);
        orb.addColorStop(0, `hsla(${(time * 100 + i * 60) % 360}, 100%, 60%, 0.3)`);
        orb.addColorStop(1, 'transparent');

        ctx.fillStyle = orb;
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

  init3DTilt() {
    if (!this.loginCard) return;

    const card = this.loginCard.nativeElement;

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = (y - rect.height / 2) / 15;
      const rotateY = (rect.width / 2 - x) / 15;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  }

  initParallax() {
    if (!this.brandingSection) return;

    const branding = this.brandingSection.nativeElement;

    document.addEventListener('mousemove', (e: MouseEvent) => {
      const intensity = 10;
      const x = (e.clientX / window.innerWidth - 0.5) * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * intensity;

      branding.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
}
