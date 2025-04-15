import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import * as mongoose from 'mongoose';
import { Freelancer } from 'src/freelancer/entities/freelancer.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  id: number;
  @Prop()
  first_name: string;
  @Prop()
  last_name: string;
  @Prop()
  email: string;
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  age: number;
  @Prop({default:0})
  is_verify: number;
  @Prop()
  token: string;
  @Prop()
  role: number;
  @Prop()
  phoneNumber: string;
  @Prop()
  description: string;
  @Prop({default:"user.png"})
  image: string;

  
  @Prop({type:mongoose.Schema.Types.ObjectId,ref:"Customer"})
  customer:Customer

  
  @Prop({type:mongoose.Schema.Types.ObjectId,ref:"Freelancer"})
  freelancer:Freelancer

}

export const UserSchema = SchemaFactory.createForClass(User);