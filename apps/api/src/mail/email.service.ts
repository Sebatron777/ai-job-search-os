import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // For production, use real SMTP settings
    // For development, we can use Ethereal or a mock
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("SMTP_HOST", "smtp.ethereal.email"),
      port: this.configService.get("SMTP_PORT", 587),
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASS"),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: `"AI Job Search OS" <${this.configService.get("EMAIL_FROM", "noreply@aijobsearch.os")}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    // If using Ethereal, log the preview URL
    if (this.configService.get("SMTP_HOST") === "smtp.ethereal.email") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}
