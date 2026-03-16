import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private config: ConfigService
  ) {}

  async onModuleInit() {
    await this.seedPlans();
  }

  /**
   * Seed default plans if they don't exist
   */
  private async seedPlans() {
    const plans = [
      {
        name: "FREE",
        description: "Perfect for individuals and side projects",
        monthlyPrice: 0,
        maxWorkspaces: 1,
        maxJobsPerMonth: 10,
        maxResumesCount: 50,
        features: ["ai_parsing", "gmail_sync"],
      },
      {
        name: "PRO",
        description: "For active job seekers and freelancers",
        monthlyPrice: 2900, // $29.00
        maxWorkspaces: 3,
        maxJobsPerMonth: 100,
        maxResumesCount: 200,
        features: ["ai_parsing", "gmail_sync", "advanced_analytics", "feature_flags"],
      },
      {
        name: "ENTERPRISE",
        description: "For recruiting teams and organizations",
        monthlyPrice: 9900, // $99.00
        maxWorkspaces: 10,
        maxJobsPerMonth: 1000,
        maxResumesCount: 1000,
        features: ["ai_parsing", "gmail_sync", "advanced_analytics", "feature_flags", "audit_logs", "multi_tenant"],
      },
    ];

    for (const plan of plans) {
      await this.prisma.plan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan,
      });
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany();
  }

  async getOrganizationSubscription(organizationId: string) {
    return this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
  }

  async createCheckout(organizationId: string, planName: string) {
    const plan = await this.prisma.plan.findUnique({ where: { name: planName } });
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });

    if (!plan || !org) throw new Error("Plan or Organization not found");

    // In a real app, we'd check if org has a stripeCustomerId, or create one here
    // For now, we'll mock the customerId or use a dummy one if not present
    const customerId = (org as any).stripeCustomerId || "cus_dummy_123";

    return this.stripeService.createCheckoutSession(
      customerId,
      plan.priceId || "price_dummy_123",
      `${this.config.get("FRONTEND_URL")}/billing/success`,
      `${this.config.get("FRONTEND_URL")}/billing/cancel`
    );
  }

  async createPortal(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new Error("Organization not found");

    const customerId = (org as any).stripeCustomerId || "cus_dummy_123";

    return this.stripeService.createPortalSession(
      customerId,
      `${this.config.get("FRONTEND_URL")}/billing`
    );
  }

  async subscribeToDefaultPlan(organizationId: string) {
    const freePlan = await this.prisma.plan.findUnique({
      where: { name: "FREE" },
    });

    if (!freePlan) return;

    return this.prisma.subscription.create({
      data: {
        organizationId,
        planId: freePlan.id,
        status: "active",
      },
    });
  }
}
