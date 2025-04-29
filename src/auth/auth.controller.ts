import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { HasRoles } from './has-roles.decorator';
import { Role } from 'src/user/role/user.enum';
import { RolesGuard } from './roles.guard';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { LoginUser } from 'src/user/dto/login-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const data = await this.usersService.create(createUserDto);
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Login user and return access token' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() login: LoginUser, @Res() res: Response) {
    try {
      const data = await this.authService.login(req.user);
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 201, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  getProfile(@Request() req, @Res() res: Response) {
    try {
      const data = req.user;
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Accessible only by ADMIN' })
  @ApiResponse({ status: 201, description: 'Admin route accessed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('admin')
  onlyAdmin(@Request() req, @Res() res: Response) {
    try {
      const data = req.user;
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Accessible only by FREELANCER' })
  @ApiResponse({ status: 201, description: 'Freelancer route accessed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.FREELANCER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('freelancer')
  onlyFreelancer(@Request() req, @Res() res: Response) {
    try {
      const data = req.user;
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Accessible only by CUSTOMER' })
  @ApiResponse({ status: 201, description: 'Customer route accessed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.CUSTOMER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('customer')
  onlyCustomer(@Request() req, @Res() res: Response) {
    try {
      const data = req.user;
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}
