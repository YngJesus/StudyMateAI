import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Pdf, UpdatePdfDto } from '../../../core/models/pdf.model';
import { CourseService } from '../../../core/services/course';
import { PdfService } from '../../../core/services/pdf';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail implements OnInit {
  courseId = signal<string>('');
  currentCourse = signal<any>(null);

  // Modal states
  showUploadModal = signal(false);
  showEditPdfModal = signal(false);
  showDeletePdfModal = signal(false);
  selectedPdf = signal<Pdf | null>(null);

  // Upload state
  selectedFile = signal<File | null>(null);
  uploadMetadata = signal({ description: '', tags: '' });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public courseService: CourseService,
    public pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.courseId.set(id);
      this.loadCourseData(id);
      this.loadPdfs(id);
    });
  }

  loadCourseData(courseId: string): void {
    // Find course in loaded courses or fetch it
    const course = this.courseService.courses().find((c) => c.id === courseId);
    if (course) {
      this.currentCourse.set(course);
    }
  }

  loadPdfs(courseId: string): void {
    this.pdfService.loadPdfsByCourse(courseId).subscribe({
      error: (err) => {
        console.error('Error loading PDFs:', err);
        this.errorMessage.set('Failed to load PDFs');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/subjects']);
  }

  // ==================== PDF UPLOAD ====================

  openUploadModal(): void {
    this.selectedFile.set(null);
    this.uploadMetadata.set({ description: '', tags: '' });
    this.errorMessage.set(null);
    this.showUploadModal.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (file.type !== 'application/pdf') {
        this.errorMessage.set('Please select a PDF file');
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        this.errorMessage.set('File size must be less than 50MB');
        return;
      }

      this.selectedFile.set(file);
      this.errorMessage.set(null);
    }
  }

  uploadPdf(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Please select a file');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const metadata = this.uploadMetadata();
    const tags = metadata.tags
      ? metadata.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    this.pdfService
      .uploadPdf(file, this.courseId(), {
        description: metadata.description || undefined,
        tags,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModals();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to upload PDF');
        },
      });
  }

  // ==================== PDF MANAGEMENT ====================

  openEditPdfModal(pdf: Pdf): void {
    this.selectedPdf.set(pdf);
    this.uploadMetadata.set({
      description: pdf.description || '',
      tags: pdf.tags?.join(', ') || '',
    });
    this.errorMessage.set(null);
    this.showEditPdfModal.set(true);
  }

  updatePdf(): void {
    const pdf = this.selectedPdf();
    if (!pdf) return;

    const metadata = this.uploadMetadata();
    const tags = metadata.tags
      ? metadata.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const data: UpdatePdfDto = {
      description: metadata.description || undefined,
      tags,
    };

    this.pdfService.updatePdf(pdf.id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update PDF');
      },
    });
  }

  openDeletePdfModal(pdf: Pdf): void {
    this.selectedPdf.set(pdf);
    this.showDeletePdfModal.set(true);
  }

  deletePdf(): void {
    const pdf = this.selectedPdf();
    if (!pdf) return;

    this.isSubmitting.set(true);

    this.pdfService.deletePdf(pdf.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete PDF');
      },
    });
  }
  downloadPdf(pdf: Pdf): void {
    this.pdfService.downloadPdf(pdf.id, pdf.fileName);
  }
  closeModals(): void {
    this.showUploadModal.set(false);
    this.showEditPdfModal.set(false);
    this.showDeletePdfModal.set(false);
    this.selectedPdf.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }
  updateMetadataField(field: 'description' | 'tags', value: string): void {
    this.uploadMetadata.update((current) => ({
      ...current,
      [field]: value,
    }));
  }
  formatFileSize(bytes: string): string {
    return this.pdfService.formatFileSize(bytes);
  }
}
