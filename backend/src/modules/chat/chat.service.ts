import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatSession } from './messages/chat-message.entity';
import { Pdf } from '../pdfs/entities/pdf.entity';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import * as fs from 'fs';
import Groq from 'groq-sdk';
// @ts-ignore
import PDFParser from 'pdf2json';

@Injectable()
export class ChatService {
  private readonly groq: Groq;

  constructor(
    @InjectRepository(ChatHistory)
    private chatRepository: Repository<ChatHistory>,
    @InjectRepository(ChatSession)
    private sessionRepository: Repository<ChatSession>,
    @InjectRepository(Pdf)
    private pdfRepository: Repository<Pdf>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') || '';

    if (!apiKey) {
      console.error('❌ GROQ_API_KEY is not configured in .env file!');
      console.warn('⚠️  AI Chat features will not work without API key');
      console.warn('🔗 Get free key at: https://console.groq.com/keys');
    } else {
      console.log('✅ Groq API key loaded successfully');
      this.groq = new Groq({ apiKey });
    }
  }

  /**
   * Extract text from PDF using pdf2json
   */
  private async extractPdfText(pdfId: string): Promise<string> {
    const pdfFile = await this.pdfRepository.findOne({
      where: { id: pdfId },
    });

    if (!pdfFile || !fs.existsSync(pdfFile.filePath)) {
      throw new NotFoundException('PDF file not found');
    }

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new BadRequestException('Failed to parse PDF'));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          let text = '';

          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R) {
                    textItem.R.forEach((run: any) => {
                      if (run.T) {
                        try {
                          text += decodeURIComponent(run.T) + ' ';
                        } catch (e) {
                          // Handle malformed URI by using the raw text
                          text += run.T.replace(/%/g, '') + ' ';
                        }
                      }
                    });
                  }
                });
              }
            });
          }

          text = text.replace(/\s+/g, ' ').trim();

          if (!text || text.length < 50) {
            reject(
              new BadRequestException(
                'Could not extract enough text from PDF. File might be scanned or image-based.',
              ),
            );
            return;
          }

          if (text.length > 20000) {
            text = text.substring(0, 20000) + '...';
          }

          console.log(`✅ Extracted ${text.length} characters from PDF`);
          resolve(text);
        } catch (error) {
          console.error('Text extraction error:', error);
          reject(new BadRequestException('Failed to extract text from PDF'));
        }
      });

      pdfParser.loadPDF(pdfFile.filePath);
    });
  }

  /**
   * Get recent chat history for context (session-aware)
   */
  private async getRecentContext(
    userId: string,
    sessionId: string,
  ): Promise<any[]> {
    const recentChats = await this.chatRepository.find({
      where: { userId, sessionId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (recentChats.length === 0) return [];

    recentChats.reverse();

    const messages: any[] = [];
    recentChats.forEach((chat) => {
      messages.push({ role: 'user', content: chat.message });
      messages.push({ role: 'assistant', content: chat.response });
    });

    return messages;
  }

  /**
   * Natural, conversational system prompt
   */
  private getSystemPrompt(): string {
    return `You're StudyMate AI - a smart study buddy for university students. Talk naturally and be helpful.

What you're great at:
- Breaking down PDFs and course material into clear notes
- Creating quizzes that actually test understanding (not just memorization)
- Explaining tough concepts in ways that click
- Helping students figure out what to study and when

How to be:
- Conversational and chill, not robotic
- Clear and direct - no fluff
- Explain WHY things work, not just WHAT they are
- Adapt to how the student talks and what they need

When creating notes:
- Use headings and structure that makes sense
- Pull out the important stuff
- Add examples when they help
- Make it scannable and easy to review

When making quizzes:
- Mix up question types (multiple choice, true/false, short answer, real scenarios)
- Include good explanations for answers
- Vary the difficulty - some easy warm-ups, some that make them think
- Make sure questions actually test understanding, not just recall

When explaining concepts:
- Start simple, then go deeper
- Use analogies and examples from real life when possible
- Break complex stuff into bite-sized pieces
- Connect it to things they might already know

Be natural. If they ask casually, respond casually. If they want something formal, match that. Read the room and adjust.`;
  }

  /**
   * Call Groq AI with enhanced prompt
   */
  private async callGroqChat(
    message: string,
    previousMessages: any[],
    pdfContext?: string,
  ): Promise<string> {
    if (!this.groq) {
      throw new BadRequestException(
        'AI service not configured. Please add GROQ_API_KEY to .env file. Get free key at: https://console.groq.com/keys',
      );
    }

    try {
      console.log('🤖 Calling Groq AI...');

      const messages: any[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(),
        },
      ];

      // Add previous conversation
      if (previousMessages.length > 0) {
        messages.push(...previousMessages);
      }

      // Add current message with PDF context if provided
      if (pdfContext) {
        messages.push({
          role: 'user',
          content: `${message}

---
📄 **ATTACHED PDF CONTENT:**

${pdfContext}

---

Please respond to my request above using the PDF content I've attached.`,
        });
      } else {
        messages.push({
          role: 'user',
          content: message,
        });
      }

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048, // Increased for longer responses
        top_p: 1,
        stream: false,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      console.log('✅ Groq response received');

      if (!aiResponse || aiResponse.trim().length === 0) {
        return "I understand your question, but I need more context to provide a helpful answer. Could you please provide more details or clarify what you'd like help with?";
      }

      return aiResponse.trim();
    } catch (error: any) {
      console.error('Groq error:', error);

      if (error.message?.includes('API key')) {
        throw new BadRequestException(
          'Invalid API key. Please check GROQ_API_KEY in .env file.',
        );
      }

      if (error.status === 429) {
        throw new BadRequestException(
          'Rate limit exceeded. Please wait a moment and try again.',
        );
      }

      throw new BadRequestException(
        `AI service error: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Auto-generate session title from first message
   */
  private async autoGenerateSessionTitle(
    userId: string,
    sessionId: string,
    firstMessage: string,
    isFirstMessage: boolean,
  ): Promise<void> {
    try {
      // Only generate title for the very first message
      if (isFirstMessage) {
        const session = await this.sessionRepository.findOne({
          where: { id: sessionId, userId },
        });

        if (!session) {
          console.log('⚠️  Session not found for auto-title generation');
          return;
        }

        console.log(`🔍 Checking session title: "${session.title}"`);

        // Check if session still has default title
        if (session.title === 'New Chat' || session.title === 'New chat') {
          // Generate a smart title from the message (first 60 chars, trimmed at word boundary)
          let autoTitle = firstMessage.trim();

          if (autoTitle.length > 60) {
            autoTitle = autoTitle.substring(0, 60);
            const lastSpace = autoTitle.lastIndexOf(' ');
            if (lastSpace > 30) {
              autoTitle = autoTitle.substring(0, lastSpace);
            }
            autoTitle += '...';
          }

          session.title = autoTitle;
          await this.sessionRepository.save(session);
          console.log(`🎯 Auto-generated session title: "${autoTitle}"`);
        } else {
          console.log(
            `ℹ️  Session already has custom title, skipping auto-generation`,
          );
        }
      }
    } catch (error) {
      // Silent fail - title generation is not critical
      console.warn('⚠️  Failed to auto-generate session title:', error.message);
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(
    userId: string,
    sessionId: string,
    dto: ChatMessageDto,
  ): Promise<ChatResponseDto> {
    console.log('📨 Received message:', {
      message: dto.message.substring(0, 50) + '...',
      pdfFileId: dto.pdfFileId,
      hasPdf: !!dto.pdfFileId,
    });

    let pdfFile: Pdf | null = null;
    let pdfContext: string | undefined;

    // 1. If PDF attached, verify ownership and extract text
    if (dto.pdfFileId) {
      console.log(`📄 PDF attached: ${dto.pdfFileId}`);

      pdfFile = await this.pdfRepository.findOne({
        where: { id: dto.pdfFileId },
        relations: ['course', 'course.subject', 'course.subject.user'],
      });

      if (!pdfFile) {
        throw new NotFoundException('PDF not found');
      }

      // For PDFs with a course, verify ownership
      if (pdfFile.course) {
        if (!pdfFile.course.subject || !pdfFile.course.subject.user) {
          throw new BadRequestException('PDF relations not properly loaded');
        }
        if (pdfFile.course.subject.user.id !== userId) {
          throw new ForbiddenException('You do not have access to this PDF');
        }
      }
      // For chat-uploaded PDFs without a course, ownership is implicit (user uploaded it)

      console.log('✅ PDF ownership verified');

      // Extract PDF text
      try {
        const pdfText = await this.extractPdfText(dto.pdfFileId);
        pdfContext = pdfText;
        console.log(`✅ Extracted ${pdfText.length} characters from PDF`);
      } catch (error) {
        console.error('PDF extraction failed:', error);
        pdfContext = `[Note: Could not extract text from "${pdfFile.fileName}". It might be scanned or image-based.]`;
      }
    }

    // 2. Get recent conversation context (session-aware)
    const previousMessages = await this.getRecentContext(userId, sessionId);

    // Check if this is the first message (for auto-title generation)
    const isFirstMessage = previousMessages.length === 0;
    console.log(
      `📊 Message count in session: ${previousMessages.length / 2} (isFirst: ${isFirstMessage})`,
    );

    // 3. Call Groq AI
    let aiResponse: string;
    try {
      aiResponse = await this.callGroqChat(
        dto.message,
        previousMessages,
        pdfContext,
      );
    } catch (error) {
      console.error('AI call failed:', error);
      throw error;
    }

    // 4. Save to database
    const chatHistory = this.chatRepository.create({
      message: dto.message,
      response: aiResponse,
      pdfFileId: dto.pdfFileId || null,
      userId,
      sessionId,
    });

    const saved = await this.chatRepository.save(chatHistory);

    console.log(`✅ Chat saved with ID: ${saved.id}`);

    // 4.5. Auto-generate session title from first message
    await this.autoGenerateSessionTitle(
      userId,
      sessionId,
      dto.message,
      isFirstMessage,
    );

    // 5. Return response
    return {
      id: saved.id,
      message: saved.message,
      response: saved.response,
      pdfFileId: saved.pdfFileId,
      pdfFileName: pdfFile?.fileName || null,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Get chat history for user
   */
  async getChatHistory(
    userId: string,
    sessionId: string,
  ): Promise<ChatResponseDto[]> {
    const chats = await this.chatRepository.find({
      where: { userId, sessionId },
      relations: ['pdfFile'],
      order: { createdAt: 'ASC' }, // Changed to ASC for chronological order
      take: 50,
    });

    return chats.map((chat) => ({
      id: chat.id,
      message: chat.message,
      response: chat.response,
      pdfFileId: chat.pdfFileId,
      pdfFileName: chat.pdfFile?.fileName || null,
      createdAt: chat.createdAt,
    }));
  }

  /**
   * Delete chat message
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const chat = await this.chatRepository.findOne({
      where: { id: messageId },
    });

    if (!chat) {
      throw new NotFoundException('Chat message not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('You do not own this message');
    }

    await this.chatRepository.remove(chat);
    console.log(`✅ Chat message deleted: ${messageId}`);
  }

  /**
   * Clear all chat history for user
   */
  async clearHistory(userId: string): Promise<void> {
    await this.chatRepository.delete({ userId });
    console.log(`✅ Chat history cleared for user: ${userId}`);
  }
}
