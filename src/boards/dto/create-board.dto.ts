import { MaxLength } from "class-validator";
import { IsNotEmpty } from "class-validator";
export class CreateBoardDto{
    @IsNotEmpty()
    @MaxLength(100)
    title!: string;
}