/**
 * LLM-assisted сервис для анализа вакансий
 * 
 * Использует LLM для:
 * - Reasoning summary
 * - Hard fail detection
 * - Implied seniority
 * - Risk flags
 * - Recommendation
 */

import type { CandidateProfile, Job } from "@ai-job-search/types";
import { buildMatchingPrompt } from "@ai-job-search/prompts";

/**
 * Результат LLM анализа
 */
export interface LLMAnalysisResult {
  /** Reasoning summary */
  reasoning: string;
  /** Рекомендация */
  recommendation: MatchRecommendation;
  /** Hard fail причины */
  hardFailReasons: HardFailReason[];
  /** Risk flags */
  riskFlags: RiskFlag[];
  /** Implied seniority (если отличается от указанного) */
  impliedSeniority?: string;
  /** Confidence в анализе (0-1) */
  confidence: number;
  /** Рекомендуемый режим отклика */
  recommendedApplyMode?: "manual" | "assisted" | "auto";
  /** Токены и стоимость */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost?: number;
  };
}

/**
 * Типы рекомендаций
 */
export type MatchRecommendation =
  | "highly_recommended"
  | "recommended"
  | "neutral"
  | "not_recommended"
  | "avoid";

/**
 * Hard fail причины
 */
export type HardFailReason =
  | "seniority_mismatch"
  | "skill_gap_critical"
  | "location_dealbreaker"
  | "salary_below_minimum"
  | "work_mode_incompatible"
  | "excluded_company"
  | "excluded_keyword"
  | "visa_sponsorship_required"
  | "relocation_required";

/**
 * Risk flag
 */
export interface RiskFlag {
  /** Тип риска */
  type: RiskFlagType;
  /** Серьёзность */
  severity: "low" | "medium" | "high";
  /** Сообщение */
  message: string;
  /** Детали */
  details?: Record<string, unknown>;
}

/**
 * Типы рисков
 */
export type RiskFlagType =
  | "job_posting_age" // Старая вакансия
  | "salary_transparency" // Нет зарплаты
  | "vague_description" // Непонятное описание
  | "too_many_requirements" // Нереалистичные требования
  | "company_reputation" // Негативные отзывы
  | "high_turnover_signal" // Частая смена сотрудников
  | "scam_likelihood" // Возможно мошенничество
  | "duplicate_posting" // Дубликат
  | "ghost_job"; // Вакансия не активна

/**
 * LLM клиент интерфейс
 */
export interface LLMClient {
  /**
   * Generate completion
   */
  generate(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
}

/**
 * Опции для LLM
 */
export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
}

/**
 * Ответ от LLM
 */
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model?: string;
  };
}

/**
 * Конфигурация LLM сервиса
 */
export interface LLMScoringConfig {
  /** Включить LLM анализ */
  enabled: boolean;
  /** Минимальный confidence для auto-apply */
  minConfidenceForAuto: number;
  /** Максимальная температура */
  temperature: number;
}

/**
 * LLM-assisted сервис скоринга
 */
export class LLMScoringService {
  private client: LLMClient | null;
  private config: LLMScoringConfig;

  constructor(client?: LLMClient, config?: Partial<LLMScoringConfig>) {
    this.client = client || null;
    this.config = {
      enabled: true,
      minConfidenceForAuto: 0.8,
      temperature: 0.3,
      ...config,
    };
  }

  /**
   * Проанализировать вакансию с помощью LLM
   */
  async analyze(
    job: Job,
    candidate: CandidateProfile
  ): Promise<LLMAnalysisResult> {
    // Если LLM не подключён, возвращаем дефолтный результат
    if (!this.client || !this.config.enabled) {
      return this.getDefaultAnalysis(job, candidate);
    }

    try {
      // Строим промт
      const prompt = buildMatchingPrompt({
        candidate,
        job,
        includeReasoning: true,
      });

      // Запрашиваем анализ у LLM
      const response = await this.client.generate(prompt, {
        temperature: this.config.temperature,
        responseFormat: "json",
      });

      // Парсим ответ
      const result = this.parseLLMResponse(response.content, job, candidate);

      // Добавляем инфо об использовании
      if (response.usage) {
        result.usage = {
          ...response.usage,
          estimatedCost: this.calculateUsageCost(response.usage),
        };
      }

      return result;
    } catch (error) {
      console.error("LLM analysis failed:", error);
      // Возвращаем дефолтный анализ при ошибке
      return this.getDefaultAnalysis(job, candidate);
    }
  }

  /**
   * Вычислить примерную стоимость запроса (в USD)
   */
  private calculateUsageCost(usage: { promptTokens: number; completionTokens: number; model?: string }): number {
    const model = usage.model || "";
    
    // Цены за 1M токенов (примерные)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      "claude-3-5-sonnet-20240620": { prompt: 3, completion: 15 },
      "claude-3-5-sonnet-20241022": { prompt: 3, completion: 15 },
      "claude-3-opus-20240229": { prompt: 15, completion: 75 },
      "claude-3-haiku-20240307": { prompt: 0.25, completion: 1.25 },
      "gpt-4o": { prompt: 5, completion: 15 },
      "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
    };

    // Находим наиболее подходящую цену
    const modelKey = Object.keys(pricing).find(k => model.includes(k)) || "claude-3-5-sonnet-20241022";
    const prices = pricing[modelKey];

    const promptCost = (usage.promptTokens / 1_000_000) * prices.prompt;
    const completionCost = (usage.completionTokens / 1_000_000) * prices.completion;

    return Number((promptCost + completionCost).toFixed(6));
  }

  /**
   * Определить hard fail причины
   */
  detectHardFails(
    job: Job,
    candidate: CandidateProfile
  ): HardFailReason[] {
    const hardFails: HardFailReason[] = [];

    // Проверка excluded companies
    const excludedKeywords = candidate.excludedKeywords || [];
    if (excludedKeywords.some(k => 
      job.company.toLowerCase().includes(k.toLowerCase())
    )) {
      hardFails.push("excluded_company");
    }

    // Проверка excluded keywords в описании
    const descriptionLower = job.description.toLowerCase();
    if (excludedKeywords.some(k =>
      descriptionLower.includes(k.toLowerCase())
    )) {
      hardFails.push("excluded_keyword");
    }

    return hardFails;
  }

  /**
   * Обнаружить risk flags
   */
  detectRiskFlags(job: Job): RiskFlag[] {
    const flags: RiskFlag[] = [];

    // Старая вакансия
    const daysSincePosted = this.daysSince(job.postedAt);
    if (daysSincePosted > 30) {
      flags.push({
        type: "job_posting_age",
        severity: daysSincePosted > 60 ? "high" : "medium",
        message: `Вакансия размещена ${daysSincePosted} дней назад`,
        details: { daysSincePosted, postedAt: job.postedAt },
      });
    }

    // Нет зарплаты
    if (!job.salaryMin && !job.salaryMax) {
      flags.push({
        type: "salary_transparency",
        severity: "low",
        message: "Зарплата не указана",
      });
    }

    // Непонятное описание
    if (job.description.length < 200) {
      flags.push({
        type: "vague_description",
        severity: "medium",
        message: "Описание слишком короткое",
        details: { length: job.description.length },
      });
    }

    // Слишком много требований
    const requirementsCount = job.requirements?.length || 0;
    if (requirementsCount > 15) {
      flags.push({
        type: "too_many_requirements",
        severity: "medium",
        message: "Нереалистично много требований",
        details: { count: requirementsCount },
      });
    }

    // Признаки ghost job
    if (this.isGhostJobSignal(job)) {
      flags.push({
        type: "ghost_job",
        severity: "medium",
        message: "Возможно, вакансия не активна",
      });
    }

    return flags;
  }

  /**
   * Определить рекомендацию по отклику
   */
  recommendApplyMode(
    totalScore: number,
    confidence: number,
    hardFails: HardFailReason[],
    riskFlags: RiskFlag[]
  ): "manual" | "assisted" | "auto" {
    // Если есть hard fails - только manual
    if (hardFails.length > 0) {
      return "manual";
    }

    // Если высокий риск - manual
    const highRiskCount = riskFlags.filter(r => r.severity === "high").length;
    if (highRiskCount > 0) {
      return "manual";
    }

    // Если низкий confidence - assisted
    if (confidence < this.config.minConfidenceForAuto) {
      return "assisted";
    }

    // Если отличный скор и высокая уверенность - auto
    if (totalScore >= 80 && confidence >= 0.9) {
      return "auto";
    }

    // По умолчанию assisted
    return "assisted";
  }

  /**
   * Парсить ответ от LLM
   */
  private parseLLMResponse(
    content: string,
    job: Job,
    candidate: CandidateProfile
  ): LLMAnalysisResult {
    try {
      // Пытаемся распарсить JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        reasoning: parsed.reasoning || "Анализ не предоставлен",
        recommendation: this.parseRecommendation(parsed.recommendation),
        hardFailReasons: Array.isArray(parsed.hardFailReasons)
          ? parsed.hardFailReasons
          : [],
        riskFlags: Array.isArray(parsed.riskFlags)
          ? parsed.riskFlags.map((r: any) => this.parseRiskFlag(r))
          : [],
        impliedSeniority: parsed.impliedSeniority,
        confidence: typeof parsed.confidence === "number"
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0.7,
        recommendedApplyMode: parsed.recommendedApplyMode || "assisted",
      };
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      return this.getDefaultAnalysis(job, candidate);
    }
  }

  /**
   * Дефолтный анализ (без LLM)
   */
  private getDefaultAnalysis(
    job: Job,
    candidate: CandidateProfile
  ): LLMAnalysisResult {
    const hardFails = this.detectHardFails(job, candidate);
    const riskFlags = this.detectRiskFlags(job);

    return {
      reasoning: "Анализ выполнен без LLM на основе правил",
      recommendation: this.calculateDefaultRecommendation(job, candidate, hardFails),
      hardFailReasons: hardFails,
      riskFlags,
      confidence: 0.6,
      recommendedApplyMode: hardFails.length > 0 ? "manual" : "assisted",
    };
  }

  /**
   * Парсить рекомендацию из строки
   */
  private parseRecommendation(value: string): MatchRecommendation {
    const valid: MatchRecommendation[] = [
      "highly_recommended",
      "recommended",
      "neutral",
      "not_recommended",
      "avoid",
    ];

    if (valid.includes(value as any)) {
      return value as MatchRecommendation;
    }

    // Пытаемся маппить
    const normalized = value?.toLowerCase() || "";
    if (normalized.includes("high") || normalized.includes("strong")) {
      return "highly_recommended";
    }
    if (normalized.includes("avoid") || normalized.includes("skip")) {
      return "avoid";
    }
    if (normalized.includes("not") || normalized.includes("don't")) {
      return "not_recommended";
    }

    return "neutral";
  }

  /**
   * Парсить risk flag из объекта
   */
  private parseRiskFlag(data: any): RiskFlag {
    return {
      type: data.type || "unknown",
      severity: ["low", "medium", "high"].includes(data.severity)
        ? data.severity
        : "low",
      message: data.message || "Unknown risk",
      details: data.details,
    };
  }

  /**
   * Вычислить дефолтную рекомендацию
   */
  private calculateDefaultRecommendation(
    job: Job,
    candidate: CandidateProfile,
    hardFails: HardFailReason[]
  ): MatchRecommendation {
    if (hardFails.length > 0) {
      return "not_recommended";
    }

    // Простая эвристика по навыкам
    const skillOverlap = this.calculateSkillOverlap(job, candidate);
    
    if (skillOverlap > 0.7) return "highly_recommended";
    if (skillOverlap > 0.5) return "recommended";
    if (skillOverlap > 0.3) return "neutral";
    
    return "not_recommended";
  }

  /**
   * Вычислить пересечение навыков
   */
  private calculateSkillOverlap(job: Job, candidate: CandidateProfile): number {
    const jobSkills = new Set([
      ...job.requiredSkills,
      ...job.preferredSkills,
    ].map(s => s.toLowerCase()));

    const candidateSkills = new Set(
      candidate.skills.map(s => s.toLowerCase())
    );

    if (jobSkills.size === 0) return 0.5;

    let matches = 0;
    for (const skill of jobSkills) {
      if (candidateSkills.has(skill)) {
        matches++;
      }
    }

    return matches / jobSkills.size;
  }

  /**
   * Проверить на ghost job
   */
  private isGhostJobSignal(job: Job): boolean {
    // Эвристики для ghost job:
    // - Вакансия старше 90 дней
    // - Описание очень общее
    // - Нет конкретной информации о команде
    
    const daysSincePosted = this.daysSince(job.postedAt);
    if (daysSincePosted < 90) return false;

    const genericPhrases = [
      "world class",
      "fast paced",
      "cutting edge",
      "rock star",
      "ninja",
    ];

    const hasGenericDescription = genericPhrases.some(phrase =>
      job.description.toLowerCase().includes(phrase)
    );

    return hasGenericDescription;
  }

  /**
   * Дней с даты
   */
  private daysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

/**
 * Mock LLM клиент для тестирования
 */
export class MockLLMClient implements LLMClient {
  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    // Возвращаем фиктивный ответ для тестирования
    return {
      content: JSON.stringify({
        reasoning: "Кандидат хорошо подходит по навыкам и опыту",
        recommendation: "recommended",
        hardFailReasons: [],
        riskFlags: [],
        confidence: 0.85,
        recommendedApplyMode: "assisted",
      }),
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
    };
  }
}
