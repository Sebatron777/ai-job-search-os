import { Module } from "@nestjs/common";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";
import { JobsModule } from "../jobs/jobs.module";
import { ProfilesModule } from "../profiles/profiles.module";

@Module({
  imports: [JobsModule, ProfilesModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
