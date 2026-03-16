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

  async create(workspaceId: string, data: any) {
    // Get organizationId via workspace
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    if (!workspace?.organizationId) {
      throw new Error("Workspace not linked to an organization");
    }

    // Create job and increment count atomatically
    const [job] = await this.prisma.$transaction([
      this.prisma.job.create({
        data: {
          ...data,
          workspaceId,
        },
      }),
      this.prisma.organization.update({
        where: { id: workspace.organizationId },
        data: { currentMonthJobsCount: { increment: 1 } },
      }),
    ]);

    return job;
  }
}
