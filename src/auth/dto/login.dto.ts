import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from 'class-validator';


export class LoginhDto {

    @IsString()
    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;
}