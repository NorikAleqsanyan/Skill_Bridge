import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sends an email to the specified recipient.
   *
   * @param email - The recipient's email address.
   * @param subject - The subject of the email.
   * @param html - The HTML content of the email body.
   * @returns A promise indicating the completion of the email sending process.
   * @throws return message: or handle errors related to sending the email.
   */
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
