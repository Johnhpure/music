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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PromptCategoryService } from './prompt-category.service';
import { CreatePromptCategoryDto } from './dto/create-prompt-category.dto';
import { UpdatePromptCategoryDto } from './dto/update-prompt-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';
import { User } from '../user/entities/user.entity';

@Controller('admin/prompt-category')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPromptCategoryController {
  constructor(
    private readonly categoryService: PromptCategoryService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  async getAllCategories(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly === 'true';
    return this.categoryService.findAll(active);
  }

  @Get(':id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  async createCategory(
    @Body() createDto: CreatePromptCategoryDto,
    @CurrentUser() user: User,
  ) {
    const category = await this.categoryService.create(createDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_CATEGORY_CREATE',
      resource: 'prompt_category',
      resourceId: category.id.toString(),
      details: createDto,
    });

    return category;
  }

  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePromptCategoryDto,
    @CurrentUser() user: User,
  ) {
    const category = await this.categoryService.update(id, updateDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_CATEGORY_UPDATE',
      resource: 'prompt_category',
      resourceId: id.toString(),
      details: updateDto,
    });

    return category;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.categoryService.remove(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_CATEGORY_DELETE',
      resource: 'prompt_category',
      resourceId: id.toString(),
    });
  }

  @Post(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const category = await this.categoryService.toggleStatus(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_CATEGORY_TOGGLE_STATUS',
      resource: 'prompt_category',
      resourceId: id.toString(),
      details: { isActive: category.isActive },
    });

    return category;
  }

  @Post('batch-sort')
  async batchUpdateSort(
    @Body() sortData: { id: number; sortOrder: number }[],
    @CurrentUser() user: User,
  ) {
    await this.categoryService.updateSort(sortData);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_CATEGORY_BATCH_SORT',
      resource: 'prompt_category',
      resourceId: 'batch',
      details: { count: sortData.length },
    });

    return { success: true };
  }
}
