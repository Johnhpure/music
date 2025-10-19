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
import {
  ChatCompletionDto,
  PromptCompletionDto,
} from '../dto/chat-completion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * AI聊天接口Controller
 * 提供给前端和其他模块调用
 */
@Controller('user/ai/chat')
@UseGuards(JwtAuthGuard)
export class AIChatController {
  constructor(private readonly clientManager: AIClientManagerService) {}

  /**
   * 提示词完成接口（自动选择启用的模型）
   * 四个模型（Claude、OpenAI、Gemini、DeepSeek）中每次只有一个处于开启状态
   */
  @Post('prompt-completion')

  async promptCompletion(
    @Body() dto: PromptCompletionDto,
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      // 查询当前启用的Provider（只有一个isActive=true）
      const activeProvider = await this.clientManager[
        'providerService'
      ].providerRepo.findOne({
        where: { isActive: true },
        relations: ['models'],
      });

      if (!activeProvider) {
        return {
          code: 404,
          message: '未找到启用的AI模型，请在AI配置管理中启用一个模型',
        };
      }

      // 如果请求没有指定model，则使用该Provider的默认模型
      let modelToUse = dto.model;
      if (!modelToUse && activeProvider.models && activeProvider.models.length > 0) {
        const defaultModel = activeProvider.models.find(m => m.isDefault && m.isActive);
        if (defaultModel) {
          modelToUse = defaultModel.modelCode;
        }
      }

      // 调用AI服务
      const response = await this.clientManager.createChatCompletion(
        activeProvider.providerCode,
        {
          messages: dto.messages,
          model: modelToUse,
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
        data: {
          ...response,
          usedProvider: {
            code: activeProvider.providerCode,
            name: activeProvider.providerName,
          },
        },
      };
    } catch (error) {
      console.error('[prompt-completion] 错误:', error);
      return {
        code: error.status || 500,
        message: error.message || 'AI服务调用失败',
        error: error.code || 'INTERNAL_ERROR',
      };
    }
  }

  @Post('completions')
  async createChatCompletion(
    @Body() dto: ChatCompletionDto,
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      let response;

      // 如果指定了keyGroupId，使用KEY组进行轮询
      if (dto.keyGroupId && dto.providerCode === 'gemini') {
        response = await this.clientManager.createChatCompletionWithKeyGroup(
          dto.keyGroupId,
          {
            messages: dto.messages,
            model: dto.model,
            maxTokens: dto.maxTokens,
            temperature: dto.temperature,
            topP: dto.topP,
          },
          req.user?.id,
        );
      } else {
        // 正常调用
        response = await this.clientManager.createChatCompletion(
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
      }

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
