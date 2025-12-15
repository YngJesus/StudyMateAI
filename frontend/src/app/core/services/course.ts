import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course, CreateCourseDto, UpdateCourseDto } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = `${environment.Backend}/api/courses`;

  // Reactive state
  courses = signal<Course[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Load all courses for a specific subject
   */
  loadCoursesBySubject(subjectId: string): Observable<Course[]> {
    this.isLoading.set(true);
    return this.http.get<Course[]>(`${this.apiUrl}/${subjectId}`).pipe(
      tap((courses) => {
        this.courses.set(courses);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create a new course
   */
  createCourse(data: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, data).pipe(
      tap((newCourse) => {
        this.courses.update((current) => [...current, newCourse]);
      })
    );
  }

  /**
   * Update a course
   */
  updateCourse(id: string, data: UpdateCourseDto): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedCourse) => {
        this.courses.update((current) => current.map((c) => (c.id === id ? updatedCourse : c)));
      })
    );
  }

  /**
   * Delete a course
   */
  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.courses.update((current) => current.filter((c) => c.id !== id));
      })
    );
  }
}
