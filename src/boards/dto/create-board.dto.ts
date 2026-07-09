import { MaxLength } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateBoardDto{
    @ApiProperty({example: 'Project Board', maxLength: 100})
    @IsNotEmpty()
    @MaxLength(100)
    title!: string;
}