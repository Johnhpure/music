import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

/**
 * 创建Gemini密钥组DTO
 */
export class CreateGeminiKeyGroupDto {
  @IsString()
  groupName: string;

  @IsEnum(['sequential', 'failover'])
  rotationStrategy: 'sequential' | 'failover';

  @IsArray()
  @ArrayMinSize(1, { message: '至少需要添加一个API密钥' })
  @IsString({ each: true })
  apiKeys: string[];

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 更新Gemini密钥组DTO
 */
export class UpdateGeminiKeyGroupDto {
  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsEnum(['sequential', 'failover'])
  rotationStrategy?: 'sequential' | 'failover';

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要添加一个API密钥' })
  @IsString({ each: true })
  apiKeys?: string[];

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 添加密钥到组DTO
 */
export class AddKeysToGroupDto {
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要添加一个API密钥' })
  @IsString({ each: true })
  apiKeys: string[];
}
