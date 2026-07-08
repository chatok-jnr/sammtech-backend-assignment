import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MoveTaskDto {
  @IsOptional()
  @IsString()
  columnId?: string;

  @IsInt()
  @Min(0)
  position!: number; 
}