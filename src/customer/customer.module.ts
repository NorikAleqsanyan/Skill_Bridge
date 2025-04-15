import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from './entities/customer.entity';
import { JobSchema } from 'src/job/entities/job.entity';
import { UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports:[MongooseModule.forFeature([
    {name:"Customer", schema:CustomerSchema},
    {name:"User", schema:UserSchema},
    {name:"Job", schema:JobSchema}
  ])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
