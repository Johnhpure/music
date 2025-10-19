import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiKeyGroup } from '../entities/gemini-key-group.entity';
import {
  CreateGeminiKeyGroupDto,
  UpdateGeminiKeyGroupDto,
  AddKeysToGroupDto,
} from '../dto/gemini-key-group.dto';
import { EncryptionService } from '@common/services/encryption.service';

/**
 * Gemini密钥组管理服务
 * 实现KEY组的创建、管理和轮询策略
 */
@Injectable()
export class GeminiKeyGroupService {
  private readonly logger = new Logger(GeminiKeyGroupService.name);

  constructor(
    @InjectRepository(GeminiKeyGroup)
    private readonly keyGroupRepo: Repository<GeminiKeyGroup>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * 创建KEY组
   */
  async createKeyGroup(dto: CreateGeminiKeyGroupDto): Promise<GeminiKeyGroup> {
    // 加密所有API密钥
    const encryptedKeys = await Promise.all(
      dto.apiKeys.map(async (key) => ({
        key: await this.encryptionService.encrypt(key),
        status: 'active' as const,
        errorCount: 0,
        lastUsedAt: null,
        lastErrorMsg: null,
      })),
    );

    const keyGroup = this.keyGroupRepo.create({
      groupName: dto.groupName,
      rotationStrategy: dto.rotationStrategy,
      apiKeys: encryptedKeys,
      baseUrl: dto.baseUrl,
      description: dto.description,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      currentKeyIndex: 0,
    });

    const saved = await this.keyGroupRepo.save(keyGroup);
    this.logger.log(
      `Created Gemini key group: ${saved.groupName} with ${dto.apiKeys.length} keys`,
    );

    return saved;
  }

  /**
   * 更新KEY组
   */
  async updateKeyGroup(
    id: number,
    dto: UpdateGeminiKeyGroupDto,
  ): Promise<GeminiKeyGroup> {
    const keyGroup = await this.findOne(id);

    if (dto.groupName !== undefined) {
      keyGroup.groupName = dto.groupName;
    }

    if (dto.rotationStrategy !== undefined) {
      keyGroup.rotationStrategy = dto.rotationStrategy;
      // 切换策略时重置索引
      keyGroup.currentKeyIndex = 0;
    }

    if (dto.apiKeys !== undefined) {
      // 加密新的密钥列表
      keyGroup.apiKeys = await Promise.all(
        dto.apiKeys.map(async (key) => ({
          key: await this.encryptionService.encrypt(key),
          status: 'active' as const,
          errorCount: 0,
          lastUsedAt: null,
          lastErrorMsg: null,
        })),
      );
      keyGroup.currentKeyIndex = 0;
    }

    if (dto.baseUrl !== undefined) {
      keyGroup.baseUrl = dto.baseUrl;
    }

    if (dto.description !== undefined) {
      keyGroup.description = dto.description;
    }

    if (dto.isActive !== undefined) {
      keyGroup.isActive = dto.isActive;
    }

    const updated = await this.keyGroupRepo.save(keyGroup);
    this.logger.log(`Updated Gemini key group: ${id}`);

    return updated;
  }

  /**
   * 添加密钥到KEY组
   */
  async addKeysToGroup(
    id: number,
    dto: AddKeysToGroupDto,
  ): Promise<GeminiKeyGroup> {
    const keyGroup = await this.findOne(id);

    // 加密新密钥
    const newKeys = await Promise.all(
      dto.apiKeys.map(async (key) => ({
        key: await this.encryptionService.encrypt(key),
        status: 'active' as const,
        errorCount: 0,
        lastUsedAt: null,
        lastErrorMsg: null,
      })),
    );

    // 添加到现有密钥列表
    keyGroup.apiKeys = [...keyGroup.apiKeys, ...newKeys];

    const updated = await this.keyGroupRepo.save(keyGroup);
    this.logger.log(`Added ${dto.apiKeys.length} keys to group: ${id}`);

    return updated;
  }

  /**
   * 从KEY组中移除指定索引的密钥
   */
  async removeKeyFromGroup(
    id: number,
    keyIndex: number,
  ): Promise<GeminiKeyGroup> {
    const keyGroup = await this.findOne(id);

    if (keyIndex < 0 || keyIndex >= keyGroup.apiKeys.length) {
      throw new NotFoundException(
        `Key index ${keyIndex} not found in group ${id}`,
      );
    }

    if (keyGroup.apiKeys.length === 1) {
      throw new Error('Cannot remove the last key from the group');
    }

    keyGroup.apiKeys.splice(keyIndex, 1);

    // 调整currentKeyIndex
    if (keyGroup.currentKeyIndex >= keyGroup.apiKeys.length) {
      keyGroup.currentKeyIndex = 0;
    }

    const updated = await this.keyGroupRepo.save(keyGroup);
    this.logger.log(`Removed key at index ${keyIndex} from group: ${id}`);

    return updated;
  }

  /**
   * 删除KEY组
   */
  async deleteKeyGroup(id: number): Promise<void> {
    const keyGroup = await this.findOne(id);
    await this.keyGroupRepo.remove(keyGroup);
    this.logger.log(`Deleted Gemini key group: ${id}`);
  }

  /**
   * 获取所有KEY组
   */
  async findAll(): Promise<GeminiKeyGroup[]> {
    return await this.keyGroupRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个KEY组
   */
  async findOne(id: number): Promise<GeminiKeyGroup> {
    const keyGroup = await this.keyGroupRepo.findOne({ where: { id } });

    if (!keyGroup) {
      throw new NotFoundException(`Gemini key group ${id} not found`);
    }

    return keyGroup;
  }

  /**
   * 获取并解密KEY组的下一个可用密钥
   * 根据轮询策略选择KEY
   */
  async getNextAvailableKey(
    id: number,
  ): Promise<{ key: string; keyIndex: number }> {
    const keyGroup = await this.findOne(id);

    if (!keyGroup.isActive) {
      throw new Error(`Key group ${id} is not active`);
    }

    if (keyGroup.apiKeys.length === 0) {
      throw new Error(`No keys available in group ${id}`);
    }

    let selectedIndex: number;
    let selectedKeyData: (typeof keyGroup.apiKeys)[0];

    if (keyGroup.rotationStrategy === 'sequential') {
      // 顺序轮询策略：使用currentKeyIndex，每次调用后递增
      selectedIndex = keyGroup.currentKeyIndex;
      selectedKeyData = keyGroup.apiKeys[selectedIndex];

      // 更新索引到下一个KEY
      const nextIndex = (selectedIndex + 1) % keyGroup.apiKeys.length;
      await this.keyGroupRepo.update(id, { currentKeyIndex: nextIndex });

      this.logger.log(
        `Sequential rotation: Selected key ${selectedIndex} from group ${id}, next will be ${nextIndex}`,
      );
    } else {
      // 故障切换策略：使用currentKeyIndex，只有在出错时才切换
      selectedIndex = keyGroup.currentKeyIndex;
      selectedKeyData = keyGroup.apiKeys[selectedIndex];

      this.logger.log(
        `Failover strategy: Using key ${selectedIndex} from group ${id}`,
      );
    }

    // 解密密钥
    const decryptedKey = await this.encryptionService.decrypt(
      selectedKeyData.key,
    );

    // 更新最后使用时间
    keyGroup.apiKeys[selectedIndex].lastUsedAt = new Date();
    await this.keyGroupRepo.save(keyGroup);

    return {
      key: decryptedKey,
      keyIndex: selectedIndex,
    };
  }

  /**
   * 报告KEY使用成功
   */
  async reportKeySuccess(
    id: number,
    keyIndex: number,
    _tokens: number,
  ): Promise<void> {
    const keyGroup = await this.findOne(id);

    if (keyIndex < 0 || keyIndex >= keyGroup.apiKeys.length) {
      return;
    }

    // 重置错误计数
    keyGroup.apiKeys[keyIndex].status = 'active';
    keyGroup.apiKeys[keyIndex].errorCount = 0;
    keyGroup.apiKeys[keyIndex].lastErrorMsg = null;

    // 更新统计
    keyGroup.requestsCountTotal++;
    keyGroup.successCountTotal++;

    await this.keyGroupRepo.save(keyGroup);

    this.logger.log(`Key ${keyIndex} in group ${id} used successfully`);
  }

  /**
   * 报告KEY使用失败
   * 对于故障切换策略，需要切换到下一个KEY
   */
  async reportKeyError(
    id: number,
    keyIndex: number,
    errorMsg: string,
    errorStatus?: number,
  ): Promise<void> {
    const keyGroup = await this.findOne(id);

    if (keyIndex < 0 || keyIndex >= keyGroup.apiKeys.length) {
      return;
    }

    // 更新KEY状态
    keyGroup.apiKeys[keyIndex].errorCount++;
    keyGroup.apiKeys[keyIndex].lastErrorMsg = errorMsg;

    // 根据错误类型设置状态
    if (
      errorStatus === 429 ||
      errorMsg.includes('quota') ||
      errorMsg.includes('rate limit')
    ) {
      keyGroup.apiKeys[keyIndex].status = 'exhausted';
      this.logger.warn(`Key ${keyIndex} in group ${id} exhausted: ${errorMsg}`);
    } else {
      keyGroup.apiKeys[keyIndex].status = 'error';
      this.logger.warn(`Key ${keyIndex} in group ${id} error: ${errorMsg}`);
    }

    // 更新统计
    keyGroup.requestsCountTotal++;
    keyGroup.errorCountTotal++;

    // 故障切换策略：自动切换到下一个可用KEY
    if (keyGroup.rotationStrategy === 'failover') {
      const nextAvailableIndex = this.findNextAvailableKeyIndex(
        keyGroup,
        keyIndex,
      );

      if (nextAvailableIndex !== keyIndex) {
        keyGroup.currentKeyIndex = nextAvailableIndex;
        this.logger.log(
          `Failover: Switched from key ${keyIndex} to key ${nextAvailableIndex} in group ${id}`,
        );
      } else {
        this.logger.error(`No available keys in group ${id} for failover`);
      }
    }

    await this.keyGroupRepo.save(keyGroup);
  }

  /**
   * 查找下一个可用的KEY索引（用于故障切换）
   */
  private findNextAvailableKeyIndex(
    keyGroup: GeminiKeyGroup,
    currentIndex: number,
  ): number {
    const keysCount = keyGroup.apiKeys.length;

    // 尝试找到一个active状态的KEY
    for (let i = 1; i < keysCount; i++) {
      const nextIndex = (currentIndex + i) % keysCount;
      if (keyGroup.apiKeys[nextIndex].status === 'active') {
        return nextIndex;
      }
    }

    // 如果没有active的KEY，找错误次数最少的
    let minErrorCount = Infinity;
    let bestIndex = currentIndex;

    for (let i = 0; i < keysCount; i++) {
      if (
        i !== currentIndex &&
        keyGroup.apiKeys[i].errorCount < minErrorCount
      ) {
        minErrorCount = keyGroup.apiKeys[i].errorCount;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * 重置KEY组中所有KEY的状态
   */
  async resetKeyGroupStatus(id: number): Promise<GeminiKeyGroup> {
    const keyGroup = await this.findOne(id);

    keyGroup.apiKeys = keyGroup.apiKeys.map((keyData) => ({
      ...keyData,
      status: 'active',
      errorCount: 0,
      lastErrorMsg: null,
    }));

    keyGroup.currentKeyIndex = 0;

    const updated = await this.keyGroupRepo.save(keyGroup);
    this.logger.log(`Reset all key statuses in group: ${id}`);

    return updated;
  }

  /**
   * 获取KEY组的统计信息（隐藏真实密钥）
   */
  async getKeyGroupStats(id: number): Promise<any> {
    const keyGroup = await this.findOne(id);

    return {
      id: keyGroup.id,
      groupName: keyGroup.groupName,
      rotationStrategy: keyGroup.rotationStrategy,
      isActive: keyGroup.isActive,
      totalKeys: keyGroup.apiKeys.length,
      activeKeys: keyGroup.apiKeys.filter((k) => k.status === 'active').length,
      currentKeyIndex: keyGroup.currentKeyIndex,
      keys: keyGroup.apiKeys.map((keyData, index) => ({
        index,
        status: keyData.status,
        errorCount: keyData.errorCount,
        lastUsedAt: keyData.lastUsedAt,
        lastErrorMsg: keyData.lastErrorMsg,
        keyPreview: '***' + keyData.key.slice(-8), // 只显示后8位（加密后的）
      })),
      requestsCountTotal: keyGroup.requestsCountTotal,
      successCountTotal: keyGroup.successCountTotal,
      errorCountTotal: keyGroup.errorCountTotal,
      successRate:
        keyGroup.requestsCountTotal > 0
          ? (
              (keyGroup.successCountTotal / keyGroup.requestsCountTotal) *
              100
            ).toFixed(2) + '%'
          : 'N/A',
      description: keyGroup.description,
      createdAt: keyGroup.createdAt,
      updatedAt: keyGroup.updatedAt,
    };
  }
}
