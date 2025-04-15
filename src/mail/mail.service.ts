// src/mail/mail.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    email: string,
    subject: string,
    html: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      html
    });
  }
}
