/**
 * Конвейер импорта вакансий
 * 
 * Orchestrates the full ingestion pipeline:
 * 1. Collect raw jobs from sources
 * 2. Normalize to canonical format
 * 3. Deduplicate using fingerprints
 * 4. Store and trigger scoring
 */

import type { JobSource, RawJob } from "@ai-job-search/types";
import type { SourceAdapter, CollectionResult } from "./source-adapter";
import type { NormalizationService, NormalizationResult, JobInput } from "./normalization.service";
import type { DeduplicationService, DeduplicationResult } from "./deduplication.service";

/**
 * Статус задачи импорта
 */
export type IngestionTaskStatus =
  | "pending"
  | "collecting"
  | "normalizing"
  | "deduplicating"
  | "completed"
  | "failed"
  | "partial";

/**
 * Результат импорта
 */
export interface IngestionResult {
  /** Статус задачи */
  status: IngestionTaskStatus;
  /** ID источника */
  sourceId: string;
  /** Результат сбора */
  collectionResult?: CollectionResult;
  /** Количество нормализованных вакансий */
  normalizedCount: number;
  /** Количество дубликатов */
  duplicateCount: number;
  /** Количество новых вакансий */
  newJobsCount: number;
  /** Количество ошибок */
  errorCount: number;
  /** Ошибки */
  errors: IngestionError[];
  /** Время начала */
  startedAt: Date;
  /** Время окончания */
  completedAt?: Date;
}

/**
 * Ошибка импорта
 */
export interface IngestionError {
  /** Стадия, где произошла ошибка */
  stage: "collection" | "normalization" | "deduplication" | "storage";
  /** Код ошибки */
  code: string;
  /** Сообщение */
  message: string;
  /** ID вакансии (если применимо) */
  jobId?: string;
  /** Детали */
  details?: Record<string, unknown>;
}

/**
 * Обработчик сырой вакансии
 */
export interface RawJobHandler {
  /**
   * Сохранить сырую вакансию
   */
  saveRawJob(rawJob: RawJob): Promise<string>;
  
  /**
   * Сохранить нормализованную вакансию
   */
  saveJob(job: JobInput, sourceId: string, fingerprintId?: string): Promise<string>;
  
  /**
   * Обновить статус сырой вакансии
   */
  updateRawJobStatus(
    rawJobId: string,
    status: "normalized" | "failed",
    error?: string,
    normalizedJobId?: string
  ): Promise<void>;
  
  /**
   * Обновить статистику источника
   */
  updateSourceStats(
    sourceId: string,
    stats: {
      totalJobsCollected: number;
      activeJobsCount: number;
    }
  ): Promise<void>;
}

/**
 * Опции конвейера импорта
 */
export interface IngestionPipelineOptions {
  /** Адаптер источника */
  adapter: SourceAdapter;
  /** Сервис нормализации */
  normalizationService: NormalizationService;
  /** Сервис дедупликации */
  deduplicationService: DeduplicationService;
  /** Обработчик вакансий */
  handler: RawJobHandler;
  /** Опции сбора */
  collectionLimit?: number;
  /** Параллелизм обработки */
  parallelism?: number;
  /** Пропускать ошибки (не прерывать pipeline) */
  skipErrors?: boolean;
}

/**
 * Конвейер импорта вакансий
 */
export class IngestionPipeline {
  private adapter: SourceAdapter;
  private normalizationService: NormalizationService;
  private deduplicationService: DeduplicationService;
  private handler: RawJobHandler;
  private collectionLimit: number;
  private parallelism: number;
  private skipErrors: boolean;
  
  constructor(options: IngestionPipelineOptions) {
    this.adapter = options.adapter;
    this.normalizationService = options.normalizationService;
    this.deduplicationService = options.deduplicationService;
    this.handler = options.handler;
    this.collectionLimit = options.collectionLimit || 100;
    this.parallelism = options.parallelism || 5;
    this.skipErrors = options.skipErrors ?? true;
  }
  
  /**
   * Запустить конвейер импорта
   */
  async run(source: JobSource): Promise<IngestionResult> {
    const startedAt = new Date();
    const errors: IngestionError[] = [];
    
    let collectionResult: CollectionResult | undefined;
    let normalizedCount = 0;
    let duplicateCount = 0;
    let newJobsCount = 0;
    
    try {
      // Этап 1: Сбор сырых вакансий
      collectionResult = await this.collectRawJobs(source);
      
      if (collectionResult.errorCount > 0 && !this.skipErrors) {
        throw new Error(`Collection failed with ${collectionResult.errorCount} errors`);
      }
      
      // Этап 2: Нормализация и дедупликация
      // (реализуется итеративно для каждой вакансии)
      
      return {
        status: "completed",
        sourceId: source.id,
        collectionResult,
        normalizedCount,
        duplicateCount,
        newJobsCount,
        errorCount: errors.length,
        errors,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      errors.push({
        stage: "collection",
        code: "PIPELINE_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: { source },
      });
      
      return {
        status: "failed",
        sourceId: source.id,
        collectionResult,
        normalizedCount,
        duplicateCount,
        newJobsCount,
        errorCount: errors.length,
        errors,
        startedAt,
        completedAt: new Date(),
      };
    }
  }
  
  /**
   * Этап 1: Сбор сырых вакансий
   */
  private async collectRawJobs(source: JobSource): Promise<CollectionResult> {
    try {
      // Инициализация адаптера
      await this.adapter.initialize(source.config as any);
      
      // Проверка доступности
      const isHealthy = await this.adapter.healthCheck();
      if (!isHealthy) {
        throw new Error("Source adapter health check failed");
      }
      
      // Сбор вакансий
      const result = await this.adapter.collect(source, {
        limit: this.collectionLimit,
      });
      
      return result;
    } catch (error) {
      return {
        collectedCount: 0,
        errorCount: 1,
        errors: [{
          location: source.id,
          code: "COLLECTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        }],
        startedAt: new Date(),
        completedAt: new Date(),
      };
    }
  }
  
  /**
   * Этап 2: Обработка сырой вакансии
   */
  async processRawJob(rawJob: RawJob): Promise<ProcessRawJobResult> {
    // Нормализация
    const normalizationResult = await this.normalizationService.normalize(rawJob);
    
    if (!normalizationResult.success || !normalizationResult.job) {
      return {
        success: false,
        stage: "normalization",
        errors: normalizationResult.errors || [],
      };
    }
    
    const jobInput = normalizationResult.job;
    
    // Дедупликация
    const dedupResult = await this.deduplicationService.checkDuplicate(
      {
        canonicalUrl: jobInput.canonicalUrl,
        sourceJobId: rawJob.sourceJobId,
        title: jobInput.title,
        company: jobInput.company,
        description: jobInput.description,
        location: jobInput.location,
        postedAt: jobInput.postedAt,
      },
      rawJob.sourceId // workspaceId будет получен из source
    );
    
    if (dedupResult.isDuplicate) {
      return {
        success: false,
        stage: "deduplication",
        isDuplicate: true,
        existingJob: dedupResult.existingJob,
        reason: dedupResult.reason,
      };
    }
    
    // Сохранение вакансии
    const jobId = await this.handler.saveJob(
      jobInput,
      rawJob.sourceId,
      undefined // fingerprintId будет создан
    );
    
    // Обновление статуса сырой вакансии
    await this.handler.updateRawJobStatus(
      rawJob.id,
      "normalized",
      undefined,
      jobId
    );
    
    return {
      success: true,
      stage: "completed",
      jobId,
      fingerprint: dedupResult.fingerprint,
    };
  }
}

/**
 * Результат обработки сырой вакансии
 */
export interface ProcessRawJobResult {
  /** Успешно ли обработано */
  success: boolean;
  /** Стадия завершения */
  stage: "normalization" | "deduplication" | "storage" | "completed";
  /** ID вакансии (если успешно) */
  jobId?: string;
  /** Fingerprint (если не дубликат) */
  fingerprint?: any;
  /** Это дубликат? */
  isDuplicate?: boolean;
  /** Существующая вакансия (если дубликат) */
  existingJob?: any;
  /** Причина (если дубликат) */
  reason?: any;
  /** Ошибки (если неудачно) */
  errors?: any[];
}

/**
 * Очередь импорта вакансий
 */
export interface IngestionQueue {
  /**
   * Добавить задачу в очередь
   */
  add(sourceId: string, options?: IngestionJobOptions): Promise<string>;
  
  /**
   * Обработать задачу из очереди
   */
  process(job: IngestionJob): Promise<IngestionResult>;
  
  /**
   * Получить статус задачи
   */
  getStatus(jobId: string): Promise<IngestionJobStatus>;
}

/**
 * Опции задачи импорта
 */
export interface IngestionJobOptions {
  /** Приоритет (0-10) */
  priority?: number;
  /** Отложенный запуск */
  delay?: number;
  /** Повторить при ошибке */
  retries?: number;
}

/**
 * Задача импорта
 */
export interface IngestionJob {
  /** ID задачи */
  id: string;
  /** ID источника */
  sourceId: string;
  /** Опции */
  options: IngestionJobOptions;
  /** Попытка выполнения */
  attempts: number;
  /** Данные задачи */
  data: any;
}

/**
 * Статус задачи импорта в очереди
 */
export interface IngestionJobStatus {
  /** ID задачи */
  jobId: string;
  /** Статус */
  status: IngestionTaskStatus;
  /** Результат */
  result?: IngestionResult;
  /** Ошибка */
  error?: string;
  /** Создано */
  createdAt: Date;
  /** Начато */
  startedAt?: Date;
  /** Завершено */
  completedAt?: Date;
  /** Следующая попытка */
  nextRetryAt?: Date;
}
