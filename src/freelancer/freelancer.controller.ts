import { FreelancerService } from './freelancer.service';
import {
  DeleteFreelancerSkillDto,
  UpdateFreelancerSalaryDto,
  UpdateFreelancerSkillDto,
} from './dto/update-freelancer.dto';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Res,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/roles.guard';
import { HasRoles } from 'src/auth/has-roles.decorator';
import { Role } from 'src/user/role/user.enum';

@ApiTags('Freelancers')
@Controller('freelancer')
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}

  @ApiOperation({ summary: 'Get all freelancers (Customer/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of freelancers retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const data = await this.freelancerService.findAll();
      
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get a freelancer by ID (Customer/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Freelancer retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.freelancerService.getFreelancerById(id);
      
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get freelancers by skill ID (Customer/Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Freelancers retrieved successfully by skill',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('by-skills/:skillId')
  async getFreelancersBySkills(
    @Param('skillId') skillId: string,
    @Res() res: Response,
  ) {
    try {
      const freelancers =
        await this.freelancerService.getFreelancersBySkills(skillId);
      
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get freelancers with minimum salary' })
  @ApiResponse({
    status: 200,
    description: 'Freelancers filtered by minimum salary',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('filter/by-min-salary')
  async getFreelancersByMinSalary(
    @Query('min') min: number,
    @Res() res: Response,
  ) {
    try {
      const freelancers =
        await this.freelancerService.getFreelancersByMinSalary(min);
      
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Get freelancers with maximum salary' })
  @ApiResponse({
    status: 200,
    description: 'Freelancers filtered by maximum salary',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('filter/by-max-salary')
  async getFreelancersByMaxSalary(
    @Query('max') max: number,
    @Res() res: Response,
  ) {
    try {
      const freelancers =
        await this.freelancerService.getFreelancersByMaxSalary(max);
      
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Update freelancer salary (Freelancer only)' })
  @ApiResponse({ status: 201, description: 'Salary updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.FREELANCER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/salary')
  async updateSalary(
    @Req() req,
    @Body() updateFreelancerSalaryDto: UpdateFreelancerSalaryDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.updateSalary(
      
        req.user._id,
        updateFreelancerSalaryDto,
      
      );
      
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Update freelancer skills' })
  @ApiResponse({ status: 201, description: 'Skills updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.FREELANCER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('skill')
  async updateSkill(
    @Req() req,
    @Body() updateFreelancerSkillDto: UpdateFreelancerSkillDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.updateSkill(
        req.user._id,
        updateFreelancerSkillDto,
      );
      
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiOperation({ summary: 'Delete freelancer skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HasRoles(Role.FREELANCER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('/delete/skill')
  async deleteSkill(
    @Req() req,
    @Body() deleteFreelancerSkillDto: DeleteFreelancerSkillDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.deleteSkill(
      
        req.user._id,
        deleteFreelancerSkillDto,
      
      );
      
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}
