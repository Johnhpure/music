import {
  Injectable,
  BadRequestException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { File, FileType, StorageType } from './entities/file.entity';
import { StorageService } from './storage.service';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'audio/ogg',
  ];
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ];

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private storageService: StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId?: number,
    fileType?: FileType,
  ): Promise<File> {
    this.validateFile(file, fileType);

    const detectedType = this.detectFileType(file.mimetype);
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = `${detectedType}_${timestamp}_${random}${ext}`;
    const subPath = `${detectedType}s/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    const fileUrl = await this.storageService.upload(file, subPath);

    const fileRecord = this.fileRepository.create({
      user_id: userId,
      original_name: file.originalname,
      file_name: fileName,
      file_path: subPath,
      file_url: fileUrl,
      file_type: detectedType,
      file_size: file.size,
      mime_type: file.mimetype,
      storage_type: StorageType.LOCAL,
    });

    const saved = await this.fileRepository.save(fileRecord);

    this.logger.log(
      `File uploaded: ${fileName}, user: ${userId}`,
      'FileService',
    );

    return saved;
  }

  async deleteFile(fileId: number, userId?: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new BadRequestException('文件不存在');
    }

    if (userId && file.user_id !== userId) {
      throw new BadRequestException('无权删除此文件');
    }

    await this.storageService.delete(file.file_path);
    await this.fileRepository.delete(fileId);

    this.logger.log(`File deleted: ${file.file_name}`, 'FileService');
  }

  async getFile(fileId: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new BadRequestException('文件不存在');
    }

    return file;
  }

  private validateFile(file: Express.Multer.File, fileType?: FileType): void {
    if (!file) {
      throw new BadRequestException('未提供文件');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小不能超过${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (fileType) {
      const allowedTypes = this.getAllowedTypes(fileType);
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
      }
    }
  }

  private detectFileType(mimeType: string): FileType {
    if (this.ALLOWED_AUDIO_TYPES.includes(mimeType)) {
      return FileType.AUDIO;
    }
    if (this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return FileType.IMAGE;
    }
    if (this.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      return FileType.VIDEO;
    }
    return FileType.OTHER;
  }

  private getAllowedTypes(fileType: FileType): string[] {
    switch (fileType) {
      case FileType.AUDIO:
        return this.ALLOWED_AUDIO_TYPES;
      case FileType.IMAGE:
        return this.ALLOWED_IMAGE_TYPES;
      case FileType.VIDEO:
        return this.ALLOWED_VIDEO_TYPES;
      default:
        return [];
    }
  }
}
