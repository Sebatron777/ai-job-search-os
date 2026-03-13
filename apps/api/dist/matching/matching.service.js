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
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MatchingService = class MatchingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scoreJob(jobId, candidateProfileId) {
        const score = Math.floor(Math.random() * 40) + 60;
        const matchScore = await this.prisma.matchScore.upsert({
            where: {
                jobId_candidateProfileId: {
                    jobId,
                    candidateProfileId,
                },
            },
            create: {
                jobId,
                candidateProfileId,
                totalScore: score,
                confidence: 0.8,
                titleScore: score,
                skillScore: score,
                seniorityScore: score,
                workModeScore: score,
                locationScore: score,
                salaryScore: score,
                recommendation: score > 80 ? "highly_recommended" : "recommended",
                recommendedApplyMode: "assisted",
                skillGaps: [],
                hardFailReasons: [],
            },
            update: {},
        });
        return { matchScore, result: { totalScore: score } };
    }
    async getCandidateScores(candidateProfileId, workspaceId, limit) {
        return this.prisma.matchScore.findMany({
            where: { candidateProfileId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                    },
                },
            },
            orderBy: { totalScore: "desc" },
            take: limit || 50,
        });
    }
    async getBestMatches(candidateProfileId, workspaceId, minScore) {
        return this.prisma.matchScore.findMany({
            where: {
                candidateProfileId,
                totalScore: {
                    gte: minScore || 70,
                },
            },
            include: {
                job: true,
            },
            orderBy: { totalScore: "desc" },
            take: 20,
        });
    }
    async batchScoreForCandidate(candidateProfileId, workspaceId) {
        return { scored: 0, total: 0 };
    }
    async updateRecommendation(matchScoreId, recommendation, applyMode) {
        return this.prisma.matchScore.update({
            where: { id: matchScoreId },
            data: {
                recommendation: recommendation,
                recommendedApplyMode: applyMode,
            },
        });
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchingService);
//# sourceMappingURL=matching.service.js.map