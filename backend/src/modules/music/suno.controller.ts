import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { SunoService } from './suno.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CreateMusicDto } from './dto/create-music.dto';
import { ExtendMusicDto } from './dto/extend-music.dto';
import { GenerateSunoLyricsDto } from './dto/generate-suno-lyrics.dto';
import { SeparateVocalsDto } from './dto/separate-vocals.dto';
import { ConvertToWavDto } from './dto/convert-to-wav.dto';
import { CreateMusicVideoDto } from './dto/create-music-video.dto';
import { UploadAndCoverDto } from './dto/upload-and-cover.dto';
import { CoverSunoDto } from './dto/cover-suno.dto';

@ApiTags('SUNO API')
@Controller('user/suno')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SunoController {
  constructor(private readonly sunoService: SunoService) {}

  // =====================================================
  // 音乐生成相关API
  // =====================================================

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成音乐（SUNO API）',
    description:
      '使用SUNO AI生成原创音乐，支持自定义模式和非自定义模式，可设置风格、人声性别等高级参数。',
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
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '参数错误或SUNO API调用失败',
  })
  @ApiResponse({
    status: 402,
    description: '点数不足',
  })
  async generateMusic(@Request() req, @Body() dto: CreateMusicDto) {
    const taskId = await this.sunoService.generateMusic({
      customMode: dto.customMode !== false,
      instrumental: dto.instrumental || false,
      model: dto.model,
      prompt: dto.prompt,
      title: dto.title,
      style: dto.style,
      lyrics: dto.lyrics,
    });

    return {
      code: 200,
      message: '音乐生成任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('generate/:taskId')
  @ApiOperation({
    summary: '查询音乐生成任务状态',
    description: '根据任务ID查询SUNO音乐生成任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
    example: 'suno_task_abc123',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: 'suno_task_abc123',
          status: 'SUCCESS',
          response: {
            data: [
              {
                id: 'audio_123',
                audio_url: 'https://example.com/audio.mp3',
                title: '生成的音乐',
                duration: 180.5,
              },
            ],
          },
        },
      },
    },
  })
  async getTaskStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getTaskStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 音乐扩展API
  // =====================================================

  @Post('extend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '扩展现有音乐',
    description: '对已生成的音乐进行扩展，添加新的内容段落',
  })
  @ApiResponse({
    status: 200,
    description: '扩展任务创建成功',
  })
  async extendMusic(@Request() req, @Body() dto: ExtendMusicDto) {
    // TODO: 通过audioId查找originalMusicTaskId
    const taskId = await this.sunoService.extendMusic(
      {
        audioId: dto.audioId,
        defaultParamFlag: dto.defaultParamFlag,
        prompt: dto.prompt,
        continueAt: dto.continueAt,
        model: dto.model,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
      0, // TODO: 从数据库中查找原始任务ID
    );

    return {
      code: 200,
      message: '音乐扩展任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('extend/:taskId')
  @ApiOperation({
    summary: '查询音乐扩展任务状态',
    description: '查询音乐扩展任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  async getExtendStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getTaskStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 歌词生成API
  // =====================================================

  @Post('lyrics/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成AI歌词（SUNO）',
    description: '使用SUNO API生成AI创作的歌词',
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
        },
      },
    },
  })
  async generateLyrics(@Request() req, @Body() dto: GenerateSunoLyricsDto) {
    const taskId = await this.sunoService.generateLyrics(
      {
        prompt: dto.prompt,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
    );

    return {
      code: 200,
      message: '歌词生成任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('lyrics/:taskId')
  @ApiOperation({
    summary: '查询歌词生成任务状态',
    description: '查询歌词生成任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: 'suno_lyrics_abc123',
          status: 'SUCCESS',
          data: [
            {
              id: 'lyrics_123',
              text: '主歌:\n阳光洒在沙滩上...',
              title: '夏日海滩',
            },
          ],
        },
      },
    },
  })
  async getLyricsStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getLyricsStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  @Get('lyrics/timestamped/:audioId')
  @ApiOperation({
    summary: '获取带时间戳的歌词',
    description: '获取指定音频的带时间戳歌词，用于歌词同步显示',
  })
  @ApiParam({
    name: 'audioId',
    description: 'SUNO音频ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          audioId: 'audio_123',
          lyrics: [
            {
              timestamp: 0.5,
              text: '主歌第一句',
            },
            {
              timestamp: 5.2,
              text: '主歌第二句',
            },
          ],
        },
      },
    },
  })
  async getTimestampedLyrics(@Param('audioId') audioId: string) {
    const data = await this.sunoService.getTimestampedLyrics(audioId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 人声分离API
  // =====================================================

  @Post('vocal-separation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '人声音乐分离',
    description: '将音乐分离为纯人声和纯伴奏两个轨道',
  })
  @ApiResponse({
    status: 200,
    description: '人声分离任务创建成功',
  })
  async separateVocals(@Request() req, @Body() dto: SeparateVocalsDto) {
    const taskId = await this.sunoService.separateVocals(
      {
        taskId: dto.taskId,
        audioId: dto.audioId,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
      dto.taskId,
    );

    return {
      code: 200,
      message: '人声分离任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('vocal-separation/:taskId')
  @ApiOperation({
    summary: '查询人声分离任务状态',
    description: '查询人声分离任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: 'suno_vocal_abc123',
          status: 'SUCCESS',
          vocal_removal_info: {
            instrumental_url: 'https://example.com/instrumental.mp3',
            vocal_url: 'https://example.com/vocal.mp3',
          },
        },
      },
    },
  })
  async getVocalSeparationStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getVocalSeparationStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // WAV格式转换API
  // =====================================================

  @Post('convert-to-wav')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '转换为WAV格式',
    description: '将生成的音乐转换为高质量WAV格式',
  })
  @ApiResponse({
    status: 200,
    description: 'WAV转换任务创建成功',
  })
  async convertToWav(@Request() req, @Body() dto: ConvertToWavDto) {
    const taskId = await this.sunoService.convertToWav(
      {
        taskId: dto.taskId,
        audioId: dto.audioId,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
      dto.taskId,
    );

    return {
      code: 200,
      message: 'WAV转换任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('convert-to-wav/:taskId')
  @ApiOperation({
    summary: '查询WAV转换任务状态',
    description: '查询WAV转换任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: 'suno_wav_abc123',
          status: 'SUCCESS',
          wav_url: 'https://example.com/music.wav',
          file_size: 10485760,
        },
      },
    },
  })
  async getWavConversionStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getWavConversionStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 音乐视频生成API
  // =====================================================

  @Post('music-video')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '创建音乐视频',
    description: '为生成的音乐创建可视化视频',
  })
  @ApiResponse({
    status: 200,
    description: '音乐视频任务创建成功',
  })
  async createMusicVideo(@Request() req, @Body() dto: CreateMusicVideoDto) {
    const taskId = await this.sunoService.createMusicVideo(
      {
        taskId: dto.taskId,
        audioId: dto.audioId,
        author: dto.author,
        domainName: dto.domainName,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
      dto.taskId,
    );

    return {
      code: 200,
      message: '音乐视频任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('music-video/:taskId')
  @ApiOperation({
    summary: '查询音乐视频生成状态',
    description: '查询音乐视频生成任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: 'suno_video_abc123',
          status: 'SUCCESS',
          video_url: 'https://example.com/video.mp4',
          thumbnail_url: 'https://example.com/thumb.jpg',
          duration: 180.5,
        },
      },
    },
  })
  async getMusicVideoStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getMusicVideoStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 上传并翻唱API
  // =====================================================

  @Post('upload-cover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '上传音频并生成翻唱',
    description: '上传自己的音频文件，使用SUNO AI生成翻唱版本',
  })
  @ApiResponse({
    status: 200,
    description: '翻唱任务创建成功',
  })
  async uploadAndCover(@Request() req, @Body() dto: UploadAndCoverDto) {
    const taskId = await this.sunoService.uploadAndCover(
      {
        uploadUrl: dto.uploadUrl,
        customMode: dto.customMode,
        prompt: dto.prompt,
        style: dto.style,
        title: dto.title,
        model: dto.model,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
    );

    return {
      code: 200,
      message: '翻唱任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('upload-and-cover/:taskId')
  @ApiOperation({
    summary: '查询翻唱任务状态',
    description: '查询翻唱任务的状态和结果',
  })
  @ApiParam({
    name: 'taskId',
    description: 'SUNO任务ID',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
  })
  async getCoverStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getTaskStatus(taskId);

    return {
      code: 200,
      data,
    };
  }

  // =====================================================
  // 积分查询API
  // =====================================================

  // =====================================================
  // 音乐封面生成API (Cover Suno)
  // =====================================================

  @Post('cover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成音乐封面图',
    description: '为SUNO生成的音乐创建封面图片',
  })
  @ApiResponse({
    status: 200,
    description: '封面生成任务创建成功',
    schema: {
      example: {
        code: 200,
        message: '封面生成任务已创建',
        data: {
          taskId: 'suno_cover_abc123',
        },
      },
    },
  })
  async coverSuno(@Request() req, @Body() dto: CoverSunoDto) {
    const taskId = await this.sunoService.coverSuno(
      {
        taskId: dto.taskId,
        callBackUrl: dto.callBackUrl,
      },
      req.user.id,
      dto.taskId,
    );

    return {
      code: 200,
      message: '封面生成任务已创建',
      data: {
        taskId,
      },
    };
  }

  @Get('cover-suno/:taskId')
  @ApiOperation({
    summary: '查询音乐封面生成状态',
    description: '查询音乐封面生成任务的状态和结果，获取封面图像URL',
  })
  @ApiParam({
    name: 'taskId',
    description: '封面生成任务ID',
    example: '21aee3c3c2a01fa5e030b3799fa4dd56',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          taskId: '21aee3c3c2a01fa5e030b3799fa4dd56',
          parentTaskId: '73d6128b3523a0079df10da9471017c8',
          callbackUrl: 'https://api.example.com/callback',
          completeTime: '2025-01-15T10:35:27.000Z',
          response: {
            images: [
              'https://example.com/cover1.png',
              'https://example.com/cover2.png',
            ],
          },
          successFlag: 1,
          createTime: '2025-01-15T10:33:01.000Z',
          errorCode: 200,
          errorMessage: '',
        },
      },
    },
  })
  async getCoverSunoStatus(@Param('taskId') taskId: string) {
    const data = await this.sunoService.getCoverSunoDetails(taskId);

    return {
      code: 200,
      data,
    };
  }

  @Get('credits')
  @ApiOperation({
    summary: '查询SUNO API剩余积分',
    description: '查询当前账户在SUNO API的剩余积分数',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        data: {
          credits: 500,
        },
      },
    },
  })
  async getRemainingCredits() {
    const credits = await this.sunoService.getRemainingCredits();

    return {
      code: 200,
      data: {
        credits,
      },
    };
  }
}
