import { Priority } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class FilterTaskDto {
    @ApiProperty({example: 'Implement authentication', maxLength: 150, required: false})
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({example: 'Implement user authentication using JWT', maxLength: 500, required: false})
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @ApiProperty({example: '2024-12-31T23:59:59Z', required: false})
    @IsOptional()
    @IsDateString()
    dueBefore?: string;

    @ApiProperty({example: '2024-01-01T00:00:00Z', required: false})
    @IsOptional()
    @IsDateString()
    dueAfter?: string;
}