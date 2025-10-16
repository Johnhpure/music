import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMusicVideoDto {
  @ApiProperty({
    description: '音乐生成任务ID',
    example: 'music_task_abc123',
  })
  @IsString()
  taskId: string;

  @ApiProperty({
    description: 'SUNO音频ID',
    example: 'e231****-****-****-****-****8cadc7dc',
  })
  @IsString()
  audioId: string;

  @ApiPropertyOptional({
    description: '作者名称',
    example: '音乐创作者',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '作者名称不能超过100个字符' })
  author?: string;

  @ApiPropertyOptional({
    description: '域名/品牌名',
    example: 'music.example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '域名不能超过100个字符' })
  domainName?: string;

  @ApiPropertyOptional({
    description: '回调URL',
    example: 'https://your-server.com/video-callback',
  })
  @IsOptional()
  @IsString()
  callBackUrl?: string;
}
