import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadPath =
      this.configService.get<string>('STORAGE_PATH') ||
      path.join(process.cwd(), 'uploads');
    this.baseUrl =
      this.configService.get<string>('STORAGE_BASE_URL') ||
      'http://localhost:3000/uploads';

    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  async upload(file: Express.Multer.File, subPath: string): Promise<string> {
    const filePath = path.join(this.uploadPath, subPath);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, file.buffer);

    this.logger.log(`File uploaded: ${subPath}`);
    // 返回相对路径，而不是完整的URL
    return `/uploads/${subPath.replace(/\\/g, '/')}`;
  }

  async uploadFromUrl(url: string, subPath: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const filePath = path.join(this.uploadPath, subPath);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await fs.promises.writeFile(filePath, Buffer.from(response.data));

      this.logger.log(`File downloaded and saved: ${subPath}`);
      // 返回相对路径，而不是完整的URL
      return `/uploads/${subPath.replace(/\\/g, '/')}`;
    } catch (error) {
      this.logger.error(`Failed to download file from ${url}`, error);
      throw error;
    }
  }

  async delete(subPath: string): Promise<void> {
    const filePath = path.join(this.uploadPath, subPath);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(`File deleted: ${subPath}`);
    }
  }

  getFileUrl(subPath: string): string {
    // 返回相对路径，而不是完整的URL
    return `/uploads/${subPath.replace(/\\/g, '/')}`;
  }

  fileExists(subPath: string): boolean {
    const filePath = path.join(this.uploadPath, subPath);
    return fs.existsSync(filePath);
  }

  getFilePath(subPath: string): string {
    return path.join(this.uploadPath, subPath);
  }

  async getFileSize(subPath: string): Promise<number> {
    const filePath = path.join(this.uploadPath, subPath);
    const stats = await fs.promises.stat(filePath);
    return stats.size;
  }
}
