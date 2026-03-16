/**
 * Anthropic LLM Client
 * 
 * Реальная интеграция с Anthropic Claude API
 */

import type { LLMClient, LLMResponse, LLMOptions } from "./llm-scoring.service";

/**
 * Anthropic клиент
 */
export class AnthropicClient implements LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://api.anthropic.com/v1";

  constructor(apiKey: string, model: string = "claude-sonnet-4-5-20250929") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Generate completion
   */
  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const temperature = options?.temperature ?? 0.3;
    const maxTokens = options?.maxTokens ?? 1000;

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      return {
        content: data.content[0]?.text || "",
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
          model: this.model,
        },
      };
    } catch (error) {
      console.error("AnthropicClient error:", error);
      throw error;
    }
  }

  /**
   * Generate with retry logic
   */
  async generateWithRetry(
    prompt: string,
    options?: LLMOptions,
    maxRetries: number = 3
  ): Promise<LLMResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generate(prompt, options);
      } catch (error) {
        lastError = error as Error;

        // Не retry'им ошибки аутентификации и валидации
        if (
          error instanceof Error &&
          (error.message.includes("401") || error.message.includes("400"))
        ) {
          throw error;
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Unknown error in generateWithRetry");
  }
}

/**
 * OpenAI LLM Client (альтернатива Anthropic)
 */
export class OpenAIClient implements LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://api.openai.com/v1";

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const temperature = options?.temperature ?? 0.3;
    const maxTokens = options?.maxTokens ?? 1000;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          model: this.model,
        },
      };
    } catch (error) {
      console.error("OpenAIClient error:", error);
      throw error;
    }
  }

  async generateWithRetry(
    prompt: string,
    options?: LLMOptions,
    maxRetries: number = 3
  ): Promise<LLMResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generate(prompt, options);
      } catch (error) {
        lastError = error as Error;

        if (
          error instanceof Error &&
          (error.message.includes("401") || error.message.includes("400"))
        ) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Unknown error in generateWithRetry");
  }
}
