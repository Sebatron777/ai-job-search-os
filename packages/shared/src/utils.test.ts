import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizeCompanyName,
  normalizeJobTitle,
  createFingerprint,
  calculateSimilarity,
  hasOverlap,
  truncateText,
  extractDomain,
  getDateBucket,
  paginateArray,
} from "./utils";

describe("utils", () => {
  describe("normalizeText", () => {
    it("should lowercase and trim text", () => {
      expect(normalizeText("  Hello World  ")).toBe("hello world");
    });

    it("should remove extra spaces", () => {
      expect(normalizeText("hello   world")).toBe("hello world");
    });

    it("should remove special characters", () => {
      expect(normalizeText("Hello! World?")).toBe("hello world");
    });
  });

  describe("normalizeCompanyName", () => {
    it("should remove corporate suffixes", () => {
      expect(normalizeCompanyName("Acme Inc.")).toBe("acme");
      expect(normalizeCompanyName("Tech Corp")).toBe("tech");
      expect(normalizeCompanyName("Startup LLC")).toBe("startup");
    });

    it("should handle case insensitivity", () => {
      expect(normalizeCompanyName("ACME INC")).toBe("acme");
    });
  });

  describe("normalizeJobTitle", () => {
    it("should remove seniority prefixes", () => {
      expect(normalizeJobTitle("Senior Engineer")).toBe("engineer");
      expect(normalizeJobTitle("Junior Developer")).toBe("developer");
    });

    it("should remove roman numerals", () => {
      expect(normalizeJobTitle("Software Engineer III")).toBe("software engineer");
    });
  });

  describe("createFingerprint", () => {
    it("should create consistent fingerprints", () => {
      const fp1 = createFingerprint("a", "b", "c");
      const fp2 = createFingerprint("a", "b", "c");
      expect(fp1).toBe(fp2);
    });

    it("should create different fingerprints for different inputs", () => {
      const fp1 = createFingerprint("a", "b", "c");
      const fp2 = createFingerprint("a", "b", "d");
      expect(fp1).not.toBe(fp2);
    });
  });

  describe("calculateSimilarity", () => {
    it("should return 1 for identical arrays", () => {
      expect(calculateSimilarity([1, 2, 3], [1, 2, 3])).toBe(1);
    });

    it("should return 0 for completely different arrays", () => {
      expect(calculateSimilarity([1, 2, 3], [4, 5, 6])).toBe(0);
    });

    it("should calculate partial overlap", () => {
      expect(calculateSimilarity([1, 2, 3], [2, 3, 4])).toBeCloseTo(0.5);
    });
  });

  describe("hasOverlap", () => {
    it("should return true for overlapping arrays", () => {
      expect(hasOverlap([1, 2, 3], [3, 4, 5])).toBe(true);
    });

    it("should return false for non-overlapping arrays", () => {
      expect(hasOverlap([1, 2, 3], [4, 5, 6])).toBe(false);
    });
  });

  describe("truncateText", () => {
    it("should not truncate short text", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    it("should truncate long text", () => {
      expect(truncateText("Hello World", 8)).toBe("Hello Wo...");
    });

    it("should try to break at word boundaries", () => {
      const result = truncateText("Hello World Test", 12);
      expect(result).toMatch(/\.\.\.$/);
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from URL", () => {
      expect(extractDomain("https://www.example.com/path")).toBe("example.com");
    });

    it("should remove www prefix", () => {
      expect(extractDomain("http://www.google.com")).toBe("google.com");
    });

    it("should return empty string for invalid URL", () => {
      expect(extractDomain("not-a-url")).toBe("");
    });
  });

  describe("getDateBucket", () => {
    it("should return YYYY-MM-DD format", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(getDateBucket(date)).toBe("2024-01-15");
    });
  });

  describe("paginateArray", () => {
    it("should paginate correctly", () => {
      const array = [1, 2, 3, 4, 5];
      const { items, pagination } = paginateArray(array, 1, 2);
      
      expect(items).toEqual([1, 2]);
      expect(pagination.total).toBe(5);
      expect(pagination.totalPages).toBe(3);
      expect(pagination.hasMore).toBe(true);
    });

    it("should handle last page", () => {
      const array = [1, 2, 3, 4, 5];
      const { items, pagination } = paginateArray(array, 3, 2);
      
      expect(items).toEqual([5]);
      expect(pagination.hasMore).toBe(false);
    });
  });
});
