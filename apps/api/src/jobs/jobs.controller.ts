import { Controller, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../database/prisma.service";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private prisma: PrismaService) {}

  @Post("clean-duplicates")
  @ApiOperation({ summary: "Clean duplicate jobs by canonicalUrl" })
  async cleanDuplicates(@Query("workspaceId") workspaceId: string) {
    // Get all jobs for workspace
    const allJobs = await this.prisma.job.findMany({
      where: { workspaceId },
      select: {
        id: true,
        canonicalUrl: true,
      },
    });

    // Find duplicates by canonicalUrl
    const urlMap = new Map<string, string[]>();
    
    for (const job of allJobs) {
      const url = job.canonicalUrl;
      const existing = urlMap.get(url) || [];
      existing.push(job.id);
      urlMap.set(url, existing);
    }

    // Delete duplicates (keep first)
    let deletedCount = 0;
    
    for (const [url, jobIds] of urlMap.entries()) {
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
