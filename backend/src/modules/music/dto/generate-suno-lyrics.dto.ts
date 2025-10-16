import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateSunoLyricsDto {
  @ApiProperty({
    description: '歌词创作主题/提示词',
    example: '创作一首关于夏日海边的轻快歌曲',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '提示词不能超过500个字符' })
  prompt: string;

  @ApiPropertyOptional({
    description: '回调URL',
    example: 'https://your-server.com/lyrics-callback',
  })
  @IsOptional()
  @IsString()
  callBackUrl?: string;
}
