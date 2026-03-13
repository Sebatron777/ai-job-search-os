/**
 * LLM Client Factory
 * 
 * Создаёт нужный LLM клиент на основе конфигурации
 */

import { AnthropicClient } from "./anthropic.client";
import { OpenAIClient } from "./anthropic.client";
import { MockLLMClient } from "./llm-scoring.service";
import type { LLMClient } from "./llm-scoring.service";

/**
 * Типы провайдеров
 */
export type LLMProvider = "anthropic" | "openai" | "mock";

/**
 * Конфигурация для создания клиента
 */
export interface LLMClientConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
}

/**
 * Создать LLM клиент
 */
export function createLLMClient(config: LLMClientConfig): LLMClient {
  const { provider, apiKey, model } = config;

  switch (provider) {
    case "anthropic":
      if (!apiKey) {
        console.warn("Anthropic API key not provided, using mock client");
        return new MockLLMClient();
      }
      return new AnthropicClient(apiKey, model);

    case "openai":
      if (!apiKey) {
        console.warn("OpenAI API key not provided, using mock client");
        return new MockLLMClient();
      }
      return new OpenAIClient(apiKey, model);

    case "mock":
    default:
      return new MockLLMClient();
  }
}

/**
 * Создать LLM клиент из environment variables
 */
export function createLLMClientFromEnv(): LLMClient {
  const provider = (process.env.LLM_PROVIDER || "mock") as LLMProvider;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  return createLLMClient({ provider, apiKey, model });
}
