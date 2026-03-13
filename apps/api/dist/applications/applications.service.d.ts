import { PrismaService } from "../database/prisma.service";
export interface CreateApplicationDto {
    jobId: string;
    candidateProfileId: string;
    workspaceId: string;
}
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string, filters?: any): Promise<({
        job: {
            id: string;
            title: string;
            company: string;
        };
        matchScore: {
            totalScore: number;
            recommendation: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    })[]>;
    findById(id: string): Promise<{
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    }>;
    create(dto: CreateApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    }>;
    updateStatus(id: string, status: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    }>;
    approve(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    }>;
    reject(id: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        candidateProfileId: string;
        status: string;
        jobId: string;
        matchScoreId: string | null;
        coverLetter: string | null;
        introMessage: string | null;
        customAnswers: import("@prisma/client/runtime/library").JsonValue | null;
        submittedAt: Date | null;
        submitMethod: string | null;
        statusHistory: import("@prisma/client/runtime/library").JsonValue;
        lastActivityAt: Date;
    }>;
}
