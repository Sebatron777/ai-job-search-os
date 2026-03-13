import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement resume management
  async findByProfile(profileId: string) {
    return this.prisma.resumeAsset.findMany({
      where: { candidateProfileId: profileId },
    });
  }
}
