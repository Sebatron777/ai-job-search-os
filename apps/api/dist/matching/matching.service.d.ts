import { PrismaService } from "../database/prisma.service";
export declare class MatchingService {
    private prisma;
    constructor(prisma: PrismaService);
    scoreJob(jobId: string, candidateProfileId: string): Promise<{
        matchScore: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateProfileId: string;
            jobId: string;
            totalScore: number;
            confidence: number;
            titleScore: number;
            skillScore: number;
            seniorityScore: number;
            workModeScore: number;
            locationScore: number;
            salaryScore: number;
            recommendation: string;
            recommendedApplyMode: string | null;
            skillGaps: import("@prisma/client/runtime/library").JsonValue;
            hardFailReasons: string[];
        };
        result: {
            totalScore: number;
        };
    }>;
    getCandidateScores(candidateProfileId: string, workspaceId: string, limit?: number): Promise<({
        job: {
            id: string;
            location: string;
            title: string;
            company: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateProfileId: string;
        jobId: string;
        totalScore: number;
        confidence: number;
        titleScore: number;
        skillScore: number;
        seniorityScore: number;
        workModeScore: number;
        locationScore: number;
        salaryScore: number;
        recommendation: string;
        recommendedApplyMode: string | null;
        skillGaps: import("@prisma/client/runtime/library").JsonValue;
        hardFailReasons: string[];
    })[]>;
    getBestMatches(candidateProfileId: string, workspaceId: string, minScore?: number): Promise<({
        job: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            description: string;
            location: string;
            salaryCurrency: string | null;
            salaryPeriod: string | null;
            isActive: boolean;
            status: string;
            sourceId: string;
            title: string;
            company: string;
            canonicalUrl: string;
            sourceUrl: string;
            locationType: string;
            isRemote: boolean;
            salaryMin: number | null;
            salaryMax: number | null;
            jobType: string;
            seniorityLevel: string | null;
            requiredSkills: string[];
            preferredSkills: string[];
            postedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateProfileId: string;
        jobId: string;
        totalScore: number;
        confidence: number;
        titleScore: number;
        skillScore: number;
        seniorityScore: number;
        workModeScore: number;
        locationScore: number;
        salaryScore: number;
        recommendation: string;
        recommendedApplyMode: string | null;
        skillGaps: import("@prisma/client/runtime/library").JsonValue;
        hardFailReasons: string[];
    })[]>;
    batchScoreForCandidate(candidateProfileId: string, workspaceId: string): Promise<{
        scored: number;
        total: number;
    }>;
    updateRecommendation(matchScoreId: string, recommendation: string, applyMode?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateProfileId: string;
        jobId: string;
        totalScore: number;
        confidence: number;
        titleScore: number;
        skillScore: number;
        seniorityScore: number;
        workModeScore: number;
        locationScore: number;
        salaryScore: number;
        recommendation: string;
        recommendedApplyMode: string | null;
        skillGaps: import("@prisma/client/runtime/library").JsonValue;
        hardFailReasons: string[];
    }>;
}
