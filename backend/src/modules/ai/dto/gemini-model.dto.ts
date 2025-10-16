import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateGeminiModelDto {
  @IsString()
  modelName: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxInputTokens?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxOutputTokens?: number;

  @IsOptional()
  @IsBoolean()
  supportStreaming?: boolean;

  @IsOptional()
  @IsBoolean()
  supportVision?: boolean;

  @IsOptional()
  @IsBoolean()
  supportAudio?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPer1kPromptTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPer1kCompletionTokens?: number;
}

export class UpdateGeminiModelDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPer1kPromptTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPer1kCompletionTokens?: number;
}
