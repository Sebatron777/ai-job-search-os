import { describe, it, expect, beforeEach } from "vitest";
import {
  DeduplicationService,
  SimHash,
  FingerprintRepository,
} from "./deduplication.service";

describe("DeduplicationService", () => {
  let service: DeduplicationService;
  let mockRepository: FingerprintRepository;

  beforeEach(() => {
    mockRepository = {
      findByFingerprint: async () => null,
      findByUrlHash: async () => null,
      findByTitleCompanyLocation: async () => null,
      create: async (data: any) => ({
        id: "fp-1",
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      addJobToFingerprint: async (id: string, jobId: string) => ({
        id,
        jobIds: [jobId],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    service = new DeduplicationService(mockRepository);
  });

  describe("createFingerprint", () => {
    it("should create consistent fingerprints for the same input", () => {
      const jobData = {
        canonicalUrl: "https://example.com/jobs/123",
        sourceJobId: "job-123",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      const fp1 = service.createFingerprint(jobData);
      const fp2 = service.createFingerprint(jobData);

      expect(fp1.fingerprint).toBe(fp2.fingerprint);
      expect(fp1.canonicalUrlHash).toBe(fp2.canonicalUrlHash);
    });

    it("should create different fingerprints for different URLs", () => {
      const job1 = {
        canonicalUrl: "https://example.com/jobs/123",
        sourceJobId: "job-123",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      const job2 = {
        ...job1,
        canonicalUrl: "https://example.com/jobs/456",
      };

      const fp1 = service.createFingerprint(job1);
      const fp2 = service.createFingerprint(job2);

      expect(fp1.fingerprint).not.toBe(fp2.fingerprint);
    });

    it("should normalize titles before hashing", () => {
      const job1 = {
        canonicalUrl: "https://example.com/jobs/123",
        sourceJobId: "job-123",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      const job2 = {
        ...job1,
        title: "Sr. Software Engineer II",
      };

      const fp1 = service.createFingerprint(job1);
      const fp2 = service.createFingerprint(job2);

      // Нормализованные заголовки должны быть одинаковыми
      expect(fp1.normalizedTitleHash).toBe(fp2.normalizedTitleHash);
    });

    it("should normalize company names before hashing", () => {
      const job1 = {
        canonicalUrl: "https://example.com/jobs/123",
        sourceJobId: "job-123",
        title: "Software Engineer",
        company: "Tech Corp Inc.",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      const job2 = {
        ...job1,
        company: "Tech Corp LLC",
      };

      const fp1 = service.createFingerprint(job1);
      const fp2 = service.createFingerprint(job2);

      // Нормализованные компании должны быть одинаковыми
      expect(fp1.normalizedCompanyHash).toBe(fp2.normalizedCompanyHash);
    });
  });

  describe("checkDuplicate", () => {
    it("should detect duplicate by canonical URL", async () => {
      const jobData = {
        canonicalUrl: "https://example.com/jobs/123",
        sourceJobId: "job-123",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      // Mock repository to return existing fingerprint for URL
      mockRepository.findByUrlHash = async () => ({
        id: "fp-existing",
        canonicalUrlHash: "hash123",
        sourceJobIdHash: "hash456",
        normalizedTitleHash: "hash789",
        normalizedCompanyHash: "hashabc",
        descriptionHash: "hashdef",
        locationHash: "hashghi",
        postedDateBucket: "2024-01-15",
        fingerprint: "fingerprint123",
        jobIds: ["job-existing"],
        workspaceId: "ws-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkDuplicate(jobData, "ws-1");

      expect(result.isDuplicate).toBe(true);
      expect(result.reason).toBe("SAME_CANONICAL_URL");
    });

    it("should not detect duplicate for new job", async () => {
      const jobData = {
        canonicalUrl: "https://example.com/jobs/new",
        sourceJobId: "job-new",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "We are hiring...",
        location: "San Francisco, CA",
        postedAt: new Date("2024-01-15"),
      };

      const result = await service.checkDuplicate(jobData, "ws-1");

      expect(result.isDuplicate).toBe(false);
      expect(result.fingerprint).toBeDefined();
    });
  });
});

describe("SimHash", () => {
  let simhash: SimHash;

  beforeEach(() => {
    simhash = new SimHash(64);
  });

  it("should compute simhash for text", () => {
    const text = "This is a sample text for testing";
    const hash = simhash.compute(text);

    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should produce similar hashes for similar texts", () => {
    const text1 = "Software Engineer with React experience";
    const text2 = "Software Engineer with React and Node experience";
    const text3 = "Marketing Manager for tech company";

    const hash1 = simhash.compute(text1);
    const hash2 = simhash.compute(text2);
    const hash3 = simhash.compute(text3);

    const similarity12 = simhash.similarity(hash1, hash2);
    const similarity13 = simhash.similarity(hash1, hash3);

    // Похожие тексты должны иметь большую схожесть
    expect(similarity12).toBeGreaterThan(similarity13);
  });

  it("should produce identical hashes for identical texts", () => {
    const text = "Identical text";
    const hash1 = simhash.compute(text);
    const hash2 = simhash.compute(text);

    expect(hash1).toBe(hash2);
    expect(simhash.similarity(hash1, hash2)).toBe(1);
  });

  it("should calculate Hamming distance correctly", () => {
    const hash1 = "0000000000000000";
    const hash2 = "0000000000000001";
    const hash3 = "0000000000000011";

    expect(simhash.hammingDistance(hash1, hash2)).toBe(1);
    expect(simhash.hammingDistance(hash1, hash3)).toBe(2);
    expect(simhash.hammingDistance(hash1, hash1)).toBe(0);
  });
});
