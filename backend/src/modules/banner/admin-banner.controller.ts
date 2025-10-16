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
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';
import { User } from '../user/entities/user.entity';

@Controller('admin/banner')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminBannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly auditService: AuditService,
  ) {}

  @Get('list')
  async getAllBanners(@Query() query: QueryBannerDto) {
    return this.bannerService.findAllPaginated(query);
  }

  @Get(':id')
  async getBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Post()
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
    @CurrentUser() user: User,
  ) {
    const banner = await this.bannerService.create(createBannerDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_CREATE',
      resource: 'banner',
      resourceId: banner.id.toString(),
      details: createBannerDto,
    });

    return banner;
  }

  @Patch(':id')
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser() user: User,
  ) {
    const banner = await this.bannerService.update(id, updateBannerDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_UPDATE',
      resource: 'banner',
      resourceId: id.toString(),
      details: updateBannerDto,
    });

    return banner;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBanner(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.bannerService.softDelete(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_DELETE',
      resource: 'banner',
      resourceId: id.toString(),
    });
  }

  @Post(':id/restore')
  async restoreBanner(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const banner = await this.bannerService.restore(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_RESTORE',
      resource: 'banner',
      resourceId: id.toString(),
    });

    return banner;
  }

  @Post(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const banner = await this.bannerService.toggleStatus(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_TOGGLE_STATUS',
      resource: 'banner',
      resourceId: id.toString(),
      details: { isActive: banner.isActive },
    });

    return banner;
  }

  @Post('sort')
  async updateSort(
    @Body() sortData: { id: number; sortOrder: number }[],
    @CurrentUser() user: User,
  ) {
    await this.bannerService.updateSort(sortData);

    await this.auditService.log({
      adminId: user.id,
      action: 'BANNER_SORT',
      resource: 'banner',
      details: { sortData },
    });

    return { message: '排序更新成功' };
  }
}
