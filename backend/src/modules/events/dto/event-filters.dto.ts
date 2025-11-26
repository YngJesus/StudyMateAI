import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class EventFiltersDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  upcoming?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : Math.floor(n);
  })
  @IsInt()
  @Min(1)
  limit?: number;
}
