import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../database/prisma.service";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "List all jobs for workspace" })
  async list(
    @Query("workspaceId") workspaceId: string,
    @Query("status") status?: string
  ) {
    const where: any = { workspaceId };
    if (status && status !== 'all') {
      where.status = status;
    }
    return this.prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get job by ID" })
  async get(@Param("id") id: string) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  @Post("clean-duplicates")
  @ApiOperation({ summary: "Clean duplicate jobs by title+company" })
  async cleanDuplicates(@Query("workspaceId") workspaceId: string) {
    // Get all jobs for workspace
    const allJobs = await this.prisma.job.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        company: true,
      },
    });

    // Find duplicates by title+company
    const keyMap = new Map<string, string[]>();

    for (const job of allJobs) {
      const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
      const existing = keyMap.get(key) || [];
      existing.push(job.id);
      keyMap.set(key, existing);
    }

    // Delete duplicates (keep first)
    let deletedCount = 0;

    for (const [key, jobIds] of keyMap.entries()) {
      if (jobIds.length > 1) {
        // Keep first, delete rest
        const toDelete = jobIds.slice(1);

        for (const jobId of toDelete) {
          await this.prisma.job.delete({
            where: { id: jobId },
          });
          deletedCount++;
        }
      }
    }

    return {
      success: true,
      deletedCount,
      remainingCount: allJobs.length - deletedCount,
    };
  }
}
