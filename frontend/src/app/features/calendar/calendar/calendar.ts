// frontend/src/app/features/calendar/calendar/calendar.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event';
import { SubjectService } from '../../../core/services/subject';
import { Event, CreateEventDto, EventType } from '../../../core/models/event.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  // Expose Math to template
  protected readonly Math = Math;

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedEvent = signal<Event | null>(null);
  selectedFilter = signal<'all' | 'upcoming' | 'past'>('upcoming');

  formData = signal<CreateEventDto>({
    title: '',
    type: EventType.ASSIGNMENT,
    date: this.formatDateForInput(new Date()),
    description: '',
    subjectId: '',
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Available event types
  eventTypes = [
    { value: EventType.EXAM, label: 'Exam' },
    { value: EventType.DS, label: 'DS (Devoir Surveillé)' },
    { value: EventType.ASSIGNMENT, label: 'Assignment' },
  ];

  // Filtered events based on selected filter
  filteredEvents = computed(() => {
    const filter = this.selectedFilter();
    const events = this.eventService.events();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= today;
      });
    } else if (filter === 'past') {
      return events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate < today;
      });
    }
    return events;
  });

  constructor(public eventService: EventService, public subjectService: SubjectService) {}

  ngOnInit(): void {
    this.loadEvents();
    // Load subjects for the dropdown
    if (this.subjectService.subjects().length === 0) {
      this.subjectService.loadSubjects().subscribe();
    }
  }

  loadEvents(): void {
    this.eventService.loadEvents().subscribe({
      error: (err) => {
        console.error('Error loading events:', err);
        this.errorMessage.set('Failed to load events');
      },
    });
  }

  openCreateModal(): void {
    this.formData.set({
      title: '',
      type: EventType.ASSIGNMENT,
      date: this.formatDateForInput(new Date()),
      description: '',
      subjectId: this.subjectService.subjects()[0]?.id || '',
    });
    this.errorMessage.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(event: Event): void {
    this.selectedEvent.set(event);
    this.formData.set({
      title: event.title,
      type: event.type,
      date: event.date,
      description: event.description || '',
      subjectId: event.subjectId,
    });
    this.errorMessage.set(null);
    this.showEditModal.set(true);
  }

  openDeleteModal(event: Event): void {
    this.selectedEvent.set(event);
    this.showDeleteModal.set(true);
  }

  closeModals(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedEvent.set(null);
    this.errorMessage.set(null);
  }

  createEvent(): void {
    const data = this.formData();

    if (!data.title.trim()) {
      this.errorMessage.set('Event title is required');
      return;
    }

    if (!data.subjectId) {
      this.errorMessage.set('Please select a subject');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.eventService.createEvent(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create event');
      },
    });
  }

  updateEvent(): void {
    const event = this.selectedEvent();
    if (!event) return;

    const data = this.formData();

    if (!data.title.trim()) {
      this.errorMessage.set('Event title is required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.eventService.updateEvent(event.id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update event');
      },
    });
  }

  deleteEvent(): void {
    const event = this.selectedEvent();
    if (!event) return;

    this.isSubmitting.set(true);

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModals();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete event');
      },
    });
  }

  updateFormField(field: keyof CreateEventDto, value: any): void {
    this.formData.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  getEventIcon(type: EventType): string {
    const icons: Record<EventType, string> = {
      [EventType.EXAM]: '📝',
      [EventType.DS]: '📋',
      [EventType.ASSIGNMENT]: '📄',
    };
    return icons[type] || '📌';
  }

  getEventColor(type: EventType): string {
    const colors: Record<EventType, string> = {
      [EventType.EXAM]: 'border-red-500',
      [EventType.DS]: 'border-yellow-500',
      [EventType.ASSIGNMENT]: 'border-blue-500',
    };
    return colors[type] || 'border-gray-500';
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDaysUntil(dateStr: string): number {
    const eventDate = new Date(dateStr);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
