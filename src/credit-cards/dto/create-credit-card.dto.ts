import { Type } from "class-transformer";
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { TransactionDto } from "./transaction.dto";

export class CreateCreditCardDto {

    @IsNotEmpty({ message: "The name is required" })
    @IsString()
    name: string;

    @IsNotEmpty({ message: "The credit limit is required" })
    @IsNumber()
    creditLimit: number;

    @IsOptional()
    @IsNumber()
    annualInterestRate: number;

    @IsNotEmpty({ message: "The closing date is required" })
    @IsDate()
    @Type(() => Date)
    dueDate: Date;

    @IsNotEmpty({ message: "The payment date is required" })
    @IsDate()
    @Type(() => Date)
    grantDate: Date;

    @IsOptional()
    @IsArray()
    @Type(() => TransactionDto)
    transaction: TransactionDto[];

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
