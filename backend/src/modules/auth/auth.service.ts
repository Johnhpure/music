import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/user.service';
import { WechatService } from './wechat.service';
import { RegisterDto } from './dto/register.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { User } from '@modules/user/entities/user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly wechatService: WechatService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    // Password authentication is not supported in current database schema
    // Only WeChat login is supported
    this.logger.warn(
      'Password authentication attempted but not supported',
      'AuthService',
    );
    return null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`用户登录成功: ${user.id}`, 'AuthService');

    return {
      access_token: token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        credit: user.credit,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { phone, email, password, nickname } = registerDto;

    if (!phone && !email) {
      throw new ConflictException('手机号或邮箱必须提供一个');
    }

    // 生成默认昵称，确保安全处理边界情况
    let defaultNickname = '用户';
    if (phone) {
      const suffix =
        phone.length >= 4 ? phone.slice(-4) : phone.padStart(4, '0');
      defaultNickname = `用户${suffix}`;
    } else if (email) {
      const emailPrefix = email.includes('@') ? email.split('@')[0] : email;
      defaultNickname = `用户${emailPrefix.substring(0, 20)}`;
    }

    const user = await this.userService.create({
      phone,
      email,
      password,
      nickname: nickname || defaultNickname,
    });

    this.logger.log(`新用户注册成功: ${user.id}`, 'AuthService');

    return this.login(user);
  }

  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    const { code } = wechatLoginDto;

    const { openid } = await this.wechatService.getOpenId(code);

    let user = await this.userService.findByOpenid(openid);

    if (!user) {
      user = await this.userService.create({
        openid,
        nickname: `微信用户${openid.slice(-6)}`,
      });
      this.logger.log(`微信新用户创建: ${user.id}`, 'AuthService');
    }

    return this.login(user);
  }

  async refreshToken(userId: number) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Token刷新成功: ${user.id}`, 'AuthService');

    return {
      access_token: token,
      expiresIn: 604800, // 7 days in seconds
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        credit: user.credit,
      },
    };
  }
}
