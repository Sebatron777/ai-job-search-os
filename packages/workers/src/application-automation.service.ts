/**
 * Сервис автоматизации откликов на вакансии
 * 
 * Поддерживает:
 * - API-driven apply (Greenhouse, Lever, etc.)
 * - Playwright browser automation
 * - Retry logic с exponential backoff
 * - Artifact capture (screenshots, confirmation numbers)
 */

import type { Application, ApplyAttempt, ApplyArtifact } from "@ai-job-search/types";

/**
 * Статус попытки отклика
 */
export type ApplyStatus = "pending" | "in_progress" | "success" | "failed" | "retry_scheduled";

/**
 * Результат попытки отклика
 */
export interface ApplyAttemptResult {
  /** Статус */
  status: ApplyStatus;
  /** Успешно ли */
  success: boolean;
  /** Сообщение */
  message?: string;
  /** Код ошибки */
  errorCode?: string;
  /** Артефакты */
  artifacts: ApplyArtifactData[];
  /** Можно ли повторить */
  retryable: boolean;
  /** Рекомендация */
  recommendation?: string;
}

/**
 * Данные артефакта
 */
export interface ApplyArtifactData {
  /** Тип артефакта */
  type: ApplyArtifactType;
  /** Storage key (для файлов) */
  storageKey?: string;
  /** Content (для текста) */
  content?: string;
  /** Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * Типы артефактов
 */
export type ApplyArtifactType =
  | "screenshot_success"
  | "screenshot_error"
  | "confirmation_page"
  | "confirmation_number"
  | "submission_receipt"
  | "error_message"
  | "form_validation_error";

/**
 * Контекст отклика
 */
export interface ApplyContext {
  /** ID приложения */
  applicationId: string;
  /** ID вакансии */
  jobId: string;
  /** URL для отклика */
  applyUrl: string;
  /** Provider (linkedin, greenhouse, lever, etc.) */
  provider?: string;
  /** Метод отклика */
  submitMethod: "manual" | "assisted" | "auto_safe" | "auto_full" | "api" | "playwright";
  /** Cover letter */
  coverLetter?: string;
  /** Intro message */
  introMessage?: string;
  /** Custom answers */
  customAnswers?: Record<string, string>;
  /** Resume storage key */
  resumeStorageKey?: string;
  /** Portfolio links */
  portfolioLinks?: Array<{ url: string; title: string }>;
}

/**
 * Конфигурация retry logic
 */
export interface RetryConfig {
  /** Максимум попыток */
  maxRetries: number;
  /** Начальная задержка (мс) */
  initialDelayMs: number;
  /** Максимальная задержка (мс) */
  maxDelayMs: number;
  /** Множитель для exponential backoff */
  backoffMultiplier: number;
}

/**
 * Интерфейс для apply adapter
 */
export interface ApplyAdapter {
  /**
   * Название провайдера
   */
  readonly provider: string;

  /**
   * Проверка доступности
   */
  healthCheck(): Promise<boolean>;

  /**
   * Отклик на вакансию
   */
  apply(context: ApplyContext): Promise<ApplyAttemptResult>;

  /**
   * Проверка статуса отклика
   */
  checkStatus(applicationId: string): Promise<ApplyStatus>;
}

/**
 * Стратегия заполнения форм
 */
export interface FormStrategy {
  /**
   * Заполнить поле формы
   */
  fillField(field: string, value: string): Promise<void>;

  /**
   * Загрузить файл
   */
  uploadFile(field: string, fileKey: string): Promise<void>;

  /**
   * Отправить форму
   */
  submit(): Promise<void>;

  /**
   * Обработать ошибки валидации
   */
  handleValidationErrors(): Promise<ValidationError[]>;
}

/**
 * Ошибка валидации формы
 */
export interface ValidationError {
  /** Поле */
  field: string;
  /** Сообщение */
  message: string;
}

/**
 * Сервис автоматизации откликов
 */
export class ApplicationAutomationService {
  private adapters: Map<string, ApplyAdapter>;
  private retryConfig: RetryConfig;

  constructor(config?: { retry?: Partial<RetryConfig> }) {
    this.adapters = new Map();
    this.retryConfig = {
      maxRetries: 3,
      initialDelayMs: 2000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      ...config?.retry,
    };
  }

  /**
   * Зарегистрировать adapter
   */
  registerAdapter(adapter: ApplyAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  /**
   * Получить adapter по provider
   */
  getAdapter(provider: string): ApplyAdapter | undefined {
    return this.adapters.get(provider);
  }

  /**
   * Выполнить попытку отклика
   */
  async attemptApply(context: ApplyContext): Promise<ApplyAttemptResult> {
    // Получить adapter
    const adapter = this.getAdapter(context.provider || "default");

    if (!adapter) {
      return {
        status: "failed",
        success: false,
        message: `No adapter found for provider: ${context.provider}`,
        errorCode: "NO_ADAPTER",
        artifacts: [],
        retryable: false,
        recommendation: "Manual application required",
      };
    }

    try {
      // Проверка health
      const isHealthy = await adapter.healthCheck();
      if (!isHealthy) {
        throw new Error(`Provider ${context.provider} is unavailable`);
      }

      // Выполнить отклик
      const result = await adapter.apply(context);

      return result;
    } catch (error) {
      return {
        status: "failed",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: "APPLY_ERROR",
        artifacts: [],
        retryable: true,
        recommendation: "Retry with exponential backoff",
      };
    }
  }

  /**
   * Рассчитать задержку для retry
   */
  calculateRetryDelay(attemptNumber: number): number {
    const delay =
      this.retryConfig.initialDelayMs *
      Math.pow(this.retryConfig.backoffMultiplier, attemptNumber - 1);

    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Определить: стоит ли retry
   */
  shouldRetry(result: ApplyAttemptResult, attemptNumber: number): boolean {
    // Не retry если не retryable
    if (!result.retryable) {
      return false;
    }

    // Не retry если превышен лимит
    if (attemptNumber >= this.retryConfig.maxRetries) {
      return false;
    }

    // Retry если ошибка временная
    const retryableErrors = [
      "TIMEOUT",
      "NETWORK_ERROR",
      "RATE_LIMITED",
      "PROVIDER_ERROR",
    ];

    if (result.errorCode && retryableErrors.includes(result.errorCode)) {
      return true;
    }

    return false;
  }

  /**
   * Создать artifact
   */
  createArtifact(
    type: ApplyArtifactType,
    content?: string,
    storageKey?: string,
    metadata?: Record<string, unknown>
  ): ApplyArtifactData {
    return {
      type,
      content,
      storageKey,
      metadata,
    };
  }

  /**
   * Обработать успешный отклик
   */
  handleSuccess(confirmationNumber?: string, confirmationPage?: string): ApplyAttemptResult {
    const artifacts: ApplyArtifactData[] = [];

    if (confirmationNumber) {
      artifacts.push(
        this.createArtifact("confirmation_number", confirmationNumber)
      );
    }

    if (confirmationPage) {
      artifacts.push(
        this.createArtifact("confirmation_page", undefined, confirmationPage)
      );
    }

    return {
      status: "success",
      success: true,
      message: "Application submitted successfully",
      artifacts,
      retryable: false,
    };
  }

  /**
   * Обработать ошибку отклика
   */
  handleFailure(
    error: Error,
    screenshotKey?: string
  ): ApplyAttemptResult {
    const artifacts: ApplyArtifactData[] = [];

    if (screenshotKey) {
      artifacts.push(
        this.createArtifact("screenshot_error", undefined, screenshotKey, {
          errorMessage: error.message,
        })
      );
    }

    artifacts.push(
      this.createArtifact("error_message", error.message)
    );

    return {
      status: "failed",
      success: false,
      message: error.message,
      errorCode: this.mapErrorCode(error),
      artifacts,
      retryable: this.isRetryableError(error),
      recommendation: this.getFailureRecommendation(error),
    };
  }

  /**
   * Распознать тип ошибки
   */
  private mapErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("timeout")) return "TIMEOUT";
    if (message.includes("network")) return "NETWORK_ERROR";
    if (message.includes("rate limit")) return "RATE_LIMITED";
    if (message.includes("unavailable")) return "PROVIDER_ERROR";
    if (message.includes("validation")) return "VALIDATION_ERROR";

    return "UNKNOWN_ERROR";
  }

  /**
   * Проверка: retryable ли ошибка
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const retryablePatterns = [
      "timeout",
      "network",
      "rate limit",
      "temporarily unavailable",
      "try again later",
    ];

    return retryablePatterns.some((pattern) => message.includes(pattern));
  }

  /**
   * Получить рекомендацию при ошибке
   */
  private getFailureRecommendation(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("validation")) {
      return "Fix validation errors and retry";
    }
    if (message.includes("rate limit")) {
      return "Wait and retry with exponential backoff";
    }
    if (message.includes("network") || message.includes("timeout")) {
      return "Check connection and retry";
    }

    return "Manual application recommended";
  }
}

/**
 * Mock apply adapter для тестирования
 */
export class MockApplyAdapter implements ApplyAdapter {
  readonly provider = "mock";

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async apply(context: ApplyContext): Promise<ApplyAttemptResult> {
    // Симуляция успешного отклика
    return {
      status: "success",
      success: true,
      message: "Mock application submitted",
      artifacts: [
        {
          type: "confirmation_number",
          content: `MOCK-${Date.now()}`,
        },
      ],
      retryable: false,
    };
  }

  async checkStatus(): Promise<ApplyStatus> {
    return "success";
  }
}
