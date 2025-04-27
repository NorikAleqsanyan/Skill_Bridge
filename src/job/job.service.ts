import {
  Injectable,
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

  /**
   * Creates a new job linked to a customer and skills.
   *
   * @param createJobDto - Job details.
   * @param customerId - Customer ID.
   * @returns Created job.
   * @throws return message: or return message on validation errors.
   */

  async create(createJobDto: CreateJobDto, customerId: string) {
    const { title, description, deadline, skills } = createJobDto;

    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      return {
        message: 'User not found with that email',
        error: true,
      };
    }
    const foundSkills = await this.skillModel.find({
      _id: { $in: skills },
    });

    if (foundSkills.length !== skills.length) {
      return {
        message: 'Some skills not found',
        error: true,
      };
    }

    if (deadline && new Date(deadline) <= new Date()) {
      return {
        message: 'The deadline must be in the future.',
        error: true,
      };
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

  /**
   * Retrieves all jobs with related skills and customer user data populated.
   *
   * @returns List of jobs.
   */

  async findAll() {
    return await this.jobModel
      .find()
      .populate('skills')
      .populate('customer.user');
  }

  /**
   * Retrieves a single job by ID with related skills and customer user data populated.
   *
   * @param jobId - Job ID.
   * @returns The found job or null.
   */

  async findOne(jobId: string) {
    return await this.jobModel
      .findById(jobId)
      .populate('skills')
      .populate('customer.user');
  }

  /**
   * Retrieves jobs by status if the status is valid.
   *
   * @param status - Job status.
   * @returns List of jobs or an error message if status is invalid.
   */
  async getJobsByStatus(status: StatusJob): Promise<any> {
    if (status >= 0 && status <= 2) {
      return this.jobModel.find({ status: status }).exec();
    } else {
      return {
        message: `Status ${status} not found.`,
      };
    }
  }

  /**
   * Retrieves jobs associated with a customer or freelancer by user ID.
   *
   * @param userId - User ID.
   * @returns List of jobs or an error message if user is not found.
   */
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

  /**
   * Updates a job by ID after validating its existence and deadline.
   *
   * @param id - Job ID.
   * @param updateJobDto - Updated job details.
   * @returns The update result.
   * @throws return message: or return message on validation errors.
   */

  async update(id: string, updateJobDto: UpdateJobDto): Promise<any> {
    const job = await this.jobModel.findById(id).exec();

    if (!job) {
      return {
        message: 'Job not found',
        error: true,
      };
    }

    const { deadline } = updateJobDto;

    if (deadline && new Date(deadline) <= new Date()) {
      return {
        message: 'The deadline must be in the future.',
        error: true,
      };
    }

    return await this.jobModel.findByIdAndUpdate(id, updateJobDto);
  }

  /**
   * Adds multiple skills to a job after validating the job and skills.
   *
   * @param jobId - Job ID.
   * @param addSkillDto - Skills to add.
   * @returns Updated job with new skills.
   * @throws return message: if the job or any skills are not found.
   */

  async addSkillsInJob(jobId: string, addSkillDto: AddSkillDto): Promise<any> {
    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      return {
        message: 'Job not found.',
        error: true,
      };
    }
    const { skills } = addSkillDto;
    if (skills) {
      const skill = await this.skillModel.find({ _id: { $in: skills } });

      if (skill.length !== skills.length) {
        return {
          message: 'Some skills not found',
          error: true,
        };
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

  /**
   * Removes a skill from a job and updates both job and skill documents.
   *
   * @param jobId - Job ID.
   * @param skillId - Skill ID.
   * @returns Updated job.
   * @throws return message: if the job or skill is not found.
   */

  async deleteSkillsInJob(jobId: string, skillId: string) {
    const job = await this.jobModel.findById(jobId).exec();

    if (!job) {
      return {
        message: 'Job not found.',
        error: true,
      };
    }

    const skill = await this.skillModel.findById(skillId);

    if (!skill) {
      return {
        message: 'Skill not found.',
        error: true,
      };
    }

    await this.skillModel.findByIdAndUpdate(skill, {
      $pull: { jobs: job._id },
    });

    await this.jobModel.findByIdAndUpdate(job, {
      $pull: { skills: skill._id },
    });

    return await this.jobModel.findById(jobId).exec();
  }

  /**
   * Assigns a freelancer to a job and updates the job and freelancer associations.
   *
   * @param jobId - Job ID.
   * @param freelancerId - Freelancer ID.
   * @returns Updated job with assigned freelancer.
   * @throws return message: if the job or freelancer is not found.
   */

  async assignFreelancerToJob(
    jobId: string,
    freelancerId: string,
  ): Promise<any> {
    const job = await this.jobModel.findById(jobId).exec();

    if (!job) {
      return {
        message: 'Job not found',
        error: true,
      };
    }

    const freelancer = await this.freelancerModel.findById(freelancerId).exec();
    if (!freelancer) {
      return {
        message: 'Freelancer not found.',
        error: true,
      };
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
      'Freelancer Assigned to Job',
      'Dear [Freelancer Name],\n\n' +
        'We are pleased to inform you that you have been successfully assigned to the job titled "[Job Title]". Please review the job details and proceed accordingly.\n\n' +
        'Best regards,\n' +
        '[Your Company Name]',
    );

    return job;
  }

  /**
   * Updates the status of a job after validating the status value.
   *
   * @param jobId - Job ID.
   * @param status - New job status.
   * @returns Updated job.
   * @throws return message: if the job is not found.
   * @throws return message if the status is invalid.
   */

  async updateStatus(jobId: string, status: StatusJob): Promise<any> {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      return {
        messasge: 'Job not found.',
        error: true,
      };
    }

    if (status >= 0 && status <= 2) {
      return await this.jobModel.findByIdAndUpdate(job, { status: status });
    } else {
      return {
        messasge: 'Invalid status value. Status must be between 0 and 2.',
        error: true,
      };
    }
  }

  /**
   * Adds feedback to a job if it is completed and belongs to the specified customer.
   *
   * @param id - Job ID.
   * @param feedbackDto - Feedback data (rate and text).
   * @param customerId - Customer ID who is providing the feedback.
   * @returns Updated job with feedback or null.
   * @throws return message: if the job or customer is not found, or if the job is not completed.
   */

  async addFeedbackToJob(
    id: string,
    feedbackDto: JobFeedbackDto,
    customerId: string,
  ): Promise<any> {
    const job = await this.jobModel.findById(id).populate('customer').exec();

    if (!job) {
      return {
        messasge: `Job with ID ${id} not found`,
        error: true,
      };
    }
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      return {
        messasge: 'Customer not found',
        error: true,
      };
    }
    console.log(customerId, job.customer._id.toString());

    if (job.customer._id.toString() !== customerId) {
      return {
        messasge: `This work does not belong to you`,
        error: true,
      };
    }
    if (job.status === StatusJob.END) {
      await this.jobModel.findByIdAndUpdate(job, {
        feedback: {
          rate: feedbackDto.rate,
          text: feedbackDto.text,
        },
      });
    } else {
      return {
        messasge: 'Job is not completed yet․',
        error: true,
      };
    }

    return await this.jobModel.findById(id);
  }

  /**
   * Deletes a freelancer's request for a job and updates both job and freelancer documents.
   *
   * @param jobId - Job ID.
   * @param freelancerId - Freelancer ID.
   * @returns Updated job.
   * @throws return message: if the job or freelancer is not found, or if the freelancer's request is not found.
   */

  async deleteFreelancerRequest(
    jobId: string,
    freelancerId: string,
  ): Promise<any> {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      return {
        messasge: 'Job not found.',
        error: true,
      };
    }

    const freelancer = await this.freelancerModel.findById(freelancerId);
    if (!freelancer) {
      return {
        messasge: 'Freelancer not found.',
        error: true,
      };
    }

    const requestIndex = job.requestFreelancer.findIndex(
      (Request) => Request.toString() === freelancerId,
    );

    if (requestIndex === -1) {
      return {
        messasge: 'Freelancer Request not found',
        error: true,
      };
    }

    await this.jobModel.findByIdAndUpdate(job, {
      $pull: { requestFreelancer: freelancer._id },
    });
    await this.freelancerModel.findByIdAndUpdate(freelancer, {
      $pull: { requestJob: job._id },
    });
    await this.mailService.sendEmail(
      'aleqsanyan.004@gmail.com',
      'Freelancer Request Rejected',
      'Dear [Freelancer Name],\n\n' +
        'We regret to inform you that your request for the job titled "[Job Title]" has been rejected by the customer.\n\n' +
        'We encourage you to explore other job opportunities on the platform.\n\n' +
        'Best regards,\n' +
        '[Your Company Name]',
    );

    return job;
  }

  /**
   * Removes a job and updates related customer, skills, and freelancer data.
   * Only allows removal if the job is not started and has no freelancer assigned.
   *
   * @param id - Job ID.
   * @returns True if the job is successfully removed, otherwise an error message.
   * @throws Error if the job has already started or has a freelancer assigned.
   */

  async remove(id: string) {
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

  /**
   * Toggles the block status of a job and updates related customer data.
   * If the job is blocked, it moves it to the blocked jobs list and vice versa.
   *
   * @param jobId - Job ID.
   * @returns A message indicating the job's block status.
   * @throws return message: if the job is not found or already has a freelancer assigned.
   */

  async isBlock(jobId: string) {
    const job = await this.jobModel.findById({ where: { jobId } });
    if (!job) {
      return {
        messasge: 'Job not found.',
        error: true,
      };
    }
    if (job.freelancer) {
      return {
        messasge: 'This job has already Freelancer',
        error: true,
      };
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
      'Job Blocked',
      'Dear [Customer Name],\n\n' +
        'This is to inform you that the job titled "[Job Title]" has been blocked. Please review the job status, and you can unblock it anytime.\n\n' +
        'If you have any questions, feel free to reach out to us.\n\n' +
        'Best regards,\n' +
        '[Your Company Name]',
    );

    return {
      message: 'Job is blocked',
    };
  }
}
