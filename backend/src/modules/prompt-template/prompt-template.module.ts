import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptTemplateService } from './prompt-template.service';
import { PromptCategoryService } from './prompt-category.service';
import { PublicPromptTemplateController } from './public-prompt-template.controller';
import { AdminPromptTemplateController } from './admin-prompt-template.controller';
import { PublicPromptCategoryController } from './public-prompt-category.controller';
import { AdminPromptCategoryController } from './admin-prompt-category.controller';
import { PromptTemplate } from './entities/prompt-template.entity';
import { PromptTemplateUsage } from './entities/prompt-template-usage.entity';
import { PromptCategory } from './entities/prompt-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromptTemplate,
      PromptTemplateUsage,
      PromptCategory,
    ]),
  ],
  controllers: [
    PublicPromptTemplateController,
    AdminPromptTemplateController,
    PublicPromptCategoryController,
    AdminPromptCategoryController,
  ],
  providers: [PromptTemplateService, PromptCategoryService],
  exports: [PromptTemplateService, PromptCategoryService],
})
export class PromptTemplateModule {}
