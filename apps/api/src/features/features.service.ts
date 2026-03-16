import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class FeaturesService {
  constructor(private prisma: PrismaService) {}

  async isEnabled(organizationId: string, featureName: string): Promise<boolean> {
    const feature = await this.prisma.organizationFeature.findUnique({
      where: {
        organizationId_featureName: {
          organizationId,
          featureName,
        },
      },
    });

    return feature?.isEnabled ?? false;
  }

  async setFeatureStatus(organizationId: string, featureName: string, isEnabled: boolean) {
    return this.prisma.organizationFeature.upsert({
      where: {
        organizationId_featureName: {
          organizationId,
          featureName,
        },
      },
      update: { isEnabled },
      create: {
        organizationId,
        featureName,
        isEnabled,
      },
    });
  }

  async getOrganizationFeatures(organizationId: string) {
    return this.prisma.organizationFeature.findMany({
      where: { organizationId },
    });
  }
}
