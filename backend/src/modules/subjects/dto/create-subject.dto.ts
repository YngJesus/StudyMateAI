import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Hex color (#RGB or #RRGGBB)',
    example: '#fff',
    pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$',
  })
  @IsOptional()
  @IsString()
  // accepts #RGB or #RRGGBB
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'color must be a valid hex color like #fff or #ffffff',
  })
  color?: string;

  @ApiPropertyOptional({
    description: 'Semester or term',
    example: 'Fall 2025',
  })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ description: 'Professor name', example: 'Dr. Smith' })
  @IsOptional()
  @IsString()
  professor?: string;
}
