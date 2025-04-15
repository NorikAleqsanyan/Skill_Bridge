import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmailOrUsername(username, email);
    console.log(user);
    if (user && bcrypt.compareSync(pass, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      _id: user._id,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      image: user.image,
    };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
}
