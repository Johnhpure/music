import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SunoConfig } from './entities/suno-config.entity';
import { CreateSunoConfigDto } from './dto/create-suno-config.dto';
import { UpdateSunoConfigDto } from './dto/update-suno-config.dto';

@Injectable()
export class SunoConfigService {
  constructor(
    @InjectRepository(SunoConfig)
    private sunoConfigRepository: Repository<SunoConfig>,
  ) {}

  async create(createDto: CreateSunoConfigDto): Promise<SunoConfig> {
    if (createDto.is_active) {
      await this.deactivateAll();
    }

    const config = this.sunoConfigRepository.create(createDto);
    return await this.sunoConfigRepository.save(config);
  }

  async findAll(): Promise<SunoConfig[]> {
    return await this.sunoConfigRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SunoConfig> {
    const config = await this.sunoConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`配置ID ${id} 不存在`);
    }
    return config;
  }

  async getActiveConfig(): Promise<SunoConfig | null> {
    return await this.sunoConfigRepository.findOne({
      where: { is_active: true },
    });
  }

  async update(
    id: number,
    updateDto: UpdateSunoConfigDto,
  ): Promise<SunoConfig> {
    const config = await this.findOne(id);

    if (updateDto.is_active && !config.is_active) {
      await this.deactivateAll();
    }

    Object.assign(config, updateDto);
    return await this.sunoConfigRepository.save(config);
  }

  async activate(id: number): Promise<SunoConfig> {
    const config = await this.findOne(id);

    await this.deactivateAll();

    config.is_active = true;
    return await this.sunoConfigRepository.save(config);
  }

  async remove(id: number): Promise<void> {
    const config = await this.findOne(id);

    if (config.is_active) {
      throw new BadRequestException(
        '无法删除当前激活的配置，请先切换到其他配置',
      );
    }

    await this.sunoConfigRepository.remove(config);
  }

  private async deactivateAll(): Promise<void> {
    await this.sunoConfigRepository.update(
      { is_active: true },
      { is_active: false },
    );
  }
}
