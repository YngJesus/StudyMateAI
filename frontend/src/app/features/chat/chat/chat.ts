import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../../core/services/chat';
import { PdfService } from '../../../core/services/pdf';
import { SubjectService } from '../../../core/services/subject';
import { CourseService } from '../../../core/services/course';
import { ChatSession } from '../../../core/models/chat.model';
import { Pdf } from '../../../core/models/pdf.model';
import { Subject } from '../../../core/models/subject.model';
import { Course } from '../../../core/models/course.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  messageInput = signal('');
  showNewSessionModal = signal(false);
  showRenameModal = signal(false);
  showPdfSelectorModal = signal(false);
  newSessionTitle = signal('');
  selectedSessionForRename = signal<ChatSession | null>(null);
  errorMessage = signal<string | null>(null);
  attachedPdf = signal<Pdf | null>(null);
  availablePdfs = signal<Pdf[]>([]);

  // Step-by-step PDF selection
  pdfSelectionStep = signal<'subject' | 'course' | 'pdf'>('subject');
  selectedSubject = signal<Subject | null>(null);
  selectedCourse = signal<Course | null>(null);
  availableCourses = signal<Course[]>([]);
  isLoadingCourses = signal(false);
  isLoadingPdfs = signal(false);

  // Direct PDF upload
  showPdfUploadOptionModal = signal(false);
  showDirectUploadModal = signal(false);
  uploadingFile = signal(false);
  uploadProgress = signal(0);
  selectedFile = signal<File | null>(null);

  private shouldScrollToBottom = false;

  constructor(
    public chatService: ChatService,
    private pdfService: PdfService,
    public subjectService: SubjectService,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.chatService.loadSessions().subscribe({
      next: (sessions) => {
        if (sessions.length > 0 && !this.chatService.currentSession()) {
          this.selectSession(sessions[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
        this.errorMessage.set('Failed to load chat sessions');
      },
    });

    // Load subjects to get PDFs
    this.subjectService.loadSubjects().subscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  selectSession(session: ChatSession): void {
    this.chatService.setCurrentSession(session);
    this.attachedPdf.set(null); // Clear attached PDF when switching sessions
    this.shouldScrollToBottom = true;
  }

  // ==================== SESSION MANAGEMENT ====================

  openNewSessionModal(): void {
    // Auto-create a new session with default title
    this.createNewSession();
  }

  createNewSession(autoTitle?: string): void {
    const title = autoTitle || 'New Chat';

    this.chatService.createSession({ title }).subscribe({
      next: () => {
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create session');
      },
    });
  }

  openRenameModal(session: ChatSession, event: Event): void {
    event.stopPropagation();
    this.selectedSessionForRename.set(session);
    this.newSessionTitle.set(session.title);
    this.errorMessage.set(null);
    this.showRenameModal.set(true);
  }

  renameSession(): void {
    const session = this.selectedSessionForRename();
    if (!session) return;

    const title = this.newSessionTitle().trim();
    if (!title) {
      this.errorMessage.set('Session title is required');
      return;
    }

    this.chatService.renameSession(session.id, { title }).subscribe({
      next: () => {
        this.showRenameModal.set(false);
        this.selectedSessionForRename.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to rename session');
      },
    });
  }

  deleteSession(session: ChatSession, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete session "${session.title}"?`)) return;

    this.chatService.deleteSession(session.id).subscribe({
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to delete session');
      },
    });
  }

  // ==================== PDF ATTACHMENT ====================

  openPdfSelector(): void {
    // Show option modal first
    this.showPdfUploadOptionModal.set(true);
  }

  chooseUploadNewPdf(): void {
    this.showPdfUploadOptionModal.set(false);
    this.showDirectUploadModal.set(true);
  }

  chooseSelectFromCourses(): void {
    this.showPdfUploadOptionModal.set(false);
    // Reset to step 1
    this.pdfSelectionStep.set('subject');
    this.selectedSubject.set(null);
    this.selectedCourse.set(null);
    this.availableCourses.set([]);
    this.availablePdfs.set([]);
    this.errorMessage.set(null);
    this.showPdfSelectorModal.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile.set(file);
        this.errorMessage.set(null);
      } else {
        this.errorMessage.set('Please select a PDF file');
        this.selectedFile.set(null);
      }
    }
  }

  uploadDirectPdf(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Please select a file first');
      return;
    }

    this.uploadingFile.set(true);
    this.uploadProgress.set(0);

    // Upload to backend with empty courseId for chat temporary uploads
    this.pdfService
      .uploadPdf(file, '', {
        description: 'Chat upload',
      })
      .subscribe({
        next: (uploadedPdf) => {
          console.log('✅ PDF uploaded successfully:', uploadedPdf);
          this.attachedPdf.set(uploadedPdf);
          this.showDirectUploadModal.set(false);
          this.selectedFile.set(null);
          this.uploadingFile.set(false);
          this.uploadProgress.set(0);
        },
        error: (err) => {
          console.error('❌ PDF upload failed:', err);
          this.errorMessage.set(err.error?.message || 'Failed to upload PDF');
          this.uploadingFile.set(false);
          this.uploadProgress.set(0);
        },
      });
  }

  selectSubject(subject: Subject): void {
    this.selectedSubject.set(subject);
    this.isLoadingCourses.set(true);
    this.errorMessage.set(null);

    this.courseService.loadCoursesBySubject(subject.id).subscribe({
      next: (courses) => {
        this.availableCourses.set(courses);
        this.isLoadingCourses.set(false);
        if (courses.length === 0) {
          this.errorMessage.set('No courses found in this subject');
        } else {
          this.pdfSelectionStep.set('course');
        }
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.errorMessage.set('Failed to load courses');
        this.isLoadingCourses.set(false);
      },
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse.set(course);
    this.isLoadingPdfs.set(true);
    this.errorMessage.set(null);

    this.pdfService.loadPdfsByCourse(course.id).subscribe({
      next: (pdfs) => {
        this.availablePdfs.set(pdfs);
        this.isLoadingPdfs.set(false);
        if (pdfs.length === 0) {
          this.errorMessage.set('No PDFs found in this course');
        } else {
          this.pdfSelectionStep.set('pdf');
        }
      },
      error: (err) => {
        console.error('Error loading PDFs:', err);
        this.errorMessage.set('Failed to load PDFs');
        this.isLoadingPdfs.set(false);
      },
    });
  }

  selectPdfToAttach(pdf: Pdf): void {
    this.attachedPdf.set(pdf);
    this.showPdfSelectorModal.set(false);
    this.errorMessage.set(null);
  }

  goBackToPreviousStep(): void {
    if (this.pdfSelectionStep() === 'pdf') {
      this.pdfSelectionStep.set('course');
      this.selectedCourse.set(null);
      this.availablePdfs.set([]);
    } else if (this.pdfSelectionStep() === 'course') {
      this.pdfSelectionStep.set('subject');
      this.selectedSubject.set(null);
      this.availableCourses.set([]);
    }
    this.errorMessage.set(null);
  }

  removeAttachedPdf(): void {
    this.attachedPdf.set(null);
  }

  // ==================== MESSAGE SENDING ====================

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content || this.chatService.isSending()) return;

    const session = this.chatService.currentSession();

    // Auto-create session if none exists (backend will auto-generate title from first message)
    if (!session) {
      this.chatService.createSession({ title: 'New Chat' }).subscribe({
        next: (newSession) => {
          this.sendMessageToSession(newSession.id, content);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create session');
        },
      });
      return;
    }

    this.sendMessageToSession(session.id, content);
  }

  private sendMessageToSession(sessionId: string, content: string): void {
    const pdfId = this.attachedPdf()?.id;

    console.log('📤 Sending message with PDF:', {
      hasAttachedPdf: !!this.attachedPdf(),
      pdfId: pdfId,
      pdfFileName: this.attachedPdf()?.fileName,
    });

    this.messageInput.set('');
    this.errorMessage.set(null);

    this.chatService
      .sendMessage(sessionId, {
        message: content,
        pdfFileId: pdfId,
      })
      .subscribe({
        next: () => {
          this.shouldScrollToBottom = true;
          this.attachedPdf.set(null); // Clear after sending

          // Reload sessions to get the auto-generated title
          this.chatService.loadSessions().subscribe();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to send message');
        },
      });
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ==================== QUICK TEMPLATES ====================

  insertTemplate(type: 'notes' | 'quiz' | 'explain'): void {
    const templates = {
      notes:
        '📝 Please create detailed study notes from the attached PDF, covering all key concepts and important points.',
      quiz: '🎯 Generate a comprehensive quiz with 10 questions (multiple choice, true/false, and short answer) based on the attached PDF content.',
      explain: '💡 Please explain the following concept in simple terms with examples: ',
    };

    this.messageInput.set(templates[type]);
  }

  // ==================== UI HELPERS ====================

  formatAIResponse(response: string): SafeHtml {
    // Convert markdown-style formatting to HTML
    let formatted = response
      // Headers
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Lists
      .replace(/^• (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      // Code blocks (inline)
      .replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return this.sanitizer.sanitize(1, formatted) || '';
  }

  formatFileSize(bytes: string): string {
    const size = parseInt(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  closeModals(): void {
    this.showNewSessionModal.set(false);
    this.showRenameModal.set(false);
    this.showPdfSelectorModal.set(false);
    this.showPdfUploadOptionModal.set(false);
    this.showDirectUploadModal.set(false);
    this.selectedSessionForRename.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
