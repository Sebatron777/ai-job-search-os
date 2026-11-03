import { describe, it, expect, beforeEach } from "vitest";
import {
  LLMScoringService,
  MockLLMClient,
  type LLMAnalysisResult,
} from "./llm-scoring.service";
import type { Job, CandidateProfile } from "@ai-job-search/types";

describe("LLMScoringService", () => {
  let service: LLMScoringService;
  let mockClient: MockLLMClient;

  beforeEach(() => {
    mockClient = new MockLLMClient();
    service = new LLMScoringService(mockClient, { enabled: true });
  });

  const createMockJob = (overrides?: Partial<Job>): Job => ({
    id: "job-1",
    workspaceId: "ws-1",
    sourceId: "source-1",
    title: "Senior Software Engineer",
    company: "Tech Corp",
    canonicalUrl: "https://example.com/jobs/1",
    sourceUrl: "https://example.com/jobs/1",
    description: "We are hiring a senior engineer...",
    requirements: [],
    responsibilities: [],
    benefits: [],
    location: "San Francisco, CA",
    locationType: "remote",
    country: "USA",
    city: "San Francisco",
    state: "CA",
    isRemote: true,
    salaryMin: 150000,
    salaryMax: 200000,
    salaryCurrency: "USD",
    salaryPeriod: "yearly",
    jobType: "full_time",
    seniorityLevel: "senior",
    requiredSkills: ["TypeScript", "React"],
    preferredSkills: [],
    postedAt: new Date(),
    status: "normalized",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockCandidate = (overrides?: Partial<CandidateProfile>): CandidateProfile => ({
    id: "candidate-1",
    userId: "user-1",
    workspaceId: "ws-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: null,
    linkedinUrl: null,
    websiteUrl: null,
    location: null,
    timezone: null,
    yearsOfExperience: null,
    headline: "Senior Software Engineer",
    currentTitle: "Senior Software Engineer",
    currentCompany: "Startup Inc",
    skills: ["TypeScript", "React", "Node.js"],
    preferredKeywords: [],
    excludedKeywords: ["casino", "gambling"],
    voiceTone: "professional",
    autoGenerateCoverLetters: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("analyze", () => {
    it("should return analysis result with LLM", async () => {
      const job = createMockJob();
      const candidate = createMockCandidate();

      const result = await service.analyze(job, candidate);

      expect(result.reasoning).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should detect hard fails for excluded companies", async () => {
      const job = createMockJob({ company: "Casino Gaming Corp" });
      const candidate = createMockCandidate({
        excludedKeywords: ["casino", "gambling"],
      });

      const hardFails = service.detectHardFails(job, candidate);

      expect(hardFails).toContain("excluded_company");
    });

    it("should detect hard fails for excluded keywords", async () => {
      const job = createMockJob({
        description: "Experience with gambling systems required",
      });
      const candidate = createMockCandidate({
        excludedKeywords: ["gambling"],
      });

      const hardFails = service.detectHardFails(job, candidate);

      expect(hardFails).toContain("excluded_keyword");
    });

    it("should detect risk flags for old postings", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 45);

      const job = createMockJob({ postedAt: oldDate });
      const flags = service.detectRiskFlags(job);

      const ageFlag = flags.find(f => f.type === "job_posting_age");
      expect(ageFlag).toBeDefined();
      expect(ageFlag?.severity).toBe("medium");
    });

    it("should detect risk flags for very old postings", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 90);

      const job = createMockJob({ postedAt: oldDate });
      const flags = service.detectRiskFlags(job);

      const ageFlag = flags.find(f => f.type === "job_posting_age");
      expect(ageFlag?.severity).toBe("high");
    });

    it("should detect risk flags for missing salary", () => {
      const job = createMockJob({
        salaryMin: undefined,
        salaryMax: undefined,
      });

      const flags = service.detectRiskFlags(job);

      const salaryFlag = flags.find(f => f.type === "salary_transparency");
      expect(salaryFlag).toBeDefined();
    });

    it("should detect risk flags for vague description", () => {
      const job = createMockJob({
        description: "Join our team! Great benefits!",
      });

      const flags = service.detectRiskFlags(job);

      const vagueFlag = flags.find(f => f.type === "vague_description");
      expect(vagueFlag).toBeDefined();
    });

    it("should detect risk flags for too many requirements", () => {
      const job = createMockJob({
        requirements: Array(20).fill("Requirement"),
      });

      const flags = service.detectRiskFlags(job);

      const tooManyFlag = flags.find(f => f.type === "too_many_requirements");
      expect(tooManyFlag).toBeDefined();
    });

    it("should recommend manual for hard fails", () => {
      const mode = service.recommendApplyMode(
        80,
        0.9,
        ["seniority_mismatch"],
        []
      );

      expect(mode).toBe("manual");
    });

    it("should recommend manual for high risk", () => {
      const mode = service.recommendApplyMode(
        80,
        0.9,
        [],
        [{ type: "scam_likelihood", severity: "high", message: "Suspicious" }]
      );

      expect(mode).toBe("manual");
    });

    it("should recommend assisted for low confidence", () => {
      const mode = service.recommendApplyMode(
        80,
        0.5,
        [],
        []
      );

      expect(mode).toBe("assisted");
    });

    it("should recommend auto for high score and confidence", () => {
      const mode = service.recommendApplyMode(
        85,
        0.95,
        [],
        []
      );

      expect(mode).toBe("auto");
    });
  });

  describe("getDefaultAnalysis", () => {
    it("should return default analysis without LLM", async () => {
      const serviceWithoutLLM = new LLMScoringService(undefined, {
        enabled: false,
      });

      const job = createMockJob();
      const candidate = createMockCandidate();

      const result = await serviceWithoutLLM.analyze(job, candidate);

      expect(result.reasoning).toContain("без LLM");
      expect(result.confidence).toBe(0.6);
    });
  });

  describe("parseRecommendation", () => {
    it("should parse valid recommendations", () => {
      const valid = ["highly_recommended", "recommended", "neutral", "not_recommended", "avoid"];
      
      for (const v of valid) {
        // @ts-ignore - testing private method
        const result = service.parseRecommendation(v);
        expect(valid).toContain(result);
      }
    });

    it("should map similar strings", () => {
      // @ts-ignore
      expect(service.parseRecommendation("high")).toBe("highly_recommended");
      // @ts-ignore
      expect(service.parseRecommendation("strong match")).toBe("highly_recommended");
      // @ts-ignore
      expect(service.parseRecommendation("avoid this")).toBe("avoid");
      // @ts-ignore
      expect(service.parseRecommendation("don't apply")).toBe("not_recommended");
    });
  });
});

describe("MockLLMClient", () => {
  it("should return mock response", async () => {
    const client = new MockLLMClient();
    const response = await client.generate("test prompt");

    expect(response.content).toBeDefined();
    expect(response.usage).toBeDefined();
    expect(response.usage?.totalTokens).toBe(150);
  });
});
