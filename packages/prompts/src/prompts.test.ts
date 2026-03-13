import { describe, it, expect } from "vitest";
import {
  buildMatchingPrompt,
  buildCoverLetterPrompt,
  buildIntroMessagePrompt,
} from "./prompts";

describe("prompts", () => {
  const mockCandidate = {
    firstName: "John",
    lastName: "Doe",
    headline: "Senior Software Engineer",
    email: "john@example.com",
    currentTitle: "Senior Engineer",
    currentCompany: "Tech Corp",
    yearsOfExperience: 5,
    skills: ["TypeScript", "React", "Node.js", "Python"],
    preferredKeywords: ["remote", "startup"],
    excludedKeywords: ["enterprise"],
  };

  const mockJob = {
    title: "Senior Frontend Engineer",
    company: "StartupXYZ",
    location: "San Francisco, CA",
    locationType: "remote" as const,
    jobType: "full_time" as const,
    seniorityLevel: "senior" as const,
    salaryDisplay: "$150k - $200k",
    requiredSkills: ["React", "TypeScript", "CSS"],
    preferredSkills: ["Next.js", "GraphQL"],
    description: "We are looking for a Senior Frontend Engineer...",
    responsibilities: ["Build features", "Mentor juniors"],
  };

  describe("buildMatchingPrompt", () => {
    it("should build a matching prompt with all required fields", () => {
      const prompt = buildMatchingPrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        includeReasoning: true,
      });

      expect(prompt).toContain("Candidate Profile");
      expect(prompt).toContain("John Doe");
      expect(prompt).toContain("Job Posting");
      expect(prompt).toContain("Senior Frontend Engineer");
      expect(prompt).toContain("Task");
      expect(prompt).toContain("JSON");
    });

    it("should include all candidate skills", () => {
      const prompt = buildMatchingPrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        includeReasoning: true,
      });

      mockCandidate.skills.forEach((skill) => {
        expect(prompt).toContain(skill);
      });
    });
  });

  describe("buildCoverLetterPrompt", () => {
    it("should build a cover letter prompt", () => {
      const prompt = buildCoverLetterPrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        tone: "professional",
        maxLength: 250,
      });

      expect(prompt).toContain("Generate a cover letter");
      expect(prompt).toContain("John Doe");
      expect(prompt).toContain("StartupXYZ");
      expect(prompt).toContain("professional");
    });

    it("should include tone instructions", () => {
      const prompt = buildCoverLetterPrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        tone: "concise",
      });

      expect(prompt).toContain("Be direct and brief");
    });
  });

  describe("buildIntroMessagePrompt", () => {
    it("should build an intro message prompt", () => {
      const prompt = buildIntroMessagePrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        platform: "linkedin",
      });

      expect(prompt).toContain("Generate a short intro message");
      expect(prompt).toContain("LinkedIn-friendly");
      expect(prompt).toContain("300 characters");
    });

    it("should support different platforms", () => {
      const emailPrompt = buildIntroMessagePrompt({
        candidate: mockCandidate as any,
        job: mockJob as any,
        platform: "email",
      });

      expect(emailPrompt).toContain("150 words");
    });
  });
});
