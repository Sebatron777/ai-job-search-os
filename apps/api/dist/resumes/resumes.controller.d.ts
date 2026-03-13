import { ResumesService } from "./resumes.service";
export declare class ResumesController {
    private resumesService;
    constructor(resumesService: ResumesService);
    list(profileId: string): Promise<{
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
