import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface CreateJobSourceDto {
  name: string;
  type: string;
  config: Record<string, any>;
  workspaceId: string;
}

export interface UpdateJobSourceDto {
  name?: string;
  config?: Record<string, any>;
  status?: string;
}

@Injectable()
export class JobSourcesService {
  constructor(private prisma: PrismaService) {}

  async findByWorkspace(workspaceId: string) {
    return this.prisma.jobSource.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const source = await this.prisma.jobSource.findUnique({
      where: { id },
    });

    if (!source) {
      throw new NotFoundException("Job source not found");
    }

    return source;
  }

  async create(dto: CreateJobSourceDto) {
    return this.prisma.jobSource.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        type: dto.type,
        config: dto.config as any,
        status: "active",
      },
    });
  }

  async update(id: string, dto: UpdateJobSourceDto) {
    const source = await this.findById(id);
    
    return this.prisma.jobSource.update({
      where: { id },
      data: {
        name: dto.name,
        config: dto.config as any,
        status: dto.status,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.jobSource.delete({
      where: { id },
    });

    return { success: true };
  }

  async getCollectionStatus(sourceId: string) {
    const source = await this.findById(sourceId);

    return {
      lastCollectionAt: source.lastCollectionAt,
      lastCollectionStatus: source.lastCollectionStatus,
      lastCollectionError: null,
      totalJobsCollected: source.totalJobsCollected,
      activeJobsCount: source.activeJobsCount,
    };
  }
}
