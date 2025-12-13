import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from '../../../core/models/subject.model';
import { Course, CreateCourseDto } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course';
import { SubjectService } from '../../../core/services/subject';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subject-detail.html',
  styleUrl: './subject-detail.css',
})
export class SubjectDetail implements OnInit {
  subjectId = signal<string>('');
  currentSubject = computed(() => {
    const id = this.subjectId();
    return this.subjectService.subjects().find((s) => s.id === id) || null;
  });

  // Modal states
  showCreateCourseModal = signal(false);
  showEditCourseModal = signal(false);
  showDeleteCourseModal = signal(false);
  selectedCourse = signal<Course | null>(null);

  // Form state
  courseFormData = signal<CreateCourseDto>({
    name: '',
    description: '',
    orderNumber: 0,
    subjectId: '',
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public subjectService: SubjectService,
    public courseService: CourseService
  ) {}

  ngOnInit(): void {
    // Get subject ID from route
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.subjectId.set(id);

      // Load subjects if not already loaded
      if (this.subjectService.subjects().length === 0) {
        this.subjectService.loadSubjects().subscribe();
      }

      // Load courses for this subject
      this.loadCourses();
    });
  }

  loadCourses(): void {
    const id = this.subjectId();
    if (id) {
      this.courseService.loadCoursesBySubject(id).subscribe({
        error: (err) => {
          console.error('Error loading courses:', err);
          this.errorMessage.set('Failed to load courses');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/subjects']);
  }

  // ==================== COURSE CRUD ====================

  openCreateCourseModal(): void {
    this.courseFormData.set({
      name: '',
      description: '',
      orderNumber: this.courseService.courses().length,
      subjectId: this.subjectId(),
    });
    this.errorMessage.set(null);
    this.showCreateCourseModal.set(true);
  }

  openEditCourseModal(course: Course): void {
    this.selectedCourse.set(course);
    this.courseFormData.set({
      name: course.name,
      description: course.description || '',
      orderNumber: course.orderNumber,
      subjectId: course.subjectId,
    });
    this.errorMessage.set(null);
    this.showEditCourseModal.set(true);
  }

  openDeleteCourseModal(course: Course): void {
    this.selectedCourse.set(course);
    this.showDeleteCourseModal.set(true);
  }

  closeModals(): void {
    this.showCreateCourseModal.set(false);
    this.showEditCourseModal.set(false);
    this.showDeleteCourseModal.set(false);
    this.selectedCourse.set(null);
    this.errorMessage.set(null);
  }

  createCourse(): void {
    const data = this.courseFormData();

    if (!data.name.trim()) {
      this.errorMessage.set('Course name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.courseService.createCourse(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create course');
      },
    });
  }

  updateCourse(): void {
    const course = this.selectedCourse();
    if (!course) return;

    const data = this.courseFormData();

    if (!data.name.trim()) {
      this.errorMessage.set('Course name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.courseService.updateCourse(course.id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update course');
      },
    });
  }

  deleteCourse(): void {
    const course = this.selectedCourse();
    if (!course) return;

    this.isSubmitting.set(true);

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete course');
      },
    });
  }

  updateCourseFormField(field: keyof CreateCourseDto, value: string | number): void {
    this.courseFormData.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  navigateToCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }
}
