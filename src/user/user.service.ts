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

  /**
   * Creates a new user and links them to the appropriate customer or freelancer role.
   *
   * @param createUserDto - User details.
   * @returns Created user object.
   * @throws BadRequestException if the email or username is already in use.
   */
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
    if (usemail) {
      throw new BadRequestException('User has already with that email');
    }
    if (usname) {
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
    this.mailService.sendEmail(
      user.email,
      'Registration Confirmation',
      `<h3>Welcome to our platform!</h3>
       <p>Dear ${first_name} ${last_name},</p>
       <p>Thank you for registering with us! We are excited to have you in our community.</p>
       <p>Follow the links below to start using our services:</p>
       <ul>
         <li><a href="{{profile_link}}">Your Profile</a></li>
         <li><a href="{{dashboard_link}}">Dashboard</a></li>
       </ul>
       <p>If you have any questions, feel free to contact us:</p>
       <p>Best regards,<br>Our Team</p>`,
    );

    return user;
  }

  /**
   * Finds a user by email or username.
   *
   * @param username - The email or username of the user.
   * @returns User object if found.
   */
  async findUserByEmailOrUsername(username: string) {
    return await this.userModel.findOne({
      $or: [{ email: username }, { username }],
    });
  }

  /**
   * Retrieves all users.
   *
   * @returns List of all users.
   */
  async findAll() {
    return await this.userModel.find();
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The user's ID.
   * @returns User object if found.
   */
  async findOne(id: string) {
    console.log(id);
    return await this.userModel.findById(id);
  }

  /**
   * Updates a user's details.
   *
   * @param id - The user's ID.
   * @param updateUserDto - The details to update.
   * @returns Updated user object.
   * @throws BadRequestException if the user is not found.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findById(id);

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    return await this.userModel.findByIdAndUpdate(updateUserDto);
  }

  /**
   * Updates a user's profile image.
   *
   * @param id - The user's ID.
   * @param newImage - The new image filename.
   * @returns Updated user object with new image.
   * @throws BadRequestException if the user is not found.
   */
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

  /**
   * Updates a user's password.
   *
   * @param id - The user's ID.
   * @param updateUserPasswordDto - The new password details.
   * @returns Success message and updated user object.
   * @throws BadRequestException if password fields are missing or invalid.
   */
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

    await this.mailService.sendEmail(
      user.email,
      'Password updated',
      `<h3>Password Update</h3>
       <p>Dear ${user.first_name} ${user.last_name},</p>
       <p>Your password has been successfully updated. If you did not request this change, please contact us immediately.</p>
       <p>Your new password should be secure, and no one else should have access to it.</p>
       <p>If you have any questions, feel free to reach out at any time.</p>
       <p>Best regards,<br>Our Team</p>`,
    );

    return { message: 'Password updated successfully', user };
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The user's ID.
   * @returns `true` if the user was deleted, `false` if the user was not found.
   * @throws BadRequestException if the user is not found.
   */
  async remove(id: string) {
    const us = await this.userModel.findById(id);
    if (!us) {
      return false;
    }
    await this.userModel.findByIdAndDelete(us);

    await this.mailService.sendEmail(
      us.email, 
      'Account Deletion',
      `
        <h3>Account Deletion</h3>
        <p>Dear <strong>${us.first_name} ${us.last_name}</strong>,</p>
        <p>Your account has been successfully deleted. If this was not your request or if you deleted your account by mistake, please contact us immediately.</p>
        <p>We will try to restore your account as soon as possible.</p>
        <p>Best regards,<br>Our Team</p>
      `,
    );

    return true;
  }
}
