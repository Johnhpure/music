import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLog } from '../entities/admin-log.entity';

export interface CreateAuditLogDto {
  adminId: number;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface QueryAuditLogDto {
  page?: number;
  pageSize?: number;
  action?: string;
  adminId?: number;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AdminLog)
    private adminLogRepository: Repository<AdminLog>,
  ) {}

  async log(logData: CreateAuditLogDto): Promise<AdminLog> {
    try {
      const log = this.adminLogRepository.create({
        adminId: logData.adminId,
        action: logData.action,
        resource: logData.resource,
        resourceId: logData.resourceId,
        details: logData.details,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
      });

      const savedLog = await this.adminLogRepository.save(log);

      this.logger.log(
        `管理员操作记录: ${logData.action} - ${logData.resource} (ID: ${logData.resourceId})`,
      );

      return savedLog;
    } catch (error) {
      this.logger.error(`记录审计日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryAuditLogDto): Promise<PaginatedResult<AdminLog>> {
    const {
      page = 1,
      pageSize = 20,
      action,
      adminId,
      resource,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.adminLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin');

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (adminId) {
      queryBuilder.andWhere('log.adminId = :adminId', { adminId });
    }

    if (resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource });
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByAdmin(adminId: number, limit = 50): Promise<AdminLog[]> {
    return this.adminLogRepository.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByResource(
    resource: string,
    resourceId: string,
  ): Promise<AdminLog[]> {
    return this.adminLogRepository.find({
      where: { resource, resourceId },
      relations: ['admin'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics(days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.adminLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.action')
      .getRawMany();

    return logs;
  }
}
