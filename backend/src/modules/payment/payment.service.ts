import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // 生成订单号
  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `ORD${timestamp}${random}`;
  }

  // 创建订单
  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const { packageId, points, bonus, amount } = createOrderDto;

    const orderNo = this.generateOrderNo();

    const order = this.orderRepository.create({
      order_no: orderNo,
      user_id: userId,
      package_id: packageId,
      points,
      bonus,
      amount,
      status: 'pending',
      payment_method: 'wechat',
    });

    const savedOrder = await this.orderRepository.save(order);

    this.logger.log(
      `订单创建成功: orderId=${savedOrder.id}, orderNo=${orderNo}, userId=${userId}, amount=${amount}`,
      'PaymentService',
    );

    return savedOrder;
  }

  // 获取订单详情
  async getOrder(orderId: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  // 生成微信支付参数
  async generateWechatPayment(orderId: number, userId: number): Promise<any> {
    const order = await this.getOrder(orderId, userId);

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不正确');
    }

    // TODO: 实际对接微信支付API
    // 这里返回模拟数据，实际需要调用微信支付统一下单接口
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const prepayId = `wx${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    const packageStr = `prepay_id=${prepayId}`;

    // TODO: 实际需要使用微信支付密钥生成签名
    const signStr = `appId=YOUR_APPID&nonceStr=${nonceStr}&package=${packageStr}&signType=MD5&timeStamp=${timeStamp}&key=YOUR_KEY`;
    const paySign = crypto
      .createHash('md5')
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    this.logger.log(
      `生成微信支付参数: orderId=${orderId}, orderNo=${order.order_no}`,
      'PaymentService',
    );

    return {
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'MD5',
      paySign,
      orderId: order.id,
      orderNo: order.order_no,
      amount: order.amount,
    };
  }

  // 更新订单状态
  async updateOrderStatus(
    orderId: number,
    status: string,
    transactionId?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    order.status = status;
    if (transactionId) {
      order.transaction_id = transactionId;
    }
    if (status === 'paid') {
      order.paid_at = new Date();
    }

    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(
      `订单状态更新: orderId=${orderId}, status=${status}`,
      'PaymentService',
    );

    return updatedOrder;
  }

  // 获取用户订单列表
  async getUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Order[]; total: number }> {
    const [data, total] = await this.orderRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  // 取消订单
  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    const order = await this.getOrder(orderId, userId);

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许取消');
    }

    return this.updateOrderStatus(orderId, 'cancelled');
  }
}
