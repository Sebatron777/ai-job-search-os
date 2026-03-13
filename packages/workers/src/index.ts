/**
 * Workers package barrel export
 */

export * from "./source-adapter";
export * from "./normalization.service";
export * from "./deduplication.service";
export * from "./ingestion.pipeline";
export * from "./deterministic-scoring.service";
export * from "./llm-scoring.service";
export * from "./matching.service";
export * from "./draft-generation.service";
export * from "./approval.service";
export * from "./application-automation.service";
export * from "./gmail-integration.service";
export * from "./notion-integration.service";
export * from "./sheets-integration.service";

// LLM Clients
export { AnthropicClient, OpenAIClient } from "./anthropic.client";
export { createLLMClient, createLLMClientFromEnv, type LLMProvider } from "./llm-client.factory";

// Mock Source Adapter
export { MockSourceAdapter, MockSourceAdapterFactory } from "./mock-source.adapter";
