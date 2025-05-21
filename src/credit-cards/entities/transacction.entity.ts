import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { State, StatePending } from '../dto/transaction.dto';


@Schema({
   
})
export class Transaction  extends Document {

    @Prop({ required: [true, "The card is required"] })
    tarjeta: string;

    @Prop({ required: false, default: ''})
    description: string;

    @Prop({ required: [true, "The total amount is required"] })
    totalAmount: number;

    @Prop({ required: [true, "The purchase date is required"] })
    dayBuy: Date;

    @Prop({ required: [true, "The number of installments is required"] })
    installments: number;

    @Prop({ required: false, default: 0 })
    interestPurchase: number;

    @Prop({ required: [true, "The installment amount is required"] })
    installmentAmount: number;

    @Prop({ required: [true, "The total interest per installment is required"] })
    totalInterestPerInstallment: number;


    @Prop({ required: [true, "The next payment date is required"] })
    nextPayment: Date;

    @Prop({ 
        required: false, 
        type: SchemaTypes.Mixed, 
        default: () => ({ state: StatePending.PENDING, pending: 0, paid: 0 }) 
    })
    state: State;


}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);