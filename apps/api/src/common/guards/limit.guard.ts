import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../database/prisma.service";

/**
 * Guard to enforce subscription usage limits.
 */
@Injectable()
export class LimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitType = this.reflector.get<string>("limitType", context.getHandler());
    if (!limitType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.body.workspaceId || request.query.workspaceId;

    if (!user || !user.userId) return false;

    // Get organization for this user/workspace
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.userId,
        workspaceId,
      },
      include: {
        workspace: {
          include: {
            organization: {
              include: {
                subscription: {
                  include: { plan: true },
                },
              },
            },
          },
        },
      },
    });

    if (!membership?.workspace?.organization) {
      throw new ForbiddenException("Organization context not found");
    }

    const org = membership.workspace.organization;
    const sub = org.subscription;
    const plan = sub?.plan;

    if (!plan) {
      throw new ForbiddenException("No active subscription plan found");
    }

    // Check limits
    if (limitType === "jobs") {
      if (org.currentMonthJobsCount >= plan.maxJobsPerMonth) {
        throw new ForbiddenException(`Job creation limit reached for your ${plan.name} plan`);
      }
    } else if (limitType === "resumes") {
      // For resumes, we might check total count
      const resumeCount = await this.prisma.resumeAsset.count({
        where: {
          candidateProfile: {
            workspaceId,
          },
        },
      });
      if (resumeCount >= plan.maxResumesCount) {
        throw new ForbiddenException(`Resume storage limit reached for your ${plan.name} plan`);
      }
    }

    return true;
  }
}
