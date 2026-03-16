/**
 * Сервис подготовки к интервью с помощью AI
 */

import type { CandidateProfile, Job } from "@ai-job-search/types";
import { buildInterviewPrepPrompt } from "@ai-job-search/prompts";
import { LLMClient, LLMOptions } from "./llm-scoring.service";

/**
 * Опции подготовки к интервью
 */
export interface InterviewPrepOptions {
  /** Тип интервью */
  interviewType?: "screening" | "technical" | "behavioral" | "system_design" | "final";
  /** Настройки LLM */
  llmOptions?: LLMOptions;
}

/**
 * Результат подготовки к интервью
 */
export interface InterviewPrepResult {
  likelyQuestions: Array<{
    question: string;
    reason: string;
    suggestedPoints: string[];
  }>;
  areasToEmphasize: string[];
  questionsToAsk: string[];
  generalTips: string[];
  metadata: {
    interviewType: string;
    generatedAt: Date;
    model?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCost?: number;
    };
  };
}

/**
 * Сервис подготовки к интервью
 */
export class InterviewPrepService {
  private client: LLMClient | null;

  constructor(client?: LLMClient) {
    this.client = client || null;
  }

  /**
   * Сгенерировать план подготовки
   */
  async prepare(
    job: Job,
    candidate: CandidateProfile,
    options: InterviewPrepOptions = {}
  ): Promise<InterviewPrepResult> {
    if (!this.client) {
      throw new Error("LLM client not initialized for InterviewPrepService");
    }

    const {
      interviewType = "technical",
      llmOptions = { temperature: 0.5, responseFormat: "json" },
    } = options;

    // Строим промт
    const prompt = buildInterviewPrepPrompt({
      candidate,
      job,
      interviewType,
    });

    // Генерируем
    const response = await this.client.generate(prompt, llmOptions);

    try {
      const parsed = JSON.parse(response.content);
      
      return {
        ...parsed,
        metadata: {
          interviewType,
          generatedAt: new Date(),
          model: response.usage?.model,
          usage: response.usage ? {
            ...response.usage,
            estimatedCost: this.calculateUsageCost(response.usage),
          } : undefined,
        },
      };
    } catch (e) {
      throw new Error(`Failed to parse InterviewPrep LLM response: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Вычислить стоимость
   */
  private calculateUsageCost(usage: { promptTokens: number; completionTokens: number; model?: string }): number {
    const model = usage.model || "";
    const pricing: Record<string, { prompt: number; completion: number }> = {
      "claude-3-5-sonnet-20240620": { prompt: 3, completion: 15 },
      "claude-3-5-sonnet-20241022": { prompt: 3, completion: 15 },
      "claude-3-opus-20240229": { prompt: 15, completion: 75 },
      "claude-3-haiku-20240307": { prompt: 0.25, completion: 1.25 },
      "gpt-4o": { prompt: 5, completion: 15 },
      "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
    };

    const modelKey = Object.keys(pricing).find(k => model.includes(k)) || "claude-3-5-sonnet-20241022";
    const prices = pricing[modelKey];

    const promptCost = (usage.promptTokens / 1_000_000) * prices.prompt;
    const completionCost = (usage.completionTokens / 1_000_000) * prices.completion;

    return Number((promptCost + completionCost).toFixed(6));
  }
}
