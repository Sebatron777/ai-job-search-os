import { PrismaService } from "../database/prisma.service";
export interface CreateWorkspaceDto {
    name: string;
    slug: string;
}
export interface UpdateWorkspaceDto {
    name?: string;
    settings?: Record<string, unknown>;
}
export declare class WorkspacesService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
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
    findBySlug(slug: string): Promise<{
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
    create(ownerId: string, dto: CreateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    update(id: string, dto: UpdateWorkspaceDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    getMemberships(userId: string): Promise<({
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
}
