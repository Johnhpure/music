import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Like,
} from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create(createBannerDto);
    return await this.bannerRepository.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return await this.bannerRepository.find({
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();

    return await this.bannerRepository.find({
      where: [
        {
          isActive: true,
          deletedAt: IsNull(),
          startTime: IsNull(),
          endTime: IsNull(),
        },
        {
          isActive: true,
          deletedAt: IsNull(),
          startTime: LessThanOrEqual(now),
          endTime: MoreThanOrEqual(now),
        },
        {
          isActive: true,
          deletedAt: IsNull(),
          startTime: LessThanOrEqual(now),
          endTime: IsNull(),
        },
        {
          isActive: true,
          deletedAt: IsNull(),
          startTime: IsNull(),
          endTime: MoreThanOrEqual(now),
        },
      ],
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
      select: ['id', 'title', 'imageUrl', 'linkUrl', 'linkType', 'sortOrder'],
    });
  }

  async findAllPaginated(
    query: QueryBannerDto,
  ): Promise<PaginatedResult<Banner>> {
    const {
      page = 1,
      pageSize = 20,
      status,
      includeDeleted = false,
      keyword,
    } = query;

    const queryBuilder = this.bannerRepository.createQueryBuilder('banner');

    if (!includeDeleted) {
      queryBuilder.andWhere('banner.deletedAt IS NULL');
    }

    if (status === 'active') {
      queryBuilder.andWhere('banner.isActive = :isActive', { isActive: true });
    } else if (status === 'inactive') {
      queryBuilder.andWhere('banner.isActive = :isActive', { isActive: false });
    }

    if (keyword) {
      queryBuilder.andWhere('banner.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC')
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

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, updateBannerDto);
    return await this.bannerRepository.save(banner);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  async softDelete(id: number): Promise<void> {
    const banner = await this.findOne(id);
    banner.deletedAt = new Date();
    await this.bannerRepository.save(banner);
    this.logger.log(`Banner ${id} 已软删除`);
  }

  async restore(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    if (!banner.deletedAt) {
      throw new NotFoundException(`Banner with ID ${id} is not deleted`);
    }

    banner.deletedAt = null;
    await this.bannerRepository.save(banner);
    this.logger.log(`Banner ${id} 已恢复`);
    return banner;
  }

  async toggleStatus(id: number): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return await this.bannerRepository.save(banner);
  }

  async updateSort(
    sortData: { id: number; sortOrder: number }[],
  ): Promise<void> {
    for (const item of sortData) {
      await this.bannerRepository.update(item.id, {
        sortOrder: item.sortOrder,
      });
    }
  }
}
