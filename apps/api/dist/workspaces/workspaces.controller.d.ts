import { WorkspacesService, CreateWorkspaceDto } from "./workspaces.service";
export declare class WorkspacesController {
    private workspacesService;
    constructor(workspacesService: WorkspacesService);
    listWorkspaces(req: any): Promise<({
        workspace: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        acceptedAt: Date | null;
        userId: string;
        workspaceId: string;
    })[]>;
    getWorkspace(slug: string): Promise<{
        memberships: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            acceptedAt: Date | null;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    createWorkspace(req: any, dto: CreateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    updateWorkspace(id: string, dto: {
        name?: string;
        settings?: Record<string, unknown>;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
}
