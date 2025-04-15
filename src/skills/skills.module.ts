import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsSchema } from './entities/skill.entity';
import { JobSchema } from 'src/job/entities/job.entity';
import { FreelancerSchema } from 'src/freelancer/entities/freelancer.entity';

@Module({
  imports:[MongooseModule.forFeature([
    {name:"Skills", schema:SkillsSchema},
    {name:"Job", schema:JobSchema},
    {name:"Freelancer", schema:FreelancerSchema}
  ])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
