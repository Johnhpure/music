import {
  Controller,
  Post,
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

/**
 * 专门处理公开文件上传的控制器
 * 路由前缀: /upload
 */
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 头像上传接口（公开，用于小程序）
   * POST /api/upload/avatar
   */
  @Public()
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('请上传头像');
    }

    // 验证是否为图片
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('只能上传图片文件');
    }

    // 验证文件大小（限制为5MB）
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('头像文件不能超过5MB');
    }

    const uploadedFile = await this.fileService.uploadFile(file, req.user?.id);

    return {
      code: 200,
      message: '头像上传成功',
      data: {
        url: uploadedFile.file_url,
        avatarUrl: uploadedFile.file_url,
      },
    };
  }
}
