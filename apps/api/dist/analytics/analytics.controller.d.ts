import { AnalyticsService } from "./analytics.service";
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getFunnel(workspaceId: string): Promise<{
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
