import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class CreateJobDto {
  @ApiProperty()
  @JoiSchema(Joi.string().required())
  title: string;
  @ApiProperty()
  @JoiSchema(Joi.string().required())
  description: string;
  @ApiProperty()
  @JoiSchema(Joi.date().required())
  deadline: Date;
  @ApiProperty()
  @JoiSchema(Joi.string().required())
  customerId: string;
  @ApiProperty()
  @JoiSchema(Joi.string().optional())
  freelancerId?: string;
  @ApiProperty()
  @JoiSchema(Joi.array().items(Joi.string()).required())
  skills: string[];
}