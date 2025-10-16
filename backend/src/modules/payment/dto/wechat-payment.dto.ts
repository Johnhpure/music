import { IsString } from 'class-validator';

export class WechatPaymentDto {
  @IsString()
  orderId: string;
}
