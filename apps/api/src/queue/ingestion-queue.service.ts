import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bullmq";
import { PrismaService } from "../database/prisma.service";

export interface IngestionJobData {
  sourceId: string;
  workspaceId: string;
  options?: {
    limit?: number;
    dryRun?: boolean;
  };
}

@Injectable()
export class IngestionQueueService {
  constructor(
    @InjectQueue("ingestion") private ingestionQueue: Queue,
    private prisma: PrismaService
  ) {}

  async addIngestionJob(
    sourceId: string,
    workspaceId: string,
    options?: { limit?: number; dryRun?: boolean }
  ): Promise<string> {
    const job = await this.ingestionQueue.add("ingest-source", {
      sourceId,
      workspaceId,
      options,
    } as IngestionJobData, {
      priority: 5,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });

    await this.prisma.scheduledTask.create({
      data: {
        name: `Ingest source: ${sourceId}`,
        type: "INGESTION",
        status: "pending",
        scheduledAt: new Date(),
        payload: { sourceId, workspaceId, options } as any,
      },
    });

    return job.id || "";
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = await this.ingestionQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async getJobStatus(jobId: string) {
    const job = await this.ingestionQueue.getJob(jobId);
    if (!job) return null;

    return {
      status: await job.getState(),
      failedReason: job.failedReason,
      data: job.data,
    };
  }
}
