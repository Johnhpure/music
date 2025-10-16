import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from '../entities/ai-model.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';

/**
 * AI Model管理Controller
 */
@Controller('admin/ai-models')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AIModelController {
  constructor(
    @InjectRepository(AIModel)
    private readonly modelRepo: Repository<AIModel>,
  ) {}

  @Get()
  async listModels(
    @Query('providerId') providerId?: number,
    @Query('modelType') modelType?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (modelType) {
      where.modelType = modelType;
    }

    if (isActive !== undefined) {
      where.isActive =
        typeof isActive === 'string' ? isActive === 'true' : isActive;
    }

    const models = await this.modelRepo.find({
      where,
      relations: ['provider'],
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
    });

    return { code: 200, data: models };
  }

  @Get(':id')
  async getModel(@Param('id') id: number) {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!model) {
      return { code: 404, message: 'Model not found' };
    }

    return { code: 200, data: model };
  }

  @Put(':id')
  async updateModel(@Param('id') id: number, @Body() dto: Partial<AIModel>) {
    await this.modelRepo.update(id, dto);
    const model = await this.modelRepo.findOne({ where: { id } });

    return { code: 200, message: 'Model updated', data: model };
  }

  @Delete(':id')
  async deleteModel(@Param('id') id: number) {
    await this.modelRepo.delete(id);
    return { code: 200, message: 'Model deleted' };
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: number) {
    const model = await this.modelRepo.findOne({ where: { id } });

    if (!model) {
      return { code: 404, message: 'Model not found' };
    }

    await this.modelRepo.update(id, { isActive: !model.isActive });

    return {
      code: 200,
      message: `Model ${model.isActive ? 'deactivated' : 'activated'}`,
    };
  }

  @Put(':id/set-default')
  async setDefault(@Param('id') id: number) {
    const model = await this.modelRepo.findOne({ where: { id } });

    if (!model) {
      return { code: 404, message: 'Model not found' };
    }

    // 取消同Provider下其他模型的默认状态
    await this.modelRepo.update(
      { providerId: model.providerId, isDefault: true },
      { isDefault: false },
    );

    // 设置当前模型为默认
    await this.modelRepo.update(id, { isDefault: true });

    return { code: 200, message: 'Default model set' };
  }
}
