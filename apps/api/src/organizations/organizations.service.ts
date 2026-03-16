import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7);

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        workspaces: true,
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

    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return org;
  }
}
