import { UsersService } from "./users.service";
declare class UpdateUserDto {
    name?: string;
    avatarUrl?: string;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
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
    updateMe(req: any, dto: UpdateUserDto): Promise<{
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
export {};
