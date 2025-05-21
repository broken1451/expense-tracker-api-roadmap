import { Type } from "class-transformer";
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateExpenseDto {

    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]*$/, {
        message: 'The name must contain only letters and spaces, and can have spaces at the end.',
    })
    description: string;


    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z\s]*$/, {
        message: 'The category must contain only letters and spaces, and can have spaces at the end.',
    })
    category: string;


    @IsNumber()
    amount: number

    @IsDate()
    @Type(() => Date)
    date: Date;

    @IsNumber()
    @IsOptional()
    totalAmount: number;

    @IsNumber()
    @IsOptional()
    totalIncome: number;

    @IsNumber()
    @IsOptional()
    balance: number;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    created_at: number;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    update_at: number;

    @IsNotEmpty()
    @IsString()
    user: string;
}

