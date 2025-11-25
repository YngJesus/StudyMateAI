import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chat-history.entity';
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
                        text += decodeURIComponent(run.T) + ' ';
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

          // Groq can handle large contexts!
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
   * Get recent chat history for context
   */
  private async getRecentContext(userId: string): Promise<any[]> {
    const recentChats = await this.chatRepository.find({
      where: { userId },
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
   * Call Groq AI (FREE & SUPER FAST!)
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
          content: `You are StudyMate AI, a specialized study assistant for university students.

CAPABILITIES:
- Summarize PDFs and study materials (be concise, highlight key points)
- Generate practice questions (multiple choice, true/false, short answer)
- Explain complex concepts in simple terms with examples
- Create study plans and revision schedules
- Answer questions about course content

PERSONALITY:
- Encouraging and supportive (students may be stressed)
- Clear and concise (avoid overwhelming with information)
- Educational (don't just give answers, explain WHY)

QUIZ FORMAT (when asked to generate quiz):
Generate exactly 10 questions in this format:
1. [Multiple Choice] Question here
   A) Option 1
   B) Option 2
   C) Option 3
   D) Option 4
   Correct Answer: B

2. [True/False] Statement here
   Correct Answer: True

3. [Short Answer] Question here
   Suggested Answer: Brief answer here

SUMMARY FORMAT (when asked to summarize):
- Main Topic: [title]
- Key Points:
  • Point 1
  • Point 2
  • Point 3
- Important Concepts: [list]
- Study Tips: [if relevant]

If you don't have enough information, ask clarifying questions.`,
        },
      ];

      // Add previous conversation
      if (previousMessages.length > 0) {
        messages.push(...previousMessages);
      }

      // Add PDF context if provided
      if (pdfContext) {
        messages.push({
          role: 'user',
          content: `Here is the content from the attached PDF:\n\n${pdfContext}\n\n---\n\nNow, here's my question about it:`,
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message,
      });

      // Call Groq - Using llama-3.3-70b-versatile (NEW & FREE!)
      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile', // ✅ UPDATED: New free model!
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      console.log('✅ Groq response received (LIGHTNING FAST!)');

      if (!aiResponse || aiResponse.trim().length === 0) {
        return 'I understand your question, but I need more context to provide a helpful answer. Could you please provide more details?';
      }

      return aiResponse.trim();
    } catch (error: any) {
      console.error('Groq error:', error);

      if (error.message?.includes('API key')) {
        throw new BadRequestException(
          'Invalid API key. Please check GROQ_API_KEY in .env file. Get free key at: https://console.groq.com/keys',
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
   * Send a chat message
   */
  async sendMessage(
    userId: string,
    sessionId: string,
    dto: ChatMessageDto,
  ): Promise<ChatResponseDto> {
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

      if (
        !pdfFile.course ||
        !pdfFile.course.subject ||
        !pdfFile.course.subject.user
      ) {
        throw new BadRequestException('PDF relations not properly loaded');
      }

      if (pdfFile.course.subject.user.id !== userId) {
        throw new ForbiddenException('You do not have access to this PDF');
      }

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

    // 2. Get recent conversation context
    const previousMessages = await this.getRecentContext(userId);

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
      throw error; // Let the error propagate with proper message
    }

    // 4. Save to database
    const chatHistory = this.chatRepository.create({
      message: dto.message,
      response: aiResponse,
      pdfFileId: dto.pdfFileId || null,
      userId,
    });

    chatHistory.sessionId = sessionId;

    const saved = await this.chatRepository.save(chatHistory);

    console.log(`✅ Chat saved with ID: ${saved.id}`);

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
      order: { createdAt: 'DESC' },
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
