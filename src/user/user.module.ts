import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { CustomerSchema } from 'src/customer/entities/customer.entity';
import { FreelancerSchema } from 'src/freelancer/entities/freelancer.entity';
import { MailModule } from 'src/mail/mail.module';
import { JoiPipeModule } from 'nestjs-joi';


@Module({
  imports:[MongooseModule.forFeature([
    {name:"User", schema:UserSchema},
    {name:"Customer", schema:CustomerSchema},
    {name:"Freelancer", schema:FreelancerSchema}
  ]),
  MailModule,
  JoiPipeModule
],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

