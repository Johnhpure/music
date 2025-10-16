import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { AIClientManagerService } from '../services/ai-client-manager.service';
import { ChatCompletionDto } from '../dto/chat-completion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * AI聊天接口Controller
 * 提供给前端和其他模块调用
 */
@Controller('user/ai/chat')
@UseGuards(JwtAuthGuard)
export class AIChatController {
  constructor(private readonly clientManager: AIClientManagerService) {}

  @Post('completions')
  async createChatCompletion(
    @Body() dto: ChatCompletionDto,
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const response = await this.clientManager.createChatCompletion(
        dto.providerCode,
        {
          messages: dto.messages,
          model: dto.model,
          maxTokens: dto.maxTokens,
          temperature: dto.temperature,
          topP: dto.topP,
        },
        req.user?.id,
        ip,
        userAgent,
      );

      return {
        code: 200,
        data: response,
      };
    } catch (error) {
      return {
        code: error.status || 500,
        message: error.message || 'AI service error',
        error: error.code || 'INTERNAL_ERROR',
      };
    }
  }

  @Post('count-tokens')
  async countTokens(
    @Body() body: { providerCode: string; text: string; model?: string },
  ) {
    try {
      const count = await this.clientManager.countTokens(
        body.providerCode,
        body.text,
        body.model,
      );

      return {
        code: 200,
        data: { tokens: count },
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message,
      };
    }
  }

  @Post('available-providers')
  async getAvailableProviders() {
    const providers = await this.clientManager.getAvailableProviders();

    return {
      code: 200,
      data: providers,
    };
  }
}
