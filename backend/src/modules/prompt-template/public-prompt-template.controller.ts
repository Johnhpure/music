import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { UsagePromptTemplateDto } from './dto/usage-prompt-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public/prompt-template')
export class PublicPromptTemplateController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Public()
  @Get('list')
  async getActiveTemplates(@Query('category') category?: string) {
    return await this.promptTemplateService.findActive(category);
  }

  @Post('usage')
  @UseGuards(JwtAuthGuard)
  async recordUsage(@Request() req, @Body() usageDto: UsagePromptTemplateDto) {
    await this.promptTemplateService.recordUsage(
      usageDto.templateId,
      req.user.id,
    );
    return { message: 'Usage recorded successfully' };
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return await this.promptTemplateService.getCategories();
  }
}
