import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHotRecommendationDto {
  @IsString()
  @MaxLength(50)
  category: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(500)
  coverUrl: string;

  @IsString()
  @MaxLength(500)
  audioUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  duration?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === 'true' || value === '1';
    return Boolean(value);
  })
  isActive?: boolean;
}
