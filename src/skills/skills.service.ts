import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skills } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(@InjectModel("Skills")private skillModel:Model<Skills>){}
  
  async create(createSkillDto: CreateSkillDto) {
    const { name } =
    createSkillDto;
    const skill = await this.skillModel.findOne({ name });
    if (skill) {
      throw new BadRequestException('Skill name alredy' );
    }
    const skills = await this.skillModel.create({
      name
    });
    return skills;
  }

  async findAll() {
    return await this.skillModel.find();
  }

  async findOne(id: string) {
    return await this.skillModel.findById(id);
  }


  async remove(id: string) {
    const us = await this.skillModel.findById(id);
    if (!us) {
      return false;
    }
    await this.skillModel.findByIdAndDelete(us);
    return true;
  }
}
