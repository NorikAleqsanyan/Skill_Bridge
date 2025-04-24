import { Injectable } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
  ) {}
  async findAll() {
    return this.customerModel.find().populate('user');
  }

  async findOne(id: string) {
    return this.customerModel.findById(id).populate('user');
  }
}
