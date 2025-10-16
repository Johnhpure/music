/**
 * 异常基类
 */
export abstract class BaseException extends Error {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly error?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 业务异常
 * 用于可预见的业务逻辑错误
 */
export class BusinessException extends BaseException {
  constructor(code: number, message: string, error?: string) {
    super(code, message, error);
  }
}

/**
 * 系统异常
 * 用于系统级错误,如数据库连接失败等
 */
export class SystemException extends BaseException {
  constructor(code: number, message: string, error?: string) {
    super(code, message, error);
  }
}

/**
 * 外部API异常
 * 用于第三方API调用失败
 */
export class ExternalApiException extends BaseException {
  constructor(code: number, message: string, error?: string) {
    super(code, message, error);
  }
}

/**
 * 常见业务异常错误码
 */
export const ErrorCodes = {
  // 用户相关 (4xx)
  UNAUTHORIZED: {
    code: 401,
    message: '未授权,请先登录',
    error: 'UNAUTHORIZED',
  },
  FORBIDDEN: { code: 403, message: '没有权限', error: 'FORBIDDEN' },
  NOT_FOUND: { code: 404, message: '资源不存在', error: 'NOT_FOUND' },
  INVALID_PARAMS: { code: 422, message: '参数错误', error: 'INVALID_PARAMS' },

  // 点数相关
  INSUFFICIENT_CREDITS: {
    code: 402,
    message: '点数不足',
    error: 'INSUFFICIENT_CREDITS',
  },

  // 外部服务相关 (5xx)
  GEMINI_API_ERROR: {
    code: 503,
    message: 'AI服务暂时不可用',
    error: 'GEMINI_API_ERROR',
  },
  SUNO_API_ERROR: {
    code: 503,
    message: '音乐生成服务暂时不可用',
    error: 'SUNO_API_ERROR',
  },
  WECHAT_API_ERROR: {
    code: 503,
    message: '微信服务暂时不可用',
    error: 'WECHAT_API_ERROR',
  },

  // 系统错误
  DATABASE_ERROR: { code: 500, message: '数据库错误', error: 'DATABASE_ERROR' },
  REDIS_ERROR: { code: 500, message: '缓存服务错误', error: 'REDIS_ERROR' },
  INTERNAL_ERROR: {
    code: 500,
    message: '服务器内部错误',
    error: 'INTERNAL_ERROR',
  },
};
