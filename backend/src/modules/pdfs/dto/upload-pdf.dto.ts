// import { ApiProperty } from '@nestjs/swagger';
// import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

// export class UploadPdfDto {
//   @ApiProperty({
//     type: 'string',
//     format: 'binary',
//     description: 'PDF file to upload (multipart/form-data)',
//   })
//   file: any;

//   @ApiProperty({
//     type: String,
//     maxLength: 200,
//     required: false,
//     description:
//       'Optional filename to store (if omitted server may use original name)',
//   })
//   @IsOptional()
//   @IsString()
//   fileName?: string;

//   @ApiProperty({
//     type: String,
//     maxLength: 500,
//     required: false,
//     description: 'Optional custom storage path (usually set server-side)',
//   })
//   @IsOptional()
//   @IsString()
//   filePath?: string;

//   @ApiProperty({
//     type: 'string',
//     format: 'uuid',
//     description: 'Course id this PDF belongs to',
//   })
//   @IsUUID()
//   courseId: string;

//   @ApiProperty({
//     type: String,
//     required: false,
//     description: 'Optional description for the PDF',
//   })
//   @IsOptional()
//   @IsString()
//   description?: string;

//   @ApiProperty({
//     type: [String],
//     required: false,
//     description: 'Optional list of tags',
//   })
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   tags?: string[];
// }

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class UploadPdfDto {
  @ApiPropertyOptional({
    description: 'Course id this PDF belongs to (optional for chat uploads)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Optional filename to store',
    maxLength: 200,
    example: 'Chapter 1 Notes.pdf',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Optional description for the PDF',
    maxLength: 500,
    example: 'Lecture notes from week 1',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional list of tags',
    type: [String],
    example: ['chapter1', 'introduction', 'lecture'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [];
  })
  tags?: string[];
}
