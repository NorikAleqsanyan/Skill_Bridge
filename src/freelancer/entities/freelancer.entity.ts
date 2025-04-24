import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Job } from 'src/job/entities/job.entity';
import { Skills } from 'src/skills/entities/skill.entity';
import { User } from 'src/user/entities/user.entity';

export type FreelancerDocument = HydratedDocument<Freelancer>;

@Schema()
export class Freelancer {
  userId: string;

  @Prop()
  first_name: string;

  @Prop()
  salary: number;

  @Prop()
  rating: number;

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}]})
  requestJob:Job[]

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}]})
  finishJob:Job[]

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}]})
  jobs:Job[]

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Skills"}]})
  skills:Skills[]

  @Prop({type:mongoose.Schema.Types.ObjectId,ref:"User"})
  user:User

}

export const FreelancerSchema = SchemaFactory.createForClass(Freelancer);