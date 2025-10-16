import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  packageId?: number;

  @IsInt()
  @Min(1)
  points: number;

  @IsInt()
  @Min(0)
  bonus: number;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
