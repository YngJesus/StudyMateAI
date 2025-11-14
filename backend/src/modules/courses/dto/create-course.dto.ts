import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Name of the course',
    example: 'Algebra I',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional course description',
    example: 'An introduction to basic algebra concepts',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Order number used for sorting courses',
    example: 1,
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  orderNumber?: number;

  @ApiProperty({
    description: 'UUID of the subject this course belongs to',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  subjectId: string;

  @ApiProperty({
    description:
      'Optional timestamp of when the course was last studied (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
    type: String,
  })
  @IsDateString()
  @IsOptional()
  lastStudied?: string;
}
