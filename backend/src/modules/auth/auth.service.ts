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
    // 支持用户名或邮箱登录
    const user = await this.userService.findByUsernameOrEmail(username);

    if (!user) {
      this.logger.warn(
        `登录失败：用户不存在 - ${username}`,
        'AuthService',
      );
      return null;
    }

    // 检查是否有密码
    if (!user.password) {
      this.logger.warn(
        `登录失败：用户未设置密码 - ${username}`,
        'AuthService',
      );
      return null;
    }

    // 验证密码
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `登录失败：密码错误 - ${username}`,
        'AuthService',
      );
      return null;
    }

    this.logger.log(`用户验证成功: ${user.id} (${username})`, 'AuthService');
    return user;
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

  async logout(userId: number) {
    this.logger.log(`用户退出登录: ${userId}`, 'AuthService');

    // 对于JWT，我们在前端删除token
    // 如果将来需要实现token黑名单，可以在这里添加逻辑
    return {
      message: '退出登录成功',
    };
  }
}
