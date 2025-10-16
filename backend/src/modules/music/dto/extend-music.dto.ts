import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicModel } from '../music.types';

export class ExtendMusicDto {
  @ApiProperty({
    description: 'SUNO音频ID',
    example: 'e231****-****-****-****-****8cadc7dc',
  })
  @IsString()
  audioId: string;

  @ApiPropertyOptional({
    description: '是否使用默认参数',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  defaultParamFlag?: boolean;

  @ApiPropertyOptional({
    description: '扩展提示词',
    maxLength: 500,
    example: '继续添加吉他独奏部分',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '提示词不能超过500个字符' })
  prompt?: string;

  @ApiPropertyOptional({
    description: '从第几秒开始扩展',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '起始时间不能为负数' })
  continueAt?: number;

  @ApiProperty({
    description: '使用的模型版本',
    enum: MusicModel,
    example: MusicModel.V3_5,
  })
  @IsEnum(MusicModel, { message: '无效的音乐模型' })
  model: MusicModel;

  @ApiPropertyOptional({
    description: '回调URL',
    example: 'https://your-server.com/callback',
  })
  @IsOptional()
  @IsString()
  callBackUrl?: string;
}
