import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // Заглушка - будет реализовано позже
  async getConnectedAccounts(userId: string) {
    return [];
  }

  async getMailboxConnections(workspaceId: string) {
    return [];
  }
}
