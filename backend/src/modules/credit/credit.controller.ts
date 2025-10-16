import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Public } from '@modules/auth/decorators/public.decorator';
import { CreditService } from './credit.service';
import { ConsumeCreditDto } from './dto/consume-credit.dto';
import { RewardCreditDto } from './dto/reward-credit.dto';

@Controller('user/credit')
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('consume')
  async consumeCredit(@Request() req, @Body() consumeDto: ConsumeCreditDto) {
    return this.creditService.consumeCredit(req.user.id, consumeDto);
  }

  @Post('reward')
  async rewardCredit(@Request() req, @Body() rewardDto: RewardCreditDto) {
    return this.creditService.rewardCredit(req.user.id, rewardDto);
  }

  @Get('logs')
  async getCreditLogs(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.creditService.getUserCreditLogs(req.user.id, page, limit);
  }

  @Public()
  @Get('packages')
  async getCreditPackages() {
    return this.creditService.getCreditPackages();
  }

  @Get('balance')
  async getBalance(@Request() req) {
    return this.creditService.getUserBalance(req.user.id);
  }
}
