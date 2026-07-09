import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class MoveTaskDto {
  @ApiProperty({ example: 'column-id-123', required: false })
  @IsOptional()
  @IsString()
  columnId?: string;

  @ApiProperty({ example: 2, required: true, minimum: 0 }) 
  @IsInt()
  @Min(0)
  position!: number; 
}