import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 全局验证管道
 * 自动验证DTO
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 跳过实体类（Entity）的验证，只验证DTO
    const className = metatype.name;
    if (
      className === 'User' ||
      className === 'PromptTemplate' ||
      className === 'HotRecommendation' ||
      className === 'Banner' ||
      className === 'Order' ||
      className === 'CreditLog' ||
      className === 'MusicTask' ||
      className.endsWith('Entity')
    ) {
      console.log(`🔓 跳过实体类验证: ${className}`);
      return value;
    }

    const logData = {
      timestamp: new Date().toISOString(),
      rawData: value,
      targetType: metatype?.name,
    };

    console.log('🔍 ValidationPipe - 原始数据:', JSON.stringify(value));
    console.log('🔍 ValidationPipe - 目标类型:', metatype?.name);

    // 写入调试日志文件
    try {
      const logFile = path.join(process.cwd(), 'logs', 'validation-debug.log');
      fs.appendFileSync(logFile, JSON.stringify(logData) + '\n');
    } catch (e) {
      console.error('写入调试日志失败:', e.message);
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      });

      const errorData = {
        timestamp: new Date().toISOString(),
        messages,
        object,
        errors,
      };

      console.log('❌ 参数验证失败:', messages);
      console.log('❌ 验证对象:', JSON.stringify(object));
      console.log('❌ 详细错误:', JSON.stringify(errors, null, 2));

      // 写入错误日志文件
      try {
        const logFile = path.join(
          process.cwd(),
          'logs',
          'validation-debug.log',
        );
        fs.appendFileSync(
          logFile,
          'ERROR: ' + JSON.stringify(errorData, null, 2) + '\n',
        );
      } catch (e) {
        console.error('写入错误日志失败:', e.message);
      }

      throw new BadRequestException({
        code: 400,
        message: '参数验证失败',
        error: 'VALIDATION_ERROR',
        details: messages,
        fields: errors.map((err) => ({
          field: err.property,
          value: err.value,
          constraints: err.constraints,
        })),
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private isEntity(metatype: Function): boolean {
    // 检查是否是实体类
    const className = metatype.name;
    return (
      className === 'User' ||
      className.endsWith('Entity') ||
      Reflect.hasMetadata('design:type', metatype)
    );
  }
}
