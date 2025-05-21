import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes} from 'mongoose';
import { Auth } from 'src/auth/entities/auth.entity';

@Schema()
export class Expense extends Document {

    @Prop({ required: [true, "The description is required"], type: String })
    description: string;

    @Prop({ required: [true, "The category is required"], type: String })
    category: string;

    @Prop({ required: [true, "The amount is required"], type: Number })
    amount: number;

    @Prop({ required: [true, "The date is required"], type: Date })
    date: Date;

    @Prop({ type: Number })
    totalAmount: number;

    @Prop({  type: Number })
    totalIncome: number;

    @Prop({ type: Number })
    balance: number;

    @Prop({ 
        required: [true, "The user is required"],
        type: SchemaTypes.ObjectId, 
        ref: Auth.name
     })
     user: Auth;

    @Prop({ type: Date, default: Date.now })
    created_at: Date | number;;

    @Prop({ type: Date, default: Date.now })
    update_at: Date | number;
}

export const ExpenseShema = SchemaFactory.createForClass(Expense);