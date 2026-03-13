import { PrismaService } from "../database/prisma.service";
import { IngestionQueueService } from "../queue/ingestion-queue.service";
export interface CreateJobSourceDto {
    name: string;
    type: string;
    config: Record<string, any>;
    workspaceId: string;
}
export interface UpdateJobSourceDto {
    name?: string;
    config?: Record<string, any>;
    status?: string;
}
export declare class JobSourcesService {
    private prisma;
    private ingestionQueue;
    constructor(prisma: PrismaService, ingestionQueue: IngestionQueueService);
    findByWorkspace(workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        type: string;
        status: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: string | null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        type: string;
        status: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: string | null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }>;
    create(dto: CreateJobSourceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        type: string;
        status: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: string | null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }>;
    update(id: string, dto: UpdateJobSourceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        type: string;
        status: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: string | null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    triggerIngestion(sourceId: string, options?: {
        limit?: number;
        dryRun?: boolean;
    }): Promise<string>;
    getCollectionStatus(sourceId: string): Promise<{
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }>;
}
