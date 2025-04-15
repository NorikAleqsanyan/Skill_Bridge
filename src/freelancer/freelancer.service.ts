import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeleteFreelancerSkillDto,
  UpdateFreelancerSalaryDto,
  UpdateFreelancerSkillDto,
} from './dto/update-freelancer.dto';
import { Freelancer } from './entities/freelancer.entity';
import { Model } from 'mongoose';

@Injectable()
export class FreelancerService {
  constructor(
    @InjectModel('Freelancer') private freelancerModel: Model<Freelancer>,
  ) { }

  async findAll() {
    return await this.freelancerModel.find();
  }

  async getFreelancerById(freelancerId: string): Promise<Freelancer> {
    const freelancer = await this.freelancerModel.findById(freelancerId).exec();

    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    const totalRating = freelancer.finishJob.reduce((sum, job) => sum + (job.feedback?.rate || 0), 0);
    const ratingCount = freelancer.finishJob.length;
    freelancer.rating = ratingCount > 0 ? totalRating / ratingCount : 0;

    await freelancer.save();

    return freelancer;
  }

  async getFreelancersBySkills(skills: string[]): Promise<Freelancer[]> {
    if (!skills || skills.length === 0) {
      throw new BadRequestException('Skills must be provided');
    }
    return await this.freelancerModel.find({ skills: { $in: skills } });
  }

  async getFreelancersByMinSalary(minSalary: number): Promise<Freelancer[]> {
    if (!minSalary || minSalary < 0) {
      throw new BadRequestException('Invalid minimum salary');
    }
    return await this.freelancerModel.find({ salary: { $gte: minSalary } });
  }

  async getFreelancersByMaxSalary(maxSalary: number): Promise<Freelancer[]> {
    if (!maxSalary || maxSalary < 0) {
      throw new BadRequestException('Invalid maximum salary');
    }
    return await this.freelancerModel.find({ salary: { $lte: maxSalary } });
  }

  async updateSelary(
    id: string,
    updateFreelancerSalaryDto: UpdateFreelancerSalaryDto,
  ) {
    const updatedUser = await this.freelancerModel.findOne({ where: { id } });

    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }

    return await this.freelancerModel.findByIdAndUpdate(
      updateFreelancerSalaryDto,
    );
  }

  async updateSkill(
    id: string,
    updateFreelancerSkillDto: UpdateFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findOne({ where: { id } });
    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }
    return await this.freelancerModel.findByIdAndUpdate(
      updateFreelancerSkillDto,
    );
  }

  async deleteSkill(
    id: string,
    deleteFreelancerSkillDto: DeleteFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findOne({ where: { id } });

    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }

    return await this.freelancerModel.findByIdAndUpdate(
      deleteFreelancerSkillDto,
    );
  }
}
