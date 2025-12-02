import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatSession {
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-studyai',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './studyai.html',
  styleUrls: ['./studyai.css'],
})
export class StudyAiComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: Message[] = [];
  currentMessage = '';
  isTyping = false;
  userName = 'Student';
  particles: Particle[] = [];

  chatHistory: ChatSession[] = [];
  currentChatIndex = -1;

  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number = 0;
  private time = 0;

  ngOnInit(): void {
    this.generateParticles();
    this.loadChatHistory();
    this.startNewChat(); // Start with a fresh chat
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));
  }

  initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  animate(): void {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.time += 0.005;

    const gridSize = 80;
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';

    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        const wave = Math.sin(this.time + x * 0.01 + y * 0.01) * 10;
        this.ctx.beginPath();
        this.ctx.arc(x, y + wave, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // ✅ Fixed: Accepts Event, checks type
  onEnter(event: Event): void {
    if (event instanceof KeyboardEvent && !event.shiftKey) {
      this.sendMessage();
      event.preventDefault();
    }
  }

  startNewChat(): void {
    this.messages = [];
    this.currentChatIndex = -1;
  }

  saveCurrentChat(): void {
    if (this.messages.length === 0) return;

    const firstUserMessage = this.messages.find(m => m.sender === 'user')?.text || 'New Chat';
    const title = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + '...' : firstUserMessage;

    const newSession: ChatSession = {
      title,
      messages: [...this.messages],
      createdAt: new Date(),
    };

    // Save to history (limit to last 10)
    this.chatHistory = [newSession, ...this.chatHistory].slice(0, 10);
    localStorage.setItem('studyMateChatHistory', JSON.stringify(this.chatHistory));
  }

  loadChat(index: number): void {
    this.currentChatIndex = index;
    this.messages = [...this.chatHistory[index].messages];
    this.scrollToBottom();
  }

  loadChatHistory(): void {
    const saved = localStorage.getItem('studyMateChatHistory');
    if (saved) {
      try {
        this.chatHistory = JSON.parse(saved).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        }));
      } catch (e) {
        this.chatHistory = [];
      }
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage = this.currentMessage.trim();
    this.messages.push({ sender: 'user', text: userMessage });
    this.currentMessage = '';
    this.scrollToBottom();

    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      const responses = [
        `I understand you're asking about "${userMessage}". Let me break this down...`,
        `Great question! Here's a step-by-step explanation of ${userMessage.toLowerCase()}...`,
        `Based on my knowledge, here's how to approach ${userMessage.toLowerCase()}...`,
      ];
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      this.messages.push({ sender: 'ai', text: aiResponse });
      this.scrollToBottom();
    }, 1500);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 10);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.saveCurrentChat(); // Save when leaving
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}