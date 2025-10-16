import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicModel } from '../music.types';

export class UploadAndExtendDto {
  @ApiProperty({
    description: '用于上传音频文件的URL，确保上传的音频长度不超过8分钟',
    example: 'https://api.example.com/upload',
  })
  @IsString()
  uploadUrl: string;

  @ApiProperty({
    description: '是否使用自定义参数模式',
    example: true,
  })
  @IsBoolean()
  defaultParamFlag: boolean;

  @ApiProperty({
    description: '使用的模型版本，必须与源音频保持一致',
    enum: MusicModel,
    example: MusicModel.V3_5,
  })
  @IsEnum(MusicModel, { message: '无效的音乐模型' })
  model: MusicModel;

  @ApiProperty({
    description: '接收任务完成通知的URL',
    example: 'https://api.example.com/callback',
  })
  @IsString()
  callBackUrl: string;

  @ApiPropertyOptional({
    description: '是否为纯音乐（无歌词）',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  instrumental?: boolean;

  @ApiPropertyOptional({
    description: '描述音乐应如何延长',
    example: '用更多舒缓的音符延长音乐',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: '提示词不能超过5000个字符' })
  prompt?: string;

  @ApiPropertyOptional({
    description: '音乐风格',
    example: '古典',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '风格不能超过1000个字符' })
  style?: string;

  @ApiPropertyOptional({
    description: '音乐标题',
    example: '宁静钢琴延长版',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '标题不能超过100个字符' })
  title?: string;

  @ApiPropertyOptional({
    description: '音频开始扩展的时间点（秒），必须大于0且小于上传音频的总时长',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '起始时间必须大于0' })
  continueAt?: number;

  @ApiPropertyOptional({
    description: '需要在生成中排除的音乐风格',
    example: '舒缓钢琴',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '排除标签不能超过500个字符' })
  negativeTags?: string;

  @ApiPropertyOptional({
    description: '期望的人声性别',
    enum: ['m', 'f'],
    example: 'm',
  })
  @IsOptional()
  @IsEnum(['m', 'f'], { message: '人声性别必须是 m 或 f' })
  vocalGender?: 'm' | 'f';

  @ApiPropertyOptional({
    description: '风格指引权重（0.00-1.00）',
    example: 0.65,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  styleWeight?: number;

  @ApiPropertyOptional({
    description: '创意发散/奇异度约束（0.00-1.00）',
    example: 0.65,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weirdnessConstraint?: number;

  @ApiPropertyOptional({
    description: '输入音频影响力权重（0.00-1.00）',
    example: 0.65,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  audioWeight?: number;
}
