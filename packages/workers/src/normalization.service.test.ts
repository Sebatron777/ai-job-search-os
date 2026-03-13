import { describe, it, expect, beforeEach } from "vitest";
import {
  NormalizationService,
  JobInput,
} from "./normalization.service";
import type { RawJob } from "@ai-job-search/types";

describe("NormalizationService", () => {
  let service: NormalizationService;

  beforeEach(() => {
    service = new NormalizationService();
  });

  const createMockRawJob = (overrides?: Partial<RawJob>): RawJob => ({
    id: "raw-job-1",
    sourceId: "source-1",
    sourceJobId: "job-123",
    rawPayload: {},
    extractedTitle: "Senior Software Engineer",
    extractedCompany: "Tech Corp Inc.",
    extractedLocation: "San Francisco, CA",
    extractedDescription: "We are looking for a Senior Software Engineer...",
    extractedUrl: "https://example.com/jobs/123",
    extractedPostedAt: new Date("2024-01-15"),
    extractedSalary: "$150k - $200k",
    extractedJobType: "full_time",
    processingStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("normalize", () => {
    it("should successfully normalize a valid raw job", async () => {
      const rawJob = createMockRawJob();
      const result = await service.normalize(rawJob);

      expect(result.success).toBe(true);
      expect(result.job).toBeDefined();
      expect(result.job?.title).toBe("senior software engineer");
      // Company is normalized for matching purposes (suffixes removed)
      expect(result.job?.company).toBe("tech");
      expect(result.job?.location).toBe("San Francisco, CA");
      expect(result.job?.isRemote).toBe(false);
      expect(result.job?.jobType).toBe("full_time");
      expect(result.job?.seniorityLevel).toBe("senior");
    });

    it("should fail when title is missing", async () => {
      const rawJob = createMockRawJob({ extractedTitle: "" });
      const result = await service.normalize(rawJob);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.field === "extractedTitle")).toBe(true);
    });

    it("should fail when company is missing", async () => {
      const rawJob = createMockRawJob({ extractedCompany: "" });
      const result = await service.normalize(rawJob);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === "extractedCompany")).toBe(true);
    });

    it("should fail when URL is missing", async () => {
      const rawJob = createMockRawJob({ extractedUrl: "" });
      const result = await service.normalize(rawJob);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === "extractedUrl")).toBe(true);
    });

    it("should parse remote location correctly", async () => {
      const rawJob = createMockRawJob({
        extractedLocation: "Remote",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.isRemote).toBe(true);
      expect(result.job?.locationType).toBe("remote");
    });

    it("should parse hybrid location correctly", async () => {
      const rawJob = createMockRawJob({
        extractedLocation: "San Francisco, CA (Hybrid)",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.locationType).toBe("hybrid");
    });

    it("should extract seniority level from title", async () => {
      const testCases = [
        { title: "Junior Developer", expected: "junior" },
        { title: "Senior Engineer", expected: "senior" },
        { title: "Staff Software Engineer", expected: "staff" },
        { title: "Principal Engineer", expected: "principal" },
        { title: "Engineering Director", expected: "director" },
        { title: "VP of Engineering", expected: "vp" },
        { title: "Chief Technology Officer", expected: "c_level" },
      ];

      for (const { title, expected } of testCases) {
        const rawJob = createMockRawJob({ 
          extractedTitle: title,
          extractedDescription: `We are looking for a ${title}...`,
        });
        const result = await service.normalize(rawJob);
        expect(result.job?.seniorityLevel).toBe(expected);
      }
    });

    it("should parse salary range correctly", async () => {
      const rawJob = createMockRawJob({
        extractedSalary: "$120k - $150k per year",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.salaryMin).toBe(120000);
      expect(result.job?.salaryMax).toBe(150000);
      expect(result.job?.salaryCurrency).toBe("USD");
      expect(result.job?.salaryPeriod).toBe("yearly");
    });

    it("should parse hourly salary correctly", async () => {
      const rawJob = createMockRawJob({
        extractedSalary: "$50 - $70 per hour",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.salaryPeriod).toBe("hourly");
    });

    it("should extract skills from description", async () => {
      const rawJob = createMockRawJob({
        extractedDescription:
          "We need someone with strong TypeScript and React skills. Experience with Node.js and PostgreSQL is required. Familiarity with AWS is a plus.",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.requiredSkills.length).toBeGreaterThan(0);
      expect(result.warnings).toBeDefined();
    });

    it("should add warning when salary is not specified", async () => {
      const rawJob = createMockRawJob({
        extractedSalary: null,
      });
      const result = await service.normalize(rawJob);

      expect(result.success).toBe(true);
      expect(result.warnings?.some(w => w.includes("Зарплата"))).toBe(true);
    });

    it("should build canonical URL without tracking parameters", async () => {
      const rawJob = createMockRawJob({
        extractedUrl: "https://example.com/jobs/123?utm_source=linkedin&utm_medium=social",
      });
      const result = await service.normalize(rawJob);

      expect(result.job?.canonicalUrl).toBe("https://example.com/jobs/123");
      expect(result.job?.sourceUrl).toContain("utm_");
    });

    it("should parse job type from text", async () => {
      const testCases = [
        { type: "part_time", expected: "part_time" },
        { type: "contract", expected: "contract" },
        { type: "internship", expected: "internship" },
        { type: null, expected: "full_time" },
      ];

      for (const { type, expected } of testCases) {
        const rawJob = createMockRawJob({ extractedJobType: type });
        const result = await service.normalize(rawJob);
        expect(result.job?.jobType).toBe(expected);
      }
    });
  });
});
