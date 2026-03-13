import { Module } from "@nestjs/common";
import { JobSourcesController } from "./job-sources.controller";
import { JobSourcesService } from "./job-sources.service";
import { IngestionQueueService } from "../queue/ingestion-queue.service";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [QueueModule],
  controllers: [JobSourcesController],
  providers: [JobSourcesService, IngestionQueueService],
  exports: [JobSourcesService, IngestionQueueService],
})
export class JobSourcesModule {}
