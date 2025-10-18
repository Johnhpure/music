import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';

// 使用统一的MusicModel枚举
import { MusicModel } from '../../music.types';

/**
 * 小程序音乐生成DTO（简化版）
 */
export class MiniGenerateMusicDto {
  @ApiProperty({
    description: '歌曲标题',
    example: '夏日海滩',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80, { message: '标题最多80个字符' })
  @MinLength(1, { message: '标题不能为空' })
  title: string;

  @ApiPropertyOptional({
    description: '歌词内容（自定义模式下使用）',
    example: '主歌:\n阳光洒在沙滩上...\n\n副歌:\n让我们一起摇摆...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000, { message: '歌词最多3000个字符（V3_5/V4）' })
  lyrics?: string;

  @ApiProperty({
    description: '音乐风格',
    example: 'pop',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: '风格描述最多200个字符' })
  style: string;

  @ApiPropertyOptional({
    description: '创意描述或提示词',
    example: '轻快欢乐的夏日氛围',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '提示词最多500个字符' })
  prompt?: string;

  @ApiPropertyOptional({
    description: '是否生成纯音乐（无人声）',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  instrumental?: boolean;

  @ApiPropertyOptional({
    description: 'AI模型版本',
    enum: MusicModel,
    default: MusicModel.V3_5,
  })
  @IsOptional()
  @IsEnum(MusicModel)
  model?: MusicModel;
}
