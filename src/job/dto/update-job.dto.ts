import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { StatusJob } from '../status/status.enum';

export class UpdateJobDto {
  @ApiProperty()
  @JoiSchema(Joi.string())
  title: string;
  @ApiProperty()
  @JoiSchema(Joi.string())
  description: string;
  @ApiProperty()
  @JoiSchema(Joi.date())
  deadline: Date;
  @ApiProperty()
  @JoiSchema(Joi.string())
  freelancerId: string;
  @ApiProperty()
  @JoiSchema(Joi.array().items(Joi.string()))
  skills: string[];
}

export class AddSkillDto { 
  @ApiProperty()
  @JoiSchema(Joi.array().items(Joi.string()))
  skills: string[]; 
}
export class UpdateJobStatusDto {
  @ApiProperty()
  @JoiSchema(Joi.number().min(0).max(2))
  status: StatusJob;
}

export class JobFeedbackDto {
  @ApiProperty()
  @JoiSchema(Joi.number().min(0).max(5).integer())
  rate: number;

  @ApiProperty()
  @JoiSchema(Joi.string().max(50))
  text: string;
}