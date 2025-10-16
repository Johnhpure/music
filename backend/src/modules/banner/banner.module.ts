import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './banner.service';
import { PublicBannerController } from './public-banner.controller';
import { AdminBannerController } from './admin-banner.controller';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [PublicBannerController, AdminBannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
