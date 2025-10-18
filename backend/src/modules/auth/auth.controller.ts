import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { WechatPhoneDto } from './dto/wechat-phone.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('wechat-login')
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  @Post('refresh-token')
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('wechat/phone')
  async bindPhoneNumber(@Request() req, @Body() wechatPhoneDto: WechatPhoneDto) {
    return this.authService.bindPhoneNumber(req.user.id, wechatPhoneDto.code);
  }
}
