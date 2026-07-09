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

import { ApiProperty } from '@nestjs/swagger';

class LabelDto {
  @ApiProperty({ example: 'Bug', maxLength: 30 })
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @ApiProperty({ example: '#FF0000' }) 
  @IsNotEmpty()
  color!: string;
}

export class UpdateTaskDto {
  @ApiProperty({ example: 'Implement authentication', maxLength: 150, required: false })
  @IsOptional()
  @MaxLength(150)
  title?: string;

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