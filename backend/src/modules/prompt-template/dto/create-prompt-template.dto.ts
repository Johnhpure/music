import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  IsArray,
} from 'class-validator';

export class CreatePromptTemplateDto {
  @IsString()
  @MaxLength(50)
  category: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
