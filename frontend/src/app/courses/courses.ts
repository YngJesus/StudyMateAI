import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Attachment {
  name: string;
  dataUrl: string;
}

interface Chapter {
  name: string;
  status: 'todo' | 'in-progress' | 'done';
  attachments?: Attachment[];
}

interface Quiz {
  title: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  completed: boolean;
  score?: number;
}

interface Course {
  id: number;
  name: string;
  professor: string;
  semester: string;
  chapters: Chapter[];
  quizzes?: Quiz[];
}

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  courses: Course[] = [];
  selectedCourse: Course | null = null;
  openMenuIndex: number | null = null;
  particles: Particle[] = [];
  showAddCourseModal = false;
  
  newCourse = {
    name: '',
    professor: '',
    semester: ''
  };

  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number = 0;
  private time = 0;

  ngOnInit(): void {
    this.initializeCourses();
    this.generateParticles();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  initializeCourses(): void {
    this.courses = [
      {
        id: 1,
        name: 'Advanced Machine Learning',
        professor: 'Dr. Sarah Johnson',
        semester: 'Fall 2024',
        chapters: [
          { name: 'Introduction to ML', status: 'done' },
          { name: 'Neural Networks', status: 'in-progress' },
          { name: 'Deep Learning', status: 'todo' }
        ],
        quizzes: [
          {
            title: 'ML Fundamentals',
            chapter: 'Introduction to ML',
            difficulty: 'Easy',
            totalQuestions: 10,
            completed: true,
            score: 92
          }
        ]
      },
      {
        id: 2,
        name: 'Web Development with Angular',
        professor: 'Prof. Michael Chen',
        semester: 'Fall 2024',
        chapters: [
          { name: 'TypeScript Basics', status: 'done' },
          { name: 'Components & Templates', status: 'done' },
          { name: 'Services & DI', status: 'in-progress' },
          { name: 'Routing', status: 'todo' }
        ],
        quizzes: []
      },
      {
        id: 3,
        name: 'Data Structures & Algorithms',
        professor: 'Dr. Emily Rodriguez',
        semester: 'Fall 2024',
        chapters: [
          { name: 'Arrays & Strings', status: 'done' },
          { name: 'Linked Lists', status: 'in-progress' },
          { name: 'Trees & Graphs', status: 'todo' },
          { name: 'Dynamic Programming', status: 'todo' }
        ],
        quizzes: [
          {
            title: 'Arrays Quiz',
            chapter: 'Arrays & Strings',
            difficulty: 'Medium',
            totalQuestions: 15,
            completed: false
          }
        ]
      },
      {
        id: 4,
        name: 'Cloud Computing',
        professor: 'Prof. David Park',
        semester: 'Fall 2024',
        chapters: [
          { name: 'Cloud Fundamentals', status: 'in-progress' },
          { name: 'AWS Services', status: 'todo' },
          { name: 'Serverless Architecture', status: 'todo' }
        ],
        quizzes: []
      }
    ];
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

  getCourseGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
      'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
      'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
    ];
    return gradients[id % gradients.length];
  }

  getCourseLetter(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getProgressPercentage(course: Course): number {
    const total = course.chapters.length;
    if (total === 0) return 0;
    const completed = course.chapters.filter(ch => ch.status === 'done').length;
    return Math.round((completed / total) * 100);
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Easy': 'rgba(34, 197, 94, 0.2)',
      'Medium': 'rgba(251, 191, 36, 0.2)',
      'Hard': 'rgba(239, 68, 68, 0.2)'
    };
    return colors[difficulty] || colors['Medium'];
  }

  getStats() {
    return [
      {
        icon: '📚',
        title: 'Courses in Progress',
        description: '4 active courses',
        percentage: 75,
        color: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))'
      },
      {
        icon: '✅',
        title: 'Completed Chapters',
        description: '8 chapters done',
        percentage: 62,
        color: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(99, 102, 241, 0.3))'
      },
      {
        icon: '🎯',
        title: 'Quiz Average',
        description: 'Great performance!',
        percentage: 92,
        color: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(236, 72, 153, 0.3))'
      }
    ];
  }

  toggleMenu(idx: number): void {
    this.openMenuIndex = this.openMenuIndex === idx ? null : idx;
  }

  openCourseDetail(course: Course): void {
    this.selectedCourse = course;
    this.openMenuIndex = null;
  }

  addCourse(): void {
    // Validate input
    if (!this.newCourse.name.trim() || !this.newCourse.professor.trim() || !this.newCourse.semester.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Create new course
    const course: Course = {
      id: this.courses.length + 1,
      name: this.newCourse.name,
      professor: this.newCourse.professor,
      semester: this.newCourse.semester,
      chapters: [],
      quizzes: []
    };

    // Add to courses array
    this.courses.push(course);

    // Reset form and close modal
    this.newCourse = {
      name: '',
      professor: '',
      semester: ''
    };
    this.showAddCourseModal = false;

    // Show success message (optional)
    console.log('Course added successfully:', course.name);
  }

  addChapter(): void {
    if (!this.selectedCourse) return;
    
    const newChapter: Chapter = {
      name: `Chapter ${this.selectedCourse.chapters.length + 1}`,
      status: 'todo',
      attachments: []
    };
    
    this.selectedCourse.chapters.push(newChapter);
  }

  changeStatus(chapter: Chapter, newStatus: string): void {
    chapter.status = newStatus as 'todo' | 'in-progress' | 'done';
  }

  uploadPdf(event: any, chapter: Chapter): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (!chapter.attachments) {
        chapter.attachments = [];
      }
      
      chapter.attachments.push({
        name: file.name,
        dataUrl: e.target.result
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  }

  downloadAttachment(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  deleteChapter(index: number): void {
    if (!this.selectedCourse) return;
    
    if (confirm('Are you sure you want to delete this chapter?')) {
      this.selectedCourse.chapters.splice(index, 1);
    }
  }

  unrollCourse(course: Course): void {
    if (confirm(`Are you sure you want to unenroll from ${course.name}?`)) {
      console.log('Unenroll from:', course.name);
      // Implement unenroll logic
    }
    this.openMenuIndex = null;
  }

  moveCourse(course: Course): void {
    console.log('Move course:', course.name);
    // Implement move logic
    this.openMenuIndex = null;
  }

  deleteCourse(course: Course): void {
    if (confirm(`Are you sure you want to delete ${course.name}?`)) {
      this.courses = this.courses.filter(c => c.id !== course.id);
      console.log('Deleted course:', course.name);
    }
    this.openMenuIndex = null;
  }

  takeQuiz(quiz: Quiz): void {
    console.log('Taking quiz:', quiz.title);
    // Implement quiz navigation logic
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}