import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFunnelMetrics(workspaceId: string) {
    const applications = await this.prisma.application.findMany({
      where: { workspaceId },
      select: { status: true },
    });

    const byStatus = applications.reduce((acc: any, app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = applications.length;
    const applied = byStatus["applied"] || 0;
    const replyReceived = byStatus["reply_received"] || 0;
    const interview = byStatus["interview"] || 0;
    const offer = byStatus["offer"] || 0;

    return {
      totalApplications: total,
      byStatus,
      appliedCount: applied,
      replyCount: replyReceived,
      interviewCount: interview,
      offerCount: offer,
      replyRate: total > 0 ? replyReceived / total : 0,
      interviewRate: total > 0 ? interview / total : 0,
      offerRate: total > 0 ? offer / total : 0,
    };
  }

  // TODO: Implement source performance metrics
  // TODO: Implement conversion analytics
}
