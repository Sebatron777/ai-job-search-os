import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

/**
 * Guard to ensure user has access to a specific organization.
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.orgId || request.body.organizationId || request.query.organizationId;

    if (!user || !user.userId) {
      return false;
    }

    if (!orgId) {
      return true; // If no orgId specified, we assume it's a non-org specific route (but should be carefully used)
    }

    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not belong to this organization");
    }

    // Add organization info to request for downstream use
    request.organization = {
      id: orgId,
      role: membership.role,
    };

    return true;
  }
}
