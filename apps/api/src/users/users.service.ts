import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Omit sensitive fields
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }
}
