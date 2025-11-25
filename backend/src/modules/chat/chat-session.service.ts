import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './messages/chat-message.entity';
import { CreateSessionDto } from './sessions/dto/create-session.dto';
import { RenameSessionDto } from './sessions/dto/rename-session.dto';

@Injectable()
export class ChatSessionService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const title = dto.title || 'New chat';

    const session = this.sessionRepo.create({
      userId,
      title,
    });

    return await this.sessionRepo.save(session);
  }

  async listSessions(userId: string) {
    return await this.sessionRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async renameSession(
    userId: string,
    sessionId: string,
    dto: RenameSessionDto,
  ) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    session.title = dto.title;
    return await this.sessionRepo.save(session);
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    await this.sessionRepo.remove(session);
  }
}
