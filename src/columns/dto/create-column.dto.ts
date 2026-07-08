import { IsInt, IsNotEmpty, MaxLength, IsOptional, Min } from "class-validator";


export class CreateColumnDto{
    @IsNotEmpty()
    @MaxLength(50)
    title!: string;
    
    @IsOptional()
    @IsInt()
    @Min(0)
    order!: number;
}