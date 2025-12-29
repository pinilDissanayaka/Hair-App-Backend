import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {

    @IsEmail({}, { message: 'Invalid email address' })
    email: string

    @IsNotEmpty({ message: 'Name should not be empty' })
    @IsString({ message: 'Name must be a string' })
    name: string

    @IsNotEmpty({ message: 'Password should not be empty' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(4, { message: 'Password must be at least 4 characters long' })
    password: string
}