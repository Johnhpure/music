import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateGeminiApiKeyDto {
  @IsString()
  keyName: string;

  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitRpm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitTpm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitRpd?: number;
}

export class UpdateGeminiApiKeyDto {
  @IsOptional()
  @IsString()
  keyName?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitRpm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitTpm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitRpd?: number;
}

export class QueryGeminiStatsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  keyId?: number;

  @IsOptional()
  @IsString()
  modelName?: string;
}
