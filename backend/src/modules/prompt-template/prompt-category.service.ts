import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptCategory } from './entities/prompt-category.entity';
import { CreatePromptCategoryDto } from './dto/create-prompt-category.dto';
import { UpdatePromptCategoryDto } from './dto/update-prompt-category.dto';

@Injectable()
export class PromptCategoryService {
  constructor(
    @InjectRepository(PromptCategory)
    private categoryRepository: Repository<PromptCategory>,
  ) {}

  async create(createDto: CreatePromptCategoryDto): Promise<PromptCategory> {
    const existing = await this.categoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(`分类 "${createDto.name}" 已存在`);
    }

    const category = this.categoryRepository.create(createDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(activeOnly = false): Promise<PromptCategory[]> {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    return await this.categoryRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: ['templates'],
    });
  }

  async findOne(id: number): Promise<PromptCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['templates'],
    });

    if (!category) {
      throw new NotFoundException(`分类ID ${id} 不存在`);
    }

    return category;
  }

  async update(id: number, updateDto: UpdatePromptCategoryDto): Promise<PromptCategory> {
    const category = await this.findOne(id);

    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException(`分类 "${updateDto.name}" 已存在`);
      }
    }

    Object.assign(category, updateDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    if (category.templates && category.templates.length > 0) {
      throw new ConflictException(
        `分类 "${category.name}" 下还有 ${category.templates.length} 个提示词，无法删除`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  async toggleStatus(id: number): Promise<PromptCategory> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return await this.categoryRepository.save(category);
  }

  async updateSort(sortData: { id: number; sortOrder: number }[]): Promise<void> {
    for (const item of sortData) {
      await this.categoryRepository.update(item.id, {
        sortOrder: item.sortOrder,
      });
    }
  }
}
