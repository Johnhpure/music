import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Suno回调中的音乐数据
class SunoCallbackMusicDataDto {
  @ApiProperty({ description: '音乐ID', example: '8551****662c' })
  @IsString()
  id: string;

  @ApiProperty({
    description: '音频URL',
    example: 'https://example.cn/****.mp3',
  })
  @IsString()
  audio_url: string;

  @ApiProperty({
    description: '源音频URL',
    example: 'https://example.cn/****.mp3',
    required: false,
  })
  @IsOptional()
  @IsString()
  source_audio_url?: string;

  @ApiProperty({
    description: '封面图URL',
    example: 'https://example.cn/****.jpeg',
  })
  @IsString()
  image_url: string;

  @ApiProperty({
    description: '源封面图URL',
    example: 'https://example.cn/****.jpeg',
    required: false,
  })
  @IsOptional()
  @IsString()
  source_image_url?: string;

  @ApiProperty({ description: '提示词/歌词', required: false })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ description: '音乐标题', example: 'Iron Man' })
  @IsString()
  title: string;

  @ApiProperty({
    description: '音乐标签',
    example: 'electrifying, rock',
  })
  @IsString()
  tags: string;

  @ApiProperty({ description: '音频时长（秒）', example: 198.44 })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: '创建时间',
    example: '2025-01-01 00:00:00',
  })
  @IsString()
  createTime: string;
}

// Suno回调data字段
class SunoCallbackInnerDataDto {
  @ApiProperty({
    description: '回调类型',
    enum: ['text', 'first', 'complete', 'error'],
    example: 'complete',
  })
  @IsString()
  callbackType: 'text' | 'first' | 'complete' | 'error';

  @ApiProperty({ description: 'Suno任务ID', example: '2fac****9f72' })
  @IsString()
  task_id: string;

  @ApiProperty({
    description: '音乐生成结果数据',
    type: [SunoCallbackMusicDataDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SunoCallbackMusicDataDto)
  data?: SunoCallbackMusicDataDto[] | null;
}

/**
 * Suno回调DTO
 * 用于接收Suno音乐生成完成后的回调通知
 */
export class SunoCallbackDto {
  @ApiProperty({
    description: '状态码 (200=成功, 400/451/500=失败)',
    example: 200,
  })
  @IsNumber()
  code: number;

  @ApiProperty({
    description: '状态消息',
    example: 'All generated successfully.',
  })
  @IsString()
  msg: string;

  @ApiProperty({ description: '回调数据', type: SunoCallbackInnerDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SunoCallbackInnerDataDto)
  data: SunoCallbackInnerDataDto;
}
