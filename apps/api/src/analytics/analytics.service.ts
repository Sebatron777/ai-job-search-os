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
    const hired = byStatus["hired"] || 0;

    return {
      totalApplications: total,
      byStatus,
      appliedCount: applied,
      replyCount: replyReceived,
      interviewCount: interview,
      offerCount: offer,
      hiredCount: hired,
      replyRate: total > 0 ? replyReceived / total : 0,
      interviewRate: total > 0 ? interview / total : 0,
      offerRate: total > 0 ? offer / total : 0,
      hiredRate: total > 0 ? hired / total : 0,
    };
  }

  async getSourceMetrics(workspaceId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { workspaceId },
      include: {
        source: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    const sourceStats = jobs.reduce((acc: any, job: any) => {
      const sourceName = job.source.name || "Unknown";
      if (!acc[sourceName]) {
        acc[sourceName] = { jobs: 0, applications: 0 };
      }
      acc[sourceName].jobs += 1;
      acc[sourceName].applications += job._count.applications;
      return acc;
    }, {});

    return sourceStats;
  }

  async getTimeToHire(workspaceId: string) {
    const hiredApplications = await this.prisma.application.findMany({
      where: {
        workspaceId,
        status: "hired",
        submittedAt: { not: null },
      },
      select: {
        submittedAt: true,
        updatedAt: true,
      },
    });

    const averageDays = hiredApplications.length > 0
      ? hiredApplications.reduce((sum, app) => {
          const days = (app.updatedAt.getTime() - app.submittedAt!.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / hiredApplications.length
      : 0;

    return {
      averageDaysToHire: Math.round(averageDays * 10) / 10,
      hiredCount: hiredApplications.length,
    };
  }

  async getWeeklyTrends(workspaceId: string) {
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    const applications = await this.prisma.application.findMany({
      where: {
        workspaceId,
        createdAt: { gte: sevenWeeksAgo },
      },
      select: { createdAt: true },
    });

    // Bucket by week
    const trends = applications.reduce((acc: any, app: any) => {
      const date = new Date(app.createdAt);
      date.setHours(0, 0, 0, 0);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split("T")[0];
      acc[weekStart] = (acc[weekStart] || 0) + 1;
      return acc;
    }, {});

    return trends;
  }
}
