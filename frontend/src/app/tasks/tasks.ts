import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  project: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
}

interface Stats {
  totalTasks: number;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'],
})
export class TasksComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTask: Task | null = null;
  showTaskMenu = false;
  showAddModal = false;
  showManageModal = false;
  showAllTasks = false;
  searchQuery = '';
  notepadContent = '';
  particles: Particle[] = [];

  newTaskForm = {
    title: '',
    project: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  };

  stats: Stats = {
    totalTasks: 0,
    assignedTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  };

  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number = 0;
  private time = 0;

  ngOnInit(): void {
    this.initializeTasks();
    this.generateParticles();
    this.loadNotepad();
    this.calculateStats();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  initializeTasks(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Complete ML Assignment',
        project: 'Machine Learning',
        dueDate: '2 days',
        priority: 'high',
        status: 'in-progress',
      },
      {
        id: 2,
        title: 'Review Code Changes',
        project: 'Web Development',
        dueDate: '1 week',
        priority: 'medium',
        status: 'todo',
      },
      {
        id: 3,
        title: 'Prepare Presentation',
        project: 'Data Structures',
        dueDate: '3 days',
        priority: 'high',
        status: 'completed',
      },
      {
        id: 4,
        title: 'Study Algorithms',
        project: 'Cloud Computing',
        dueDate: '5 days',
        priority: 'low',
        status: 'todo',
      },
    ];
    this.filteredTasks = [...this.tasks];
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
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

  getTaskGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
      'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
      'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
      'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
    ];
    return gradients[index % gradients.length];
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      todo: 'rgba(156, 163, 175, 0.2)',
      'in-progress': 'rgba(251, 191, 36, 0.2)',
      completed: 'rgba(34, 197, 94, 0.2)',
    };
    return colors[status] || colors['todo'];
  }

  getStatusTextColor(status: string): string {
    const colors: { [key: string]: string } = {
      todo: '#9ca3af',
      'in-progress': '#fbbf24',
      completed: '#22c55e',
    };
    return colors[status] || colors['todo'];
  }

  getFilteredTasks(): Task[] {
    let filtered = this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    if (!this.showAllTasks) {
      filtered = filtered.slice(0, 3); // Show only first 3 if not expanded
    }
    return filtered;
  }

  onSearchChange(): void {
    this.filteredTasks = this.getFilteredTasks();
  }

  sortByDueDate(): void {
    this.tasks.sort((a, b) => {
      const aDays = this.parseDueDate(a.dueDate);
      const bDays = this.parseDueDate(b.dueDate);
      return aDays - bDays;
    });
    this.filteredTasks = [...this.tasks];
  }

  private parseDueDate(dueDate: string): number {
    const match = dueDate.match(/(\d+)\s*(day|week)/);
    if (!match) return Infinity;
    const num = parseInt(match[1]);
    return match[2] === 'week' ? num * 7 : num;
  }

  toggleTaskMenu(): void {
    this.showTaskMenu = !this.showTaskMenu;
  }

  viewTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showTaskMenu = false;
  }

  updateTaskStatus(status: 'todo' | 'in-progress' | 'completed'): void {
    if (this.selectedTask) {
      this.selectedTask.status = status;
      this.calculateStats();
    }
  }

  openAddTaskModal(): void {
    this.selectedTask = null;
    this.newTaskForm = { title: '', project: '', dueDate: '', priority: 'medium' };
    this.showAddModal = true;
    this.showTaskMenu = false;
  }

  openManageTasksModal(): void {
    this.showManageModal = true;
    this.showTaskMenu = false;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showManageModal = false;
    this.selectedTask = null;
  }

  addTask(): void {
    if (
      !this.newTaskForm.title.trim() ||
      !this.newTaskForm.project.trim() ||
      !this.newTaskForm.dueDate.trim()
    ) {
      alert('Please fill in all fields');
      return;
    }

    const newTask: Task = {
      id: this.tasks.length + 1,
      title: this.newTaskForm.title,
      project: this.newTaskForm.project,
      dueDate: this.newTaskForm.dueDate,
      priority: this.newTaskForm.priority,
      status: 'todo',
    };

    this.tasks.push(newTask);
    this.filteredTasks = [...this.tasks];
    this.calculateStats();
    this.closeModals();
  }

  saveEditedTask(): void {
    if (this.selectedTask) {
      this.selectedTask.title = this.newTaskForm.title;
      this.selectedTask.project = this.newTaskForm.project;
      this.selectedTask.dueDate = this.newTaskForm.dueDate;
      this.selectedTask.priority = this.newTaskForm.priority;
      this.calculateStats();
      this.closeModals();
    }
  }

  editTask(task: Task): void {
    this.selectedTask = task;
    this.newTaskForm = {
      title: task.title,
      project: task.project,
      dueDate: task.dueDate,
      priority: task.priority,
    };
    this.showManageModal = false;
    this.showAddModal = true;
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.filteredTasks = [...this.tasks];
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.stats.totalTasks = this.tasks.length;
    this.stats.assignedTasks = this.tasks.filter((task) => task.status !== 'completed').length;
    this.stats.completedTasks = this.tasks.filter((task) => task.status === 'completed').length;
    this.stats.overdueTasks = this.tasks.filter((task) => this.isOverdue(task.dueDate)).length;
  }

  private isOverdue(dueDate: string): boolean {
    const days = this.parseDueDate(dueDate);
    return days < 0; // Simplified: assume negative means overdue
  }

  loadNotepad(): void {
    this.notepadContent = localStorage.getItem('studyMateNotepad') || '';
  }

  saveNotepad(): void {
    localStorage.setItem('studyMateNotepad', this.notepadContent);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
