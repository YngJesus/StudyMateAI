import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, CreateEventDto, UpdateEventDto } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.Backend}/api/events`;

  events = signal<Event[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Load all events
   */
  loadEvents(): Observable<Event[]> {
    this.isLoading.set(true);
    return this.http.get<Event[]>(this.apiUrl).pipe(
      tap((events) => {
        this.events.set(events);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get upcoming events (next N days)
   */
  getUpcoming(days: number = 7): Observable<Event[]> {
    this.isLoading.set(true);
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming?days=${days}`).pipe(
      tap((events) => {
        this.events.set(events);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get events in date range
   */
  getRange(from: string, to: string): Observable<Event[]> {
    this.isLoading.set(true);
    return this.http.get<Event[]>(`${this.apiUrl}/range?from=${from}&to=${to}`).pipe(
      tap((events) => {
        this.events.set(events);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create event
   */
  createEvent(data: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, data).pipe(
      tap((newEvent) => {
        this.events.update((current) => [...current, newEvent]);
      })
    );
  }

  /**
   * Update event
   */
  updateEvent(id: string, data: UpdateEventDto): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedEvent) => {
        this.events.update((current) => current.map((e) => (e.id === id ? updatedEvent : e)));
      })
    );
  }

  /**
   * Delete event
   */
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.events.update((current) => current.filter((e) => e.id !== id));
      })
    );
  }
}
