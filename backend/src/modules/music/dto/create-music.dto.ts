import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MusicModel } from '../music.types';

export class CreateMusicDto {
  @IsString()
  @MinLength(2, { message: '标题至少需要2个字符' })
  @MaxLength(200, { message: '标题不能超过200个字符' })
  title: string;

  @IsString()
  @MinLength(10, { message: '歌词至少需要10个字符' })
  lyrics: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '风格描述不能超过50个字符' })
  style?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '提示词不能超过500个字符' })
  prompt?: string;

  @IsBoolean()
  @IsOptional()
  instrumental?: boolean;

  @IsEnum(MusicModel, { message: '无效的音乐模型' })
  @IsOptional()
  model?: MusicModel;

  @IsBoolean()
  @IsOptional()
  customMode?: boolean;
}
