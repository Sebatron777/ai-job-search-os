import { Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { IngestionJobData } from "./ingestion-queue.service";

@Processor("ingestion")
export class IngestionProcessor {
  private readonly logger = new Logger(IngestionProcessor.name);

  @Process("ingest-source")
  async processIngestion(job: Job<IngestionJobData>) {
    this.logger.log(`Starting ingestion for source: ${job.data.sourceId}`);

    try {
      const { sourceId, workspaceId, options } = job.data;
      
      this.logger.log(`Processing source ${sourceId} in workspace ${workspaceId}`);
      
      // Симуляция работы
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.logger.log(`Completed ingestion for source: ${sourceId}`);
      
      return {
        success: true,
        sourceId,
        collectedCount: 0,
        normalizedCount: 0,
        duplicateCount: 0,
        newJobsCount: 0,
      };
    } catch (error) {
      this.logger.error(
        `Ingestion failed for source ${job.data.sourceId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
