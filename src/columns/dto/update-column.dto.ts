import { IsInt, IsNotEmpty, MaxLength, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class UpdateColumnDto{

    @ApiProperty({example: 'To Do', maxLength: 50, required: false})
    @IsNotEmpty()
    @MaxLength(50)
    title?: string;
    
    @ApiProperty({example: 0, required: false, minimum: 0})
    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;
}