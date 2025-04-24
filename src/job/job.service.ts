import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import {
  AddSkillDto,
  JobFeedbackDto,
  UpdateJobDto,
} from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './entities/job.entity';
import { Model } from 'mongoose';
import { Customer } from 'src/customer/entities/customer.entity';
import { Freelancer } from 'src/freelancer/entities/freelancer.entity';
import { Skills } from 'src/skills/entities/skill.entity';
import { StatusJob } from './status/status.enum';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class JobService {
  constructor(
    @InjectModel('Job') private jobModel: Model<Job>,
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Freelancer') private freelancerModel: Model<Freelancer>,
    @InjectModel('Skills') private skillModel: Model<Skills>,
    private mailService: MailService,
  ) {}

  async create(createJobDto: CreateJobDto, customerId: string) {
    const { title, description, deadline, skills } = createJobDto;

    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const foundSkills = await this.skillModel.find({
      _id: { $in: skills },
    });

    if (foundSkills.length !== skills.length) {
      throw new NotFoundException('Some skills not found');
    }
    if (deadline && new Date(deadline) <= new Date()) {
      throw new BadRequestException('The deadline must be in the future.');
    }
    const job = await this.jobModel.create({
      title,
      description,
      deadline,
      skills,
      customer,
    });

    await this.customerModel.findByIdAndUpdate(customer, {
      $push: { jobs: job },
    });
    for (const elm of skills) {
      await this.skillModel.findByIdAndUpdate(elm, {
        $push: { jobs: job._id },
      });
    }
    return job;
  }

  async findAll() {
    return await this.jobModel
      .find()
      .populate('skills')
      .populate('customer.user');
  }

  async findOne(jobId: string) {
    return await this.jobModel
      .findById(jobId)
      .populate('skills')
      .populate('customer.user');
  }

  async getJobsByStatus(status: StatusJob): Promise<any> {
    if (status >= 0 && status <= 2) {
      return this.jobModel.find({ status: status }).exec();
    } else {
      return {
        message: `Status ${status} not found.`,
      };
    }
  }

  async getJobsByUser(userId: string): Promise<any> {
    const freelancer = await this.freelancerModel.findById(userId);
    const customer = await this.customerModel.findById(userId);
    if (customer) {
      return await this.jobModel.find({ customer }).populate('skills');
    } else if (freelancer) {
      return await this.jobModel.find({ freelancer }).populate('skills');
    } else {
      return {
        message: 'User not found',
      };
    }
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<any> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }
    const { deadline } = updateJobDto;
    if (deadline && new Date(deadline) <= new Date()) {
      throw new BadRequestException('The deadline must be in the future.');
    }

    return await this.jobModel.findByIdAndUpdate(id, updateJobDto);
  }

  async addSkillsInJob(jobId: string, addSkillDto: AddSkillDto): Promise<any> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }
    const { skills } = addSkillDto;
    if (skills) {
      const skill = await this.skillModel.find({ _id: { $in: skills } });

      if (skill.length !== skills.length) {
        throw new NotFoundException('Some skills not found');
      }
    }

    skills.forEach(async (elm) => {
      await this.skillModel.findByIdAndUpdate(elm, {
        $push: { jobs: job._id },
      });
    });
    await this.jobModel.findByIdAndUpdate(job, {
      $push: { skills: skills },
    });
    return await this.jobModel.findById(jobId);
  }

  async deleteSkillsInJob(jobId: string, skillId: string) {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job not found`);
    }
    const skill = await this.skillModel.findById(skillId);
    if (!skill) {
      throw new NotFoundException(`Skill not found`);
    }
    await this.skillModel.findByIdAndUpdate(skill, {
      $pull: { jobs: job._id },
    });
    await this.jobModel.findByIdAndUpdate(job, {
      $pull: { skills: skill._id },
    });
    return await this.jobModel.findById(jobId).exec();
  }

  async assignFreelancerToJob(
    jobId: string,
    freelancerId: string,
  ): Promise<Job> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const freelancer = await this.freelancerModel.findById(freelancerId).exec();
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    await this.jobModel.findByIdAndUpdate(job, { requestFreelancer: [] });
    await this.jobModel.findByIdAndUpdate(job, { freelancer: freelancer });
    await this.freelancerModel.findByIdAndUpdate(freelancer, {
      $push: { jobs: job },
    });
    job.requestFreelancer.forEach(async (elm) => {
      await this.freelancerModel.findByIdAndUpdate(elm, {
        $pull: { requestJob: job },
      });
    });
    await this.mailService.sendEmail(
      'aleqsanyan.004@gmail.com',
      'assignFreelancerToJob',
      'good',
    );
    return job;
  }

  async updateStatus(jobId: string, status: StatusJob): Promise<any> {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (status >= 0 && status <= 2) {
      return await this.jobModel.findByIdAndUpdate(job, { status: status });
    } else {
      throw new BadRequestException(
        'Invalid status value. Status must be between 0 and 2.',
      );
    }
  }

  /**
   *
   *  
   * 
   * @param id:string
   * @param feedbackDto:JobFeedbackDto
   * @param customerId:string
   * @returns Job|null
   */
  async addFeedbackToJob(
    id: string,
    feedbackDto: JobFeedbackDto,
    customerId: string,
  ): Promise<Job | null> {
    const job = await this.jobModel.findById(id).populate('customer').exec();

    if (!job) {

      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {

      throw new NotFoundException('Customer not found');
    }
    console.log(customerId, job.customer._id.toString());

    if (job.customer._id.toString() !== customerId) {

      throw new NotFoundException(`This work does not belong to you`);
    }
    if (job.status === StatusJob.END) {
      await this.jobModel.findByIdAndUpdate(job, {
        feedback: {
          rate: feedbackDto.rate,
          text: feedbackDto.text,
        },
      });
    } else {

      throw new NotFoundException('Job is not completed yet');
    }

    return await this.jobModel.findById(id);
  }

  async deleteFreelancerRequest(
    jobId: string,
    freelancerId: string,
  ): Promise<Job> {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const freelancer = await this.freelancerModel.findById(freelancerId);
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    const requestIndex = job.requestFreelancer.findIndex(
      (Request) => Request.toString() === freelancerId,
    );

    if (requestIndex === -1) {
      throw new NotFoundException('Freelancer Request not found');
    }

    await this.jobModel.findByIdAndUpdate(job, {
      $pull: { requestFreelancer: freelancer._id },
    });
    await this.freelancerModel.findByIdAndUpdate(freelancer, {
      $pull: { requestJob: job._id },
    });
    await this.mailService.sendEmail(
      'aleqsanyan.004@gmail.com',
      'Freelancer Request',
      'rejected',
    );
    return job;
  }

  async remove(id: string) {
    console.log(id);

    const job = await this.jobModel.findById(id);
    if (!job) {
      return {
        message: 'job not found',
      };
    }

    if (job.status != StatusJob.START && job.freelancer) {
      return {
        message: 'Job is not started yet, but a freelancer is assigned',
      };
    }

    const customer = job.customer.userId;
    const skills = job.skills;
    const requestFreelancer = job.requestFreelancer;

    await this.customerModel.findByIdAndUpdate(customer, {
      $pull: { jobs: job._id },
    });

    skills.forEach(async (elm) => {
      await this.skillModel.findByIdAndUpdate(elm, {
        $pull: { jobs: job._id },
      });
    });
    requestFreelancer.forEach(async (elm) => {
      await this.freelancerModel.findByIdAndUpdate(elm, {
        $pull: { jobs: job._id },
      });
    });
    await this.jobModel.findByIdAndDelete(job);
    return true;
  }

  async isBlock(jobId: string) {
    const job = await this.jobModel.findById({ where: { jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.freelancer) {
      throw new NotFoundException('This job has already Freelancer');
    } else {
      if (job.isBlock) {
        await this.customerModel.findByIdAndUpdate(job.customer, {
          $pull: { blockedJobs: job },
        });
        await this.customerModel.findByIdAndUpdate(job.customer, {
          $push: { jobs: job },
        });

        await this.jobModel.findByIdAndUpdate(job, { isBlock: false });
      } else {
        await this.customerModel.findByIdAndUpdate(job.customer, {
          $push: { blockedJobs: job },
        });
        await this.customerModel.findByIdAndUpdate(job.customer, {
          $pull: { jobs: job },
        });

        await this.jobModel.findByIdAndUpdate(job, { isBlock: true });
      }
    }
    await this.mailService.sendEmail(
      'aleqsanyan.004@gmail.com',
      'blocked',
      'Job is blocked',
    );
    return {
      message: 'Job is blocked',
    };
  }
}
