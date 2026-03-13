import { PrismaService } from "../database/prisma.service";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        memberships: ({
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
        })[];
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        name?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        emailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
