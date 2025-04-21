import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Job } from 'src/job/entities/job.entity';
import { Freelancer } from 'src/freelancer/entities/freelancer.entity';

export type SkillsDocument = HydratedDocument<Skills>;

@Schema()
export class Skills {
  _id: string;
  
  @Prop()
  name: string;

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}]})
  job:Job[]

  @Prop({type:[{type:mongoose.Schema.Types.ObjectId,ref:"Freelancer"}]})
  freelancer:Freelancer[]
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);