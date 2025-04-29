import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Validates the user's credentials (username and password) using the AuthService.
   *
   * @param username - The username or email entered by the user.
   * @param password - The password entered by the user.
   * @returns The user object if the username and password are valid, otherwise throws UnauthorizedException.
   * @throws UnauthorizedException - If the username or password is incorrect.
   */
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
  }
}

