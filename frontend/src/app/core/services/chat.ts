import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatSession,
  ChatMessage,
  CreateSessionDto,
  RenameSessionDto,
  SendMessageDto,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = `${environment.Backend}/api/chat`;

  sessions = signal<ChatSession[]>([]);
  currentSession = signal<ChatSession | null>(null);
  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  isSending = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Load all chat sessions
   */
  loadSessions(): Observable<ChatSession[]> {
    this.isLoading.set(true);
    return this.http.get<ChatSession[]>(`${this.apiUrl}/sessions`).pipe(
      tap((sessions) => {
        this.sessions.set(sessions);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create a new session
   */
  createSession(data: CreateSessionDto): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.apiUrl}/sessions`, data).pipe(
      tap((newSession) => {
        this.sessions.update((current) => [newSession, ...current]);
        this.setCurrentSession(newSession);
      })
    );
  }

  /**
   * Rename a session
   */
  renameSession(id: string, data: RenameSessionDto): Observable<ChatSession> {
    return this.http.patch<ChatSession>(`${this.apiUrl}/sessions/${id}`, data).pipe(
      tap((updatedSession) => {
        this.sessions.update((current) => current.map((s) => (s.id === id ? updatedSession : s)));
        if (this.currentSession()?.id === id) {
          this.currentSession.set(updatedSession);
        }
      })
    );
  }

  /**
   * Delete a session
   */
  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${id}`).pipe(
      tap(() => {
        this.sessions.update((current) => current.filter((s) => s.id !== id));
        if (this.currentSession()?.id === id) {
          this.currentSession.set(null);
          this.messages.set([]);
        }
      })
    );
  }

  /**
   * Load chat history for a session
   */
  loadHistory(sessionId: string): Observable<ChatMessage[]> {
    this.isLoading.set(true);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${sessionId}`).pipe(
      tap((messages) => {
        this.messages.set(messages);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Send a message in a session
   */
  sendMessage(sessionId: string, data: SendMessageDto): Observable<ChatMessage> {
    this.isSending.set(true);
    return this.http.post<ChatMessage>(`${this.apiUrl}/${sessionId}`, data).pipe(
      tap((response) => {
        // Add the new message to the list
        this.messages.update((current) => [...current, response]);
        this.isSending.set(false);
      })
    );
  }

  /**
   * Set current session and load its history
   */
  setCurrentSession(session: ChatSession): void {
    this.currentSession.set(session);
    this.loadHistory(session.id).subscribe();
  }

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    this.currentSession.set(null);
    this.messages.set([]);
  }
}
