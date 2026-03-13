import { PrismaService } from "../database/prisma.service";
export declare class ResumesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProfile(profileId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        candidateProfileId: string;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        isDefault: boolean;
    }[]>;
}
