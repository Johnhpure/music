import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 响应数据格式
 */
export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 响应转换拦截器
 * 统一格式化成功响应数据
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
