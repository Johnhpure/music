import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { HotRecommendationService } from './hot-recommendation.service';
import { CreateHotRecommendationDto } from './dto/create-hot-recommendation.dto';
import { UpdateHotRecommendationDto } from './dto/update-hot-recommendation.dto';
import { QueryHotRecommendationDto } from './dto/query-hot-recommendation.dto';
import { TrackMusicPlayDto } from './dto/track-music-play.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public/hot-recommendation')
export class HotRecommendationController {
  constructor(
    private readonly hotRecommendationService: HotRecommendationService,
  ) {}

  @Public()
  @Get('list')
  async getRecommendations(@Query() queryDto: QueryHotRecommendationDto) {
    return this.hotRecommendationService.findAll(queryDto);
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.hotRecommendationService.getCategories();
  }

  @Get('category/:categoryId')
  async getByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return await this.hotRecommendationService.findByCategory(
      categoryId,
      page,
      pageSize,
    );
  }

  @Post('play')
  async trackPlay(@Body() trackDto: TrackMusicPlayDto, @Request() req) {
    const userId = req.user?.id;
    await this.hotRecommendationService.trackPlay(
      trackDto.musicId,
      userId,
      trackDto.playDuration,
    );
    return { message: 'Play tracked successfully' };
  }

  @Post(':id/toggle-like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.hotRecommendationService.toggleLike(id, req.user.id);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateHotRecommendationDto) {
    return this.hotRecommendationService.create(createDto);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query() queryDto: QueryHotRecommendationDto) {
    return this.hotRecommendationService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotRecommendationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHotRecommendationDto,
  ) {
    return this.hotRecommendationService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hotRecommendationService.remove(id);
  }

  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.hotRecommendationService.toggleStatus(id);
  }

  @Post('sort')
  @UseGuards(JwtAuthGuard)
  updateSort(@Body() sortData: { id: number; sortOrder: number }[]) {
    return this.hotRecommendationService.updateSort(sortData);
  }
}
