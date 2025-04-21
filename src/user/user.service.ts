import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { Customer } from 'src/customer/entities/customer.entity';
import { Freelancer } from 'src/freelancer/entities/freelancer.entity';
import { Role } from './role/user.enum';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Freelancer') private freelancerModel: Model<Freelancer>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const {
      first_name,
      last_name,
      age,
      email,
      username,
      password,
      phoneNumber,
      role,
    } = createUserDto;
    const usemail = await this.userModel.findOne({ email });
    const usname = await this.userModel.findOne({ username });
    if (usemail ) {
      throw new BadRequestException('User has already with that email');
    }
    if (usname ) {
      throw new BadRequestException('User has already with that username');
    }
    const user = await this.userModel.create({
      first_name,
      last_name,
      age,
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      phoneNumber,
      role,
    });
    if (role == Role.CUSTOMER) {
      const customer = await this.customerModel.create({ _id: user._id, user });
      await this.userModel.findByIdAndUpdate(user, { customer });
    } else if (role == Role.FREELANCER) {
      const freelancer = await this.freelancerModel.create({
        _id: user._id,
        user,
      });
      await this.userModel.findByIdAndUpdate(user, { freelancer });
    }
    this.mailService.sendEmail('aleqsanyan.004@gmail.com', 'Register', 'good');
    return user;
  }

  async findUserByEmailOrUsername(username: string) {
    return await this.userModel.findOne({
      $or: [
        { email:username },
        { username }
      ]
    });
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: string) {
    console.log(id);
    
    return await this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findById(id);

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    return await this.userModel.findByIdAndUpdate(updateUserDto);
  }

  async updateImage(id: string, newImage: string) {
    const updatedUser = await this.userModel.findById(id);
    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }
    if (updatedUser.image && updatedUser.image != 'user.png') {
      console.log(__dirname, updatedUser.image);
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        updatedUser.image,
      );
      console.log(__dirname, filePath);
      fs.unlinkSync(filePath);
    }
    await this.userModel.findByIdAndUpdate(id, { image: newImage });
    return await this.userModel.findById(id);
  }

  async updatePassword(
    id: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const { oldPassword, password, confirmPassword } = updateUserPasswordDto;

    if (!oldPassword || !password || !confirmPassword) {
      throw new BadRequestException('All password fields are required!');
    }
    
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect!');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match!',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await this.userModel.findByIdAndUpdate(user);

    await this.mailService.sendEmail("aleqsanyan.004@gmail.com", "Password updated", "Password updated successfully")
    return { message: 'Password updated successfully', user };
  }

  async remove(id: string) {
    const us = await this.userModel.findById(id);
    if (!us) {
      return false;
    }
    await this.userModel.findByIdAndDelete(us);
    await this.mailService.sendEmail("aleqsanyan.004@gmail.com", "Delete user", "good delete user")
    return true;
  }
}
