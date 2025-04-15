import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JobModule } from './job/job.module';
import { CustomerModule } from './customer/customer.module';
import { SkillsModule } from './skills/skills.module';
import { FreelancerModule } from './freelancer/freelancer.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/up-work'),
    AuthModule,
    UserModule,
    CustomerModule,
    FreelancerModule,
    SkillsModule,
    JobModule,
    MailModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'edohovakimyan555@gmail.com',
          pass: 'tlld qpdh ezey eoew',
        },
      },
      defaults: {
        from: 'edohovakimyan555@gmail.com',
      },
    }),
  ],
})

export class AppModule { }
