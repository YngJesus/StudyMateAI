import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session unique identifier',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Session title',
    example: 'Study session: Algebra',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T12:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-02T12:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
