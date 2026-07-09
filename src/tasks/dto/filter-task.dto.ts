import { Priority } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class FilterTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @IsOptional()
    @IsDateString()
    dueBefore?: string;

    @IsOptional()
    @IsDateString()
    dueAfter?: string;
}