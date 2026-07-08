import {
    IsNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from '@prisma/client';

class LabelDto {
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @IsNotEmpty()
  color!: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelDto)
  labels?: LabelDto[];
}