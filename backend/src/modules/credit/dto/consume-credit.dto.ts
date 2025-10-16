import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class ConsumeCreditDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  related_id?: number;

  @IsOptional()
  @IsString()
  related_type?: string;
}
