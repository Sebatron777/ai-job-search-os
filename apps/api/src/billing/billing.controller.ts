import { Controller, Get, Post, Body, UseGuards, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@ApiTags("billing")
@Controller("billing")
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get("plans")
  @ApiOperation({ summary: "Get all available subscription plans" })
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Get("subscription/:orgId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get organization subscription" })
  async getSubscription(@Param("orgId") orgId: string) {
    return this.billingService.getOrganizationSubscription(orgId);
  }

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a Stripe Checkout session" })
  async createCheckout(@Body("organizationId") organizationId: string, @Body("planName") planName: string) {
    const session = await this.billingService.createCheckout(organizationId, planName);
    return { url: session.url };
  }

  @Post("portal")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a Stripe Billing Portal session" })
  async createPortal(@Body("organizationId") organizationId: string) {
    const session = await this.billingService.createPortal(organizationId);
    return { url: session.url };
  }
}
