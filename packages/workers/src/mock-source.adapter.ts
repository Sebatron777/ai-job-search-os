/**
 * Mock Source Adapter
 * 
 * Тестовый адаптер для генерации mock вакансий
 * Используется для демонстрации и тестирования без реальных API
 */

import type { JobSource, RawJob } from "@ai-job-search/types";
import type { SourceAdapter, SourceConfig, CollectionOptions, CollectionResult, RawJobInput } from "./source-adapter";

/**
 * Mock данные для генерации вакансий
 */
const MOCK_JOBS = [
  {
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "remote",
    salary: "$150k - $200k",
    description: "We are looking for a Senior Frontend Engineer with React experience...",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
  },
  {
    title: "Backend Developer",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "hybrid",
    salary: "$130k - $170k",
    description: "Join our backend team to build scalable APIs with Node.js...",
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker"],
  },
  {
    title: "Full Stack Engineer",
    company: "Innovation Labs",
    location: "Remote",
    type: "remote",
    salary: "$140k - $180k",
    description: "Build end-to-end features using modern web technologies...",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
  },
  {
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Seattle, WA",
    type: "onsite",
    salary: "$160k - $210k",
    description: "Manage our cloud infrastructure and CI/CD pipelines...",
    skills: ["Kubernetes", "AWS", "Terraform", "Linux"],
  },
  {
    title: "Machine Learning Engineer",
    company: "AI Dynamics",
    location: "Boston, MA",
    type: "hybrid",
    salary: "$170k - $220k",
    description: "Develop and deploy ML models for production systems...",
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps"],
  },
];

/**
 * Mock Source Adapter
 */
export class MockSourceAdapter implements SourceAdapter {
  readonly type = "mock";
  readonly name = "Mock Job Source";

  private config: SourceConfig | null = null;

  async initialize(config: SourceConfig): Promise<void> {
    this.config = config;
    console.log("[MockSourceAdapter] Initialized with config:", config);
  }

  async healthCheck(): Promise<boolean> {
    // Mock всегда "здоров"
    return true;
  }

  async collect(source: JobSource, options?: CollectionOptions): Promise<CollectionResult> {
    console.log("[MockSourceAdapter] Starting collection for source:", source.name);
    
    const startedAt = new Date();
    const errors: Array<{ location: string; code: string; message: string }> = [];
    const collectedJobs: RawJobInput[] = [];

    // Генерируем mock вакансии
    const jobsToGenerate = options?.limit || MOCK_JOBS.length;
    
    for (let i = 0; i < Math.min(jobsToGenerate, MOCK_JOBS.length); i++) {
      const mockJob = MOCK_JOBS[i];
      
      try {
        const rawJob: RawJobInput = {
          sourceJobId: `mock-job-${Date.now()}-${i}`,
          rawPayload: { ...mockJob },
          extractedTitle: mockJob.title,
          extractedCompany: mockJob.company,
          extractedLocation: mockJob.location,
          extractedDescription: mockJob.description,
          extractedUrl: `https://mock.jobs/${mockJob.title.toLowerCase().replace(/\s+/g, "-")}`,
          extractedPostedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          extractedSalary: mockJob.salary,
          extractedJobType: this.parseJobType(mockJob.type),
          processingStatus: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        collectedJobs.push(rawJob);
      } catch (error) {
        errors.push({
          location: `mock-job-${i}`,
          code: "PARSE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const completedAt = new Date();

    return {
      collectedCount: collectedJobs.length,
      errorCount: errors.length,
      errors,
      startedAt,
      completedAt,
      collectedJobs,
    };
  }

  async parseRawJob(rawData: unknown): Promise<RawJobInput> {
    const data = rawData as Record<string, unknown>;
    
    return {
      sourceJobId: data.id as string || `mock-${Date.now()}`,
      rawPayload: data as Record<string, unknown>,
      extractedTitle: (data.title as string) || "Unknown Position",
      extractedCompany: (data.company as string) || "Unknown Company",
      extractedLocation: (data.location as string) || "Remote",
      extractedDescription: (data.description as string) || "",
      extractedUrl: (data.url as string) || "https://mock.jobs/unknown",
      extractedPostedAt: data.postedAt as Date || new Date(),
      extractedSalary: (data.salary as string) || "",
      extractedJobType: this.parseJobType(data.type as string),
      processingStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Парсинг типа занятости из строки
   */
  private parseJobType(type?: string): "full_time" | "part_time" | "contract" | "internship" {
    switch (type?.toLowerCase()) {
      case "part_time":
        return "part_time";
      case "contract":
        return "contract";
      case "internship":
        return "internship";
      default:
        return "full_time";
    }
  }

  /**
   * Получить список всех mock вакансий (для отладки)
   */
  static getAllMockJobs(): typeof MOCK_JOBS {
    return MOCK_JOBS;
  }
}

/**
 * Фабрика для создания Mock Source Adapter
 */
export class MockSourceAdapterFactory {
  static create(): MockSourceAdapter {
    return new MockSourceAdapter();
  }
}
