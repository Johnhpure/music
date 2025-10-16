import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BaseException,
  BusinessException,
  SystemException,
} from '@common/exceptions/base.exception';

/**
 * 全局异常过滤器
 * 统一处理所有异常并格式化响应
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_ERROR';

    // 业务异常
    if (exception instanceof BusinessException) {
      status =
        exception.code >= 400 && exception.code < 600
          ? exception.code
          : HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = exception.error || 'BUSINESS_ERROR';
    }
    // 系统异常
    else if (exception instanceof SystemException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = exception.error || 'SYSTEM_ERROR';

      // 系统异常需要记录详细错误日志
      this.logger.error(`System Error: ${exception.message}`, exception.stack);
    }
    // NestJS HTTP异常
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
      }
    }
    // 未知错误
    else if (exception instanceof Error) {
      message = exception.message;

      // 记录未知错误的详细信息
      this.logger.error(
        `Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    }

    // 统一响应格式
    const errorResponse = {
      code: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // 开发环境返回堆栈信息
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    // 记录错误日志
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }
}
