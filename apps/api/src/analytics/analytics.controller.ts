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
}
