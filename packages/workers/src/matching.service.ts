/**
 * Главный сервис матчинга вакансий
 * 
 * Комбинирует детерминированный и LLM-assisted скоринг
 * для получения итоговой оценки и рекомендаций
 */

import type { Job, CandidateProfile, JobPreference, MatchScore } from "@ai-job-search/types";
import {
  DeterministicScoringService,
  DeterministicScoreResult,
  ScoringConfig,
  DEFAULT_WEIGHTS,
} from "./deterministic-scoring.service";
import {
  LLMScoringService,
  LLMAnalysisResult,
  LLMClient,
  LLMScoringConfig,
} from "./llm-scoring.service";

/**
 * Результат матчинга
 */
export interface MatchingResult {
  /** ID вакансии */
  jobId: string;
  /** ID профиля кандидата */
  candidateProfileId: string;
  /** Итоговый скор (0-100) */
  totalScore: number;
  /** Confidence (0-1) */
  confidence: number;
  /** Детерминированный скор по компонентам */
  deterministicResult: DeterministicScoreResult;
  /** LLM анализ */
  llmAnalysis?: LLMAnalysisResult;
  /** Hard fail причины */
  hardFailReasons: string[];
  /** Skill gaps */
  skillGaps: any[];
  /** Risk flags */
  riskFlags: any[];
  /** Рекомендация */
  recommendation: string;
  /** Рекомендуемый режим отклика */
  recommendedApplyMode?: "manual" | "assisted" | "auto";
}

/**
 * Конфигурация сервиса матчинга
 */
export interface MatchingServiceConfig {
  /** Веса для детерминированного скоринга */
  weights?: Partial<typeof DEFAULT_WEIGHTS>;
  /** Включить LLM анализ */
  llmEnabled?: boolean;
  /** Конфигурация LLM */
  llmConfig?: Partial<LLMScoringConfig>;
}

/**
 * Сервис матчинга
 */
export class MatchingService {
  private deterministicService: DeterministicScoringService;
  private llmService: LLMScoringService;
  private config: MatchingServiceConfig;

  constructor(
    llmClient?: LLMClient,
    config?: MatchingServiceConfig
  ) {
    this.config = config || {};
    
    this.deterministicService = new DeterministicScoringService(
      this.config.weights
    );
    
    this.llmService = new LLMScoringService(
      llmClient,
      {
        enabled: this.config.llmEnabled ?? true,
        ...this.config.llmConfig,
      }
    );
  }

  /**
   * Скорить вакансию против профиля кандидата
   */
  async match(
    job: Job,
    candidate: CandidateProfile,
    preference?: JobPreference
  ): Promise<MatchingResult> {
    // 1. Детерминированный скоринг
    const deterministicResult = this.deterministicService.score(
      job,
      candidate,
      preference
    );

    // 2. LLM анализ (если включён)
    let llmAnalysis: LLMAnalysisResult | undefined;
    if (this.config.llmEnabled !== false) {
      llmAnalysis = await this.llmService.analyze(job, candidate);
    }

    // 3. Объединение результатов
    const totalScore = this.calculateTotalScore(
      deterministicResult,
      llmAnalysis
    );

    const confidence = this.calculateConfidence(
      deterministicResult,
      llmAnalysis
    );

    const hardFailReasons = this.collectHardFails(
      deterministicResult,
      llmAnalysis
    );

    const riskFlags = this.collectRiskFlags(llmAnalysis);

    const recommendation = this.determineRecommendation(
      totalScore,
      confidence,
      hardFailReasons,
      riskFlags,
      llmAnalysis
    );

    const recommendedApplyMode = llmAnalysis?.recommendedApplyMode ||
      this.llmService.recommendApplyMode(
        totalScore,
        confidence,
        hardFailReasons as any[],
        riskFlags
      );

    return {
      jobId: job.id,
      candidateProfileId: candidate.id,
      totalScore,
      confidence,
      deterministicResult,
      llmAnalysis,
      hardFailReasons,
      skillGaps: deterministicResult.skillGaps,
      riskFlags,
      recommendation,
      recommendedApplyMode,
    };
  }

  /**
   * Вычислить итоговый скор
   */
  private calculateTotalScore(
    deterministic: DeterministicScoreResult,
    llm?: LLMAnalysisResult
  ): number {
    // Если есть LLM анализ, корректируем скор
    if (llm) {
      const llmAdjustment = this.getLLMAdjustment(llm);
      return Math.round(
        deterministic.totalScore * 0.7 +
        (llm.recommendation === "highly_recommended" ? 100 :
         llm.recommendation === "recommended" ? 80 :
         llm.recommendation === "neutral" ? 60 :
         llm.recommendation === "not_recommended" ? 40 : 20) * 0.3 +
        llmAdjustment
      );
    }

    return deterministic.totalScore;
  }

  /**
   * Вычислить confidence
   */
  private calculateConfidence(
    deterministic: DeterministicScoreResult,
    llm?: LLMAnalysisResult
  ): number {
    // Базовый confidence от детерминированного скора
    let confidence = 0.6;

    // Если LLM уверен - повышаем
    if (llm?.confidence) {
      confidence = (confidence + llm.confidence) / 2;
    }

    // Если много skill gaps - понижаем
    if (deterministic.skillGaps.length > 3) {
      confidence *= 0.8;
    }

    // Если все required skills匹配 - повышаем
    const requiredGaps = deterministic.skillGaps.filter(
      g => g.gapSeverity === "critical"
    ).length;
    
    if (requiredGaps === 0) {
      confidence *= 1.2;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Собрать hard fail причины
   */
  private collectHardFails(
    deterministic: DeterministicScoreResult,
    llm?: LLMAnalysisResult
  ): string[] {
    const hardFails = new Set<string>();

    // От LLM
    if (llm?.hardFailReasons) {
      for (const reason of llm.hardFailReasons) {
        hardFails.add(reason);
      }
    }

    // Автоматические проверки
    if (deterministic.seniorityScore < 30) {
      hardFails.add("seniority_mismatch");
    }

    if (deterministic.skillGaps.filter(g => g.gapSeverity === "critical").length > 2) {
      hardFails.add("skill_gap_critical");
    }

    return Array.from(hardFails);
  }

  /**
   * Собрать risk flags
   */
  private collectRiskFlags(llm?: LLMAnalysisResult): any[] {
    if (llm?.riskFlags) {
      return llm.riskFlags;
    }
    return [];
  }

  /**
   * Определить рекомендацию
   */
  private determineRecommendation(
    totalScore: number,
    confidence: number,
    hardFails: string[],
    riskFlags: any[],
    llm?: LLMAnalysisResult
  ): string {
    // Если есть hard fails
    if (hardFails.length > 0) {
      return "not_recommended";
    }

    // Если высокие риски
    const highRisks = riskFlags.filter((r: any) => r.severity === "high").length;
    if (highRisks > 0) {
      return "not_recommended";
    }

    // От LLM если есть
    if (llm?.recommendation) {
      return llm.recommendation;
    }

    // По скору
    if (totalScore >= 85) return "highly_recommended";
    if (totalScore >= 70) return "recommended";
    if (totalScore >= 50) return "neutral";
    if (totalScore >= 30) return "not_recommended";
    
    return "avoid";
  }

  /**
   * Получить корректировку от LLM
   */
  private getLLMAdjustment(llm: LLMAnalysisResult): number {
    // LLM может скорректировать скор на ±10
    if (llm.recommendation === "highly_recommended") return 5;
    if (llm.recommendation === "avoid") return -10;
    return 0;
  }
}

/**
 * Создать MatchScore для сохранения в БД
 */
export function createMatchScoreEntity(
  result: MatchingResult,
  workspaceId: string
): Partial<MatchScore> {
  return {
    jobId: result.jobId,
    candidateProfileId: result.candidateProfileId,
    totalScore: result.totalScore,
    confidence: result.confidence,
    titleScore: result.deterministicResult.titleScore,
    skillScore: result.deterministicResult.skillScore,
    seniorityScore: result.deterministicResult.seniorityScore,
    workModeScore: result.deterministicResult.workModeScore,
    locationScore: result.deterministicResult.locationScore,
    salaryScore: result.deterministicResult.salaryScore,
    llmReasoning: result.llmAnalysis?.reasoning,
    llmRecommendation: result.llmAnalysis?.recommendation as any,
    hasHardFail: result.hardFailReasons.length > 0,
    hardFailReasons: result.hardFailReasons,
    skillGaps: result.skillGaps,
    riskFlags: result.riskFlags,
    recommendation: result.recommendation as any,
    recommendedApplyMode: result.recommendedApplyMode,
  };
}
