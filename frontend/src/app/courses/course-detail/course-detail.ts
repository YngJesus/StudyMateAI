import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

interface Chapter {
  name: string;
  status: 'todo' | 'in-progress' | 'done';
  updatedAt?: Date;
}

interface Course {
  id: number;
  name: string;
  professor: string;
  semester: string;
  chapters: Chapter[];
}

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetail implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  course: Course = {
    id: 0,
    name: '',
    professor: '',
    semester: '',
    chapters: []
  };

  particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number = 0;
  private time = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadCourseData();
    this.generateParticles();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  loadCourseData(): void {
    // Get course ID from route params
    const courseId = this.route.snapshot.paramMap.get('id');
    
    // In a real app, you would fetch this from a service
    // For now, we'll use mock data
    this.course = {
      id: Number(courseId) || 1,
      name: 'Advanced Machine Learning',
      professor: 'Dr. Sarah Johnson',
      semester: 'Fall 2024',
      chapters: [
        { 
          name: 'Introduction to Machine Learning', 
          status: 'done',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        { 
          name: 'Neural Networks Fundamentals', 
          status: 'in-progress',
          updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        { 
          name: 'Deep Learning Architectures', 
          status: 'todo',
          updatedAt: new Date()
        },
        { 
          name: 'Convolutional Neural Networks', 
          status: 'todo',
          updatedAt: new Date()
        }
      ]
    };
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4
    }));
  }

  initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  animate(): void {
    if (!this.ctx || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.time += 0.005;

    // Draw animated gradient mesh
    const gridSize = 80;
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';

    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        const wave = Math.sin(this.time + x * 0.01 + y * 0.01) * 10;
        this.ctx.beginPath();
        this.ctx.arc(x, y + wave, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  getCourseLetter(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getProgressPercentage(): number {
    const total = this.course.chapters.length;
    if (total === 0) return 0;
    const completed = this.course.chapters.filter(ch => ch.status === 'done').length;
    return Math.round((completed / total) * 100);
  }

  getCompletedCount(): number {
    return this.course.chapters.filter(ch => ch.status === 'done').length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'todo': '📋 To Do',
      'in-progress': '🔄 In Progress',
      'done': '✅ Completed'
    };
    return labels[status] || status;
  }

  getRelativeTime(date?: Date): string {
    if (!date) return 'just now';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  addChapter(): void {
    const chapterNumber = this.course.chapters.length + 1;
    const newChapter: Chapter = {
      name: `Chapter ${chapterNumber}`,
      status: 'todo',
      updatedAt: new Date()
    };
    
    this.course.chapters.push(newChapter);
    
    console.log('Chapter added:', newChapter.name);
  }

  changeStatus(chapter: Chapter, newStatus: string): void {
    chapter.status = newStatus as 'todo' | 'in-progress' | 'done';
    chapter.updatedAt = new Date();
    
    console.log(`Status changed to: ${newStatus}`);
  }

  deleteChapter(index: number): void {
    if (confirm('Are you sure you want to delete this chapter?')) {
      const deletedChapter = this.course.chapters[index];
      this.course.chapters.splice(index, 1);
      
      console.log('Chapter deleted:', deletedChapter.name);
    }
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}