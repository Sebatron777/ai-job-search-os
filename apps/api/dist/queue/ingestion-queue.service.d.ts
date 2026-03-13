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
export declare class IngestionQueueService {
    private ingestionQueue;
    private prisma;
    constructor(ingestionQueue: Queue, prisma: PrismaService);
    addIngestionJob(sourceId: string, workspaceId: string, options?: {
        limit?: number;
        dryRun?: boolean;
    }): Promise<string>;
    cancelJob(jobId: string): Promise<void>;
    getJobStatus(jobId: string): Promise<{
        status: import("bullmq").JobState | "unknown";
        failedReason: string;
        data: any;
    } | null>;
}
