import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FeaturesService } from "./features.service";

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featuresService: FeaturesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureName = this.reflector.get<string>("feature", context.getHandler());
    if (!featureName) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const organizationId = request.organization?.id || request.params?.orgId || request.body?.organizationId;

    if (!organizationId) {
      return false;
    }

    const enabled = await this.featuresService.isEnabled(organizationId, featureName);
    if (!enabled) {
      throw new ForbiddenException(`Feature '${featureName}' is not enabled for this organization`);
    }

    return true;
  }
}
