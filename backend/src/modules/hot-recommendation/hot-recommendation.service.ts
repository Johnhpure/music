import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { HotRecommendation } from './entities/hot-recommendation.entity';
import { RecommendationCategory } from './entities/recommendation-category.entity';
import { MusicPlayStat } from './entities/music-play-stat.entity';
import { UserMusicLike } from './entities/user-music-like.entity';
import { CreateHotRecommendationDto } from './dto/create-hot-recommendation.dto';
import { UpdateHotRecommendationDto } from './dto/update-hot-recommendation.dto';
import { QueryHotRecommendationDto } from './dto/query-hot-recommendation.dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class HotRecommendationService {
  private readonly logger = new Logger(HotRecommendationService.name);

  constructor(
    @InjectRepository(HotRecommendation)
    private recommendationRepository: Repository<HotRecommendation>,
    @InjectRepository(RecommendationCategory)
    private categoryRepository: Repository<RecommendationCategory>,
    @InjectRepository(MusicPlayStat)
    private playStatRepository: Repository<MusicPlayStat>,
    @InjectRepository(UserMusicLike)
    private likeRepository: Repository<UserMusicLike>,
  ) {}

  async create(
    createDto: CreateHotRecommendationDto,
  ): Promise<HotRecommendation> {
    const recommendation = this.recommendationRepository.create(createDto);
    return await this.recommendationRepository.save(recommendation);
  }

  async findAll(
    queryDto: QueryHotRecommendationDto,
  ): Promise<HotRecommendation[]> {
    const where: any = { isActive: true, deletedAt: IsNull() };

    if (queryDto.category) {
      where.category = queryDto.category;
    }

    return await this.recommendationRepository.find({
      where,
      order: { sortOrder: 'ASC', playCount: 'DESC' },
      select: [
        'id',
        'category',
        'title',
        'coverUrl',
        'audioUrl',
        'artist',
        'duration',
        'playCount',
        'likeCount',
      ],
    });
  }

  async findAllPaginated(
    query: QueryHotRecommendationDto,
  ): Promise<PaginatedResult<HotRecommendation>> {
    const {
      page = 1,
      pageSize = 20,
      category,
      status,
      includeDeleted,
      keyword,
    } = query;

    const queryBuilder =
      this.recommendationRepository.createQueryBuilder('rec');

    if (!includeDeleted) {
      queryBuilder.andWhere('rec.deletedAt IS NULL');
    }

    if (category) {
      queryBuilder.andWhere('rec.category = :category', { category });
    }

    if (status === 'active') {
      queryBuilder.andWhere('rec.isActive = :isActive', { isActive: true });
    } else if (status === 'inactive') {
      queryBuilder.andWhere('rec.isActive = :isActive', { isActive: false });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(rec.title LIKE :keyword OR rec.artist LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    queryBuilder
      .orderBy('rec.sortOrder', 'ASC')
      .addOrderBy('rec.playCount', 'DESC')
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

  async softDelete(id: number): Promise<void> {
    const recommendation = await this.findOne(id);
    recommendation.deletedAt = new Date();
    await this.recommendationRepository.save(recommendation);
    this.logger.log(`HotRecommendation ${id} 已软删除`);
  }

  async restore(id: number): Promise<HotRecommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
    });
    if (!recommendation) {
      throw new NotFoundException(`HotRecommendation with ID ${id} not found`);
    }
    if (!recommendation.deletedAt) {
      throw new NotFoundException(
        `HotRecommendation with ID ${id} is not deleted`,
      );
    }
    recommendation.deletedAt = null;
    await this.recommendationRepository.save(recommendation);
    this.logger.log(`HotRecommendation ${id} 已恢复`);
    return recommendation;
  }

  async findOne(id: number): Promise<HotRecommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
    });
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }
    return recommendation;
  }

  async update(
    id: number,
    updateDto: UpdateHotRecommendationDto,
  ): Promise<HotRecommendation> {
    const recommendation = await this.findOne(id);
    Object.assign(recommendation, updateDto);
    return await this.recommendationRepository.save(recommendation);
  }

  async remove(id: number): Promise<void> {
    const recommendation = await this.findOne(id);
    await this.recommendationRepository.remove(recommendation);
  }

  async toggleStatus(id: number): Promise<HotRecommendation> {
    const recommendation = await this.findOne(id);
    recommendation.isActive = !recommendation.isActive;
    return await this.recommendationRepository.save(recommendation);
  }

  async updateSort(
    sortData: { id: number; sortOrder: number }[],
  ): Promise<void> {
    for (const item of sortData) {
      await this.recommendationRepository.update(item.id, {
        sortOrder: item.sortOrder,
      });
    }
  }

  async getCategories(): Promise<RecommendationCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByCategory(
    categoryId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<HotRecommendation[]> {
    return await this.recommendationRepository.find({
      where: { category: categoryId, isActive: true },
      order: { sortOrder: 'ASC', playCount: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async trackPlay(
    musicId: number,
    userId?: number,
    playDuration?: number,
  ): Promise<void> {
    const recommendation = await this.findOne(musicId);
    recommendation.playCount += 1;
    await this.recommendationRepository.save(recommendation);

    const stat = this.playStatRepository.create({
      musicId,
      musicType: 'recommendation',
      userId,
      playDuration,
    });
    await this.playStatRepository.save(stat);
  }

  async toggleLike(
    musicId: number,
    userId: number,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const recommendation = await this.findOne(musicId);

    const existingLike = await this.likeRepository.findOne({
      where: {
        musicId,
        musicType: 'recommendation',
        userId,
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      recommendation.likeCount = Math.max(0, recommendation.likeCount - 1);
      await this.recommendationRepository.save(recommendation);
      return { liked: false, likeCount: recommendation.likeCount };
    } else {
      const like = this.likeRepository.create({
        musicId,
        musicType: 'recommendation',
        userId,
      });
      await this.likeRepository.save(like);
      recommendation.likeCount += 1;
      await this.recommendationRepository.save(recommendation);
      return { liked: true, likeCount: recommendation.likeCount };
    }
  }
}
