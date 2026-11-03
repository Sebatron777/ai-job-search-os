import { describe, it, expect, vi, beforeEach } from "vitest";
import { MatchingService } from "../matching.service";
import { PrismaService } from "../../database/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("MatchingService", () => {
  let service: MatchingService;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(() => {
    prisma = {
      job: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      candidateProfile: {
        findUnique: vi.fn(),
      },
      matchScore: {
        upsert: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    } as any;

    config = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === "LLM_PROVIDER") return "mock";
        if (key === "LLM_MODEL") return "claude-3-5-sonnet-20241022";
        return defaultValue ?? null;
      }),
    } as any;

    service = new MatchingService(prisma, config);
  });

  it("should score a job using deterministic scoring and mock LLM", async () => {
    const mockJob = {
      id: "job-1",
      workspaceId: "ws-1",
      title: "Senior Frontend Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      locationType: "remote",
      jobType: "full_time",
      seniorityLevel: "senior",
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: "USD",
      salaryPeriod: "yearly",
      requiredSkills: ["React", "TypeScript"],
      preferredSkills: ["Next.js"],
      isActive: true,
      description: "Frontend engineer role",
    };

    const mockCandidate = {
      id: "candidate-1",
      currentTitle: "Senior Frontend Engineer",
      yearsOfExperience: 6,
      skills: ["React", "TypeScript", "JavaScript"],
      preferences: {
        workModes: ["remote"],
        minSalary: 130000,
      },
    };

    (prisma.job.findUnique as any).mockResolvedValue(mockJob);
    (prisma.candidateProfile.findUnique as any).mockResolvedValue(mockCandidate);
    (prisma.matchScore.upsert as any).mockImplementation(({ create }: any) => Promise.resolve({ id: "match-1", ...create }));

    const res = await service.scoreJob("job-1", "candidate-1");

    expect(res.result.totalScore).toBeGreaterThan(60);
    expect(res.matchScore.titleScore).toBe(100);
    expect(prisma.matchScore.upsert).toHaveBeenCalled();
  });

  it("should throw NotFoundException if job is not found", async () => {
    (prisma.job.findUnique as any).mockResolvedValue(null);

    await expect(service.scoreJob("job-missing", "candidate-1")).rejects.toThrow("Job not found");
  });

  it("should throw NotFoundException if candidate is not found", async () => {
    (prisma.job.findUnique as any).mockResolvedValue({ id: "job-1" });
    (prisma.candidateProfile.findUnique as any).mockResolvedValue(null);

    await expect(service.scoreJob("job-1", "candidate-missing")).rejects.toThrow("Candidate profile not found");
  });
});
