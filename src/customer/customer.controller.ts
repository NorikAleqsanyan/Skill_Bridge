import { CustomerService } from './customer.service';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of customers retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const data = await this.customerService.findAll();

      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.customerService.findOne(id);

      return res.status(HttpStatus.OK).json(data);
    } catch (e) {

      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}
