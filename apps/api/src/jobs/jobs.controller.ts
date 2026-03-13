import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async list(
    @Query("workspaceId") workspaceId: string,
    @Query("status") status?: string
  ) {
    return this.jobsService.findAll(workspaceId, { status });
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return this.jobsService.findById(id);
  }
}
