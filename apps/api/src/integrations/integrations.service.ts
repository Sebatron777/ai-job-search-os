import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class IntegrationsService {
  private oauth2Client;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get("GMAIL_CLIENT_ID"),
      this.configService.get("GMAIL_CLIENT_SECRET"),
      this.configService.get("GMAIL_REDIRECT_URI")
    );
  }

  async getConnectedAccounts(userId: string) {
    return this.prisma.connectedAccount.findMany({
      where: { userId },
    });
  }

  async getMailboxConnections(workspaceId: string) {
    return this.prisma.mailbox.findMany({
      where: { workspaceId },
    });
  }

  /**
   * Сгенерировать URL для авторизации в Gmail
   */
  async getGmailConnectUrl(userId: string): Promise<string> {
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: userId, // Передаем userId в state, чтобы знать, к кому привязать
    });
  }

  /**
   * Обработать callback от Google
   */
  async handleGmailCallback(code: string, state: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      const userId = state;

      // Получаем информацию о пользователе из Google (опционально)
      this.oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
      const profile = await gmail.users.getProfile({ userId: "me" });
      const emailAddress = profile.data.emailAddress;

      if (!emailAddress) {
        throw new Error("Could not retrieve email address from Gmail profile");
      }

      // Сохраняем или обновляем аккаунт в БД
      await this.prisma.connectedAccount.upsert({
        where: {
          userId_provider_providerAccountId: {
            userId,
            provider: "gmail",
            providerAccountId: emailAddress,
          },
        },
        update: {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token!,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          status: "active",
        },
        create: {
          userId,
          provider: "gmail",
          providerAccountId: emailAddress,
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token!,
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          scopes: tokens.scope ? tokens.scope.split(" ") : [],
          status: "active",
        },
      });

      return { success: true, email: emailAddress };
    } catch (error) {
      console.error("Gmail OAuth callback error:", error);
      throw new BadRequestException("Failed to authenticate with Gmail");
    }
  }
}
