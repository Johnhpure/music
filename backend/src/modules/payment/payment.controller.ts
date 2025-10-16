import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WechatPaymentDto } from './dto/wechat-payment.dto';

@Controller('user/payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 创建订单
  @Post('order')
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const order = await this.paymentService.createOrder(
      req.user.id,
      createOrderDto,
    );

    return {
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order.id,
        orderNo: order.order_no,
        amount: order.amount,
        points: order.points,
        bonus: order.bonus,
        status: order.status,
      },
    };
  }

  // 获取微信支付参数
  @Post('wechat-pay')
  async getWechatPayment(
    @Request() req,
    @Body() wechatPaymentDto: WechatPaymentDto,
  ) {
    const orderId = parseInt(wechatPaymentDto.orderId, 10);
    const paymentData = await this.paymentService.generateWechatPayment(
      orderId,
      req.user.id,
    );

    return {
      code: 200,
      message: '支付参数生成成功',
      data: paymentData,
    };
  }

  // 获取订单详情
  @Get('order/:id')
  async getOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const order = await this.paymentService.getOrder(id, req.user.id);

    return {
      code: 200,
      data: order,
    };
  }

  // 获取订单列表
  @Get('orders')
  async getOrders(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const result = await this.paymentService.getUserOrders(
      req.user.id,
      page,
      limit,
    );

    return {
      code: 200,
      data: result,
    };
  }

  // 取消订单
  @Post('order/:id/cancel')
  async cancelOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const order = await this.paymentService.cancelOrder(id, req.user.id);

    return {
      code: 200,
      message: '订单已取消',
      data: order,
    };
  }

  // 查询订单状态
  @Get('order/:orderNo/query')
  async queryOrder(@Request() req, @Param('orderNo') orderNo: string) {
    // TODO: 实际应该查询微信支付订单状态
    return {
      code: 200,
      message: '查询成功',
      data: {
        orderNo,
        status: 'pending',
      },
    };
  }
}
