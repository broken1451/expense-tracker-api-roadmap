import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class TransactionDto {

    @IsOptional()
    @IsString()
    _id?: string;

    @IsNotEmpty({ message: "The purchase date is required" })
    @IsDate()
    @Type(() => Date)
    dayBuy: Date;

    @IsOptional()
    @IsString()
    description: string = '';
    
    @IsNotEmpty({ message: "The card is required" })
    @IsString()
    tarjeta: string;

    @IsNotEmpty({ message: "The total amount is required" })
    @IsNumber()
    totalAmount: number;

    @IsOptional()
    @IsNumber()
    interestPurchase: number = 0;

    @IsNotEmpty({ message: "The number of installments is required" })
    @IsNumber()
    installments: number;
    

    @IsNotEmpty({ message: "The installment amount is required" })
    @IsNumber()
    installmentAmount: number;

    @IsNotEmpty({ message: "The total interest per installment is required" })
    @IsNumber()
    totalInterestPerInstallment: number;


    @IsNotEmpty({ message: "The next payment date is required" })
    @IsDate()
    @Type(() => Date)
    nextPayment: Date;

    @IsOptional()
    state: State;


}

export enum StatePending {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

export interface State {
    state: StatePending;
    pending: number
    paid: number
}