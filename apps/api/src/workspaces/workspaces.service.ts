import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface CreateWorkspaceDto {
  name: string;
  slug: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  settings?: Record<string, unknown>;
}

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }

  async findBySlug(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    // Check slug uniqueness
    const existing = await this.prisma.workspace.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ForbiddenException("Workspace slug already taken");
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ownerId,
        settings: {
          defaultApprovalMode: "manual",
          autoSyncEnabled: false,
          timezone: "UTC",
          currency: "USD",
        },
      },
    });

    // Create owner membership
    await this.prisma.membership.create({
      data: {
        userId: ownerId,
        workspaceId: workspace.id,
        role: "OWNER",
        acceptedAt: new Date(),
      },
    });

    return workspace;
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        workspaceId: id,
        userId,
      },
    });

    if (!membership && workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not have access to update this workspace");
    }

    const updatedWorkspace = await this.prisma.workspace.update({
      where: { id },
      data: {
        name: dto.name,
        settings: dto.settings as any,
      },
    });

    return updatedWorkspace;
  }

  async getMemberships(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
    });

    return memberships;
  }
}
