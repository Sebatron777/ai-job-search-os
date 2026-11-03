import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { EmailService } from "../mail/email.service";
import * as crypto from "crypto";

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  /**
   * Сгенерировать токен верификации и отправить email
   */
  async sendVerificationEmail(userId: string, email: string) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 часа

    // Удаляем старые токены этого типа
    await this.prisma.verificationToken.deleteMany({
      where: { userId, type: "EMAIL_VERIFICATION" },
    });

    // Сохраняруем новый
    await this.prisma.verificationToken.create({
      data: {
        userId,
        token,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // Отправляем email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const html = `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email address for AI Job Search OS:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.emailService.sendEmail(email, "Verify your email - AI Job Search OS", html);
  }

  /**
   * Подтвердить email по токену
   */
  async verifyEmail(token: string) {
    const vt = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!vt || vt.type !== "EMAIL_VERIFICATION") {
      throw new BadRequestException("Invalid verification token");
    }

    if (vt.expiresAt < new Date()) {
      throw new BadRequestException("Verification token has expired");
    }

    // Обновляем статус пользователя
    await this.prisma.user.update({
      where: { id: vt.userId },
      data: { emailVerified: true },
    });

    // Удаляем использованный токен
    await this.prisma.verificationToken.delete({
      where: { id: vt.id },
    });

    return { success: true, email: vt.user.email };
  }
}
