import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class BanGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('未登录，需要身份验证');
    }

    if (user.is_banned) {
      throw new ForbiddenException('您的账号已被封禁，无法使用此功能');
    }

    return true;
  }
}
