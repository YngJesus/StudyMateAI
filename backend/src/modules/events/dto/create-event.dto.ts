import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from 'src/modules/events/entities/event.entity';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    maxLength: 255,
    example: 'Algebra study group',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Type of the event',
    enum: EventType,
    example: 'LECTURE',
  })
  @IsEnum(EventType)
  type: EventType;

  // expects date in YYYY-MM-DD format
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-01-01',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Optional description of the event',
    example: 'Discuss chapter 3 problems and solutions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Subject ID (UUID)',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  subjectId: string;
}
