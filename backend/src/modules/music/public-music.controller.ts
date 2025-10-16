import { Controller, Get, Param, Query } from '@nestjs/common';
import { MusicService } from './music.service';

@Controller('public/music')
export class PublicMusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('list')
  async getPublicMusicList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.musicService.getPublicTasks(pageNum, limitNum);
  }

  @Get('share/:shareUrl')
  async getSharedMusic(@Param('shareUrl') shareUrl: string) {
    const task = await this.musicService.getSharedTask(
      `/share/music/${shareUrl}`,
    );

    return {
      id: task.id,
      title: task.title,
      lyrics: task.lyrics,
      style: task.style,
      audioUrl: task.audio_url,
      imageUrl: task.image_url,
      videoUrl: task.video_url,
      duration: task.duration,
      model: task.model,
      downloadCount: task.download_count,
      createdAt: task.created_at,
      user: {
        id: task.user.id,
        nickName: task.user.nickname,
        avatarUrl: task.user.avatar,
      },
    };
  }

  @Get(':id/download')
  async downloadPublicMusic(@Param('id') id: string) {
    const downloadUrl = await this.musicService.downloadTask(parseInt(id, 10));

    return {
      downloadUrl,
      message: '下载链接已生成',
    };
  }

  @Get('hot')
  async getHotMusic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'download' | 'like' | 'latest',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.musicService.getHotTasks(
      pageNum,
      limitNum,
      sortBy || 'download',
    );
  }

  @Get('style/:style')
  async getMusicByStyle(
    @Param('style') style: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.musicService.getTasksByStyle(style, pageNum, limitNum);
  }
}
