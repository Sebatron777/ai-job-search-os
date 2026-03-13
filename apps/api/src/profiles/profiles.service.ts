import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface CreateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  location?: string;
  yearsOfExperience?: number;
  currentTitle?: string;
  currentCompany?: string;
  skills?: string[];
}

export interface CreateJobPreferenceDto {
  jobTypes?: string[];
  workModes?: string[];
  remoteOnly?: boolean;
  relocationWilling?: boolean;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  seniorityLevels?: string[];
  industries?: string[];
  targetCompanies?: string[];
  excludedCompanies?: string[];
}

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    return this.prisma.candidateProfile.findFirst({
      where: { userId, workspaceId },
      include: {
        preferences: true,
        resumes: true,
      },
    });
  }

  async findById(id: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: {
        preferences: true,
        resumes: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  async create(userId: string, workspaceId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.candidateProfile.findFirst({
      where: { userId, workspaceId },
    });

    if (existing) {
      throw new NotFoundException("Profile already exists");
    }

    return this.prisma.candidateProfile.create({
      data: {
        userId,
        workspaceId,
        ...dto,
        skills: dto.skills || [],
        preferredKeywords: [],
        excludedKeywords: [],
      },
    });
  }

  async update(id: string, dto: Partial<CreateProfileDto>) {
    return this.prisma.candidateProfile.update({
      where: { id },
      data: dto,
    });
  }

  async upsertJobPreference(profileId: string, dto: CreateJobPreferenceDto) {
    const existing = await this.prisma.jobPreference.findUnique({
      where: { candidateProfileId: profileId },
    });

    if (existing) {
      return this.prisma.jobPreference.update({
        where: { candidateProfileId: profileId },
        data: dto,
      });
    }

    return this.prisma.jobPreference.create({
      data: {
        candidateProfileId: profileId,
        jobTypes: dto.jobTypes || [],
        workModes: dto.workModes || [],
        preferredLocations: [],
        remoteOnly: dto.remoteOnly || false,
        relocationWilling: dto.relocationWilling || false,
        salaryCurrency: dto.salaryCurrency || "USD",
        salaryPeriod: dto.salaryPeriod || "yearly",
        seniorityLevels: dto.seniorityLevels || [],
        industries: dto.industries || [],
        targetCompanies: dto.targetCompanies || [],
        excludedCompanies: dto.excludedCompanies || [],
      },
    });
  }
}
