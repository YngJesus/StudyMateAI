import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatHistory } from './entities/chat-history.entity';
import { PdfsModule } from '../pdfs/pdfs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistory]),
    PdfsModule, // For PDF access
    ConfigModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
