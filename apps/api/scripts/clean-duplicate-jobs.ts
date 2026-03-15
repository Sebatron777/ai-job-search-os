/**
 * Script to clean duplicate jobs
 * Usage: pnpm tsx scripts/clean-duplicate-jobs.ts <workspaceId>
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  const workspaceId = process.argv[2];
  
  if (!workspaceId) {
    console.error('Usage: pnpm tsx scripts/clean-duplicate-jobs.ts <workspaceId>');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log(`Cleaning duplicate jobs for workspace: ${workspaceId}`);
    
    // Get all jobs for workspace
    const allJobs = await prisma.job.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        company: true,
        canonicalUrl: true,
      },
    });

    console.log(`Total jobs found: ${allJobs.length}`);

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
        console.log(`Duplicate found: ${url} (${jobIds.length} times)`);
        
        // Keep first, delete rest
        const toDelete = jobIds.slice(1);
        
        for (const jobId of toDelete) {
          await prisma.job.delete({
            where: { id: jobId },
          });
          deletedCount++;
        }
      }
    }

    console.log(`\n✅ Cleaned up ${deletedCount} duplicate jobs`);
    
    // Show remaining jobs
    const remainingJobs = await prisma.job.count({
      where: { workspaceId },
    });
    
    console.log(`Remaining jobs: ${remainingJobs}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
