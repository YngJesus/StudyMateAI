import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ description: 'Chat history record ID' })
  id: string;

  @ApiProperty({ description: 'User message' })
  message: string;

  @ApiProperty({ description: 'AI response' })
  response: string;

  @ApiProperty({ description: 'PDF ID if attached', required: false })
  pdfFileId: string | null;

  @ApiProperty({ description: 'PDF filename if attached', required: false })
  pdfFileName: string | null;

  @ApiProperty({ description: 'Timestamp' })
  createdAt: Date;
}
