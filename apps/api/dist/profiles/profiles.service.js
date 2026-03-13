"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ProfilesService = class ProfilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserAndWorkspace(userId, workspaceId) {
        return this.prisma.candidateProfile.findFirst({
            where: { userId, workspaceId },
            include: {
                preferences: true,
                resumes: true,
            },
        });
    }
    async findById(id) {
        const profile = await this.prisma.candidateProfile.findUnique({
            where: { id },
            include: {
                preferences: true,
                resumes: true,
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
        }
        return profile;
    }
    async create(userId, workspaceId, dto) {
        const existing = await this.prisma.candidateProfile.findFirst({
            where: { userId, workspaceId },
        });
        if (existing) {
            throw new common_1.NotFoundException("Profile already exists");
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
    async update(id, dto) {
        return this.prisma.candidateProfile.update({
            where: { id },
            data: dto,
        });
    }
    async upsertJobPreference(profileId, dto) {
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
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map