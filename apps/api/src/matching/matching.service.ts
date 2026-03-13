import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async scoreJob(jobId: string, candidateProfileId: string) {
    // Временная заглушка - будет заменено на реальный matching service
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    
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

  async getCandidateScores(candidateProfileId: string, workspaceId: string, limit?: number) {
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

  async getBestMatches(candidateProfileId: string, workspaceId: string, minScore?: number) {
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

  async batchScoreForCandidate(candidateProfileId: string, workspaceId: string) {
    // Заглушка
    return { scored: 0, total: 0 };
  }

  async updateRecommendation(matchScoreId: string, recommendation: string, applyMode?: string) {
    return this.prisma.matchScore.update({
      where: { id: matchScoreId },
      data: {
        recommendation: recommendation as any,
        recommendedApplyMode: applyMode,
      },
    });
  }
}
