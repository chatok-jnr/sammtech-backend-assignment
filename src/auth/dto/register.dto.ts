import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
  @ApiProperty({example: 'John Doe'})
  @IsNotEmpty()
  name!: string;

  @ApiProperty({example: 'jane@example.com'})
  @IsEmail()
  email!: string;

  @ApiProperty({example: 'password123', minLength: 8})
  @MinLength(8)
  password!: string;
}