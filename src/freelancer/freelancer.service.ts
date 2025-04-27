import { Injectable } from '@nestjs/common';
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

  /**
   * Fetches all freelancers from the database.
   *
   * @returns List of all freelancers.
   */
  async findAll() {
    return await this.freelancerModel.find();
  }

  /**
   * Retrieves a freelancer by their unique ID.
   *
   * @param freelancerId - ID of the freelancer.
   * @returns Freelancer data with associated user details.
   * @throws return message if freelancer not found.
   */
  async getFreelancerById(freelancerId: string): Promise<any> {
    const freelancer = await this.freelancerModel.findById(freelancerId).exec();

    if (!freelancer) {
      return {
        message: 'Freelancer not found.',
        error: true,
      };
    }

    const totalRating = freelancer.finishJob.reduce(
      (sum, job) => sum + (job.feedback?.rate || 0),
      0,
    );
    const ratingCount = freelancer.finishJob.length;
    freelancer.rating = ratingCount > 0 ? totalRating / ratingCount : 0;

    await freelancer.save();

    return freelancer.populate('user');
  }

  /**
   * Fetches freelancers by a given skill ID.
   *
   * @param skillId - ID of the skill.
   * @returns List of freelancers who have the skill.
   * @throws return message if skill not found.
   */
  async getFreelancersBySkills(skillId: string): Promise<any> {
    const skills = await this.skillsModel.findById(skillId);
    if (!skills) {
      return {
        message: 'Skill not found.',
        error: true,
      };
    }
    return await this.freelancerModel.find({ skills }).populate('user');
  }

  /**
   * Fetches freelancers whose salary is greater than or equal to the minimum salary.
   *
   * @param minSalary - The minimum salary filter.
   * @returns List of freelancers meeting the salary criteria.
   * @throws return message if salary is invalid.
   */
  async getFreelancersByMinSalary(minSalary: number): Promise<any> {
    if (!minSalary || minSalary < 0) {
      return {
        message: 'Invalid minimum salary.',
        error: true,
      };
    }
    const fr = await this.freelancerModel.find();
    const filtered = fr.filter((elm) => elm.salary >= minSalary);
    return filtered;
  }

  /**
   * Fetches freelancers whose salary is less than or equal to the maximum salary.
   *
   * @param maxSalary - The maximum salary filter.
   * @returns List of freelancers meeting the salary criteria.
   * @throws return message if salary is invalid.
   */
  async getFreelancersByMaxSalary(maxSalary: number): Promise<any> {
    if (!maxSalary || maxSalary < 0) {
      return {
        message: 'Invalid maximum salary.',
        error: true,
      };
    }
    const fr = await this.freelancerModel.find();
    const filtered = fr.filter((elm) => elm.salary <= maxSalary);
    return filtered;
  }

  /**
   * Updates the salary of a freelancer.
   *
   * @param id - Freelancer ID to update.
   * @param updateFreelancerSalaryDto - New salary details.
   * @returns Updated freelancer data.
   * @throws return message if freelancer not found.
   */
  async updateSalary(
    id: string,
    updateFreelancerSalaryDto: UpdateFreelancerSalaryDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);

    if (!updatedUser) {
      return {
        message: 'Freelancer not found.',
        error: true,
      };
    }

    return await this.freelancerModel.findByIdAndUpdate(
      id,
      updateFreelancerSalaryDto,
    );
  }

  /**
   * Adds a new skill to a freelancer.
   *
   * @param id - Freelancer ID to update.
   * @param updateFreelancerSkillDto - Skill ID to add.
   * @returns Updated freelancer data with the new skill.
   * @throws return message if freelancer or skill not found.
   */
  async updateSkill(
    id: string,
    updateFreelancerSkillDto: UpdateFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);
    if (!updatedUser) {
      return {
        message: 'Freelancer not found.',
        error: true,
      };
    }
    const { skillId } = updateFreelancerSkillDto;
    const skill = await this.skillsModel.findById(skillId);

    if (!skill) {
      return {
        message: 'Skill not found.',
        error: true,
      };
    }

    await this.freelancerModel.findByIdAndUpdate(id, {
      $push: { skills: skill },
    });
    await this.skillsModel.findByIdAndUpdate(skillId, {
      $push: { freelancer: updatedUser },
    });

    return await this.freelancerModel
      .findById(id)
      .populate('skills')
      .populate('user');
  }

  /**
   * Removes a skill from a freelancer.
   *
   * @param id - Freelancer ID to update.
   * @param deleteFreelancerSkillDto - Skill ID to remove.
   * @returns Updated freelancer data after removing the skill.
   * @throws return message if freelancer or skill not found.
   */
  async deleteSkill(
    id: string,
    deleteFreelancerSkillDto: DeleteFreelancerSkillDto,
  ) {
    const updatedUser = await this.freelancerModel.findById(id);

    if (!updatedUser) {
      return {
        message: 'Freelancer not found.',
        error: true,
      };
    }

    const { skillId } = deleteFreelancerSkillDto;

    const sk = await this.skillsModel.findById(skillId);
    console.log(skillId, sk, updatedUser);
    if (!sk) {
      return {
        message: 'Skill not found.',
        error: true,
      };
    }
    await this.freelancerModel.findByIdAndUpdate(id, {
      $pull: { skills: skillId },
    });
    await this.skillsModel.findByIdAndUpdate(skillId, {
      $pull: { freelancer: id },
    });

    return await this.freelancerModel
      .findById(id)
      .populate('skills')
      .populate('user');
  }
}
