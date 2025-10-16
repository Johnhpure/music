import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicModel } from '../music.types';

export class UploadAndCoverDto {
  @ApiPropertyOptional({
    description: '上传的音频URL',
    example: 'https://example.com/original-audio.mp3',
  })
  @IsOptional()
  @IsString()
  uploadUrl?: string;

  @ApiPropertyOptional({
    description: '是否自定义模式',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  customMode?: boolean;

  @ApiPropertyOptional({
    description: '提示词（非自定义模式下使用）',
    maxLength: 500,
    example: '转换为爵士风格',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '提示词不能超过500个字符' })
  prompt?: string;

  @ApiPropertyOptional({
    description: '风格（自定义模式下使用）',
    maxLength: 200,
    example: '爵士',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '风格不能超过200个字符' })
  style?: string;

  @ApiPropertyOptional({
    description: '标题（自定义模式下使用）',
    maxLength: 200,
    example: '爵士版本',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '标题不能超过200个字符' })
  title?: string;

  @ApiProperty({
    description: '使用的模型版本',
    enum: MusicModel,
    example: MusicModel.V4,
  })
  @IsEnum(MusicModel, { message: '无效的音乐模型' })
  model: MusicModel;

  @ApiPropertyOptional({
    description: '回调URL',
    example: 'https://your-server.com/cover-callback',
  })
  @IsOptional()
  @IsString()
  callBackUrl?: string;
}
