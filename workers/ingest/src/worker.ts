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

    const { sourceId, sourceName, options } = job.data;

    try {
      // Создаём mock адаптер
      const adapter = new MockSourceAdapter();
      await adapter.initialize({});

      // Создаём сервисы
      const normalizationService = new NormalizationService();
      const deduplicationService = new DeduplicationService();

      // Создаём pipeline
      const pipeline = new IngestionPipeline({
        normalizationService,
        deduplicationService,
      });

      // Запускаем сбор вакансий
      const collectionResult = await adapter.collect(
        {
          id: sourceId,
          name: sourceName || "Mock Source",
          type: "mock",
          isActive: true,
          config: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        options
      );

      console.log(
        `[IngestionWorker] Collected ${collectionResult.collectedCount} jobs, ${collectionResult.errorCount} errors`
      );

      // Запускаем pipeline
      const pipelineResult = await pipeline.execute(collectionResult.collectedJobs || []);

      console.log(
        `[IngestionWorker] Pipeline completed: ${pipelineResult.processedCount} processed, ${pipelineResult.successCount} succeeded`
      );

      return {
        success: true,
        collectedCount: collectionResult.collectedCount,
        processedCount: pipelineResult.processedCount,
        successCount: pipelineResult.successCount,
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
