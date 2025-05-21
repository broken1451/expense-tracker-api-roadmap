import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Auth } from 'src/auth/entities/auth.entity';
import { Transaction } from './transacction.entity';

@Schema()
export class CreditCard extends Document {

    @Prop({ required: [true, "The name is required"], type: String })
    name: string;

    @Prop({ required: [true, "The credit limit is required"], type: Number })
    creditLimit: number;
 
    @Prop({ required: [false, "The annual interest rate is required"], type: Number })
    annualInterestRate: number;


    @Prop({ required: [true, "The closing date is required"], type: Date })
    dueDate: Date;

    @Prop({ required: [true, "The payment date is required"], type: Date })
    grantDate: Date;
    
    @Prop({ type: [Transaction], required: false, default: [] })
    transaction: Transaction[];

    @Prop({ type: Date, default: Date.now })
    created_at: Date | number;

    @Prop({ type: Date, default: Date.now })
    update_at: Date | number;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ 
        required: [true, "The user is required"],
        type: SchemaTypes.ObjectId, 
        ref: Auth.name
     })
     user: Auth;
}


export const CreditCardShema = SchemaFactory.createForClass(CreditCard);