import { IsString, IsNotEmpty } from 'class-validator';

export class WechatPhoneDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
