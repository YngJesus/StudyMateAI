import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pdf, UpdatePdfDto } from '../models/pdf.model';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private apiUrl = `${environment.Backend}/api/pdfs`;

  pdfs = signal<Pdf[]>([]);
  isLoading = signal(false);
  uploadProgress = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Load PDFs for a specific course
   */
  loadPdfsByCourse(courseId: string): Observable<Pdf[]> {
    this.isLoading.set(true);
    return this.http.get<Pdf[]>(`${this.apiUrl}/course/${courseId}`).pipe(
      tap((pdfs) => {
        this.pdfs.set(pdfs);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Upload a PDF file
   */
  uploadPdf(
    file: File,
    courseId: string,
    metadata?: { description?: string; tags?: string[] }
  ): Observable<Pdf> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    if (metadata?.description) {
      formData.append('description', metadata.description);
    }

    if (metadata?.tags) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    return this.http.post<Pdf>(`${this.apiUrl}/upload`, formData).pipe(
      tap((newPdf) => {
        this.pdfs.update((current) => [...current, newPdf]);
      })
    );
  }

  /**
   * Update PDF metadata
   */
  updatePdf(id: string, data: UpdatePdfDto): Observable<Pdf> {
    return this.http.patch<Pdf>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updatedPdf) => {
        this.pdfs.update((current) => current.map((p) => (p.id === id ? updatedPdf : p)));
      })
    );
  }

  /**
   * Delete a PDF
   */
  deletePdf(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.pdfs.update((current) => current.filter((p) => p.id !== id));
      })
    );
  }

  /**
   * Download a PDF
   */
  downloadPdf(id: string, fileName: string): void {
    this.http
      .get(`${this.apiUrl}/${id}/download`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Download failed:', err);
        },
      });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: string): string {
    const size = parseInt(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
