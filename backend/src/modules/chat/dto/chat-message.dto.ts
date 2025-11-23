import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    description: 'User message/question',
    example: 'Can you help me with my machine learning courses?',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Message too long. Maximum 5000 characters.' })
  message: string;

  @ApiPropertyOptional({
    description: 'Optional PDF ID to attach to the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  pdfFileId?: string;
}
