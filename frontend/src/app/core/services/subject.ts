import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../models/subject.model';

export interface CreateSubjectDto {
  name: string;
  color?: string;
  semester?: string;
  professor?: string;
}

export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {}

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = `${environment.Backend}/api/subjects`;

  // Reactive state - list of all subjects
  subjects = signal<Subject[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Load all subjects for the current user
   */
  loadSubjects(): Observable<Subject[]> {
    this.isLoading.set(true);
    return this.http.get<Subject[]>(this.apiUrl).pipe(
      tap((subjects) => {
        this.subjects.set(subjects);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create a new subject
   */
  createSubject(data: CreateSubjectDto): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, data).pipe(
      tap((newSubject) => {
        // Add to local state
        this.subjects.update((current) => [...current, newSubject]);
      })
    );
  }

  /**
   * Update a subject
   */
  updateSubject(id: string, data: UpdateSubjectDto): Observable<Subject> {
    return this.http.patch<Subject>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedSubject) => {
        // Update local state
        this.subjects.update((current) => current.map((s) => (s.id === id ? updatedSubject : s)));
      })
    );
  }

  /**
   * Delete a subject
   */
  deleteSubject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove from local state
        this.subjects.update((current) => current.filter((s) => s.id !== id));
      })
    );
  }
}
