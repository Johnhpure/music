import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { SunoConfigService } from './suno-config.service';
import { CreateSunoConfigDto } from './dto/create-suno-config.dto';
import { UpdateSunoConfigDto } from './dto/update-suno-config.dto';

@ApiTags('SUNO配置管理')
@Controller('admin/suno-config')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class SunoConfigController {
  constructor(private readonly sunoConfigService: SunoConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建SUNO配置' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createDto: CreateSunoConfigDto) {
    const config = await this.sunoConfigService.create(createDto);
    return {
      code: 201,
      message: '创建成功',
      data: this.maskApiKey(config),
    };
  }

  @Get()
  @ApiOperation({ summary: '获取所有SUNO配置列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll() {
    const configs = await this.sunoConfigService.findAll();
    return {
      code: 200,
      message: '查询成功',
      data: configs.map((config) => this.maskApiKey(config)),
    };
  }

  @Get('active')
  @ApiOperation({ summary: '获取当前激活的SUNO配置' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getActive() {
    const config = await this.sunoConfigService.getActiveConfig();
    return {
      code: 200,
      message: '查询成功',
      data: config ? this.maskApiKey(config) : null,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定SUNO配置详情' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findOne(@Param('id') id: string) {
    const config = await this.sunoConfigService.findOne(+id);
    return {
      code: 200,
      message: '查询成功',
      data: this.maskApiKey(config),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新SUNO配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSunoConfigDto,
  ) {
    const config = await this.sunoConfigService.update(+id, updateDto);
    return {
      code: 200,
      message: '更新成功',
      data: this.maskApiKey(config),
    };
  }

  @Put(':id/activate')
  @ApiOperation({ summary: '激活指定SUNO配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ status: 200, description: '激活成功' })
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id') id: string) {
    const config = await this.sunoConfigService.activate(+id);
    return {
      code: 200,
      message: '激活成功',
      data: this.maskApiKey(config),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除SUNO配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.sunoConfigService.remove(+id);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  private maskApiKey(config: any): any {
    if (!config) return config;

    const masked = { ...config };
    if (masked.api_key && masked.api_key.length > 10) {
      masked.api_key = `${masked.api_key.substring(0, 6)}...${masked.api_key.substring(masked.api_key.length - 4)}`;
    }
    return masked;
  }
}
