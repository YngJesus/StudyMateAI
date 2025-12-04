import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- ViewChildren (optional, guarded) ---
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('loginCard', { static: false }) loginCard?: ElementRef<HTMLElement>;
  @ViewChild('brandingSection', { static: false }) brandingSection?: ElementRef<HTMLElement>;

  // --- form state ---
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // particles
  particles: Particle[] = [];

  // private internals for cleanup
  private animId: number | null = null;
  private resizeHandler = this.onResize.bind(this);
  private docMouseHandler = this.onDocumentMouseMove.bind(this);
  private cardMouseHandler = this.onCardMouseMove.bind(this);
  private cardLeaveHandler = this.onCardMouseLeave.bind(this);

  constructor(private ngZone: NgZone, private router: Router) {}

  ngOnInit(): void {
    this.generateParticles();
  }

  ngAfterViewInit(): void {
    // run heavy animation outside Angular change detection for perf
    this.ngZone.runOutsideAngular(() => {
      this.initCanvas();
      this.initCardTilt();
      this.initParallax();
    });
  }

  ngOnDestroy(): void {
    // cancel animation frame
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    // remove window listeners
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('mousemove', this.docMouseHandler);

    // remove card listeners (if added)
    const card = this.loginCard?.nativeElement;
    if (card) {
      card.removeEventListener('mousemove', this.cardMouseHandler);
      card.removeEventListener('mouseleave', this.cardLeaveHandler);
    }
  }

  /* -------------------------
     Form actions
     ------------------------- */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Invalid email address.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    // simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Account created successfully! 🎉';
      // example redirect (uncomment or modify to your app routing)
      // this.router.navigate(['/dashboard']);
    }, 1200);
  }

  /* -------------------------
     Particles & Canvas
     ------------------------- */
  generateParticles(): void {
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
  }

  initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    setSize();
    window.addEventListener('resize', this.resizeHandler);

    let t = 0;

    const render = () => {
      t += 0.003;

      // background animated gradient
      const g = ctx.createLinearGradient(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
      g.addColorStop(0, `hsl(${(t * 50) % 360}, 80%, 12%)`);
      g.addColorStop(0.5, `hsl(${(t * 50 + 120) % 360}, 65%, 10%)`);
      g.addColorStop(1, `hsl(${(t * 50 + 240) % 360}, 80%, 12%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

      // orbs
      for (let i = 0; i < 5; i++) {
        const cx = (canvas.width / devicePixelRatio) / 2 + Math.sin(t + i) * 300;
        const cy = (canvas.height / devicePixelRatio) / 2 + Math.cos(t + i * 1.5) * 200;
        const r = 150 + Math.sin(t * 2 + i) * 50;

        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, `hsla(${(t * 100 + i * 60) % 360}, 95%, 60%, 0.22)`);
        rg.addColorStop(1, 'transparent');

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      this.animId = requestAnimationFrame(render);
    };

    // start render loop
    this.animId = requestAnimationFrame(render);
  }

  private onResize(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    // re-size canvas for new window dimensions
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }

  /* -------------------------
     Card tilt (3D) and parallax
     ------------------------- */
  initCardTilt(): void {
    const card = this.loginCard?.nativeElement;
    if (!card) return;

    // attach listeners (store bound functions to remove later)
    card.addEventListener('mousemove', this.cardMouseHandler);
    card.addEventListener('mouseleave', this.cardLeaveHandler);
  }

  private onCardMouseMove(e: MouseEvent): void {
    const card = this.loginCard?.nativeElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * 12; // gentler tilt
    const rotateY = ((rect.width / 2 - x) / rect.width) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
  }

  private onCardMouseLeave(): void {
    const card = this.loginCard?.nativeElement;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }

  initParallax(): void {
    const branding = this.brandingSection?.nativeElement;
    if (!branding) return;

    // add doc-level mouse listener for parallax
    document.addEventListener('mousemove', this.docMouseHandler);
  }

  private onDocumentMouseMove(e: MouseEvent): void {
    const branding = this.brandingSection?.nativeElement;
    if (!branding) return;
    const intensity = 12;
    const x = (e.clientX / window.innerWidth - 0.5) * intensity;
    const y = (e.clientY / window.innerHeight - 0.5) * intensity;
    // use transform with translate3d to leverage GPU
    branding.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    branding.style.transition = 'transform 120ms linear';
  }

  /* -------------------------
     Helpers
     ------------------------- */
  togglePasswordVisibility(): void {
    // unused in this signup variant unless you wire it to a button; kept for parity with login
    (this as any).showPassword = !(this as any).showPassword;
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
