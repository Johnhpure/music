import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * 小程序音乐扩展DTO
 */
export class MiniExtendMusicDto {
  @ApiProperty({
    description: '要扩展的音频ID（从音乐生成结果中获取）',
    example: 'audio_123abc',
  })
  @IsString()
  audioId: string;

  @ApiPropertyOptional({
    description: '扩展提示词（描述想要添加的内容）',
    example: '添加一段吉他独奏',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({
    description: '从第几秒开始扩展',
    example: 120,
    minimum: 0,
    maximum: 480,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  continueAt?: number;
}
