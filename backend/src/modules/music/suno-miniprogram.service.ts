import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { SunoService } from './suno.service';
import { User } from '../user/entities/user.entity';
import { MusicTask } from './entities/music-task.entity';
import { TaskStatus, MusicModel } from './music.types';
import { MiniGenerateMusicDto } from './dto/miniprogram/mini-generate-music.dto';
import { MiniExtendMusicDto } from './dto/miniprogram/mini-extend-music.dto';
import { MiniGenerateLyricsDto } from './dto/miniprogram/mini-generate-lyrics.dto';

@Injectable()
export class SunoMiniprogramService {
  private readonly logger = new Logger(SunoMiniprogramService.name);

  constructor(
    private readonly sunoService: SunoService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MusicTask)
    private readonly musicTaskRepository: Repository<MusicTask>,
  ) {}

  /**
   * 生成音乐（小程序专用接口）
   * 1. 检查用户积分
   * 2. 扣除积分（事务保护）
   * 3. 创建music_tasks记录
   * 4. 调用SunoService.generateMusic
   * 5. 更新music_tasks的suno_task_id
   */
  async generateMusic(userId: number, dto: MiniGenerateMusicDto) {
    const creditCost = 20;

    // 检查用户积分
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.credit < creditCost) {
      throw new BadRequestException(
        `积分不足，需要${creditCost}点，当前仅有${user.credit}点`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣除积分
      await queryRunner.manager.update(
        User,
        { id: userId },
        { credit: () => `credit - ${creditCost}` },
      );

      this.logger.log(`User ${userId} deducted ${creditCost} credits`);

      // 创建music_tasks记录
      const generatedTaskId = randomUUID();
      this.logger.log(`Generated task_id: ${generatedTaskId}`);
      
      const musicTask = await queryRunner.manager.save(MusicTask, {
        task_id: generatedTaskId,
        user_id: userId,
        title: dto.title,
        lyrics: dto.lyrics,
        style: dto.style,
        prompt: dto.prompt,
        instrumental: dto.instrumental || false,
        model: dto.model || MusicModel.V3_5,
        status: TaskStatus.PENDING,
        credit_cost: creditCost,
      });

      this.logger.log(
        `Created music task ${(musicTask as any).id} for user ${userId}`,
      );

      // 调用SunoService生成音乐
      const taskId = await this.sunoService.generateMusic({
        customMode: true,
        title: dto.title,
        style: dto.style,
        lyrics: dto.lyrics,
        prompt: dto.prompt,
        instrumental: dto.instrumental,
        vocalGender: dto.vocalGender,
        model: dto.model || MusicModel.V3_5,
      });

      // 更新music_tasks的suno_task_id
      await queryRunner.manager.update(
        MusicTask,
        { id: (musicTask as any).id },
        { suno_task_id: taskId },
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Music generation started: taskId=${taskId}, musicTaskId=${musicTask.id}`,
      );

      return {
        taskId,
        musicTaskId: (musicTask as any).id,
        estimatedTime: 60, // 预估60秒
        creditCost,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate music', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询音乐生成状态
   * 1. 调用SunoService.getTaskStatus
   * 2. 查询本地music_tasks记录
   * 3. 更新本地记录状态
   * 4. 失败时退还积分
   * 5. 返回格式化的状态信息
   */
  async getTaskStatus(userId: number, taskId: string) {
    try {
      // 调用SUNO API查询状态
      const sunoStatus = await this.sunoService.getTaskStatus(taskId);

      // 查询本地music_tasks记录
      const musicTask = await this.musicTaskRepository.findOne({
        where: { suno_task_id: taskId },
        relations: ['user'],
      });

      if (!musicTask) {
        throw new NotFoundException('任务不存在');
      }

      // 验证任务所有权
      if (musicTask.user.id !== userId) {
        throw new BadRequestException('无权访问此任务');
      }

      // 更新本地记录状态
      const previousStatus = musicTask.status;
      const newStatus = this.mapSunoStatusToTaskStatus(sunoStatus.status);

      if (previousStatus !== newStatus) {
        const updateData: Partial<MusicTask> = { status: newStatus };

        // 成功时更新音频信息
        if (newStatus === TaskStatus.SUCCESS && sunoStatus.response?.data) {
          const firstResult = sunoStatus.response.data[0];
          if (firstResult) {
            updateData.audio_url = firstResult.audio_url;
            updateData.image_url = firstResult.image_url;
            updateData.video_url = firstResult.video_url;
            updateData.duration = firstResult.duration;
            updateData.completed_at = new Date();
            updateData.suno_response = sunoStatus.response.data;
          }
        }

        // 失败时退还积分
        if (
          newStatus === TaskStatus.FAILED &&
          previousStatus !== TaskStatus.FAILED
        ) {
          await this.userRepository.update(
            { id: userId },
            { credit: () => `credit + ${musicTask.credit_cost}` },
          );
          updateData.error_message = sunoStatus.errorMessage || '生成失败';
          this.logger.log(
            `Refunded ${musicTask.credit_cost} credits to user ${userId}`,
          );
        }

        await this.musicTaskRepository.update({ id: musicTask.id }, updateData);
      }

      // 返回格式化的状态信息
      return {
        status: newStatus,
        progress: this.calculateProgress(sunoStatus.status),
        statusText: this.getStatusText(sunoStatus.status),
        result: sunoStatus.response?.data,
        errorMessage: sunoStatus.errorMessage,
      };
    } catch (error) {
      this.logger.error(`Failed to get task status for ${taskId}`, error);
      throw error;
    }
  }

  /**
   * 扩展音乐（小程序专用接口）
   * 1. 查找原始音乐任务
   * 2. 检查用户积分
   * 3. 扣除积分（事务保护）
   * 4. 调用SunoService.extendMusic
   * 5. 返回taskId
   */
  async extendMusic(userId: number, dto: MiniExtendMusicDto) {
    const creditCost = 15;

    // 检查用户积分
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.credit < creditCost) {
      throw new BadRequestException(
        `积分不足，需要${creditCost}点，当前仅有${user.credit}点`,
      );
    }

    // 查找原始音乐任务（可选：验证audio_id是否属于用户）
    // 注：SunoService.extendMusic会处理积分扣除和记录，这里只需传入userId
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣除积分
      await queryRunner.manager.update(
        User,
        { id: userId },
        { credit: () => `credit - ${creditCost}` },
      );

      this.logger.log(`User ${userId} deducted ${creditCost} credits`);

      await queryRunner.commitTransaction();

      // 调用SunoService扩展音乐（注意：SunoService.extendMusic需要originalMusicTaskId）
      // 这里简化处理，假设audio_id对应的任务存在
      const taskId = await this.sunoService.extendMusic(
        {
          audioId: dto.audioId,
          prompt: dto.prompt,
          continueAt: dto.continueAt,
          defaultParamFlag: true,
          model: MusicModel.V3_5, // 默认使用V3_5模型
        },
        userId,
        0, // originalMusicTaskId，如果需要可以查询
      );

      this.logger.log(`Music extension started: taskId=${taskId}`);

      return {
        taskId,
        estimatedTime: 45, // 预估45秒
        creditCost,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to extend music', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 生成歌词（小程序专用接口）
   * 1. 检查用户积分
   * 2. 扣除积分（事务保护）
   * 3. 调用SunoService.generateLyrics
   * 4. 返回taskId
   */
  async generateLyrics(userId: number, dto: MiniGenerateLyricsDto) {
    const creditCost = 5;

    // 检查用户积分
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.credit < creditCost) {
      throw new BadRequestException(
        `积分不足，需要${creditCost}点，当前仅有${user.credit}点`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣除积分
      await queryRunner.manager.update(
        User,
        { id: userId },
        { credit: () => `credit - ${creditCost}` },
      );

      this.logger.log(`User ${userId} deducted ${creditCost} credits`);

      await queryRunner.commitTransaction();

      // 调用SunoService生成歌词
      const taskId = await this.sunoService.generateLyrics(
        { prompt: dto.prompt },
        userId,
      );

      this.logger.log(`Lyrics generation started: taskId=${taskId}`);

      return {
        taskId,
        estimatedTime: 30, // 预估30秒
        creditCost,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate lyrics', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询歌词生成状态
   */
  async getLyricsStatus(taskId: string) {
    try {
      const lyricsStatus = await this.sunoService.getLyricsStatus(taskId);
      return {
        status: lyricsStatus.status,
        progress: this.calculateProgress(lyricsStatus.status),
        statusText: this.getStatusText(lyricsStatus.status),
        result: lyricsStatus.data,
        errorMessage: lyricsStatus.errorMessage,
      };
    } catch (error) {
      this.logger.error(`Failed to get lyrics status for ${taskId}`, error);
      throw error;
    }
  }

  /**
   * 查询用户积分
   */
  async getUserCredits(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'credit'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      userId: user.id,
      credits: user.credit,
    };
  }

  /**
   * 辅助方法：计算进度百分比
   */
  private calculateProgress(status: string): number {
    const progressMap: Record<string, number> = {
      PENDING: 0,
      TEXT_SUCCESS: 30,
      GENERATING: 50,
      FIRST_SUCCESS: 70,
      SUCCESS: 100,
      FAILED: 100,
    };
    return progressMap[status] || 0;
  }

  /**
   * 辅助方法：获取状态文本描述
   */
  private getStatusText(status: string): string {
    const statusTextMap: Record<string, string> = {
      PENDING: '任务排队中...',
      TEXT_SUCCESS: '歌词已生成，开始生成音乐...',
      GENERATING: '音乐生成中...',
      FIRST_SUCCESS: '第一首音乐已完成...',
      SUCCESS: '音乐生成完成',
      FAILED: '生成失败',
    };
    return statusTextMap[status] || '未知状态';
  }

  /**
   * 辅助方法：将SUNO状态映射到TaskStatus
   */
  private mapSunoStatusToTaskStatus(status: string): TaskStatus {
    switch (status) {
      case 'PENDING':
      case 'TEXT_SUCCESS':
        return TaskStatus.PENDING;
      case 'GENERATING':
      case 'FIRST_SUCCESS':
        return TaskStatus.GENERATING;
      case 'SUCCESS':
        return TaskStatus.SUCCESS;
      case 'FAILED':
        return TaskStatus.FAILED;
      default:
        return TaskStatus.PENDING;
    }
  }
}
