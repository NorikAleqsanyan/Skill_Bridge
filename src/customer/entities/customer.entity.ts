import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema()
export class Customer {
  userId: String;

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}]})
  jobs:Job[]

  @Prop({type:mongoose.Schema.Types.ObjectId,ref:"User"})
  user:User

}

export const CustomerSchema = SchemaFactory.createForClass(Customer);