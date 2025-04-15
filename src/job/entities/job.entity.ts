import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Freelancer } from 'src/freelancer/entities/freelancer.entity';
import { StatusJob } from '../status/status.enum';
import * as mongoose from 'mongoose';
import { Skills } from 'src/skills/entities/skill.entity';
import { Customer } from 'src/customer/entities/customer.entity';

export type JobDocument = HydratedDocument<Job>;

@Schema()
export class Job {
  id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  deadline: Date;

  @Prop({ default: false })
  isBlock: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Customer" })
  customer: Customer

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }] })
  skills: Skills[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" }] })
  requestFreelancer: Freelancer[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" })
  freelancer: string

  @Prop(raw({
    rate: { type: Number },
    text: { type: String }
  }))
  feedback: { rate: number, text: string };

  @Prop({ default: StatusJob.START })
  status: StatusJob
}

export const JobSchema = SchemaFactory.createForClass(Job);