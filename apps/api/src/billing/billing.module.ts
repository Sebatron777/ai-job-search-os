import { Module } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { StripeService } from "./stripe.service";
import { BillingController } from "./billing.controller";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [BillingService, StripeService],
  exports: [BillingService, StripeService],
})
export class BillingModule {}
