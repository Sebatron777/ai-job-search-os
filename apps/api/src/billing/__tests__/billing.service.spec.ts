import { describe, it, expect, vi, beforeEach } from "vitest";
import { BillingService } from "../../billing/billing.service";
import { PrismaService } from "../../database/prisma.service";
import { StripeService } from "../../billing/stripe.service";
import { ConfigService } from "@nestjs/config";

describe("BillingService (Integration-like)", () => {
  let service: BillingService;
  let prisma: PrismaService;
  let stripeService: StripeService;
  let config: ConfigService;

  beforeEach(() => {
    prisma = {
      plan: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      subscription: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      organization: {
        findUnique: vi.fn(),
      },
    } as any;

    stripeService = {
      createCheckoutSession: vi.fn(),
      createPortalSession: vi.fn(),
    } as any;

    config = {
      get: vi.fn().mockImplementation((key) => {
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        return null;
      }),
    } as any;

    service = new BillingService(prisma, stripeService, config);
  });

  it("should create a checkout session", async () => {
    (prisma.plan.findUnique as any).mockResolvedValue({ id: "plan-1", name: "PRO", priceId: "price_pro" });
    (prisma.organization.findUnique as any).mockResolvedValue({ id: "org-1", stripeCustomerId: "cus_123" });
    (stripeService.createCheckoutSession as any).mockResolvedValue({ url: "https://stripe.com/checkout" });

    const result = await service.createCheckout("org-1", "PRO");

    expect(result.url).toBe("https://stripe.com/checkout");
    expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
      "cus_123",
      "price_pro",
      "http://localhost:3000/billing/success",
      "http://localhost:3000/billing/cancel"
    );
  });

  it("should create a portal session", async () => {
    (prisma.organization.findUnique as any).mockResolvedValue({ id: "org-1", stripeCustomerId: "cus_123" });
    (stripeService.createPortalSession as any).mockResolvedValue({ url: "https://stripe.com/portal" });

    const result = await service.createPortal("org-1");

    expect(result.url).toBe("https://stripe.com/portal");
    expect(stripeService.createPortalSession).toHaveBeenCalledWith(
      "cus_123",
      "http://localhost:3000/billing"
    );
  });

  it("should subscribe to default plan (FREE)", async () => {
    (prisma.plan.findUnique as any).mockResolvedValue({ id: "free-plan-id", name: "FREE" });
    (prisma.subscription.create as any).mockResolvedValue({ id: "sub-1" });

    await service.subscribeToDefaultPlan("org-1");

    expect(prisma.subscription.create).toHaveBeenCalledWith({
      data: {
        organizationId: "org-1",
        planId: "free-plan-id",
        status: "active",
      },
    });
  });
});
