import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeatureGuard } from "../feature.guard";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

describe("FeatureGuard", () => {
  let guard: FeatureGuard;
  let reflector: Reflector;
  let featuresService: any;

  beforeEach(() => {
    reflector = new Reflector();
    featuresService = {
      isEnabled: vi.fn(),
    };
    guard = new FeatureGuard(reflector, featuresService);
  });

  const createMockContext = (organizationId: string | null): ExecutionContext => {
    const mockRequest = {
      headers: {
        "x-organization-id": organizationId,
      },
      organization: organizationId ? { id: organizationId } : undefined,
      params: {},
      body: {},
    };
    
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
    } as any;
  };

  it("should allow access if no features are required", async () => {
    vi.spyOn(reflector, "get").mockReturnValue(undefined);
    const context = createMockContext("org-1");
    
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should allow access if required feature is enabled", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("premium-ai");
    featuresService.isEnabled.mockResolvedValue(true);

    const context = createMockContext("org-1");
    
    expect(await guard.canActivate(context)).toBe(true);
    expect(featuresService.isEnabled).toHaveBeenCalledWith("org-1", "premium-ai");
  });

  it("should throw ForbiddenException if required feature is disabled", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("premium-ai");
    featuresService.isEnabled.mockResolvedValue(false);

    const context = createMockContext("org-1");
    
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow(/is not enabled/);
  });

  it("should return false if organization ID is missing", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("premium-ai");
    
    const mockRequest = { headers: {}, params: {}, body: {} };
    const context = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
      getHandler: () => ({}),
    } as any;

    expect(await guard.canActivate(context)).toBe(false);
  });
});
