import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MusicStyle, Mood } from '../ai.types';

export class GenerateLyricsDto {
  @IsString()
  @MinLength(2, { message: '主题至少需要2个字符' })
  @MaxLength(100, { message: '主题不能超过100个字符' })
  theme: string;

  @IsEnum(MusicStyle, { message: '无效的音乐风格' })
  @IsOptional()
  style?: MusicStyle;

  @IsEnum(Mood, { message: '无效的情绪' })
  @IsOptional()
  mood?: Mood;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '自定义提示不能超过500个字符' })
  customPrompt?: string;

  @IsOptional()
  @IsNumber()
  versionsCount?: number = 2;
}
