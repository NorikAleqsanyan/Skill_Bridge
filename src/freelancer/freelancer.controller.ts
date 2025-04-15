import { FreelancerService } from './freelancer.service';
import { DeleteFreelancerSkillDto, UpdateFreelancerSalaryDto, UpdateFreelancerSkillDto } from './dto/update-freelancer.dto';
import { Controller, Get, Body, Patch, Param, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/roles.guard';
import { HasRoles } from 'src/auth/has-roles.decorator';
import { Role } from 'src/user/role/user.enum';

@Controller('freelancer')
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) { }

  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'))
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

  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'))
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

  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('by-skills')
  async getFreelancersBySkills(@Param('skills') skills: string[], @Res() res: Response) {
    try {
      const freelancers = await this.freelancerService.getFreelancersBySkills(skills);
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('by-min-salary')
  async getFreelancersByMinSalary(@Param('minSalary') minSalary: number, @Res() res: Response) {
    try {
      const freelancers = await this.freelancerService.getFreelancersByMinSalary(minSalary);
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @HasRoles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('by-max-salary')
  async getFreelancersByMaxSalary(@Param('maxSalary') maxSalary: number, @Res() res: Response) {
    try {
      const freelancers = await this.freelancerService.getFreelancersByMaxSalary(maxSalary);
      return res.status(HttpStatus.OK).json(freelancers);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @HasRoles(Role.FREELANCER)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/selary')
  async updateSelary(
    @Param('id') id: string,
    @Body() updateFreelancerSalaryDto: UpdateFreelancerSalaryDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.updateSelary(
        id,
        updateFreelancerSalaryDto,
      );
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/skill')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateFreelancerSkillDto: UpdateFreelancerSkillDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.updateSkill(
        id,
        updateFreelancerSkillDto,
      );
      return res.status(HttpStatus.CREATED).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/delete/skill')
  async deleteSkill(
    @Param('id') id: string,
    @Body() deleteFreelancerSkillDto: DeleteFreelancerSkillDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.freelancerService.deleteSkill(
        id,
        deleteFreelancerSkillDto,
      );
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }
}
