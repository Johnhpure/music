import {
  Injectable,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SunoApiLog, SunoApiTaskType } from './entities/suno-api-log.entity';
import { SunoLyricsTask } from './entities/suno-lyrics-task.entity';
import { SunoExtendTask } from './entities/suno-extend-task.entity';
import { SunoVocalSeparationTask } from './entities/suno-vocal-separation-task.entity';
import { SunoWavConversionTask } from './entities/suno-wav-conversion-task.entity';
import { SunoMusicVideoTask } from './entities/suno-music-video-task.entity';
import { SunoCoverTask } from './entities/suno-cover-task.entity';
import { SunoAddVocalsTask } from './entities/suno-add-vocals-task.entity';
import { SunoAddInstrumentalTask } from './entities/suno-add-instrumental-task.entity';
import { SunoUploadExtendTask } from './entities/suno-upload-extend-task.entity';
import { SunoCoverSunoTask } from './entities/suno-cover-suno-task.entity';
import { SunoCreditUsageLog } from './entities/suno-credit-usage-log.entity';
import { SunoUserStats } from './entities/suno-user-stats.entity';
import { SunoTimestampedLyrics } from './entities/suno-timestamped-lyrics.entity';
import { TaskStatus } from './music.types';
import { SunoConfigService } from '../suno-config/suno-config.service';
import {
  GenerateMusicParams,
  ExtendMusicParams,
  GenerateLyricsParams,
  SeparateVocalsParams,
  ConvertToWavParams,
  CreateMusicVideoParams,
  UploadAndCoverParams,
  CoverSunoParams,
  SunoGenerateRequest,
  SunoTaskResponse,
  SunoTaskStatusResponse,
  SunoLyricsResponse,
  SunoLyricsStatusResponse,
  SunoVocalSeparationResponse,
  SunoWavConversionResponse,
  SunoMusicVideoResponse,
  SunoTimestampedLyricsResponse,
  SunoCreditsResponse,
  CoverSunoResponse,
  CoverSunoStatusResponse,
  BoostMusicStyleParams,
  BoostMusicStyleResult,
  AddVocalsParams,
  AddInstrumentalParams,
  UploadAndExtendParams,
} from './music.types';

@Injectable()
export class SunoService implements OnModuleInit {
  private readonly logger = new Logger(SunoService.name);
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private sunoConfigService: SunoConfigService,
    @InjectRepository(SunoApiLog)
    private sunoApiLogRepository: Repository<SunoApiLog>,
    @InjectRepository(SunoLyricsTask)
    private sunoLyricsTaskRepository: Repository<SunoLyricsTask>,
    @InjectRepository(SunoExtendTask)
    private sunoExtendTaskRepository: Repository<SunoExtendTask>,
    @InjectRepository(SunoVocalSeparationTask)
    private sunoVocalSeparationTaskRepository: Repository<SunoVocalSeparationTask>,
    @InjectRepository(SunoWavConversionTask)
    private sunoWavConversionTaskRepository: Repository<SunoWavConversionTask>,
    @InjectRepository(SunoMusicVideoTask)
    private sunoMusicVideoTaskRepository: Repository<SunoMusicVideoTask>,
    @InjectRepository(SunoCoverTask)
    private sunoCoverTaskRepository: Repository<SunoCoverTask>,
    @InjectRepository(SunoAddVocalsTask)
    private sunoAddVocalsTaskRepository: Repository<SunoAddVocalsTask>,
    @InjectRepository(SunoAddInstrumentalTask)
    private sunoAddInstrumentalTaskRepository: Repository<SunoAddInstrumentalTask>,
    @InjectRepository(SunoUploadExtendTask)
    private sunoUploadExtendTaskRepository: Repository<SunoUploadExtendTask>,
    @InjectRepository(SunoCoverSunoTask)
    private sunoCoverSunoTaskRepository: Repository<SunoCoverSunoTask>,
    @InjectRepository(SunoCreditUsageLog)
    private sunoCreditUsageLogRepository: Repository<SunoCreditUsageLog>,
    @InjectRepository(SunoUserStats)
    private sunoUserStatsRepository: Repository<SunoUserStats>,
    @InjectRepository(SunoTimestampedLyrics)
    private sunoTimestampedLyricsRepository: Repository<SunoTimestampedLyrics>,
  ) {}

  async onModuleInit() {
    await this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    const config = await this.sunoConfigService.getActiveConfig();

    if (config) {
      this.apiKey = config.api_key;
      this.baseUrl = config.api_url;
    } else {
      this.apiKey = this.configService.get<string>('SUNO_API_KEY') || '';
      this.baseUrl =
        this.configService.get<string>('SUNO_API_BASE_URL') ||
        'https://api.sunoapi.org';
    }

    if (!this.apiKey) {
      this.logger.warn(
        'SUNO_API_KEY not configured in database or environment',
      );
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // =====================================================
  // 音乐生成相关API
  // =====================================================

  /**
   * 生成音乐
   * @param params 生成参数
   * @returns SUNO任务ID
   */

  // =====================================================
  // 辅助方法 - 数据库操作
  // =====================================================

  /**
   * 记录API调用日志
   */
  private async logApiCall(
    userId: number,
    taskType: SunoApiTaskType,
    endpoint: string,
    requestParams: any,
    responseData: any,
    statusCode: number,
    success: boolean,
    creditsUsed: number = 0,
    errorMessage?: string,
    responseTime?: number,
    taskId?: string,
  ): Promise<void> {
    try {
      await this.sunoApiLogRepository.save({
        user_id: userId,
        task_type: taskType,
        task_id: taskId,
        api_endpoint: endpoint,
        request_params: requestParams,
        response_data: responseData,
        status_code: statusCode,
        success,
        credits_used: creditsUsed,
        error_message: errorMessage,
        response_time: responseTime,
      });
    } catch (error) {
      this.logger.error('Failed to log API call', error);
    }
  }

  /**
   * 记录积分使用
   */
  private async logCreditUsage(
    userId: number,
    taskType: string,
    taskId: string,
    creditsUsed: number,
    remainingCredits?: number,
  ): Promise<void> {
    try {
      await this.sunoCreditUsageLogRepository.save({
        user_id: userId,
        task_type: taskType as any,
        task_id: taskId,
        credits_used: creditsUsed,
        suno_remaining_credits: remainingCredits,
      });
    } catch (error) {
      this.logger.error('Failed to log credit usage', error);
    }
  }

  /**
   * 更新用户统计
   */
  private async updateUserStats(
    userId: number,
    success: boolean,
    creditsUsed: number = 0,
  ): Promise<void> {
    try {
      const stats = await this.sunoUserStatsRepository.findOne({
        where: { user_id: userId },
      });

      if (stats) {
        stats.total_calls += 1;
        if (success) {
          stats.success_calls += 1;
        } else {
          stats.failed_calls += 1;
        }
        stats.total_credits_used += creditsUsed;
        stats.last_call_at = new Date();
        await this.sunoUserStatsRepository.save(stats);
      } else {
        await this.sunoUserStatsRepository.save({
          user_id: userId,
          total_calls: 1,
          success_calls: success ? 1 : 0,
          failed_calls: success ? 0 : 1,
          total_credits_used: creditsUsed,
          last_call_at: new Date(),
        });
      }
    } catch (error) {
      this.logger.error('Failed to update user stats', error);
    }
  }

  // =====================================================
  // 音乐生成相关API
  // =====================================================

  async generateMusic(params: GenerateMusicParams): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const request: SunoGenerateRequest = {
        customMode: params.customMode,
        instrumental: params.instrumental || false,
        model: params.model,
      };

      // 自定义模式参数
      if (params.customMode) {
        if (!params.title || !params.style) {
          throw new BadRequestException('自定义模式需要提供标题和风格');
        }
        request.title = params.title;
        request.style = params.style;
        if (!params.instrumental && params.lyrics) {
          request.lyrics = params.lyrics;
        }
      } else {
        // 非自定义模式参数
        if (!params.prompt) {
          throw new BadRequestException('非自定义模式需要提供提示词');
        }
        request.prompt = params.prompt;
      }

      // 可选高级参数
      if (params.negativeTags) request.negativeTags = params.negativeTags;
      if (params.vocalGender) request.vocalGender = params.vocalGender;
      if (params.styleWeight !== undefined)
        request.styleWeight = params.styleWeight;
      if (params.weirdnessConstraint !== undefined)
        request.weirdnessConstraint = params.weirdnessConstraint;
      if (params.audioWeight !== undefined)
        request.audioWeight = params.audioWeight;
      
      // 设置正确的回调URL
      const appBaseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
      request.callBackUrl = params.callBackUrl || `${appBaseUrl}/api/suno/miniprogram/callback`;

      this.logger.log(
        `Generating music with Suno API, callBackUrl: ${request.callBackUrl}`,
      );

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/generate',
        request,
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      this.logger.log(
        `Music generation task created: ${response.data.data.taskId}`,
      );
      return response.data.data.taskId;
    } catch (error) {
      this.logger.error('Failed to generate music with Suno API', error);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取音乐生成任务状态
   * @param taskId SUNO任务ID
   * @returns 任务状态信息
   */
  async getTaskStatus(taskId: string): Promise<SunoTaskStatusResponse['data']> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get<SunoTaskStatusResponse>(
        `/api/v1/generate/record-info`,
        {
          params: { taskId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get task status for ${taskId}`, error);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 音乐扩展API
  // =====================================================

  /**
   * 扩展现有音乐
   * @param params 扩展参数
   * @returns SUNO任务ID
   */
  async extendMusic(
    params: ExtendMusicParams,
    userId: number,
    originalMusicTaskId: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        audioId: params.audioId,
        defaultParamFlag: params.defaultParamFlag !== false,
        model: params.model,
      };

      if (params.prompt) request['prompt'] = params.prompt;
      if (params.continueAt !== undefined)
        request['continueAt'] = params.continueAt;
      if (params.callBackUrl) request['callBackUrl'] = params.callBackUrl;

      this.logger.log(`Extending music: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/generate/extend',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.EXTEND,
          '/api/v1/generate/extend',
          request,
          response.data,
          response.data.code,
          false,
          15,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建扩展任务记录
      await this.sunoExtendTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        original_music_task_id: originalMusicTaskId,
        audio_id: params.audioId,
        continue_at: params.continueAt,
        prompt: params.prompt,
        default_param_flag: params.defaultParamFlag !== false,
        model: params.model,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 15,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.EXTEND,
        '/api/v1/generate/extend',
        request,
        response.data,
        200,
        true,
        15,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'EXTEND', taskId, 15);

      // 更新用户统计
      await this.updateUserStats(userId, true, 15);

      this.logger.log(`Music extension task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to extend music with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.EXTEND,
          '/api/v1/generate/extend',
          { audioId: params.audioId },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 歌词生成API
  // =====================================================

  /**
   * 生成歌词
   * @param params 歌词生成参数
   * @returns SUNO任务ID
   */
  async generateLyrics(
    params: GenerateLyricsParams,
    userId: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();
    let taskRecord: SunoLyricsTask;

    try {
      const request = {
        prompt: params.prompt,
        callBackUrl: params.callBackUrl,
      };

      this.logger.log(`Generating lyrics: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoLyricsResponse>(
        '/api/v1/lyrics',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.LYRICS,
          '/api/v1/lyrics',
          request,
          response.data,
          response.data.code,
          false,
          5,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建任务记录
      taskRecord = await this.sunoLyricsTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        prompt: params.prompt,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 5,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.LYRICS,
        '/api/v1/lyrics',
        request,
        response.data,
        200,
        true,
        5,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'LYRICS', taskId, 5);

      // 更新用户统计
      await this.updateUserStats(userId, true, 5);

      this.logger.log(`Lyrics generation task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to generate lyrics with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.LYRICS,
          '/api/v1/lyrics',
          { prompt: params.prompt },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取歌词生成任务状态
   * @param taskId SUNO任务ID
   * @returns 歌词生成结果
   */
  async getLyricsStatus(
    taskId: string,
  ): Promise<SunoLyricsStatusResponse['data']> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get<SunoLyricsStatusResponse>(
        `/api/v1/lyrics/record-info`,
        {
          params: { taskId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get lyrics status for ${taskId}`, error);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取带时间戳的歌词
   * @param audioId SUNO音频ID
   * @returns 带时间戳的歌词数据
   */
  async getTimestampedLyrics(
    audioId: string,
  ): Promise<SunoTimestampedLyricsResponse['data']> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get<SunoTimestampedLyricsResponse>(
        `/api/v1/timestamped-lyrics`,
        {
          params: { audioId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Failed to get timestamped lyrics for ${audioId}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 人声分离API
  // =====================================================

  /**
   * 人声音乐分离
   * @param params 分离参数
   * @returns SUNO任务ID
   */
  async separateVocals(
    params: SeparateVocalsParams,
    userId: number,
    sourceTaskId: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        taskId: params.taskId,
        audioId: params.audioId,
        callBackUrl: params.callBackUrl,
      };

      this.logger.log(`Separating vocals: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoVocalSeparationResponse>(
        '/api/v1/vocal-removal/generate',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.VOCAL_SEPARATION,
          '/api/v1/vocal-removal/generate',
          request,
          response.data,
          response.data.code,
          false,
          10,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建人声分离任务记录
      await this.sunoVocalSeparationTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        source_task_id: sourceTaskId,
        audio_id: params.audioId,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 10,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.VOCAL_SEPARATION,
        '/api/v1/vocal-removal/generate',
        request,
        response.data,
        200,
        true,
        10,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'VOCAL_SEPARATION', taskId, 10);

      // 更新用户统计
      await this.updateUserStats(userId, true, 10);

      this.logger.log(`Vocal separation task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to separate vocals with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.VOCAL_SEPARATION,
          '/api/v1/vocal-removal/generate',
          { taskId: params.taskId, audioId: params.audioId },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取人声分离任务状态
   * @param taskId SUNO任务ID
   * @returns 人声分离结果
   */
  async getVocalSeparationStatus(taskId: string): Promise<any> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get(
        `/api/v1/vocal-removal/record-info`,
        {
          params: { taskId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Failed to get vocal separation status for ${taskId}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // WAV格式转换API
  // =====================================================

  /**
   * 转换为WAV格式
   * @param params 转换参数
   * @returns SUNO任务ID
   */
  async convertToWav(
    params: ConvertToWavParams,
    userId: number,
    sourceTaskId: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        taskId: params.taskId,
        audioId: params.audioId,
        callBackUrl: params.callBackUrl,
      };

      this.logger.log(`Converting to WAV: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoWavConversionResponse>(
        '/api/v1/wav-format/generate',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.WAV_CONVERSION,
          '/api/v1/wav-format/generate',
          request,
          response.data,
          response.data.code,
          false,
          5,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建WAV转换任务记录
      await this.sunoWavConversionTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        source_task_id: sourceTaskId,
        audio_id: params.audioId,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 5,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.WAV_CONVERSION,
        '/api/v1/wav-format/generate',
        request,
        response.data,
        200,
        true,
        5,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'WAV_CONVERSION', taskId, 5);

      // 更新用户统计
      await this.updateUserStats(userId, true, 5);

      this.logger.log(`WAV conversion task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to convert to WAV with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.WAV_CONVERSION,
          '/api/v1/wav-format/generate',
          { taskId: params.taskId, audioId: params.audioId },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取WAV转换任务状态
   * @param taskId SUNO任务ID
   * @returns WAV转换结果
   */
  async getWavConversionStatus(taskId: string): Promise<any> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get(`/api/v1/wav-format/record-info`, {
        params: { taskId },
      });

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Failed to get WAV conversion status for ${taskId}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 音乐视频生成API
  // =====================================================

  /**
   * 生成音乐视频
   * @param params 视频生成参数
   * @returns SUNO任务ID
   */
  async createMusicVideo(
    params: CreateMusicVideoParams,
    userId: number,
    sourceTaskId: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        taskId: params.taskId,
        audioId: params.audioId,
        author: params.author,
        domainName: params.domainName,
        callBackUrl: params.callBackUrl,
      };

      this.logger.log(`Creating music video: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoMusicVideoResponse>(
        '/api/v1/music-video/generate',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.MUSIC_VIDEO,
          '/api/v1/music-video/generate',
          request,
          response.data,
          response.data.code,
          false,
          25,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建音乐视频任务记录
      await this.sunoMusicVideoTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        source_task_id: sourceTaskId,
        audio_id: params.audioId,
        author: params.author,
        domain_name: params.domainName,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 25,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.MUSIC_VIDEO,
        '/api/v1/music-video/generate',
        request,
        response.data,
        200,
        true,
        25,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'MUSIC_VIDEO', taskId, 25);

      // 更新用户统计
      await this.updateUserStats(userId, true, 25);

      this.logger.log(`Music video task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to create music video with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.MUSIC_VIDEO,
          '/api/v1/music-video/generate',
          { taskId: params.taskId, audioId: params.audioId },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取音乐视频生成状态
   * @param taskId SUNO任务ID
   * @returns 音乐视频结果
   */
  async getMusicVideoStatus(taskId: string): Promise<any> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get(
        `/api/v1/music-video/record-info`,
        {
          params: { taskId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Failed to get music video status for ${taskId}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 上传并翻唱API
  // =====================================================

  /**
   * 上传并翻唱音频
   * @param params 翻唱参数
   * @returns SUNO任务ID
   */
  async uploadAndCover(
    params: UploadAndCoverParams,
    userId: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        uploadUrl: params.uploadUrl,
        customMode: params.customMode || false,
        model: params.model,
        callBackUrl: params.callBackUrl,
      };

      if (params.customMode) {
        if (!params.title || !params.style) {
          throw new BadRequestException('自定义模式需要提供标题和风格');
        }
        request['title'] = params.title;
        request['style'] = params.style;
      } else {
        if (!params.prompt) {
          throw new BadRequestException('非自定义模式需要提供提示词');
        }
        request['prompt'] = params.prompt;
      }

      this.logger.log(
        `Uploading and covering audio: ${JSON.stringify(request)}`,
      );

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/upload-cover/generate',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.COVER,
          '/api/v1/upload-cover/generate',
          request,
          response.data,
          response.data.code,
          false,
          30,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建翻唱任务记录
      await this.sunoCoverTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        upload_url: params.uploadUrl,
        custom_mode: params.customMode || false,
        prompt: params.prompt,
        style: params.style,
        title: params.title,
        model: params.model,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 30,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.COVER,
        '/api/v1/upload-cover/generate',
        request,
        response.data,
        200,
        true,
        30,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'COVER', taskId, 30);

      // 更新用户统计
      await this.updateUserStats(userId, true, 30);

      this.logger.log(`Upload and cover task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(
        'Failed to upload and cover audio with Suno API',
        error,
      );

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.COVER,
          '/api/v1/upload-cover/generate',
          { uploadUrl: params.uploadUrl },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 积分查询API
  // =====================================================

  /**
   * 获取剩余积分
   * @returns 剩余积分数
   */
  async getRemainingCredits(): Promise<number> {
    if (!this.apiKey) {
      return 0;
    }

    try {
      const response = await this.client.get<SunoCreditsResponse>(
        '/api/v1/get-credits',
      );

      if (response.data.code === 200) {
        return response.data.data.credits || 0;
      }

      return 0;
    } catch (error) {
      this.logger.warn('Failed to get Suno credits', error);
      return 0;
    }
  }

  // =====================================================
  // 音乐风格增强API
  // =====================================================

  /**
   * 音乐风格增强
   * @param params 风格增强参数
   * @returns 增强后的风格结果
   */
  async boostMusicStyle(params: BoostMusicStyleParams): Promise<any> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const request = {
        content: params.content,
      };

      this.logger.log(`Boosting music style: ${JSON.stringify(request)}`);

      const response = await this.client.post(
        '/api/v1/style/generate',
        request,
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      this.logger.log(
        `Music style boosted: ${JSON.stringify(response.data.data)}`,
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to boost music style with Suno API', error);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 添加人声API
  // =====================================================

  /**
   * 添加人声
   * @param params 人声添加参数
   * @returns SUNO任务ID
   */
  async addVocals(params: AddVocalsParams, userId: number): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        prompt: params.prompt,
        title: params.title,
        negativeTags: params.negativeTags,
        style: params.style,
        uploadUrl: params.uploadUrl,
        callBackUrl: params.callBackUrl,
        model: params.model || 'V4_5PLUS',
      };

      if (params.vocalGender) request['vocalGender'] = params.vocalGender;
      if (params.styleWeight !== undefined)
        request['styleWeight'] = params.styleWeight;
      if (params.weirdnessConstraint !== undefined)
        request['weirdnessConstraint'] = params.weirdnessConstraint;
      if (params.audioWeight !== undefined)
        request['audioWeight'] = params.audioWeight;

      this.logger.log(`Adding vocals: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/generate/add-vocals',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.ADD_VOCALS,
          '/api/v1/generate/add-vocals',
          request,
          response.data,
          response.data.code,
          false,
          20,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建添加人声任务记录
      await this.sunoAddVocalsTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        upload_url: params.uploadUrl,
        prompt: params.prompt,
        title: params.title,
        negative_tags: params.negativeTags,
        style: params.style,
        vocal_gender: params.vocalGender,
        style_weight: params.styleWeight,
        weirdness_constraint: params.weirdnessConstraint,
        audio_weight: params.audioWeight,
        model: params.model,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 20,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.ADD_VOCALS,
        '/api/v1/generate/add-vocals',
        request,
        response.data,
        200,
        true,
        20,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'ADD_VOCALS', taskId, 20);

      // 更新用户统计
      await this.updateUserStats(userId, true, 20);

      this.logger.log(`Add vocals task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to add vocals with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.ADD_VOCALS,
          '/api/v1/generate/add-vocals',
          { uploadUrl: params.uploadUrl, prompt: params.prompt },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 添加伴奏API
  // =====================================================

  /**
   * 添加伴奏
   * @param params 伴奏添加参数
   * @returns SUNO任务ID
   */
  async addInstrumental(
    params: AddInstrumentalParams,
    userId: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        uploadUrl: params.uploadUrl,
        title: params.title,
        negativeTags: params.negativeTags,
        tags: params.tags,
        callBackUrl: params.callBackUrl,
        model: params.model || 'V4_5PLUS',
      };

      if (params.vocalGender) request['vocalGender'] = params.vocalGender;
      if (params.styleWeight !== undefined)
        request['styleWeight'] = params.styleWeight;
      if (params.weirdnessConstraint !== undefined)
        request['weirdnessConstraint'] = params.weirdnessConstraint;
      if (params.audioWeight !== undefined)
        request['audioWeight'] = params.audioWeight;

      this.logger.log(`Adding instrumental: ${JSON.stringify(request)}`);

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/generate/add-instrumental',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.ADD_INSTRUMENTAL,
          '/api/v1/generate/add-instrumental',
          request,
          response.data,
          response.data.code,
          false,
          20,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建添加伴奏任务记录
      await this.sunoAddInstrumentalTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        upload_url: params.uploadUrl,
        title: params.title,
        negative_tags: params.negativeTags,
        tags: params.tags,
        vocal_gender: params.vocalGender,
        style_weight: params.styleWeight,
        weirdness_constraint: params.weirdnessConstraint,
        audio_weight: params.audioWeight,
        model: params.model,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 20,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.ADD_INSTRUMENTAL,
        '/api/v1/generate/add-instrumental',
        request,
        response.data,
        200,
        true,
        20,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'ADD_INSTRUMENTAL', taskId, 20);

      // 更新用户统计
      await this.updateUserStats(userId, true, 20);

      this.logger.log(`Add instrumental task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to add instrumental with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.ADD_INSTRUMENTAL,
          '/api/v1/generate/add-instrumental',
          { uploadUrl: params.uploadUrl, tags: params.tags },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 上传并扩展API
  // =====================================================

  /**
   * 上传并扩展音频
   * @param params 上传扩展参数
   * @returns SUNO任务ID
   */
  async uploadAndExtend(
    params: UploadAndExtendParams,
    userId: number,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        uploadUrl: params.uploadUrl,
        defaultParamFlag: params.defaultParamFlag,
        model: params.model,
        callBackUrl: params.callBackUrl,
      };

      if (params.instrumental !== undefined)
        request['instrumental'] = params.instrumental;
      if (params.prompt) request['prompt'] = params.prompt;
      if (params.style) request['style'] = params.style;
      if (params.title) request['title'] = params.title;
      if (params.continueAt !== undefined)
        request['continueAt'] = params.continueAt;
      if (params.negativeTags) request['negativeTags'] = params.negativeTags;
      if (params.vocalGender) request['vocalGender'] = params.vocalGender;
      if (params.styleWeight !== undefined)
        request['styleWeight'] = params.styleWeight;
      if (params.weirdnessConstraint !== undefined)
        request['weirdnessConstraint'] = params.weirdnessConstraint;
      if (params.audioWeight !== undefined)
        request['audioWeight'] = params.audioWeight;

      this.logger.log(
        `Uploading and extending audio: ${JSON.stringify(request)}`,
      );

      const response = await this.client.post<SunoTaskResponse>(
        '/api/v1/generate/upload-extend',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.UPLOAD_EXTEND,
          '/api/v1/generate/upload-extend',
          request,
          response.data,
          response.data.code,
          false,
          20,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建上传并扩展任务记录
      await this.sunoUploadExtendTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        upload_url: params.uploadUrl,
        default_param_flag: params.defaultParamFlag,
        instrumental: params.instrumental,
        prompt: params.prompt,
        style: params.style,
        title: params.title,
        continue_at: params.continueAt,
        negative_tags: params.negativeTags,
        vocal_gender: params.vocalGender,
        style_weight: params.styleWeight,
        weirdness_constraint: params.weirdnessConstraint,
        audio_weight: params.audioWeight,
        model: params.model,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 20,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.UPLOAD_EXTEND,
        '/api/v1/generate/upload-extend',
        request,
        response.data,
        200,
        true,
        20,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'UPLOAD_EXTEND', taskId, 20);

      // 更新用户统计
      await this.updateUserStats(userId, true, 20);

      this.logger.log(`Upload and extend task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(
        'Failed to upload and extend audio with Suno API',
        error,
      );

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.UPLOAD_EXTEND,
          '/api/v1/generate/upload-extend',
          { uploadUrl: params.uploadUrl },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  // =====================================================
  // 更新：获取剩余积分（使用正确的端点）
  // =====================================================

  /**
   * 获取剩余积分（使用正确的API端点）
   * @returns 剩余积分数
   */
  // =====================================================
  // 音乐封面生成API (Cover Suno)
  // =====================================================

  /**
   * 生成音乐封面
   * @param params 封面生成参数
   * @returns SUNO任务ID
   */
  async coverSuno(
    params: CoverSunoParams,
    userId: number,
    parentTaskId: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    const startTime = Date.now();

    try {
      const request = {
        taskId: params.taskId,
        callBackUrl: params.callBackUrl,
      };

      this.logger.log(`Generating music cover: ${JSON.stringify(request)}`);

      const response = await this.client.post<CoverSunoResponse>(
        '/api/v1/suno/cover/generate',
        request,
      );

      const responseTime = Date.now() - startTime;

      if (response.data.code !== 200) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.COVER_SUNO,
          '/api/v1/suno/cover/generate',
          request,
          response.data,
          response.data.code,
          false,
          10,
          response.data.msg,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      const taskId = response.data.data.taskId;

      // 创建Suno翻唱任务记录
      await this.sunoCoverSunoTaskRepository.save({
        task_id: taskId,
        user_id: userId,
        parent_task_id: parentTaskId,
        status: TaskStatus.PENDING,
        callback_url: params.callBackUrl,
        credit_cost: 10,
      });

      // 记录API调用
      await this.logApiCall(
        userId,
        SunoApiTaskType.COVER_SUNO,
        '/api/v1/suno/cover/generate',
        request,
        response.data,
        200,
        true,
        10,
        undefined,
        responseTime,
        taskId,
      );

      // 记录积分使用
      await this.logCreditUsage(userId, 'COVER_SUNO', taskId, 10);

      // 更新用户统计
      await this.updateUserStats(userId, true, 10);

      this.logger.log(`Music cover task created: ${taskId}`);
      return taskId;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Failed to generate music cover with Suno API', error);

      if (axios.isAxiosError(error)) {
        await this.logApiCall(
          userId,
          SunoApiTaskType.COVER_SUNO,
          '/api/v1/suno/cover/generate',
          { taskId: params.taskId },
          error.response?.data,
          error.response?.status || 500,
          false,
          0,
          error.response?.data?.msg || error.message,
          responseTime,
        );
        await this.updateUserStats(userId, false);
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取音乐封面生成状态
   * @param taskId SUNO任务ID
   * @returns 封面生成结果
   */
  async getCoverSunoDetails(
    taskId: string,
  ): Promise<CoverSunoStatusResponse['data']> {
    if (!this.apiKey) {
      throw new BadRequestException('Suno API未配置');
    }

    try {
      const response = await this.client.get<CoverSunoStatusResponse>(
        `/api/v1/suno/cover/record-info`,
        {
          params: { taskId },
        },
      );

      if (response.data.code !== 200) {
        throw new BadRequestException(`Suno API error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `Failed to get cover suno details for ${taskId}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Suno API调用失败: ${error.response?.data?.msg || error.message}`,
        );
      }
      throw error;
    }
  }

  async getRemainingCreditsV2(): Promise<number> {
    if (!this.apiKey) {
      return 0;
    }

    try {
      const response = await this.client.get('/api/v1/generate/credit');

      if (response.data.code === 200) {
        return response.data.data || 0;
      }

      return 0;
    } catch (error) {
      this.logger.warn('Failed to get Suno credits (V2)', error);
      // 降级到旧端点
      return this.getRemainingCredits();
    }
  }
}
