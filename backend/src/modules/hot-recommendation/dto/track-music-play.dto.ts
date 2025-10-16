import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class TrackMusicPlayDto {
  @IsInt()
  musicId: number;

  @IsOptional()
  @IsEnum(['play', 'click'])
  action?: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  @IsInt()
  playDuration?: number;
}
