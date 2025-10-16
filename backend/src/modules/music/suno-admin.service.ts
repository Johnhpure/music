import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { MusicTask } from './entities/music-task.entity';
import { SunoService } from './suno.service';
import { TaskStatus } from './music.types';

/**
 * SUNO API 管理服务
 * 提供统计分析、日志查询等管理功能
 */
@Injectable()
export class SunoAdminService {
  private readonly logger = new Logger(SunoAdminService.name);

  constructor(
    @InjectRepository(MusicTask)
    private musicTaskRepository: Repository<MusicTask>,
    private sunoService: SunoService,
  ) {}

  /**
   * 获取统计数据
   */
  async getStatistics(startDate?: string, endDate?: string) {
    const whereConditions: any = {};

    // 日期筛选
    if (startDate || endDate) {
      whereConditions.created_at = Between(
        startDate ? new Date(startDate) : new Date('2000-01-01'),
        endDate ? new Date(endDate) : new Date(),
      );
    }

    // 总览统计
    const totalCalls = await this.musicTaskRepository.count({
      where: whereConditions,
    });

    const successCalls = await this.musicTaskRepository.count({
      where: {
        ...whereConditions,
        status: 'success',
      },
    });

    const failedCalls = await this.musicTaskRepository.count({
      where: {
        ...whereConditions,
        status: 'failed',
      },
    });

    const successRate = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;

    // 积分消耗统计
    const creditStats = await this.musicTaskRepository
      .createQueryBuilder('task')
      .select('SUM(task.credit_cost)', 'totalCredits')
      .where(whereConditions)
      .getRawOne();

    const totalCreditsUsed = parseInt(creditStats?.totalCredits || '0', 10);

    // 按类型统计
    const byTypeStats = await this.musicTaskRepository
      .createQueryBuilder('task')
      .select('COUNT(*)', 'count')
      .addSelect('task.model', 'model')
      .where(whereConditions)
      .groupBy('task.model')
      .getRawMany();

    const byType = {
      V3_5: 0,
      V4: 0,
      V4_5: 0,
      V4_5PLUS: 0,
      V5: 0,
    };

    byTypeStats.forEach((stat) => {
      if (stat.model && byType[stat.model] !== undefined) {
        byType[stat.model] = parseInt(stat.count, 10);
      }
    });

    // 按日期统计（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDateStats = await this.musicTaskRepository
      .createQueryBuilder('task')
      .select('DATE(task.created_at)', 'date')
      .addSelect('COUNT(*)', 'calls')
      .addSelect('SUM(task.credit_cost)', 'credits')
      .where('task.created_at >= :date', { date: thirtyDaysAgo })
      .groupBy('DATE(task.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const byDate = byDateStats.map((stat) => ({
      date: stat.date,
      calls: parseInt(stat.calls, 10),
      credits: parseInt(stat.credits || '0', 10),
    }));

    return {
      overview: {
        totalCalls,
        successCalls,
        failedCalls,
        successRate: parseFloat(successRate.toFixed(2)),
        totalCreditsUsed,
      },
      byType,
      byDate,
      period: {
        startDate: startDate || thirtyDaysAgo.toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
      },
    };
  }

  /**
   * 获取实时统计（最近24小时）
   */
  async getRealtimeStatistics() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentTasks = await this.musicTaskRepository.count({
      where: {
        created_at: Between(twentyFourHoursAgo, new Date()),
      },
    });

    const recentSuccess = await this.musicTaskRepository.count({
      where: {
        created_at: Between(twentyFourHoursAgo, new Date()),
        status: TaskStatus.SUCCESS,
      },
    });

    const recentFailed = await this.musicTaskRepository.count({
      where: {
        created_at: Between(twentyFourHoursAgo, new Date()),
        status: TaskStatus.FAILED,
      },
    });

    const generating = await this.musicTaskRepository.count({
      where: {
        status: In([TaskStatus.PENDING, TaskStatus.GENERATING]),
      },
    });

    return {
      last24Hours: {
        total: recentTasks,
        success: recentSuccess,
        failed: recentFailed,
        successRate:
          recentTasks > 0
            ? parseFloat(((recentSuccess / recentTasks) * 100).toFixed(2))
            : 0,
      },
      currentStatus: {
        generating,
        queueLength: generating,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 按用户统计
   */
  async getStatisticsByUser(page = 1, limit = 20) {
    const query = this.musicTaskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.nickname', 'userName')
      .addSelect('user.avatar', 'userAvatar')
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect(
        'SUM(CASE WHEN task.status = "success" THEN 1 ELSE 0 END)',
        'successTasks',
      )
      .addSelect('SUM(task.credit_cost)', 'totalCredits')
      .addSelect('MAX(task.created_at)', 'lastUsed')
      .groupBy('user.id')
      .orderBy('totalTasks', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const items = await query.getRawMany();

    const total = await this.musicTaskRepository
      .createQueryBuilder('task')
      .select('COUNT(DISTINCT task.user_id)', 'count')
      .getRawOne();

    return {
      items: items.map((item) => ({
        userId: item.userId,
        userName: item.userName || '未知用户',
        userAvatar: item.userAvatar,
        totalTasks: parseInt(item.totalTasks, 10),
        successTasks: parseInt(item.successTasks || '0', 10),
        totalCredits: parseInt(item.totalCredits || '0', 10),
        lastUsed: item.lastUsed,
      })),
      total: parseInt(total?.count || '0', 10),
      page,
      limit,
      totalPages: Math.ceil(parseInt(total?.count || '0', 10) / limit),
    };
  }

  /**
   * 获取调用日志
   */
  async getLogs(params: {
    page: number;
    limit: number;
    taskType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, taskType, userId, startDate, endDate } = params;

    const query = this.musicTaskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .orderBy('task.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // 应用筛选条件
    if (userId) {
      query.andWhere('task.user_id = :userId', { userId });
    }

    if (taskType) {
      // 这里可以根据taskType筛选，目前所有任务都在music_tasks表中
      // 实际可以通过其他字段区分
    }

    if (startDate) {
      query.andWhere('task.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('task.created_at <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    const [items, total] = await query.getManyAndCount();

    return {
      items: items.map((task) => ({
        id: task.id,
        userId: task.user_id,
        userName: task.user?.nickname || '未知用户',
        taskType: 'generate', // 可以通过其他字段判断
        taskId: task.suno_task_id,
        title: task.title,
        model: task.model,
        status: task.status,
        creditsUsed: task.credit_cost,
        errorMessage: task.error_message,
        createdAt: task.created_at,
        completedAt: task.completed_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取日志详情
   */
  async getLogDetail(id: number) {
    const task = await this.musicTaskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      userId: task.user_id,
      userName: task.user?.nickname || '未知用户',
      userAvatar: task.user?.avatar,
      taskId: task.suno_task_id,
      title: task.title,
      lyrics: task.lyrics,
      style: task.style,
      prompt: task.prompt,
      model: task.model,
      instrumental: task.instrumental,
      status: task.status,
      audioUrl: task.audio_url,
      videoUrl: task.video_url,
      imageUrl: task.image_url,
      duration: task.duration,
      creditsUsed: task.credit_cost,
      errorMessage: task.error_message,
      sunoResponse: task.suno_response,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    let apiAvailable = false;
    let credits = 0;
    let errorMessage = null;

    try {
      credits = await this.sunoService.getRemainingCredits();
      apiAvailable = true;
    } catch (error) {
      errorMessage = error.message;
      this.logger.error('SUNO API health check failed', error);
    }

    const queueLength = await this.musicTaskRepository.count({
      where: {
        status: In(['pending', 'generating']),
      },
    });

    // 计算平均响应时间（基于最近100个完成的任务）
    const recentCompletedTasks = await this.musicTaskRepository.find({
      where: {
        status: TaskStatus.SUCCESS,
        completed_at: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
      order: {
        completed_at: 'DESC',
      },
      take: 100,
    });

    let averageResponseTime = 0;
    if (recentCompletedTasks.length > 0) {
      const totalTime = recentCompletedTasks.reduce((sum, task) => {
        if (task.completed_at && task.created_at) {
          return (
            sum +
            (task.completed_at.getTime() - task.created_at.getTime()) / 1000
          );
        }
        return sum;
      }, 0);
      averageResponseTime = totalTime / recentCompletedTasks.length;
    }

    return {
      status: apiAvailable ? 'healthy' : 'unhealthy',
      apiAvailable,
      credits,
      queueLength,
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      errorMessage,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * 获取仪表板数据
   */
  async getDashboardData() {
    const [statistics, realtimeStats, health] = await Promise.all([
      this.getStatistics(),
      this.getRealtimeStatistics(),
      this.healthCheck(),
    ]);

    // 获取最近的任务
    const recentTasks = await this.musicTaskRepository.find({
      relations: ['user'],
      order: {
        created_at: 'DESC',
      },
      take: 10,
    });

    // 获取Top用户
    const topUsers = await this.getStatisticsByUser(1, 5);

    return {
      overview: {
        ...statistics.overview,
        sunoCredits: health.credits,
        queueLength: health.queueLength,
      },
      realtime: realtimeStats,
      health,
      charts: {
        byType: statistics.byType,
        byDate: statistics.byDate,
      },
      recentTasks: recentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        userName: task.user?.nickname || '未知用户',
        status: task.status,
        model: task.model,
        createdAt: task.created_at,
      })),
      topUsers: topUsers.items,
      timestamp: new Date().toISOString(),
    };
  }
}
