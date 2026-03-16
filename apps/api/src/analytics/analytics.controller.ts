import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("funnel")
  async getFunnel(@Query("workspaceId") workspaceId: string) {
    return this.analyticsService.getFunnelMetrics(workspaceId);
  }

  @Get("source-metrics")
  async getSourceMetrics(@Query("workspaceId") workspaceId: string) {
    return this.analyticsService.getSourceMetrics(workspaceId);
  }

  @Get("time-to-hire")
  async getTimeToHire(@Query("workspaceId") workspaceId: string) {
    return this.analyticsService.getTimeToHire(workspaceId);
  }

  @Get("trends")
  async getTrends(@Query("workspaceId") workspaceId: string) {
    return this.analyticsService.getWeeklyTrends(workspaceId);
  }
}
