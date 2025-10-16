import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class ExpandInspirationDto {
  @IsString()
  @MinLength(1, { message: '创作主题不能为空' })
  @MaxLength(200, { message: '创作主题不能超过200个字符' })
  originalPrompt: string;
}
