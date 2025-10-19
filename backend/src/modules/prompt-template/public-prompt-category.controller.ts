import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PromptCategoryService } from './prompt-category.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public/prompt-category')
export class PublicPromptCategoryController {
  constructor(private readonly categoryService: PromptCategoryService) {}

  @Public()
  @Get()
  async getActiveCategories() {
    return this.categoryService.findAll(true);
  }

  @Public()
  @Get(':id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }
}
