import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateSunoConfigDto {
  @ApiProperty({ description: 'SUNO API密钥', example: 'sk-xxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty({ message: 'API密钥不能为空' })
  @MaxLength(500, { message: 'API密钥长度不能超过500字符' })
  api_key: string;

  @ApiProperty({
    description: 'SUNO API接口地址',
    example: 'https://api.sunoapi.org',
  })
  @IsString()
  @IsNotEmpty({ message: 'API接口地址不能为空' })
  @MaxLength(255, { message: 'API接口地址长度不能超过255字符' })
  api_url: string;

  @ApiProperty({ description: '是否启用', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: '描述说明', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
