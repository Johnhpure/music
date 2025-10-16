import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BoostMusicStyleDto {
  @ApiProperty({
    description: '风格描述。请用简洁明了的语言描述你期望生成的音乐风格',
    example: 'Pop, Mysterious',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: '风格描述不能超过500个字符' })
  content: string;
}
