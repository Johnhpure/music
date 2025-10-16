import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PromptTemplate } from './entities/prompt-template.entity';
import { PromptTemplateUsage } from './entities/prompt-template-usage.entity';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';
import { QueryPromptTemplateDto } from './dto/query-prompt-template.dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class PromptTemplateService {
  private readonly logger = new Logger(PromptTemplateService.name);

  constructor(
    @InjectRepository(PromptTemplate)
    private promptTemplateRepository: Repository<PromptTemplate>,
    @InjectRepository(PromptTemplateUsage)
    private usageRepository: Repository<PromptTemplateUsage>,
  ) {}

  async create(createDto: CreatePromptTemplateDto): Promise<PromptTemplate> {
    const { tags, ...rest } = createDto;

    const templateData = {
      ...rest,
      tags: tags && tags.length > 0 ? tags.join(',') : null,
    } as Partial<PromptTemplate>;

    const template = this.promptTemplateRepository.create(templateData);
    return (await this.promptTemplateRepository.save(
      template,
    )) as PromptTemplate;
  }

  async findAll(queryDto: QueryPromptTemplateDto): Promise<PromptTemplate[]> {
    const where: any = {};

    if (queryDto.category) {
      where.category = queryDto.category;
    }

    if (queryDto.status === 'active') {
      where.isActive = true;
    } else if (queryDto.status === 'inactive') {
      where.isActive = false;
    }

    return await this.promptTemplateRepository.find({
      where,
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActive(category?: string): Promise<PromptTemplate[]> {
    const where: any = { isActive: true, deletedAt: IsNull() };

    if (category) {
      where.category = category;
    }

    return await this.promptTemplateRepository.find({
      where,
      order: {
        sortOrder: 'ASC',
        usageCount: 'DESC',
      },
      select: [
        'id',
        'category',
        'title',
        'content',
        'tags',
        'usageCount',
        'sortOrder',
      ],
    });
  }

  async findAllPaginated(
    query: QueryPromptTemplateDto,
  ): Promise<PaginatedResult<PromptTemplate>> {
    const {
      page = 1,
      pageSize = 20,
      category,
      status,
      includeDeleted,
      keyword,
      tag,
    } = query;

    const queryBuilder =
      this.promptTemplateRepository.createQueryBuilder('template');

    if (!includeDeleted) {
      queryBuilder.andWhere('template.deletedAt IS NULL');
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    if (status === 'active') {
      queryBuilder.andWhere('template.isActive = :isActive', {
        isActive: true,
      });
    } else if (status === 'inactive') {
      queryBuilder.andWhere('template.isActive = :isActive', {
        isActive: false,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(template.title LIKE :keyword OR template.content LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    if (tag) {
      queryBuilder.andWhere('template.tags LIKE :tag', { tag: `%${tag}%` });
    }

    queryBuilder
      .orderBy('template.sortOrder', 'ASC')
      .addOrderBy('template.usageCount', 'DESC')
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
    const template = await this.findOne(id);
    template.deletedAt = new Date();
    await this.promptTemplateRepository.save(template);
    this.logger.log(`PromptTemplate ${id} 已软删除`);
  }

  async restore(id: number): Promise<PromptTemplate> {
    const template = await this.promptTemplateRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`PromptTemplate with ID ${id} not found`);
    }
    if (!template.deletedAt) {
      throw new NotFoundException(
        `PromptTemplate with ID ${id} is not deleted`,
      );
    }
    template.deletedAt = null;
    await this.promptTemplateRepository.save(template);
    this.logger.log(`PromptTemplate ${id} 已恢复`);
    return template;
  }

  async findOne(id: number): Promise<PromptTemplate> {
    const template = await this.promptTemplateRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Prompt template with ID ${id} not found`);
    }
    return template;
  }

  async update(
    id: number,
    updateDto: UpdatePromptTemplateDto,
  ): Promise<PromptTemplate> {
    const template = await this.findOne(id);
    const { tags, ...rest } = updateDto;

    const updateData: any = {
      ...rest,
    };

    if (tags !== undefined) {
      updateData.tags = tags && tags.length > 0 ? tags.join(',') : null;
    }

    Object.assign(template, updateData);
    return await this.promptTemplateRepository.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    await this.promptTemplateRepository.remove(template);
  }

  async toggleStatus(id: number): Promise<PromptTemplate> {
    const template = await this.findOne(id);
    template.isActive = !template.isActive;
    return await this.promptTemplateRepository.save(template);
  }

  async updateSort(
    sortData: { id: number; sortOrder: number }[],
  ): Promise<void> {
    for (const item of sortData) {
      await this.promptTemplateRepository.update(item.id, {
        sortOrder: item.sortOrder,
      });
    }
  }

  async recordUsage(templateId: number, userId: number): Promise<void> {
    const template = await this.findOne(templateId);

    template.usageCount += 1;
    await this.promptTemplateRepository.save(template);

    const usage = this.usageRepository.create({
      templateId,
      userId,
    });
    await this.usageRepository.save(usage);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.promptTemplateRepository
      .createQueryBuilder('template')
      .select('DISTINCT template.category', 'category')
      .where('template.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map((r) => r.category);
  }
}
