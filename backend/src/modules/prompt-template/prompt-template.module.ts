import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptTemplateService } from './prompt-template.service';
import { PublicPromptTemplateController } from './public-prompt-template.controller';
import { AdminPromptTemplateController } from './admin-prompt-template.controller';
import { PromptTemplate } from './entities/prompt-template.entity';
import { PromptTemplateUsage } from './entities/prompt-template-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromptTemplate, PromptTemplateUsage])],
  controllers: [PublicPromptTemplateController, AdminPromptTemplateController],
  providers: [PromptTemplateService],
  exports: [PromptTemplateService],
})
export class PromptTemplateModule {}
