import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SunoMiniprogramService } from './suno-miniprogram.service';
import { MiniGenerateMusicDto } from './dto/miniprogram/mini-generate-music.dto';
import { MiniExtendMusicDto } from './dto/miniprogram/mini-extend-music.dto';
import { MiniGenerateLyricsDto } from './dto/miniprogram/mini-generate-lyrics.dto';

/**
 * 小程序专用Suno API控制器
 */
@ApiTags('小程序-音乐生成')
@Controller('suno/miniprogram')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SunoMiniprogramController {
  constructor(
    private readonly sunoMiniprogramService: SunoMiniprogramService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成音乐',
    description: '小程序用户生成AI音乐，自动扣除积分并保存到作品库',
  })
  @ApiResponse({
    status: 200,
    description: '音乐生成任务创建成功',
    schema: {
      example: {
        code: 200,
        message: '音乐生成任务已创建',
        data: {
          taskId: 'suno_task_abc123',
          musicTaskId: 123,
          estimatedTime: 180,
          creditCost: 20,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '参数错误或积分不足',
  })
  async generateMusic(@Request() req, @Body() dto: MiniGenerateMusicDto) {
    const result = await this.sunoMiniprogramService.generateMusic(
      req.user.id,
      dto,
    );

    return {
      code: 200,
      message: '音乐生成任务已创建',
      data: result,
    };
  }

  @Get('task/:taskId')
  @ApiOperation({
    summary: '查询音乐生成任务状态',
    description: '查询任务进度和结果，包含进度百分比',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Suno任务ID',
    example: 'suno_task_abc123',
  })
  @ApiResponse({
    status: 200,
    description: '任务状态查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          taskId: 'suno_task_abc123',
          status: 'SUCCESS',
          callbackType: 'complete',
          progress: 100,
          statusText: '音乐生成完成',
          result: [
            {
              id: 'audio_123',
              audio_url: 'https://example.com/audio.mp3',
              image_url: 'https://example.com/cover.jpg',
              title: '夏日海滩',
              tags: 'pop, 欢快',
              duration: 180.5,
            },
          ],
          errorMessage: null,
        },
      },
    },
  })
  async getTaskStatus(@Request() req, @Param('taskId') taskId: string) {
    const result = await this.sunoMiniprogramService.getTaskStatus(
      req.user.id,
      taskId,
    );

    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  @Post('extend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '扩展音乐',
    description: '对已生成的音乐进行延长，消耗15点积分',
  })
  @ApiResponse({
    status: 200,
    description: '音乐扩展任务创建成功',
    schema: {
      example: {
        code: 200,
        message: '音乐扩展任务已创建',
        data: {
          taskId: 'suno_extend_abc123',
          estimatedTime: 180,
          creditCost: 15,
        },
      },
    },
  })
  async extendMusic(@Request() req, @Body() dto: MiniExtendMusicDto) {
    const result = await this.sunoMiniprogramService.extendMusic(
      req.user.id,
      dto,
    );

    return {
      code: 200,
      message: '音乐扩展任务已创建',
      data: result,
    };
  }

  @Post('lyrics/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成歌词',
    description: 'AI辅助创作歌词，消耗5点积分',
  })
  @ApiResponse({
    status: 200,
    description: '歌词生成任务创建成功',
    schema: {
      example: {
        code: 200,
        message: '歌词生成任务已创建',
        data: {
          taskId: 'suno_lyrics_abc123',
          estimatedTime: 30,
          creditCost: 5,
        },
      },
    },
  })
  async generateLyrics(@Request() req, @Body() dto: MiniGenerateLyricsDto) {
    const result = await this.sunoMiniprogramService.generateLyrics(
      req.user.id,
      dto,
    );

    return {
      code: 200,
      message: '歌词生成任务已创建',
      data: result,
    };
  }

  @Get('lyrics/:taskId')
  @ApiOperation({
    summary: '查询歌词生成状态',
    description: '查询歌词生成任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Suno歌词任务ID',
    example: 'suno_lyrics_abc123',
  })
  @ApiResponse({
    status: 200,
    description: '歌词状态查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          taskId: 'suno_lyrics_abc123',
          status: 'SUCCESS',
          lyrics: '主歌:\n...\n\n副歌:\n...',
        },
      },
    },
  })
  async getLyricsStatus(@Request() req, @Param('taskId') taskId: string) {
    const result = await this.sunoMiniprogramService.getLyricsStatus(taskId);

    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  @Get('credits')
  @ApiOperation({
    summary: '查询用户剩余积分',
    description: '获取当前用户的剩余点数',
  })
  @ApiResponse({
    status: 200,
    description: '积分查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          userId: 1,
          credits: 500,
        },
      },
    },
  })
  async getUserCredits(@Request() req) {
    const result = await this.sunoMiniprogramService.getUserCredits(
      req.user.id,
    );

    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }
}
