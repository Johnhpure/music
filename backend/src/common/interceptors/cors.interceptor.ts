import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const origin = request.headers.origin;

    console.log(
      `[CORS Interceptor] ${request.method} ${request.url}, Origin: ${origin}`,
    );

    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,DELETE,PATCH,OPTIONS',
      );
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization,X-Requested-With,Accept',
      );
      response.setHeader(
        'Access-Control-Expose-Headers',
        'Content-Range,X-Content-Range',
      );
      response.setHeader('Access-Control-Max-Age', '3600');

      console.log(`[CORS Interceptor] Headers set for origin: ${origin}`);
    }

    return next.handle().pipe(
      tap(() => {
        console.log(`[CORS Interceptor] Response sent`);
      }),
    );
  }
}
