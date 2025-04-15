import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class LoginUser {
    @ApiProperty()
    @JoiSchema(Joi.string().required())
    username: string
    @ApiProperty()
    @JoiSchema(Joi.string().min(4).max(20).required())
    password: string
}