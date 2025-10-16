import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MusicTask } from './entities/music-task.entity';
import { CreateMusicDto } from './dto/create-music.dto';
import { SunoService } from './suno.service';
import { CreditService } from '@modules/credit/credit.service';
import { StorageService } from '@modules/file/storage.service';
import { TaskStatus, MusicModel } from './music.types';

@Injectable()
export class MusicService {
  private readonly MUSIC_GENERATION_COST = 20;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(MusicTask)
    private musicTaskRepository: Repository<MusicTask>,
    @InjectQueue('music') private musicQueue: Queue,
    private sunoService: SunoService,
    private creditService: CreditService,
    private storageService: StorageService,
    private dataSource: DataSource,
  ) {}

  async createMusicTask(
    userId: number,
    dto: CreateMusicDto,
  ): Promise<MusicTask> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.creditService.consumeCredit(userId, {
        amount: this.MUSIC_GENERATION_COST,
        description: '生成AI音乐',
        related_type: 'music_generation',
      });

      const task = this.musicTaskRepository.create({
        user_id: userId,
        title: dto.title,
        lyrics: dto.lyrics,
        style: dto.style,
        prompt: dto.prompt,
        instrumental: dto.instrumental || false,
        model: dto.model || MusicModel.V3_5,
        status: TaskStatus.PENDING,
        credit_cost: this.MUSIC_GENERATION_COST,
      });

      const savedTask = await queryRunner.manager.save(task);

      await this.musicQueue.add(
        'generate',
        {
          taskId: savedTask.id,
          userId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Music task created: ${savedTask.id} for user ${userId}`);

      return savedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create music task', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('创建音乐任务失败');
    } finally {
      await queryRunner.release();
    }
  }

  async getTaskById(userId: number, taskId: number): Promise<MusicTask> {
    const task = await this.musicTaskRepository.findOne({
      where: { id: taskId, user_id: userId },
    });

    if (!task) {
      throw new BadRequestException('任务不存在');
    }

    return task;
  }

  async getUserTasks(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.musicTaskRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        style: item.style,
        status: item.status,
        audioUrl: item.audio_url,
        videoUrl: item.video_url,
        imageUrl: item.image_url,
        duration: item.duration,
        model: item.model,
        creditCost: item.credit_cost,
        errorMessage: item.error_message,
        createdAt: item.created_at,
        completedAt: item.completed_at,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateTaskStatus(
    taskId: number,
    status: TaskStatus,
    data?: Partial<MusicTask>,
  ): Promise<void> {
    const updateData: any = { status };

    if (data) {
      Object.assign(updateData, data);
    }

    if (status === TaskStatus.SUCCESS || status === TaskStatus.FAILED) {
      updateData.completed_at = new Date();
    }

    await this.musicTaskRepository.update(taskId, updateData);

    this.logger.log(`Task ${taskId} status updated to ${status}`);
  }

  async shareTask(userId: number, taskId: number): Promise<string> {
    const task = await this.getTaskById(userId, taskId);

    if (task.status !== TaskStatus.SUCCESS) {
      throw new BadRequestException('只能分享已成功生成的音乐');
    }

    if (task.share_url) {
      return task.share_url;
    }

    const shareToken = `${taskId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const shareUrl = `/share/music/${shareToken}`;

    await this.musicTaskRepository.update(taskId, {
      share_url: shareUrl,
      is_public: true,
    });

    this.logger.log(`Task ${taskId} shared with URL: ${shareUrl}`);

    return shareUrl;
  }

  async getSharedTask(shareUrl: string): Promise<MusicTask> {
    const task = await this.musicTaskRepository.findOne({
      where: { share_url: shareUrl, is_public: true },
      relations: ['user'],
    });

    if (!task) {
      throw new BadRequestException('分享链接不存在或已失效');
    }

    return task;
  }

  async downloadTask(taskId: number, userId?: number): Promise<string> {
    let task: MusicTask;

    if (userId) {
      task = await this.getTaskById(userId, taskId);
    } else {
      task = await this.musicTaskRepository.findOne({
        where: { id: taskId, is_public: true },
      });

      if (!task) {
        throw new BadRequestException('作品不存在或未公开');
      }
    }

    if (task.status !== TaskStatus.SUCCESS) {
      throw new BadRequestException('音乐尚未生成完成');
    }

    await this.musicTaskRepository.increment(
      { id: taskId },
      'download_count',
      1,
    );

    this.logger.log(`Task ${taskId} download count incremented`);

    return task.local_audio_path || task.audio_url;
  }

  async localizeAudio(taskId: number): Promise<string> {
    const task = await this.musicTaskRepository.findOne({
      where: { id: taskId },
    });

    if (!task || !task.audio_url) {
      throw new BadRequestException('任务或音频不存在');
    }

    if (task.local_audio_path) {
      this.logger.log(
        `Audio already localized for task ${taskId}: ${task.local_audio_path}`,
      );
      return task.local_audio_path;
    }

    try {
      this.logger.log(
        `Localizing audio for task ${taskId} from ${task.audio_url}`,
      );

      const ext = '.mp3';
      const fileName = `music_${taskId}_${Date.now()}${ext}`;
      const subPath = `music/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

      const localUrl = await this.storageService.uploadFromUrl(
        task.audio_url,
        subPath,
      );

      await this.musicTaskRepository.update(taskId, {
        local_audio_path: subPath,
      });

      this.logger.log(`Audio localized for task ${taskId}: ${localUrl}`);

      return localUrl;
    } catch (error) {
      this.logger.error(`Failed to localize audio for task ${taskId}`, error);
      return task.audio_url;
    }
  }

  async togglePublicStatus(
    userId: number,
    taskId: number,
    isPublic: boolean,
  ): Promise<void> {
    const task = await this.getTaskById(userId, taskId);

    if (task.status !== TaskStatus.SUCCESS) {
      throw new BadRequestException('只能公开已成功生成的音乐');
    }

    await this.musicTaskRepository.update(taskId, {
      is_public: isPublic,
    });

    this.logger.log(`Task ${taskId} public status set to ${isPublic}`);
  }

  async getPublicTasks(page = 1, limit = 20) {
    const [items, total] = await this.musicTaskRepository.findAndCount({
      where: {
        is_public: true,
        status: TaskStatus.SUCCESS,
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        style: item.style,
        audioUrl: item.audio_url,
        imageUrl: item.image_url,
        duration: item.duration,
        shareUrl: item.share_url,
        downloadCount: item.download_count,
        createdAt: item.created_at,
        user: {
          id: item.user.id,
          nickName: item.user.nickname,
          avatarUrl: item.user.avatar,
        },
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async likeTask(userId: number, taskId: number): Promise<void> {
    const task = await this.musicTaskRepository.findOne({
      where: { id: taskId, is_public: true, status: TaskStatus.SUCCESS },
    });

    if (!task) {
      throw new BadRequestException('作品不存在或未公开');
    }

    const UserMusicLike = this.dataSource.getRepository('UserMusicLike');

    const existingLike = await UserMusicLike.findOne({
      where: { user_id: userId, music_task_id: taskId },
    });

    if (existingLike) {
      throw new BadRequestException('已经点赞过了');
    }

    await UserMusicLike.save({
      user_id: userId,
      music_task_id: taskId,
    });

    await this.musicTaskRepository.increment({ id: taskId }, 'like_count', 1);

    this.logger.log(`User ${userId} liked task ${taskId}`);
  }

  async unlikeTask(userId: number, taskId: number): Promise<void> {
    const UserMusicLike = this.dataSource.getRepository('UserMusicLike');

    const like = await UserMusicLike.findOne({
      where: { user_id: userId, music_task_id: taskId },
    });

    if (!like) {
      throw new BadRequestException('未点赞过');
    }

    await UserMusicLike.remove(like);

    await this.musicTaskRepository.decrement({ id: taskId }, 'like_count', 1);

    this.logger.log(`User ${userId} unliked task ${taskId}`);
  }

  async checkUserLiked(userId: number, taskId: number): Promise<boolean> {
    const UserMusicLike = this.dataSource.getRepository('UserMusicLike');

    const like = await UserMusicLike.findOne({
      where: { user_id: userId, music_task_id: taskId },
    });

    return !!like;
  }

  async getHotTasks(
    page = 1,
    limit = 20,
    sortBy: 'download' | 'like' | 'latest' = 'download',
  ) {
    const queryBuilder = this.musicTaskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.is_public = :isPublic', { isPublic: true })
      .andWhere('task.status = :status', { status: TaskStatus.SUCCESS });

    switch (sortBy) {
      case 'download':
        queryBuilder.orderBy('task.download_count', 'DESC');
        break;
      case 'like':
        queryBuilder.orderBy('task.like_count', 'DESC');
        break;
      case 'latest':
        queryBuilder.orderBy('task.created_at', 'DESC');
        break;
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        style: item.style,
        audioUrl: item.audio_url,
        imageUrl: item.image_url,
        duration: item.duration,
        shareUrl: item.share_url,
        downloadCount: item.download_count,
        likeCount: item.like_count,
        createdAt: item.created_at,
        user: {
          id: item.user.id,
          nickName: item.user.nickname,
          avatarUrl: item.user.avatar,
        },
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTasksByStyle(style: string, page = 1, limit = 20) {
    const [items, total] = await this.musicTaskRepository.findAndCount({
      where: {
        is_public: true,
        status: TaskStatus.SUCCESS,
        style,
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        style: item.style,
        audioUrl: item.audio_url,
        imageUrl: item.image_url,
        duration: item.duration,
        downloadCount: item.download_count,
        likeCount: item.like_count,
        createdAt: item.created_at,
        user: {
          id: item.user.id,
          nickName: item.user.nickname,
          avatarUrl: item.user.avatar,
        },
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
