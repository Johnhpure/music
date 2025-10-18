import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 小程序歌词生成DTO
 */
export class MiniGenerateLyricsDto {
  @ApiProperty({
    description: '歌词创作提示词（描述歌曲主题、风格、情感等）',
    example: '创作一首关于夏日海边的轻快歌曲',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '提示词最多500个字符' })
  @MinLength(5, { message: '提示词至少5个字符' })
  prompt: string;
}
