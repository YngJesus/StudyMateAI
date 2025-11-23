import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('AI Chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message to AI (with optional PDF attachment)',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent and response received',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or AI service error',
  })
  async sendMessage(@Req() req, @Body() dto: ChatMessageDto) {
    return await this.chatService.sendMessage(req.user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of messages to return (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns chat history',
  })
  async getHistory(@Req() req, @Query('limit') limit?: number) {
    return await this.chatService.getChatHistory(
      req.user.userId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all chat history' })
  @ApiResponse({
    status: 204,
    description: 'Chat history cleared',
  })
  async clearHistory(@Req() req) {
    await this.chatService.clearHistory(req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific chat message' })
  @ApiResponse({
    status: 204,
    description: 'Message deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async deleteMessage(@Req() req, @Param('id') id: string) {
    await this.chatService.deleteMessage(req.user.userId, id);
  }
}
