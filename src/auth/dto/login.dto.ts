import { IsEmail, IsString, MaxLength, MinLength, IsOptional, IsBoolean } from 'class-validator';


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
export class LoginhDtoGoogle {

    @IsString()
    token: string

    @IsBoolean()
    google: boolean;
}