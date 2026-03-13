import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string, filters?: any) {
    return this.prisma.job.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { postedAt: "desc" },
    });
  }

  async findById(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  // TODO: Implement job filtering, scoring integration
}
