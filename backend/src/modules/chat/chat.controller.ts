import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ChatSessionService } from './chat-session.service';
import { CreateSessionDto } from './sessions/dto/create-session.dto';
import { RenameSessionDto } from './sessions/dto/rename-session.dto';

@ApiTags('AI Chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: ChatSessionService,
  ) {}

  // ────────────────────────────────────────────────
  // 1️⃣ CHAT SESSIONS (CREATE, LIST, RENAME, DELETE)
  // ────────────────────────────────────────────────

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  createSession(@Req() req, @Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(req.user.userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all chat sessions' })
  listSessions(@Req() req) {
    return this.sessionService.listSessions(req.user.userId);
  }

  @Patch('sessions/:id')
  @ApiOperation({ summary: 'Rename a chat session' })
  renameSession(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: RenameSessionDto,
  ) {
    return this.sessionService.renameSession(req.user.userId, id, dto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  deleteSession(@Req() req, @Param('id') id: string) {
    return this.sessionService.deleteSession(req.user.userId, id);
  }

  // ────────────────────────────────────────────────
  // 2️⃣ SEND MESSAGE (MAIN AI ENDPOINT)
  // ────────────────────────────────────────────────

  @Post(':sessionId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message to AI (with optional PDF attachment)',
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'AI service failed' })
  async sendMessage(
    @Req() req,
    @Param('sessionId') sessionId: string,
    @Body() dto: ChatMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.userId, sessionId, dto);
  }

  // ────────────────────────────────────────────────
  // 3️⃣ HISTORY PER SESSION
  // ────────────────────────────────────────────────

  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Get chat history for a session' })
  async getHistory(@Req() req, @Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(req.user.userId, sessionId);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear ALL chat history for user' })
  async clearHistory(@Req() req) {
    await this.chatService.clearHistory(req.user.userId);
  }

  // ────────────────────────────────────────────────
  // 4️⃣ DELETE SINGLE MESSAGE
  // ────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific chat message' })
  @ApiResponse({ status: 204, description: 'Message deleted' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(@Req() req, @Param('id') id: string) {
    await this.chatService.deleteMessage(req.user.userId, id);
  }
}
