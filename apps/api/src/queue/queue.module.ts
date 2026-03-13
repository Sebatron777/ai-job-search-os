import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { IngestionQueueService } from "./ingestion-queue.service";
import { IngestionProcessor } from "./ingestion.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }),
  ],
  providers: [IngestionQueueService, IngestionProcessor],
  exports: [IngestionQueueService, BullModule],
})
export class QueueModule {}
