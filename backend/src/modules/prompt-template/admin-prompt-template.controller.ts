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
import { PromptTemplateService } from './prompt-template.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';
import { QueryPromptTemplateDto } from './dto/query-prompt-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';
import { User } from '../user/entities/user.entity';

@Controller('admin/prompt-template')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPromptTemplateController {
  constructor(
    private readonly promptTemplateService: PromptTemplateService,
    private readonly auditService: AuditService,
  ) {}

  @Get('list')
  async getAllTemplates(@Query() query: QueryPromptTemplateDto) {
    return this.promptTemplateService.findAllPaginated(query);
  }

  @Get(':id')
  async getTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.promptTemplateService.findOne(id);
  }

  @Post()
  async createTemplate(
    @Body() createDto: CreatePromptTemplateDto,
    @CurrentUser() user: User,
  ) {
    const template = await this.promptTemplateService.create(createDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_TEMPLATE_CREATE',
      resource: 'prompt_template',
      resourceId: template.id.toString(),
      details: createDto,
    });

    return template;
  }

  @Patch(':id')
  async updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePromptTemplateDto,
    @CurrentUser() user: User,
  ) {
    const template = await this.promptTemplateService.update(id, updateDto);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_TEMPLATE_UPDATE',
      resource: 'prompt_template',
      resourceId: id.toString(),
      details: updateDto,
    });

    return template;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.promptTemplateService.softDelete(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_TEMPLATE_DELETE',
      resource: 'prompt_template',
      resourceId: id.toString(),
    });
  }

  @Post(':id/restore')
  async restoreTemplate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const template = await this.promptTemplateService.restore(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_TEMPLATE_RESTORE',
      resource: 'prompt_template',
      resourceId: id.toString(),
    });

    return template;
  }

  @Post(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const template = await this.promptTemplateService.toggleStatus(id);

    await this.auditService.log({
      adminId: user.id,
      action: 'PROMPT_TEMPLATE_TOGGLE_STATUS',
      resource: 'prompt_template',
      resourceId: id.toString(),
      details: { isActive: template.isActive },
    });

    return template;
  }
}
