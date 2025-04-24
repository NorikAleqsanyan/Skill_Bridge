import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeleteFreelancerSkillDto,
  UpdateFreelancerSalaryDto,
  UpdateFreelancerSkillDto,
} from './dto/update-freelancer.dto';
import { Freelancer } from './entities/freelancer.entity';
import { Model } from 'mongoose';
import { Skills } from 'src/skills/entities/skill.entity';

@Injectable()
export class FreelancerService {
  constructor(
    @InjectModel('Freelancer') private freelancerModel: Model<Freelancer>,
    @InjectModel('Skills') private skillsModel: Model<Skills>,
  ) {}

  async findAll() {
    return await this.freelancerModel.find();
  }

  async getFreelancerById(freelancerId: string): Promise<Freelancer> {
    const freelancer = await this.freelancerModel.findById(freelancerId).exec();

    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    const totalRating = freelancer.finishJob.reduce(
      (sum, job) => sum + (job.feedback?.rate || 0),
      0,
    );
    const ratingCount = freelancer.finishJob.length;
    freelancer.rating = ratingCount > 0 ? totalRating / ratingCount : 0;

    await freelancer.save();

    return freelancer.populate("user");
  }

  async getFreelancersBySkills(skillId: string): Promise<Freelancer[]> {
    const skills = await this.skillsModel.findById(skillId);
    if (!skills) {
      throw new BadRequestException('Skill not found');
    }
    return await this.freelancerModel.find({ skills }).populate("user");
  }

  async getFreelancersByMinSalary(minSalary: number): Promise<Freelancer[]> {
    if (!minSalary || minSalary < 0) {
      throw new BadRequestException('Invalid minimum salary');
    }
    const fr = await this.freelancerModel.find();
    const filtered = fr.filter((elm) => elm.salary >= minSalary);
    return filtered
  }

  async getFreelancersByMaxSalary(maxSalary: number): Promise<Freelancer[]> {
    if (!maxSalary || maxSalary < 0) {
      throw new BadRequestException('Invalid maximum salary');
    }
    const fr = await this.freelancerModel.find();
    const filtered = fr.filter((elm) => elm.salary <= maxSalary);
    return filtered
  }

  async updateSalary(
    id: string,
    updateFreelancerSalaryDto: UpdateFreelancerSalaryDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);

    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }

    return await this.freelancerModel.findByIdAndUpdate(
      id, 
      updateFreelancerSalaryDto,
    );
  }

  async updateSkill(
    id: string,
    updateFreelancerSkillDto: UpdateFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);
    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }
    const { skillId } = updateFreelancerSkillDto;
    const sk = await this.skillsModel.findById(skillId);
    console.log(sk, updatedUser);

    if (!sk) {
      throw new BadRequestException('Skill not found');
    }

    await this.freelancerModel.findByIdAndUpdate(id, { $push: { skills: sk } });
    await this.skillsModel.findByIdAndUpdate(skillId, {
      $push: { freelancer: updatedUser },
    });

    return await this.freelancerModel
      .findById(id)
      .populate('skills')
      .populate('user');
  }

  async deleteSkill(
    id: string,
    deleteFreelancerSkillDto: DeleteFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);

    if (!updatedUser) {
      throw new BadRequestException('Freelancer not found');
    }

    const { skillId } = deleteFreelancerSkillDto;
    
    const sk = await this.skillsModel.findById(skillId);
    console.log(skillId, sk, updatedUser);
    if (!sk) {
      throw new BadRequestException('Skill not found');
    }
    await this.freelancerModel.findByIdAndUpdate(id, { $pull: { skills: skillId } });
    await this.skillsModel.findByIdAndUpdate(skillId, {
      $pull: { freelancer: id },
    });

    return await this.freelancerModel
      .findById(id)
      .populate('skills')
      .populate('user');
  }
}
