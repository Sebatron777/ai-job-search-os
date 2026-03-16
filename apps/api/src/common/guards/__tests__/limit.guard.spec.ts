import { describe, it, expect, vi, beforeEach } from "vitest";
import { LimitGuard } from "../limit.guard";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

describe("LimitGuard", () => {
  let guard: LimitGuard;
  let reflector: Reflector;
  let prisma: any;

  beforeEach(() => {
    reflector = new Reflector();
    prisma = {
      membership: {
        findFirst: vi.fn(),
      },
      resumeAsset: {
        count: vi.fn(),
      },
    };
    guard = new LimitGuard(reflector, prisma);
  });

  const createMockContext = (userId: string, workspaceId: string, limitType?: string): ExecutionContext => {
    const mockRequest = {
      user: { userId },
      params: { workspaceId },
    };
    
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
    } as any;
  };

  it("should allow access if no limit type is specified", async () => {
    vi.spyOn(reflector, "get").mockReturnValue(undefined);
    const context = createMockContext("user-1", "ws-1");
    
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException if job limit is reached", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("jobs");
    
    prisma.membership.findFirst.mockResolvedValue({
      workspace: {
        organization: {
          currentMonthJobsCount: 10,
          subscription: {
            plan: {
              name: "FREE",
              maxJobsPerMonth: 10,
            },
          },
        },
      },
    });

    const context = createMockContext("user-1", "ws-1");
    
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow(/Job creation limit reached/);
  });

  it("should allow access if job limit is not reached", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("jobs");
    
    prisma.membership.findFirst.mockResolvedValue({
      workspace: {
        organization: {
          currentMonthJobsCount: 5,
          subscription: {
            plan: {
              name: "FREE",
              maxJobsPerMonth: 10,
            },
          },
        },
      },
    });

    const context = createMockContext("user-1", "ws-1");
    
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException if resume limit is reached", async () => {
    vi.spyOn(reflector, "get").mockReturnValue("resumes");
    
    prisma.membership.findFirst.mockResolvedValue({
      workspace: {
        organization: {
          subscription: {
            plan: {
              name: "FREE",
              maxResumesCount: 5,
            },
          },
        },
      },
    });

    prisma.resumeAsset.count.mockResolvedValue(5);

    const context = createMockContext("user-1", "ws-1");
    
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow(/Resume storage limit reached/);
  });
});
