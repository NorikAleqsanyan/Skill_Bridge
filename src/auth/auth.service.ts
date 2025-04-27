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

  /**
   * Validates the user credentials (username/email and password).
   *
   * @param username - The username or email of the user.
   * @param pass - The plaintext password provided by the user.
   * @returns The user object if validation is successful, otherwise null.
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmailOrUsername(username);
    console.log(user);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * Logs in the user by generating a JWT token with user information.
   *
   * @param user - The user object that is returned after successful validation.
   * @returns The JWT access token and the user's role.
   */
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
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      role: user.role,
    };
  }
}
