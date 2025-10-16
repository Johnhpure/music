import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Public } from '@modules/auth/decorators/public.decorator';

@Controller('user/files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    const uploadedFile = await this.fileService.uploadFile(file, req.user.id);

    return {
      id: uploadedFile.id,
      fileName: uploadedFile.file_name,
      originalName: uploadedFile.original_name,
      fileUrl: uploadedFile.file_url,
      fileSize: uploadedFile.file_size,
      fileType: uploadedFile.file_type,
      mimeType: uploadedFile.mime_type,
    };
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    const file = await this.fileService.getFile(parseInt(id, 10));

    return {
      id: file.id,
      fileName: file.file_name,
      originalName: file.original_name,
      fileUrl: file.file_url,
      fileSize: file.file_size,
      fileType: file.file_type,
      mimeType: file.mime_type,
      createdAt: file.created_at,
    };
  }

  @Delete(':id')
  async deleteFile(@Request() req, @Param('id') id: string) {
    await this.fileService.deleteFile(parseInt(id, 10), req.user.id);

    return {
      message: '文件删除成功',
    };
  }
}
