import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { UploadController } from './upload.controller';
import { FileService } from './file.service';
import { StorageService } from './storage.service';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController, UploadController],
  providers: [FileService, StorageService],
  exports: [FileService, StorageService],
})
export class FileModule {}
