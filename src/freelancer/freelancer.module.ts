import { Module } from '@nestjs/common';
import { FreelancerService } from './freelancer.service';
import { FreelancerController } from './freelancer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FreelancerSchema } from './entities/freelancer.entity';
import { JobSchema } from 'src/job/entities/job.entity';
import { SkillsSchema } from 'src/skills/entities/skill.entity';
import { UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Freelancer', schema: FreelancerSchema },
      { name: 'Customer', schema: JobSchema },
      { name: 'Skills', schema: SkillsSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [FreelancerController],
  providers: [FreelancerService],
  exports: [FreelancerService],
})
export class FreelancerModule {}
