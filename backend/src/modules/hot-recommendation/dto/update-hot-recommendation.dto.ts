import { PartialType } from '@nestjs/mapped-types';
import { CreateHotRecommendationDto } from './create-hot-recommendation.dto';

export class UpdateHotRecommendationDto extends PartialType(
  CreateHotRecommendationDto,
) {}
