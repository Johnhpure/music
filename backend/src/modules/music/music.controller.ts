import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('user/music')
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post('generate')
  async generateMusic(@Request() req, @Body() dto: CreateMusicDto) {
    const task = await this.musicService.createMusicTask(req.user.id, dto);

    return {
      taskId: task.id,
      status: task.status,
      message: '音乐生成任务已创建，请稍后查询结果',
    };
  }

  @Get('tasks')
  async getUserTasks(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.musicService.getUserTasks(req.user.id, pageNum, limitNum);
  }

  @Get('tasks/:id')
  async getTaskById(@Request() req, @Param('id') id: string) {
    const task = await this.musicService.getTaskById(
      req.user.id,
      parseInt(id, 10),
    );

    return {
      id: task.id,
      title: task.title,
      lyrics: task.lyrics,
      style: task.style,
      status: task.status,
      audioUrl: task.audio_url,
      videoUrl: task.video_url,
      imageUrl: task.image_url,
      duration: task.duration,
      model: task.model,
      instrumental: task.instrumental,
      creditCost: task.credit_cost,
      errorMessage: task.error_message,
      createdAt: task.created_at,
      completedAt: task.completed_at,
    };
  }

  @Post('tasks/:id/share')
  async shareTask(@Request() req, @Param('id') id: string) {
    const shareUrl = await this.musicService.shareTask(
      req.user.id,
      parseInt(id, 10),
    );

    return {
      shareUrl,
      message: '分享链接已生成',
    };
  }

  @Patch('tasks/:id/public')
  async togglePublic(
    @Request() req,
    @Param('id') id: string,
    @Body('isPublic') isPublic: boolean,
  ) {
    await this.musicService.togglePublicStatus(
      req.user.id,
      parseInt(id, 10),
      isPublic,
    );

    return {
      message: isPublic ? '作品已设为公开' : '作品已设为私密',
    };
  }

  @Get('tasks/:id/download')
  async downloadTask(@Request() req, @Param('id') id: string) {
    const downloadUrl = await this.musicService.downloadTask(
      parseInt(id, 10),
      req.user.id,
    );

    return {
      downloadUrl,
      message: '下载链接已生成',
    };
  }

  @Post('tasks/:id/like')
  async likeTask(@Request() req, @Param('id') id: string) {
    await this.musicService.likeTask(req.user.id, parseInt(id, 10));

    return {
      message: '点赞成功',
    };
  }

  @Post('tasks/:id/unlike')
  async unlikeTask(@Request() req, @Param('id') id: string) {
    await this.musicService.unlikeTask(req.user.id, parseInt(id, 10));

    return {
      message: '取消点赞成功',
    };
  }

  @Get('tasks/:id/check-like')
  async checkLike(@Request() req, @Param('id') id: string) {
    const liked = await this.musicService.checkUserLiked(
      req.user.id,
      parseInt(id, 10),
    );

    return {
      liked,
    };
  }
}
