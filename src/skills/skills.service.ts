import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skills } from './entities/skill.entity';
import { error } from 'console';

@Injectable()
export class SkillsService {
  constructor(@InjectModel('Skills') private skillModel: Model<Skills>) {}

  /**
   * Creates a new skill in the database.
   *
   * @param createSkillDto - The details of the skill to be created.
   * @returns The created skill or an error message if the skill already exists.
   * @throws Returns a message and error flag if the skill name already exists.
   */
  async create(createSkillDto: CreateSkillDto) {
    const { name } = createSkillDto;

    const skill = await this.skillModel.findOne({ name });

    if (skill) {
      return {
        message: 'Skill name already exists.',
        error: true,
      };
    }

    const skills = await this.skillModel.create({
      name,
    });
    
    return skills;
  }

  /**
   * Retrieves all skills from the database.
   *
   * @returns An array of all skills.
   */
  async findAll() {
    return await this.skillModel.find();
  }

  /**
   * Retrieves a skill by its ID.
   *
   * @param id - The ID of the skill to be retrieved.
   * @returns The skill with the specified ID.
   */
  async findOne(id: string) {
    return await this.skillModel.findById(id);
  }

  /**
   * Removes a skill by its ID from the database.
   *
   * @param id - The ID of the skill to be removed.
   * @returns A boolean indicating if the skill was successfully removed.
   * @throws Returns false if the skill does not exist.
   */
  async remove(id: string) {
    const us = await this.skillModel.findById(id);
    if (!us) {
      return false;
    }
    await this.skillModel.findByIdAndDelete(us);
    return true;
  }
}
