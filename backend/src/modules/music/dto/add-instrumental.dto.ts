import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicModel } from '../music.types';

export class AddInstrumentalDto {
  @ApiProperty({
    description: '要添加乐器的上传音乐文件的URL',
    example: 'https://example.com/music.mp3',
  })
  @IsString()
  uploadUrl: string;

  @ApiProperty({
    description: '音乐曲目的标题',
    example: '轻松钢琴',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: '标题不能超过200个字符' })
  title: string;

  @ApiProperty({
    description: '要从生成的乐器中排除的音乐风格或特征',
    example: '重金属, 激进鼓点',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '排除标签不能超过500个字符' })
  negativeTags: string;

  @ApiProperty({
    description: '乐器的音乐风格和特征',
    example: '轻松钢琴, 环境音乐, 宁静',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '标签不能超过500个字符' })
  tags: string;

  @ApiProperty({
    description: '接收任务完成通知的URL',
    example: 'https://api.example.com/callback',
  })
  @IsString()
  callBackUrl: string;

  @ApiPropertyOptional({
    description: '任何人声元素的首选人声性别',
    enum: ['m', 'f'],
    example: 'm',
  })
  @IsOptional()
  @IsEnum(['m', 'f'], { message: '人声性别必须是 m 或 f' })
  vocalGender?: 'm' | 'f';

  @ApiPropertyOptional({
    description: '风格指引权重（0.00-1.00）',
    example: 0.61,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  styleWeight?: number;

  @ApiPropertyOptional({
    description: '创意/新颖性约束（0.00-1.00）',
    example: 0.72,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weirdnessConstraint?: number;

  @ApiPropertyOptional({
    description: '音频一致性权重（0.00-1.00）',
    example: 0.65,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  audioWeight?: number;

  @ApiPropertyOptional({
    description: '使用的模型版本',
    enum: MusicModel,
    default: MusicModel.V4_5PLUS,
  })
  @IsOptional()
  @IsEnum(MusicModel, { message: '无效的音乐模型' })
  model?: MusicModel;
}
