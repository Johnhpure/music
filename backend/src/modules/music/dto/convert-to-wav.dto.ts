import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConvertToWavDto {
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
    description: '回调URL',
    example: 'https://your-server.com/wav-callback',
  })
  @IsOptional()
  @IsString()
  callBackUrl?: string;
}
