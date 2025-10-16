import { Controller, Get } from '@nestjs/common';
import { BannerService } from './banner.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public/banner')
export class PublicBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get('list')
  async getActiveBanners() {
    return this.bannerService.findActive();
  }
}
