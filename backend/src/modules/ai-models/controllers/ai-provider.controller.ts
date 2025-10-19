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
  HttpCode,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProvider } from '../entities/ai-provider.entity';
import { AIApiKey } from '../entities/ai-api-key.entity';
import { AIProviderService } from '../services/ai-provider.service';
import {
  CreateProviderDto,
  UpdateProviderDto,
} from '../dto/create-provider.dto';
import { CreateApiKeyDto, UpdateApiKeyDto } from '../dto/create-api-key.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { EncryptionService } from '../../../common/services/encryption.service';

/**
 * AI Provider管理Controller
 */
@Controller('admin/ai-providers')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AIProviderController {
  constructor(
    @InjectRepository(AIProvider)
    private readonly providerRepo: Repository<AIProvider>,
    @InjectRepository(AIApiKey)
    private readonly keyRepo: Repository<AIApiKey>,
    private readonly providerService: AIProviderService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ========== Provider管理 ==========

  @Get()
  async listProviders() {
    const providers = await this.providerRepo.find({
      relations: ['models', 'apiKeys'],
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
    });

    return {
      code: 200,
      data: providers.map((p) => ({
        ...p,
        modelsCount: p.models.filter((m) => m.isActive).length,
        activeKeysCount: p.apiKeys.filter((k) => k.isActive).length,
        callCount: p.callCount || 0,
        tokenUsage: p.tokenUsage || 0,
      })),
    };
  }

    return { code: 200, data: provider };
  }

  @Post()
  async createProvider(@Body() dto: CreateProviderDto) {
    const provider = this.providerRepo.create(dto);
    await this.providerRepo.save(provider);

    return { code: 201, message: 'Provider created', data: provider };
  }

  @Put(':id')
  async updateProvider(
    @Param('id') id: number,
    @Body() dto: UpdateProviderDto,
  ) {
    await this.providerRepo.update(id, dto);
    const provider = await this.providerRepo.findOne({ where: { id } });

    // 清除客户端缓存
    this.providerService.clearClientCache();

    return { code: 200, message: 'Provider updated', data: provider };
  }

  @Delete(':id')
  async deleteProvider(@Param('id') id: number) {
    await this.providerRepo.delete(id);
    return { code: 200, message: 'Provider deleted' };
  }

  // ========== API Key管理 ==========

  @Get(':providerId/keys')
  async listKeys(@Param('providerId') providerId: number) {
    const keys = await this.keyRepo.find({
      where: { providerId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    return {
      code: 200,
      data: keys.map((k) => ({
        ...k,
        // 隐藏完整的API Key,只显示前几位和后几位
        apiKey: this.maskApiKey(k.apiKey),
      })),
    };
  }

  @Get('keys/:id')
  async getKey(@Param('id') id: number) {
    const key = await this.keyRepo.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!key) {
      return { code: 404, message: 'API Key not found' };
    }

    return {
      code: 200,
      data: {
        ...key,
        apiKey: this.maskApiKey(key.apiKey),
      },
    };
  }

  @Post(':providerId/keys')
  async createKey(
    @Param('providerId') providerId: number,
    @Body() dto: CreateApiKeyDto,
  ) {
    // 加密API密钥
    const encryptedApiKey = await this.encryptionService.encrypt(dto.apiKey);

    const key = this.keyRepo.create({
      ...dto,
      apiKey: encryptedApiKey,
      providerId,
    });
    await this.keyRepo.save(key);

    return {
      code: 201,
      message: 'API Key created',
      data: {
        ...key,
        apiKey: '***已加密***',
      },
    };
  }

  @Put('keys/:id')
  async updateKey(@Param('id') id: number, @Body() dto: UpdateApiKeyDto) {
    // 如果更新包含apiKey字段，需要加密
    if (dto.apiKey) {
      dto.apiKey = await this.encryptionService.encrypt(dto.apiKey);
    }

    await this.keyRepo.update(id, dto);
    const key = await this.keyRepo.findOne({ where: { id } });

    // 清除客户端缓存
    this.providerService.clearClientCache(id);

    return {
      code: 200,
      message: 'API Key updated',
      data: {
        ...key,
        apiKey: '***已加密***',
      },
    };
  }

  @Delete('keys/:id')
  async deleteKey(@Param('id') id: number) {
    await this.keyRepo.delete(id);
    this.providerService.clearClientCache(id);
    return { code: 200, message: 'API Key deleted' };
  }

  @Post('keys/:id/validate')
  @HttpCode(200) // 明确设置HTTP状态码为200
  async validateKey(@Param('id') id: number) {
    try {
      const isValid = await this.providerService.validateKey(id);
      return {
        code: 200,
        data: { isValid },
        message: isValid ? 'API Key is valid' : 'API Key is invalid',
      };
    } catch (error) {
      // 如果是解密错误或其他严重错误，返回详细信息
      return {
        code: 500,
        data: { isValid: false },
        message: error.message || 'Validation failed',
        error: error.name || 'ValidationError',
      };
    }
  }

  @Post('keys/:id/reset-stats')
  async resetKeyStats(@Param('id') id: number) {
    await this.keyRepo.update(id, {
      requestsCountToday: 0,
      tokensCountToday: 0,
      errorsCountToday: 0,
      statsResetAt: new Date(),
    });

    return { code: 200, message: 'Key stats reset' };
  }

  // ========== 模型同步 ==========

  @Post(':id/sync-models')
  @HttpCode(200) // 明确设置HTTP状态码
  async syncModels(@Param('id') id: number) {
    try {
      const count = await this.providerService.syncProviderModels(id);
      const result = {
        code: 200,
        message: `Synced ${count} models`,
        data: { count },
      };
      console.log('🔄 Sync Models Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Sync Models Error:', error);
      return {
        code: 500,
        message: `Failed to sync models: ${error.message}`,
        data: { count: 0 },
      };
    }
  }

  // ========== 辅助方法 ==========

  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '****';
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  }
}
