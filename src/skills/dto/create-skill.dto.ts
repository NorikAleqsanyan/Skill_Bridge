import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
export class CreateSkillDto {
  @ApiProperty()
  @JoiSchema(Joi.string().required())
  name: string;
}