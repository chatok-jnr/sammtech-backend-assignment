import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

class LabelDto {
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @IsNotEmpty()
  color!: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement authentication', maxLength: 150 })
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty({ example: 'Implement user authentication using JWT', maxLength: 500, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'HIGH', enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'user-id-123', required: false }) 
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({ type: [LabelDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelDto)
  labels?: LabelDto[];
}