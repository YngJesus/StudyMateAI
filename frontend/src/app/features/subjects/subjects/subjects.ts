import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from '../../../core/models/subject.model';
import { CreateSubjectDto, SubjectService } from '../../../core/services/subject';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects implements OnInit {
  // UI State
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedSubject = signal<Subject | null>(null);

  // Form state
  formData = signal<CreateSubjectDto>({
    name: '',
    color: '#3498db',
    semester: '',
    professor: '',
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(public subjectService: SubjectService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectService.loadSubjects().subscribe({
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.errorMessage.set('Failed to load subjects');
      },
    });
  }

  openCreateModal(): void {
    this.formData.set({
      name: '',
      color: '#3498db',
      semester: '',
      professor: '',
    });
    this.errorMessage.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(subject: Subject): void {
    this.selectedSubject.set(subject);
    this.formData.set({
      name: subject.name,
      color: subject.color,
      semester: subject.semester || '',
      professor: subject.professor || '',
    });
    this.errorMessage.set(null);
    this.showEditModal.set(true);
  }

  openDeleteModal(subject: Subject): void {
    this.selectedSubject.set(subject);
    this.showDeleteModal.set(true);
  }

  closeModals(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedSubject.set(null);
    this.errorMessage.set(null);
  }

  createSubject(): void {
    const data = this.formData();

    if (!data.name.trim()) {
      this.errorMessage.set('Subject name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.subjectService.createSubject(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create subject');
      },
    });
  }

  updateSubject(): void {
    const subject = this.selectedSubject();
    if (!subject) return;

    const data = this.formData();

    if (!data.name.trim()) {
      this.errorMessage.set('Subject name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.subjectService.updateSubject(subject.id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update subject');
      },
    });
  }

  deleteSubject(): void {
    const subject = this.selectedSubject();
    if (!subject) return;

    this.isSubmitting.set(true);

    this.subjectService.deleteSubject(subject.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete subject');
      },
    });
  }

  updateFormField(field: keyof CreateSubjectDto, value: string): void {
    this.formData.update((current) => ({
      ...current,
      [field]: value,
    }));
  }
}
