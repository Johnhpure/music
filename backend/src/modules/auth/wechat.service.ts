import {
  Injectable,
  UnauthorizedException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import axios from 'axios';

interface WechatSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatService {
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.appId = this.configService.get<string>('WECHAT_APPID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_SECRET') || '';
  }

  async getOpenId(code: string): Promise<{ openid: string; unionid?: string }> {
    try {
      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const response = await axios.get<WechatSession>(url, {
        params: {
          appid: this.appId,
          secret: this.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      const data = response.data;

      if (data.errcode) {
        this.logger.error(`微信登录失败: ${data.errmsg}`, 'WechatService');
        throw new UnauthorizedException('微信登录失败');
      }

      if (!data.openid) {
        throw new UnauthorizedException('获取OpenID失败');
      }

      return {
        openid: data.openid,
      };
    } catch (error) {
      this.logger.error(`微信登录异常: ${error.message}`, 'WechatService');
      throw new UnauthorizedException('微信登录失败');
    }
  }

  async getPhoneNumber(code: string): Promise<{ phoneNumber: string }> {
    try {
      // 获取access_token
      const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
      const tokenResponse = await axios.get(tokenUrl, {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret,
        },
      });

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        this.logger.error('获取access_token失败', 'WechatService');
        throw new UnauthorizedException('获取access_token失败');
      }

      // 获取手机号
      const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
      const phoneResponse = await axios.post(phoneUrl, { code });

      const phoneData = phoneResponse.data;

      if (phoneData.errcode && phoneData.errcode !== 0) {
        this.logger.error(
          `获取手机号失败: ${phoneData.errmsg}`,
          'WechatService',
        );
        throw new UnauthorizedException('获取手机号失败');
      }

      if (!phoneData.phone_info || !phoneData.phone_info.phoneNumber) {
        throw new UnauthorizedException('手机号信息不存在');
      }

      return {
        phoneNumber: phoneData.phone_info.phoneNumber,
      };
    } catch (error) {
      this.logger.error(`获取手机号异常: ${error.message}`, 'WechatService');
      throw new UnauthorizedException('获取手机号失败');
    }
  }
}
