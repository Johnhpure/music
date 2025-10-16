import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HotRecommendationService } from './hot-recommendation.service';
import { CreateHotRecommendationDto } from './dto/create-hot-recommendation.dto';
import { UpdateHotRecommendationDto } from './dto/update-hot-recommendation.dto';
import { QueryHotRecommendationDto } from './dto/query-hot-recommendation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';
import { User } from '../user/entities/user.entity';

@Controller('admin/hot-recommendation')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminHotRecommendationController {
  constructor(
    private readonly hotRecommendationService: HotRecommendationService,
    private readonly auditService: AuditService,
  ) {}

  @Get('list')
  async getAllRecommendations(@Query() query: QueryHotRecommendationDto) {
    return this.hotRecommendationService.findAllPaginated(query);
  }

  @Get(':id')
  async getRecommendation(@Param('id', ParseIntPipe) id: number) {
    return this.hotRecommendationService.findOne(id);
  }

  @Post()
  async createRecommendation(
    @Body() createDto: CreateHotRecommendationDto,
    @CurrentUser() user: User,
  ) {
    const recommendation =
      await this.hotRecommendationService.create(createDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'HOT_RECOMMENDATION_CREATE',
      resource: 'hot_recommendation',
      resourceId: recommendation.id.toString(),
      details: createDto,
    });

    return recommendation;
  }

  @Patch(':id')
  async updateRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHotRecommendationDto,
    @CurrentUser() user: User,
  ) {
    const recommendation = await this.hotRecommendationService.update(
      id,
      updateDto,
    );

    await this.auditService.log({
      adminId: user.id,
      action: 'HOT_RECOMMENDATION_UPDATE',
      resource: 'hot_recommendation',
      resourceId: id.toString(),
      details: updateDto,
    });

    return recommendation;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.hotRecommendationService.softDelete(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'HOT_RECOMMENDATION_DELETE',
      resource: 'hot_recommendation',
      resourceId: id.toString(),
    });
  }

  @Post(':id/restore')
  async restoreRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const recommendation = await this.hotRecommendationService.restore(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'HOT_RECOMMENDATION_RESTORE',
      resource: 'hot_recommendation',
      resourceId: id.toString(),
    });

    return recommendation;
  }

  @Post(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const recommendation = await this.hotRecommendationService.toggleStatus(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'HOT_RECOMMENDATION_TOGGLE_STATUS',
      resource: 'hot_recommendation',
      resourceId: id.toString(),
      details: { isActive: recommendation.isActive },
    });

    return recommendation;
  }
}
