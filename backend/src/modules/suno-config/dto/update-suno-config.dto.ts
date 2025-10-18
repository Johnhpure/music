import { PartialType } from '@nestjs/swagger';
import { CreateSunoConfigDto } from './create-suno-config.dto';

export class UpdateSunoConfigDto extends PartialType(CreateSunoConfigDto) {}
