import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Auth extends Document {

    @Prop({ required: [true, "The name is required"], type: String })
    name: string;

    @Prop({ required: [true, "The last_name is required"], type: String })
    last_name: string;

    @Prop({required: [true, "The name is required and unique"], type: String, unique: true })
    email: string;

    @Prop({ required: [true, "The password is required"], type: String })
    password: string;

    @Prop({ type: Array, default: ['ADMIN'] })
    roles: string[];

    @Prop({ type: Date, default: Date.now })
    created_at: Date | number;;

    @Prop({ type: Date, default: Date.now })
    update_at: Date | number;

    @Prop({ type: Date, default: Date.now })
    update_at_login: Date | number;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Number, default: 0 })
    retry: number;
}

export const AuthShema = SchemaFactory.createForClass(Auth);
