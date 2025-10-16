import { IsInt, IsString, IsOptional } from 'class-validator';

export class UsagePromptTemplateDto {
  @IsInt()
  templateId: number;

  @IsOptional()
  @IsString()
  timestamp?: string;
}
