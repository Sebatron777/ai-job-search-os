import { Module, Global } from "@nestjs/common";
import { FeaturesService } from "./features.service";
import { DatabaseModule } from "../database/database.module";

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [FeaturesService],
  exports: [FeaturesService],
})
export class FeaturesModule {}
