import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
export class LoginDto{
    @ApiProperty({example: 'jane@example.com'})
    @IsEmail()
    @Transform(({value}) => value?.trim().toLowerCase())
    email!: string;

    @ApiProperty({example: 'password123'})
    @IsNotEmpty()
    password!: string;
}