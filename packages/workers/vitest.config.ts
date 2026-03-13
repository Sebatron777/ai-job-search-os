import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@ai-job-search/shared": resolve(__dirname, "../shared/src/index.ts"),
      "@ai-job-search/prompts": resolve(__dirname, "../prompts/src/index.ts"),
      "@ai-job-search/types": resolve(__dirname, "../types/src/index.ts"),
    },
  },
});
