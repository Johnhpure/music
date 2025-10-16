import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicTask } from '../entities/music-task.entity';
import { SunoService } from '../suno.service';
import { MusicService } from '../music.service';
import { TaskStatus } from '../music.types';

interface MusicJobData {
  taskId: number;
  userId: number;
}

@Processor('music')
export class MusicTaskProcessor {
  private readonly logger = new Logger(MusicTaskProcessor.name);
  private readonly MAX_POLL_ATTEMPTS = 60;
  private readonly POLL_INTERVAL = 10000;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly winstonLogger: Logger,
    @InjectRepository(MusicTask)
    private musicTaskRepository: Repository<MusicTask>,
    private sunoService: SunoService,
    private musicService: MusicService,
  ) {}

  @OnQueueActive()
  onActive(job: Job<MusicJobData>) {
    this.logger.log(`Processing job ${job.id} for task ${job.data.taskId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<MusicJobData>) {
    this.logger.log(`Job ${job.id} completed for task ${job.data.taskId}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job<MusicJobData>, err: Error) {
    this.logger.error(`Job ${job.id} failed for task ${job.data.taskId}`, err);

    await this.musicService.updateTaskStatus(
      job.data.taskId,
      TaskStatus.FAILED,
      {
        error_message: err.message,
      },
    );
  }

  @Process('generate')
  async handleMusicGeneration(job: Job<MusicJobData>) {
    const { taskId, userId } = job.data;

    try {
      const task = await this.musicTaskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      await this.musicService.updateTaskStatus(taskId, TaskStatus.GENERATING);

      const sunoTaskId = await this.sunoService.generateMusic({
        prompt: task.prompt,
        customMode: !!task.style,
        style: task.style,
        title: task.title,
        lyrics: task.lyrics,
        instrumental: task.instrumental,
        model: task.model,
      });

      await this.musicTaskRepository.update(taskId, {
        suno_task_id: sunoTaskId,
      });

      this.logger.log(
        `Suno task ${sunoTaskId} created for music task ${taskId}`,
      );

      const result = await this.pollTaskStatus(sunoTaskId, taskId);

      if (result && result.length > 0) {
        const firstResult = result[0];

        await this.musicService.updateTaskStatus(taskId, TaskStatus.SUCCESS, {
          suno_response: result,
          audio_url: firstResult.audio_url,
          video_url: firstResult.video_url,
          image_url: firstResult.image_url,
          duration: firstResult.duration,
        });

        this.winstonLogger.log(
          `Music generation completed for task ${taskId}, audio: ${firstResult.audio_url}`,
          'MusicTaskProcessor',
        );

        // Phase 4: 自动本地化音频
        try {
          await this.musicService.localizeAudio(taskId);
          this.logger.log(`Audio localized for task ${taskId}`);
        } catch (error) {
          this.logger.warn(
            `Failed to localize audio for task ${taskId}, using remote URL`,
            error,
          );
        }
      } else {
        throw new Error('No result returned from Suno API');
      }

      return { success: true, taskId, audioUrl: result[0].audio_url };
    } catch (error) {
      this.logger.error(`Music generation failed for task ${taskId}`, error);

      await this.musicService.updateTaskStatus(taskId, TaskStatus.FAILED, {
        error_message: error.message,
      });

      throw error;
    }
  }

  private async pollTaskStatus(
    sunoTaskId: string,
    musicTaskId: number,
  ): Promise<any[]> {
    for (let attempt = 0; attempt < this.MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const status = await this.sunoService.getTaskStatus(sunoTaskId);

        this.logger.debug(
          `Polling Suno task ${sunoTaskId} (attempt ${attempt + 1}/${this.MAX_POLL_ATTEMPTS}): ${status.status}`,
        );

        if (status.status === 'SUCCESS' && status.response?.data) {
          return status.response.data;
        }

        if (status.status === 'FAILED') {
          throw new Error(
            `Suno task failed: ${status.errorMessage || 'Unknown error'}`,
          );
        }

        await this.sleep(this.POLL_INTERVAL);
      } catch (error) {
        this.logger.error(`Error polling Suno task ${sunoTaskId}`, error);

        if (attempt === this.MAX_POLL_ATTEMPTS - 1) {
          throw error;
        }

        await this.sleep(this.POLL_INTERVAL);
      }
    }

    throw new Error(
      `Music generation timeout after ${this.MAX_POLL_ATTEMPTS} attempts`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
