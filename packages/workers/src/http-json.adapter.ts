/**
 * HTTP JSON Source Adapter
 * 
 * Читает вакансии из внешнего JSON API или статического файла
 */

import type { JobSource, RawJob } from "@ai-job-search/types";
import { SourceAdapter, CollectionResult, SourceConfig, CollectionOptions, RawJobInput } from "./source-adapter";

export class HttpJsonSourceAdapter implements SourceAdapter {
  readonly type = "http_json";
  readonly name = "HTTP JSON Feed";
  private config: SourceConfig = {};

  async initialize(config: SourceConfig): Promise<void> {
    this.config = config;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.config.baseUrl) return false;
    try {
      const resp = await fetch(this.config.baseUrl, { method: "HEAD" });
      return resp.ok;
    } catch (e) {
      return false;
    }
  }

  async collect(source: JobSource, options?: CollectionOptions): Promise<CollectionResult> {
    const startedAt = new Date();
    const errors: any[] = [];
    let collectedCount = 0;

    try {
      const url = this.config.searchUrl || this.config.baseUrl;
      if (!url) throw new Error("No URL configured for HttpJsonSourceAdapter");

      const response = await fetch(url, {
        headers: (this.config.headers as Record<string, string>) || {},
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Предполагаем, что данные — это массив объектов или объект с полем jobs
      const rawJobs = Array.isArray(data) ? data : (data.jobs || data.results || []);
      
      // Ограничиваем количество
      const limit = options?.limit || 100;
      const slicedJobs = rawJobs.slice(0, limit);

      collectedCount = slicedJobs.length;

      // В реальном сценарии мы бы сохраняли их в RawJob таблицу через handler
      // Но адаптер просто возвращает метаданные о результате сбора

      return {
        collectedCount,
        errorCount: 0,
        errors: [],
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      return {
        collectedCount: 0,
        errorCount: 1,
        errors: [{
          location: this.config.baseUrl || "unknown",
          code: "HTTP_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        }],
        startedAt,
        completedAt: new Date(),
      };
    }
  }

  async parseRawJob(rawData: any): Promise<RawJobInput> {
    // Маппинг полей на основе конфигурации или стандартных имен
    return {
      sourceJobId: rawData.id || rawData.jobId || String(Math.random()),
      rawPayload: rawData,
      extractedTitle: rawData.title || rawData.position || "Unknown Title",
      extractedCompany: rawData.company || rawData.employer || "Unknown Company",
      extractedLocation: rawData.location || rawData.city || null,
      extractedDescription: rawData.description || rawData.body || null,
      extractedUrl: rawData.url || rawData.link || "",
      extractedPostedAt: rawData.postedAt ? new Date(rawData.postedAt) : new Date(),
      extractedSalary: rawData.salary || null,
      extractedJobType: rawData.type || null,
    };
  }
}
