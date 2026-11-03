/**
 * Ingestion Worker
 * 
 * Обрабатывает очередь на импорт вакансий
 */

import { Queue, Worker, Job } from "bullmq";
import { 
  NormalizationService,
  DeduplicationService,
  IngestionPipeline,
  MockSourceAdapter,
} from "@ai-job-search/workers";
import type { JobSource } from "@ai-job-search/types";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

// Очередь ingestion
const ingestionQueue = new Queue("ingestion", { connection });

// Worker для обработки задач
const worker = new Worker(
  "ingestion",
  async (job: Job) => {
    console.log(`[IngestionWorker] Processing job ${job.id} with data:`, job.data);

    const { sourceId, sourceName } = job.data;

    try {
      // Создаём mock адаптер
      const adapter = new MockSourceAdapter();
      await adapter.initialize({});

      // Создаём сервисы
      const normalizationService = new NormalizationService();
      const mockRepo: any = {
        findByUrlHash: async () => null,
        findByTitleCompanyLocation: async () => null,
        create: async (data: any) => ({ ...data, id: "fp-1", createdAt: new Date(), updatedAt: new Date() }),
        addJobToFingerprint: async (id: string, jId: string) => ({ id, jobIds: [jId], createdAt: new Date(), updatedAt: new Date() } as any),
      };
      const deduplicationService = new DeduplicationService(mockRepo);

      const mockHandler: any = {
        saveJob: async () => "job-1",
        updateRawJobStatus: async () => {},
        updateSourceStats: async () => {},
      };

      // Создаём pipeline
      const pipeline = new IngestionPipeline({
        adapter,
        normalizationService,
        deduplicationService,
        handler: mockHandler,
      });

      const source: JobSource = {
        id: sourceId || "mock-source-1",
        workspaceId: "ws-1",
        name: sourceName || "Mock Source",
        type: "api_integration",
        status: "active",
        config: { enabled: true },
        totalJobsCollected: 0,
        activeJobsCount: 0,
        lastCollectionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pipelineResult = await pipeline.run(source);

      console.log(
        `[IngestionWorker] Pipeline completed: ${pipelineResult.normalizedCount} normalized, ${pipelineResult.duplicateCount} duplicates`
      );

      return {
        success: true,
        normalizedCount: pipelineResult.normalizedCount,
        duplicateCount: pipelineResult.duplicateCount,
        newJobsCount: pipelineResult.newJobsCount,
      };
    } catch (error) {
      console.error(`[IngestionWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 3, // Параллельная обработка 3 задач
  }
);

worker.on("completed", (job, result) => {
  console.log(`[IngestionWorker] Job ${job?.id} completed with result:`, result);
});

worker.on("failed", (job, error) => {
  console.error(`[IngestionWorker] Job ${job?.id} failed:`, error);
});

worker.on("error", (error) => {
  console.error("[IngestionWorker] Worker error:", error);
});

console.log("[IngestionWorker] Started, waiting for jobs...");

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[IngestionWorker] Shutting down...");
  await worker.close();
  await ingestionQueue.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[IngestionWorker] Shutting down...");
  await worker.close();
  await ingestionQueue.close();
  process.exit(0);
});
