import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GeminiKeyGroupService } from '../services/gemini-key-group.service';
import {
  CreateGeminiKeyGroupDto,
  UpdateGeminiKeyGroupDto,
  AddKeysToGroupDto,
} from '../dto/gemini-key-group.dto';

/**
 * Gemini KEY组管理控制器
 */
@ApiTags('Gemini Key Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/gemini-key-groups')
export class GeminiKeyGroupController {
  constructor(private readonly keyGroupService: GeminiKeyGroupService) {}

  @Post()
  @ApiOperation({ summary: '创建Gemini密钥组' })
  async createKeyGroup(@Body() dto: CreateGeminiKeyGroupDto) {
    const keyGroup = await this.keyGroupService.createKeyGroup(dto);
    return {
      success: true,
      message: 'Gemini密钥组创建成功',
      data: await this.keyGroupService.getKeyGroupStats(keyGroup.id),
    };
  }

  @Get()
  @ApiOperation({ summary: '获取所有Gemini密钥组' })
  async getAllKeyGroups() {
    const keyGroups = await this.keyGroupService.findAll();
    const stats = await Promise.all(
      keyGroups.map((kg) => this.keyGroupService.getKeyGroupStats(kg.id)),
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Gemini密钥组详情' })
  async getKeyGroup(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.keyGroupService.getKeyGroupStats(id);
    return {
      success: true,
      data: stats,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新Gemini密钥组' })
  async updateKeyGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeminiKeyGroupDto,
  ) {
    const keyGroup = await this.keyGroupService.updateKeyGroup(id, dto);
    return {
      success: true,
      message: 'Gemini密钥组更新成功',
      data: await this.keyGroupService.getKeyGroupStats(keyGroup.id),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Gemini密钥组' })
  async deleteKeyGroup(@Param('id', ParseIntPipe) id: number) {
    await this.keyGroupService.deleteKeyGroup(id);
    return {
      success: true,
      message: 'Gemini密钥组删除成功',
    };
  }

  @Post(':id/keys')
  @ApiOperation({ summary: '添加密钥到Gemini密钥组' })
  async addKeysToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddKeysToGroupDto,
  ) {
    const keyGroup = await this.keyGroupService.addKeysToGroup(id, dto);
    return {
      success: true,
      message: '密钥添加成功',
      data: await this.keyGroupService.getKeyGroupStats(keyGroup.id),
    };
  }

  @Delete(':id/keys/:keyIndex')
  @ApiOperation({ summary: '从Gemini密钥组中移除密钥' })
  async removeKeyFromGroup(
    @Param('id', ParseIntPipe) id: number,
    @Param('keyIndex', ParseIntPipe) keyIndex: number,
  ) {
    const keyGroup = await this.keyGroupService.removeKeyFromGroup(
      id,
      keyIndex,
    );
    return {
      success: true,
      message: '密钥移除成功',
      data: await this.keyGroupService.getKeyGroupStats(keyGroup.id),
    };
  }

  @Post(':id/reset')
  @ApiOperation({ summary: '重置Gemini密钥组状态' })
  async resetKeyGroupStatus(@Param('id', ParseIntPipe) id: number) {
    const keyGroup = await this.keyGroupService.resetKeyGroupStatus(id);
    return {
      success: true,
      message: '密钥组状态重置成功',
      data: await this.keyGroupService.getKeyGroupStats(keyGroup.id),
    };
  }
}
