import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  openid?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['wechat', 'web', 'mobile', 'unknown'])
  registration_source?: 'wechat' | 'web' | 'mobile' | 'unknown';

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
