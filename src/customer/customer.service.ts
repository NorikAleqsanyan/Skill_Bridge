import { Injectable } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
  ) {}

  /**
   * Retrieves all customers from the database.
   *
   * @returns List of all customers.
   * @throws return message: return the list of customers or handle any errors during retrieval.
   */
  async findAll() {
    return this.customerModel.find().populate('user');
  }

  /**
   * Retrieves a customer by its ID.
   *
   * @param id - The ID of the customer to retrieve.
   * @returns The customer with the specified ID.
   * @throws return message: return the customer object or an error if not found.
   */
  async findOne(id: string) {
    return this.customerModel.findById(id).populate('user');
  }
}
