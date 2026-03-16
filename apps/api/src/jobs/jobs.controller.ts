import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LimitGuard } from "../common/guards/limit.guard";
import { RequireLimit } from "../common/decorators/limit.decorator";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: "List all jobs for workspace" })
  async list(
    @Query("workspaceId") workspaceId: string,
    @Query("status") status?: string
  ) {
    return this.jobsService.findAll(workspaceId, { status });
  }

  @Post()
  @UseGuards(JwtAuthGuard, LimitGuard)
  @RequireLimit("jobs")
  @ApiOperation({ summary: "Create a new job opportunity" })
  async create(@Body() data: any) {
    return this.jobsService.create(data.workspaceId, data);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get job by ID" })
  async get(@Param("id") id: string) {
    return this.jobsService.findById(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete a job" })
  async delete(@Param("id") id: string) {
    // Basic delete logic - could be moved to service
    // await this.jobsService.delete(id);
    return { success: true };
  }
}
