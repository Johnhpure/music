import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { ExpandInspirationDto } from './dto/expand-inspiration.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('user/ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('lyrics/generate')
  async generateLyrics(@Request() req, @Body() dto: GenerateLyricsDto) {
    return this.aiService.generateLyrics(req.user.id, dto);
  }

  @Post('expand-inspiration')
  async expandInspiration(@Request() req, @Body() dto: ExpandInspirationDto) {
    return this.aiService.expandInspiration(req.user.id, dto);
  }

  @Get('lyrics/history')
  async getHistory(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.aiService.getGenerationHistory(req.user.id, pageNum, limitNum);
  }

  @Get('lyrics/:id')
  async getGenerationById(@Request() req, @Param('id') id: string) {
    return this.aiService.getGenerationById(req.user.id, parseInt(id, 10));
  }
}
