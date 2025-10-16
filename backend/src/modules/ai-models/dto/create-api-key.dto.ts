import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsInt()
  providerId: number;

  @IsString()
  keyName: string;

  @IsString()
  apiKey: string;

  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
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

  @IsOptional()
  configJson?: any;
}

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  keyName?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['normal', 'rate_limited', 'error', 'exhausted'])
  status?: string;

  @IsOptional()
  @IsInt()
  rateLimitRpm?: number;

  @IsOptional()
  @IsInt()
  rateLimitTpm?: number;

  @IsOptional()
  @IsInt()
  rateLimitRpd?: number;

  @IsOptional()
  configJson?: any;
}
