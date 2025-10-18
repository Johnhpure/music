import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SunoConfigService } from './suno-config.service';
import { SunoConfigController } from './suno-config.controller';
import { SunoConfig } from './entities/suno-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SunoConfig])],
  controllers: [SunoConfigController],
  providers: [SunoConfigService],
  exports: [SunoConfigService],
})
export class SunoConfigModule {}
