import { describe, it, expect, vi, beforeEach } from "vitest";
import { DraftGenerationService } from "../draft-generation.service";
import { PrismaService } from "../../database/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("DraftGenerationService", () => {
  let service: DraftGenerationService;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(() => {
    prisma = {
      job: {
        findUnique: vi.fn(),
      },
      candidateProfile: {
        findUnique: vi.fn(),
      },
      resumeAsset: {
        findMany: vi.fn(),
      },
      applicationDraft: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    } as any;

    config = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === "LLM_PROVIDER") return "mock";
        if (key === "LLM_MODEL") return "claude-3-5-sonnet-20241022";
        return defaultValue ?? null;
      }),
    } as any;

    service = new DraftGenerationService(prisma, config);
  });

  it("should generate a draft when job, candidate, and resume exist", async () => {
    const mockJob = {
      id: "job-1",
      workspaceId: "ws-1",
      title: "Senior Fullstack Engineer",
      company: "Startup Co",
      description: "Looking for an engineer with React and Node.js skills.",
      requiredSkills: ["React", "Node.js"],
    };

    const mockCandidate = {
      id: "candidate-1",
      firstName: "Jane",
      lastName: "Doe",
      headline: "Senior Software Engineer",
      currentTitle: "Fullstack Engineer",
      skills: ["React", "Node.js", "TypeScript"],
    };

    const mockResumes = [
      {
        id: "resume-1",
        name: "Fullstack Resume.pdf",
        isDefault: true,
        targetedRoles: ["Fullstack Engineer"],
      },
    ];

    (prisma.job.findUnique as any).mockResolvedValue(mockJob);
    (prisma.candidateProfile.findUnique as any).mockResolvedValue(mockCandidate);
    (prisma.resumeAsset.findMany as any).mockResolvedValue(mockResumes);
    (prisma.applicationDraft.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "draft-1", ...data })
    );

    const res = await service.generateDraft("job-1", "candidate-1");

    expect(res.draft).toBeDefined();
    expect(res.draft.coverLetter).toBeDefined();
    expect(res.draft.resumeAssetId).toBe("resume-1");
    expect(prisma.applicationDraft.create).toHaveBeenCalled();
  });

  it("should throw BadRequestException if candidate has no resumes", async () => {
    (prisma.job.findUnique as any).mockResolvedValue({ id: "job-1", workspaceId: "ws-1" });
    (prisma.candidateProfile.findUnique as any).mockResolvedValue({ id: "candidate-1" });
    (prisma.resumeAsset.findMany as any).mockResolvedValue([]);

    await expect(service.generateDraft("job-1", "candidate-1")).rejects.toThrow(
      "Candidate has no resumes uploaded"
    );
  });

  it("should throw NotFoundException on updateDraft if draft does not exist", async () => {
    (prisma.applicationDraft.findUnique as any).mockResolvedValue(null);

    await expect(service.updateDraft("non-existent-id", { coverLetter: "Updated" })).rejects.toThrow(
      "Draft not found"
    );
  });

  it("should throw NotFoundException on deleteDraft if draft does not exist", async () => {
    (prisma.applicationDraft.findUnique as any).mockResolvedValue(null);

    await expect(service.deleteDraft("non-existent-id")).rejects.toThrow(
      "Draft not found"
    );
  });
});
