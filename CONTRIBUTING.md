# Contributing to AI Job Search OS

Thank you for your interest in contributing to **AI Job Search OS**! We welcome contributions from developers, researchers, designers, and job seekers worldwide to help build the open-source standard for intelligent, ethical career automation.

---

## 🧭 Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all members of the community with empathy, kindness, and respect.

---

## 🏗️ Repository Architecture

This repository is organized as a **pnpm monorepo**:

```text
├── apps/
│   ├── api/          # NestJS REST backend (PostgreSQL + Prisma, BullMQ, Auth)
│   └── web/          # Next.js 14 frontend (React, Tailwind CSS, shadcn/ui)
├── packages/
│   ├── config/       # Shared configs (TypeScript, ESLint, Vitest)
│   ├── prompts/      # Production LLM prompt engineering templates (Claude)
│   ├── shared/       # Shared utilities and sanitizers
│   ├── types/        # Shared domain TypeScript interfaces and schemas
│   └── workers/      # Core engines (Scoring, Ingestion, Deduplication, Drafting)
```

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** `>= 20.0.0`
- **pnpm** `>= 9.0.0`
- **Docker & Docker Compose** (for PostgreSQL and Redis)

### Step-by-Step

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/ai-job-search-os.git
   cd ai-job-search-os
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start local infrastructure (Postgres + Redis):**
   ```bash
   docker-compose up -d
   ```

4. **Configure environment variables:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

5. **Generate Prisma Client and apply migrations:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

6. **Start the development environment:**
   ```bash
   pnpm dev
   ```

7. **Verify test suite:**
   ```bash
   pnpm test
   ```

---

## 🧪 Testing Guidelines

We prioritize test coverage and regression protection. Any new feature or bug fix should be accompanied by tests:

- **Unit & Integration Tests**: Written with [Vitest](https://vitest.dev).
  ```bash
  # Run all tests across packages
  pnpm test

  # Run tests in a specific package
  pnpm --filter @ai-job-search/workers test
  ```
- **Type Checking**:
  ```bash
  pnpm typecheck
  ```
- **Linting & Formatting**:
  ```bash
  pnpm lint
  ```

---

## 🔄 Pull Request Workflow

1. **Create an Issue First**: For substantial features, bug reports, or architectural refactors, open a GitHub Issue first to discuss the design with maintainers.
2. **Branch Naming**:
   - `feat/feature-name`
   - `fix/bug-description`
   - `docs/doc-update`
   - `refactor/clean-up`
3. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(workers): add Claude Ultra streaming response parser`
   - `fix(matching): handle null salary ranges in scoring engine`
   - `docs(readme): update pipeline architecture diagram`
4. **Self-Review**:
   - Ensure all automated tests pass (`pnpm test`).
   - Ensure there are no TypeScript errors.
   - Do not include secrets, credentials, or sensitive test data.
5. **Open Pull Request**:
   - Provide a clear summary of what changed and why.
   - Reference the issue being closed (e.g., `Closes #42`).
   - Attach screenshots or CLI output where applicable.

---

## 🤖 Working with LLM Integrations

When touching the LLM engine (`packages/prompts` or `packages/workers`):
- All LLM interactions should support **Anthropic Claude** as the primary engine.
- Use explicit schemas (JSON output validation) for structured responses.
- Always include fallback handling, exponential backoff retries, and token accounting.
- Unit tests for prompts and parsing must use deterministic mock data (no live API calls during CI).

---

## 💬 Community & Questions

- **Discussions / Questions**: Open a discussion thread or issue in this repository.
- **Security Vulnerabilities**: If you discover a security issue, please do not disclose it publicly. Contact the repository maintainers directly.

Thank you for helping make job hunting transparent, intelligent, and fair for everyone!
