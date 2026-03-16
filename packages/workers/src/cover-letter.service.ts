/**
 * Сервис генерации сопроводительных писем с помощью AI
 */

import type { CandidateProfile, Job } from "@ai-job-search/types";
import { buildCoverLetterPrompt } from "@ai-job-search/prompts";
import { LLMClient, LLMOptions, LLMResponse } from "./llm-scoring.service";

/**
 * Опции для генерации письма
 */
export interface CoverLetterOptions {
  /** Тональность письма */
  tone?: "professional" | "casual" | "enthusiastic" | "concise";
  /** Максимальная длина в словах */
  maxLength?: number;
  /** Дополнительные инструкции */
  additionalInstructions?: string;
  /** Настройки LLM */
  llmOptions?: LLMOptions;
}

/**
 * Результат генерации письма
 */
export interface GeneratedCoverLetter {
  /** Содержимое письма */
  content: string;
  /** Метаданные о генерации */
  metadata: {
    tone: string;
    maxLength: number;
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
 * Сервис генерации сопроводительных писем
 */
export class CoverLetterService {
  private client: LLMClient | null;

  constructor(client?: LLMClient) {
    this.client = client || null;
  }

  /**
   * Сгенерировать письмо
   */
  async generate(
    job: Job,
    candidate: CandidateProfile,
    options: CoverLetterOptions = {}
  ): Promise<GeneratedCoverLetter> {
    if (!this.client) {
      throw new Error("LLM client not initialized for CoverLetterService");
    }

    const {
      tone = "professional",
      maxLength = 250,
      additionalInstructions = "",
      llmOptions = { temperature: 0.7 },
    } = options;

    // Строим промт
    let prompt = buildCoverLetterPrompt({
      candidate,
      job,
      tone,
      maxLength,
    });

    if (additionalInstructions) {
      prompt += `\n\nAdditional instructions from the user: ${additionalInstructions}`;
    }

    // Генерируем
    const response = await this.client.generate(prompt, llmOptions);

    return {
      content: this.cleanResponse(response.content),
      metadata: {
        tone,
        maxLength,
        generatedAt: new Date(),
        model: response.usage?.model,
        usage: response.usage ? {
          ...response.usage,
          estimatedCost: this.calculateUsageCost(response.usage),
        } : undefined,
      },
    };
  }

  /**
   * Очистить ответ от лишних тегов/комментариев LLM
   */
  private cleanResponse(content: string): string {
    // Убираем возможные "Here is your cover letter:" или обратные кавычки
    return content
      .replace(/^(Here is your cover letter:|Subject:|Dear Hiring Manager:)/i, "")
      .replace(/```[a-z]*\n/gi, "")
      .replace(/```/g, "")
      .trim();
  }

  /**
   * Вычислить стоимость (дублируем логику из LLMScoringService или выносим в общую утилиту)
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
