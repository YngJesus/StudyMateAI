// frontend/src/app/features/chat/chat/chat.ts
import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat';
import { ChatSession, ChatMessage } from '../../../core/models/chat.model';

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
  newSessionTitle = signal('');
  selectedSessionForRename = signal<ChatSession | null>(null);
  errorMessage = signal<string | null>(null);

  private shouldScrollToBottom = false;

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.loadSessions().subscribe({
      next: (sessions) => {
        // Auto-select first session if available
        if (sessions.length > 0 && !this.chatService.currentSession()) {
          this.selectSession(sessions[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
        this.errorMessage.set('Failed to load chat sessions');
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  selectSession(session: ChatSession): void {
    this.chatService.setCurrentSession(session);
    this.shouldScrollToBottom = true;
  }

  openNewSessionModal(): void {
    this.newSessionTitle.set('');
    this.errorMessage.set(null);
    this.showNewSessionModal.set(true);
  }

  createSession(): void {
    const title = this.newSessionTitle().trim() || 'New Chat';

    this.chatService.createSession({ title }).subscribe({
      next: () => {
        this.showNewSessionModal.set(false);
        this.newSessionTitle.set('');
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

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content || this.chatService.isSending()) return;

    const session = this.chatService.currentSession();
    if (!session) {
      this.errorMessage.set('Please select a session first');
      return;
    }

    this.messageInput.set('');
    this.errorMessage.set(null);

    this.chatService.sendMessage(session.id, { message: content }).subscribe({
      next: () => {
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to send message');
      },
    });
  }

  closeModals(): void {
    this.showNewSessionModal.set(false);
    this.showRenameModal.set(false);
    this.selectedSessionForRename.set(null);
    this.errorMessage.set(null);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
