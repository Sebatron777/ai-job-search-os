import { Module } from "@nestjs/common";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";
import { DraftGenerationService } from "./draft-generation.service";

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, DraftGenerationService],
  exports: [ApplicationsService, DraftGenerationService],
})
export class ApplicationsModule {}

