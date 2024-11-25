import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateAuthDto {

    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]*$/, {
        message: 'The name must contain only letters and spaces, and can have spaces at the end.',
    })
    name: string;


    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]*$/, {
        message: 'The last_name must contain only letters and spaces, and can have spaces at the end.',
    })
    last_name: string;


    @IsString()
    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

    @IsString({ each: true }) // cada uno de los elementos  del arreglo  tiene q ser string
    @IsArray()
    @IsOptional()
    roles?: string[];

}
