import { JobSourcesService, CreateJobSourceDto } from "./job-sources.service";
export declare class JobSourcesController {
    private sourcesService;
    constructor(sourcesService: JobSourcesService);
    list(workspaceId: string): Promise<{
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
    get(id: string): Promise<{
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
    update(id: string, dto: CreateJobSourceDto): Promise<{
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
    ingest(id: string, limit?: number, dryRun?: string): Promise<{
        success: boolean;
        jobId: string;
        message: string;
    }>;
    getStatus(id: string): Promise<{
        lastCollectionAt: Date | null;
        lastCollectionStatus: string | null;
        lastCollectionError: null;
        totalJobsCollected: number;
        activeJobsCount: number;
    }>;
}
