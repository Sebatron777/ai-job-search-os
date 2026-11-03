import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import {
  DeterministicScoringService,
  LLMScoringService,
  MatchingService as WorkerMatchingService,
  createLLMClient,
  type LLMProvider,
} from "@ai-job-search/workers";

@Injectable()
export class MatchingService {
  readonly deterministicService: DeterministicScoringService;
  readonly llmService: LLMScoringService;
  private matchingEngine: WorkerMatchingService;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>("LLM_API_KEY");
    const model = this.configService.get<string>("LLM_MODEL", "claude-3-5-sonnet-20241022");
    const provider = this.configService.get<LLMProvider>("LLM_PROVIDER", "anthropic");

    const llmClient = createLLMClient({ provider, apiKey, model });
    this.deterministicService = new DeterministicScoringService();
    this.llmService = new LLMScoringService(llmClient);
    this.matchingEngine = new WorkerMatchingService(llmClient);
  }

  async scoreJob(jobId: string, candidateProfileId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: {
        preferences: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException("Candidate profile not found");
    }

    const result = await this.matchingEngine.match(
      job as any,
      candidate as any,
      (candidate.preferences || undefined) as any
    );

    const matchData = {
      totalScore: Math.round(result.totalScore),
      confidence: Math.round(result.confidence * 100) / 100,
      titleScore: Math.round(result.deterministicResult.titleScore),
      skillScore: Math.round(result.deterministicResult.skillScore),
      seniorityScore: Math.round(result.deterministicResult.seniorityScore),
      workModeScore: Math.round(result.deterministicResult.workModeScore),
      locationScore: Math.round(result.deterministicResult.locationScore),
      salaryScore: Math.round(result.deterministicResult.salaryScore),
      recommendation: result.recommendation,
      recommendedApplyMode: result.recommendedApplyMode || "assisted",
      skillGaps: result.skillGaps as any,
      hardFailReasons: result.hardFailReasons,
    };

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
        ...matchData,
      },
      update: {
        ...matchData,
      },
    });

    return { matchScore, result };
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
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
    });

    if (!candidate) {
      throw new NotFoundException("Candidate profile not found");
    }

    const jobs = await this.prisma.job.findMany({
      where: { workspaceId, isActive: true },
      select: { id: true },
    });

    let scored = 0;
    for (const job of jobs) {
      await this.scoreJob(job.id, candidateProfileId);
      scored++;
    }

    return { scored, total: jobs.length };
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
