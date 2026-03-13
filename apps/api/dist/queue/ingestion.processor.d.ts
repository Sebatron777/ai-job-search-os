import { Job } from "bullmq";
import { IngestionJobData } from "./ingestion-queue.service";
export declare class IngestionProcessor {
    private readonly logger;
    processIngestion(job: Job<IngestionJobData>): Promise<{
        success: boolean;
        sourceId: string;
        collectedCount: number;
        normalizedCount: number;
        duplicateCount: number;
        newJobsCount: number;
    }>;
}
