import { PartialType } from '@nestjs/mapped-types';
import { CreateHotRecommendationDto } from './create-hot-recommendation.dto';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateHotRecommendationDto extends PartialType(
  CreateHotRecommendationDto,
) {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === 'true' || value === '1';
    return Boolean(value);
  })
  isActive?: boolean;
}
