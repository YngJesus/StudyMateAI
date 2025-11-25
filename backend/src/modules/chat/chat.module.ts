import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatHistory } from './entities/chat-history.entity';
import { PdfsModule } from '../pdfs/pdfs.module';
import { ChatSession } from './messages/chat-message.entity';
import { ChatSessionService } from './chat-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistory, ChatSession]),
    PdfsModule, // For PDF access
    ConfigModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatSessionService],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
