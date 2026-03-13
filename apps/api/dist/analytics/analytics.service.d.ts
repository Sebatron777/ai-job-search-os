import { PrismaService } from "../database/prisma.service";
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getFunnelMetrics(workspaceId: string): Promise<{
        totalApplications: number;
        byStatus: Record<string, number>;
        appliedCount: number;
        replyCount: number;
        interviewCount: number;
        offerCount: number;
        replyRate: number;
        interviewRate: number;
        offerRate: number;
    }>;
}
