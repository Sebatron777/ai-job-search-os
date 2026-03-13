import { PrismaService } from "../database/prisma.service";
export declare class IntegrationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getConnectedAccounts(userId: string): Promise<never[]>;
    getMailboxConnections(workspaceId: string): Promise<never[]>;
}
