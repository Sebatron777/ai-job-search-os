import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASS");

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get("SMTP_HOST", "smtp.ethereal.email"),
        port: Number(this.configService.get("SMTP_PORT", 587)),
        auth: { user, pass },
      });
      this.isConfigured = true;
    } else {
      console.warn("⚠️ SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Emails will be logged to console.");
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 [Mock Email Service] To: ${to} | Subject: ${subject}`);
      console.log(`Content:\n${html}`);
      return { messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"AI Job Search OS" <${this.configService.get("EMAIL_FROM", "noreply@aijobsearch.os")}>`,
        to,
        subject,
        html,
      });

      console.log("Email sent: %s", info.messageId);
      if (this.configService.get("SMTP_HOST") === "smtp.ethereal.email") {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error("Failed to send email via SMTP, logging fallback to console:", error);
      console.log(`📧 [Fallback Email] To: ${to} | Subject: ${subject}\nContent:\n${html}`);
      return { messageId: `fallback-${Date.now()}` };
    }
  }
}
