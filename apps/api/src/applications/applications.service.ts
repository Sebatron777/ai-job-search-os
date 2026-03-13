import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface CreateApplicationDto {
  jobId: string;
  candidateProfileId: string;
  workspaceId: string;
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string, filters?: any) {
    return this.prisma.application.findMany({
      where: { workspaceId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        matchScore: {
          select: {
            totalScore: true,
            recommendation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        matchScore: true,
      },
    });

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    return application;
  }

  async create(dto: CreateApplicationDto) {
    const application = await this.prisma.application.create({
      data: {
        workspaceId: dto.workspaceId,
        candidateProfileId: dto.candidateProfileId,
        jobId: dto.jobId,
        status: "draft",
      },
    });

    return application;
  }

  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ) {
    const application = await this.findById(id);

    // Добавляем запись в историю
    const statusHistory = (application.statusHistory as any[]) || [];
    statusHistory.push({
      fromStatus: application.status,
      toStatus: status,
      reason,
      changedBy: "system",
      changedAt: new Date(),
    });

    return this.prisma.application.update({
      where: { id },
      data: {
        status: status as any,
        statusHistory,
        lastActivityAt: new Date(),
      },
    });
  }

  async approve(id: string, userId: string) {
    return this.updateStatus(id, "ready_to_apply", "Approved by user");
  }

  async reject(id: string, reason: string) {
    return this.updateStatus(id, "draft", `Rejected: ${reason}`);
  }
}
