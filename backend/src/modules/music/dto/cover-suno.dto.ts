import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CoverSunoDto {
  @ApiProperty({
    description: '原始音乐任务ID，应该是音乐生成接口返回的taskId',
    example: '73d6128b3523a0079df10da9471017c8',
  })
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsString()
  taskId: string;

  @ApiProperty({
    description: '用于接收封面生成任务完成更新的URL地址',
    example: 'https://your-server.com/cover-callback',
  })
  @IsNotEmpty({ message: '回调URL不能为空' })
  @IsString()
  callBackUrl: string;
}
