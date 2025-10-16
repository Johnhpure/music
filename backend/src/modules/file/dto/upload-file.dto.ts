import { IsEnum, IsOptional } from 'class-validator';
import { FileType } from '../entities/file.entity';

export class UploadFileDto {
  @IsEnum(FileType)
  @IsOptional()
  fileType?: FileType;
}
