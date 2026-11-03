import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JobSourcesService, CreateJobSourceDto } from "./job-sources.service";
import { PrismaService } from "../database/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("sources")
@Controller("sources")
@UseGuards(JwtAuthGuard)
export class JobSourcesController {
  constructor(
    private sourcesService: JobSourcesService,
    private prisma: PrismaService
  ) {}

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
    // Simple ingestion without queue - creates mock jobs directly
    const source = await this.sourcesService.findById(id);
    
    const mockJobs = [
      {
        title: "Frontend Developer",
        company: "Tech Corp",
        location: "Remote",
        locationType: "remote",
        jobType: "full_time",
        seniorityLevel: "mid",
        salaryMin: 80000,
        salaryMax: 120000,
        salaryCurrency: "USD",
        salaryPeriod: "yearly",
        description: "We are looking for a Frontend Developer",
        requiredSkills: ["React", "TypeScript", "CSS"],
        preferredSkills: ["Next.js"],
        postedAt: new Date(),
        status: "active",
        isActive: true,
      },
      {
        title: "Backend Developer",
        company: "API Inc",
        location: "New York, NY",
        locationType: "hybrid",
        jobType: "full_time",
        seniorityLevel: "senior",
        salaryMin: 100000,
        salaryMax: 150000,
        salaryCurrency: "USD",
        salaryPeriod: "yearly",
        description: "Backend Developer needed",
        requiredSkills: ["Node.js", "PostgreSQL", "Redis"],
        preferredSkills: ["NestJS"],
        postedAt: new Date(),
        status: "active",
        isActive: true,
      },
      {
        title: "Full Stack Engineer",
        company: "StartupXYZ",
        location: "San Francisco, CA",
        locationType: "onsite",
        jobType: "full_time",
        seniorityLevel: "mid",
        salaryMin: 120000,
        salaryMax: 180000,
        salaryCurrency: "USD",
        salaryPeriod: "yearly",
        description: "Full Stack Engineer for fast-growing startup",
        requiredSkills: ["React", "Node.js", "AWS"],
        preferredSkills: ["Docker"],
        postedAt: new Date(),
        status: "active",
        isActive: true,
      },
      {
        title: "Junior Web Developer",
        company: "Web Agency",
        location: "Remote",
        locationType: "remote",
        jobType: "full_time",
        seniorityLevel: "entry",
        salaryMin: 50000,
        salaryMax: 70000,
        salaryCurrency: "USD",
        salaryPeriod: "yearly",
        description: "Great opportunity for junior developers",
        requiredSkills: ["HTML", "CSS", "JavaScript"],
        preferredSkills: ["React"],
        postedAt: new Date(),
        status: "active",
        isActive: true,
      },
      {
        title: "DevOps Engineer",
        company: "Cloud Services",
        location: "Austin, TX",
        locationType: "hybrid",
        jobType: "contract",
        seniorityLevel: "senior",
        salaryMin: 90000,
        salaryMax: 140000,
        salaryCurrency: "USD",
        salaryPeriod: "yearly",
        description: "DevOps Engineer for cloud infrastructure",
        requiredSkills: ["AWS", "Docker", "Kubernetes"],
        preferredSkills: ["Terraform"],
        postedAt: new Date(),
        status: "active",
        isActive: true,
      },
    ];

    const limitNum = limit || 10;
    const jobsToCreate = mockJobs.slice(0, limitNum);

    // Create jobs
    for (const jobData of jobsToCreate) {
      await this.prisma.job.create({
        data: {
          ...jobData,
          sourceId: id,
          workspaceId: source.workspaceId,
          canonicalUrl: `mock://${id}/${jobData.title.replace(/\s+/g, '-').toLowerCase()}`,
          sourceUrl: `https://example.com/jobs/${jobData.title.replace(/\s+/g, '-').toLowerCase()}`,
        },
      });
    }

    // Update source stats
    await this.prisma.jobSource.update({
      where: { id },
      data: {
        lastCollectionAt: new Date(),
        lastCollectionStatus: "success",
        totalJobsCollected: { increment: jobsToCreate.length },
        activeJobsCount: { increment: jobsToCreate.length },
      },
    });

    return {
      success: true,
      jobsCreated: jobsToCreate.length,
      message: "Jobs imported successfully",
    };
  }

  @Get(":id/status")
  @ApiOperation({ summary: "Get collection status for source" })
  @ApiResponse({ status: 200 })
  async getStatus(@Param("id") id: string) {
    return this.sourcesService.getCollectionStatus(id);
  }
}
