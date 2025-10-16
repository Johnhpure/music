import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET必须在环境变量中设置');
    }
    await this.initKey(secret);
    this.logger.log('加密服务已初始化');
  }

  private async initKey(secret: string) {
    const scryptAsync = promisify(scrypt);
    this.key = (await scryptAsync(secret, 'salt', 32)) as Buffer;
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) {
      throw new Error('加密内容不能为空');
    }

    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!ciphertext) {
      throw new Error('解密内容不能为空');
    }

    try {
      const [ivBase64, authTagBase64, dataBase64] = ciphertext.split(':');

      if (!ivBase64 || !authTagBase64 || !dataBase64) {
        throw new Error('密文格式无效');
      }

      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const data = Buffer.from(dataBase64, 'base64');

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(data),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`解密失败: ${error.message}`);
      throw new Error('解密失败，密文可能已损坏');
    }
  }
}
