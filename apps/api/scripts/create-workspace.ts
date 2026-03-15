/**
 * Script to create workspace for existing users
 * Usage: pnpm tsx scripts/create-workspace.ts <userId>
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('Usage: pnpm tsx scripts/create-workspace.ts <userId>');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`User ${userId} not found`);
      process.exit(1);
    }

    // Check if workspace already exists
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    if (existingWorkspace) {
      console.log(`Workspace already exists: ${existingWorkspace.id}`);
      process.exit(0);
    }

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || user.email.split('@')[0]}'s Workspace`,
        slug: `ws-${userId.slice(0, 8)}`,
        ownerId: userId,
        settings: {
          defaultApprovalMode: 'manual',
          autoSyncEnabled: false,
          timezone: 'UTC',
          currency: 'USD',
        },
      },
    });

    console.log(`Created workspace: ${workspace.id}`);

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId: userId,
        workspaceId: workspace.id,
        role: 'OWNER',
        acceptedAt: new Date(),
      },
    });

    console.log(`Created membership: ${membership.id}`);
    console.log('✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
