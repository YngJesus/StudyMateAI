import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 'My exam revision', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  title?: string;
}
