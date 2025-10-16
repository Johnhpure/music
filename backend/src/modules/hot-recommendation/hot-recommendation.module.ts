import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotRecommendationService } from './hot-recommendation.service';
import { HotRecommendationController } from './hot-recommendation.controller';
import { AdminHotRecommendationController } from './admin-hot-recommendation.controller';
import { HotRecommendation } from './entities/hot-recommendation.entity';
import { RecommendationCategory } from './entities/recommendation-category.entity';
import { MusicPlayStat } from './entities/music-play-stat.entity';
import { UserMusicLike } from './entities/user-music-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotRecommendation,
      RecommendationCategory,
      MusicPlayStat,
      UserMusicLike,
    ]),
  ],
  controllers: [HotRecommendationController, AdminHotRecommendationController],
  providers: [HotRecommendationService],
  exports: [HotRecommendationService],
})
export class HotRecommendationModule {}
