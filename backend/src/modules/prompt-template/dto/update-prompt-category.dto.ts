import { PartialType } from '@nestjs/mapped-types';
import { CreatePromptCategoryDto } from './create-prompt-category.dto';

export class UpdatePromptCategoryDto extends PartialType(CreatePromptCategoryDto) {}
