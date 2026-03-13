import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JobSourcesService, CreateJobSourceDto } from "./job-sources.service";

@ApiTags("sources")
@Controller("sources")
export class JobSourcesController {
  constructor(private sourcesService: JobSourcesService) {}

  @Get()
  @ApiOperation({ summary: "List job sources for workspace" })
  @ApiResponse({ status: 200 })
  async list(@Query("workspaceId") workspaceId: string) {
    return this.sourcesService.findByWorkspace(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get job source by ID" })
  @ApiResponse({ status: 200 })
  async get(@Param("id") id: string) {
    return this.sourcesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new job source" })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateJobSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update job source" })
  @ApiResponse({ status: 200 })
  async update(@Param("id") id: string, @Body() dto: CreateJobSourceDto) {
    return this.sourcesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete job source" })
  @ApiResponse({ status: 200 })
  async delete(@Param("id") id: string) {
    return this.sourcesService.delete(id);
  }

  @Post(":id/ingest")
  @ApiOperation({ summary: "Trigger job ingestion from source" })
  @ApiResponse({ status: 201 })
  async ingest(
    @Param("id") id: string,
    @Query("limit") limit?: number,
    @Query("dryRun") dryRun?: string
  ) {
    const jobId = await this.sourcesService.triggerIngestion(id, {
      limit,
      dryRun: dryRun === "true",
    });

    return {
      success: true,
      jobId,
      message: "Ingestion job queued",
    };
  }

  @Get(":id/status")
  @ApiOperation({ summary: "Get collection status for source" })
  @ApiResponse({ status: 200 })
  async getStatus(@Param("id") id: string) {
    return this.sourcesService.getCollectionStatus(id);
  }
}
