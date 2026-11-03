# AI Job Search OS

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20%7C%20Anthropic-purple.svg)](https://anthropic.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vitest](https://img.shields.io/badge/Tests-99%20Passed%20(Vitest)-brightgreen.svg)](packages/workers/src)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**The open-source autonomous career agent and pipeline platform powered by Claude.**  
Intelligently discover, normalize, deep-score, craft personalized applications, and track opportunities with human-in-the-loop oversight.

[Quickstart](#-quickstart) • [Architecture](#-architecture) • [Claude Engine](#-claude-llm-intelligence) • [Pipeline Flow](#-pipeline-lifecycle) • [Contributing](CONTRIBUTING.md)

</div>

---

## 💡 What is AI Job Search OS?

Job searching in the modern era is noisy, repetitive, and fragmented. Existing tools either spray low-quality spam across boards or trap candidates in walled proprietary gardens.

**AI Job Search OS** is an open-source, candidate-first operating system designed to automate the repetitive mechanics of the job search while keeping the candidate firmly in control of quality:

- **Aggregates & Normalizes** job postings across multiple distributed sources (APIs, Web, Feeds).
- **Deep Semantic Matching** powered by **Anthropic Claude 3.5 Sonnet / Claude Ultra** — evaluating technical fit, compensation alignment, experience overlap, and cultural signals with explainable criteria scores.
- **Tailored Application Generator** producing bespoke cover letters, portfolio highlights, and interview talking points calibrated to each specific role.
- **Strict Human-in-the-Loop Gate** ensuring no submission or outreach happens without explicit candidate sign-off.
- **Bi-directional Pipeline Sync** maintaining state with Gmail, Notion, and Google Sheets, monitoring replies, and surfacing funnel analytics.

---

## 🏗️ Architecture & Pipeline Flow

The platform follows a clean modular monolith architecture inside a high-performance **pnpm monorepo**, pairing a **NestJS** backend with a modern **Next.js** dashboard, backed by PostgreSQL, Redis/BullMQ, and decoupled worker engines.

### End-to-End Pipeline

```text
  ┌───────────────────────────────────────────────────────────────┐
  │ 1. INGESTION                                                  │
  │    Aggregators • Job Boards • Web Scrapers • Feeds            │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ Raw Job Payloads
                                 ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ 2. NORMALIZATION & DEDUPLICATION                              │
  │    Schema Unification • Content Hashing • Fuzzy Duplicate     │
  │    Detection • Salary/Location Standardization                │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ Normalized Vacancies
                                 ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ 3. CLAUDE DEEP SCORING & MATCHING                             │
  │    Two-tier Scoring: Deterministic Gate + Claude Ultra Deep   │
  │    Semantic Fit • Hard Criteria • Soft Nuance • Risk Flags    │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ Match Score >= Threshold
                                 ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ 4. TAILORED DRAFTING ENGINE                                   │
  │    Context-Aware Cover Letters • Experience Emphasis Tuning   │
  │    Key Talking Points • Interview Prep Briefing Sheets        │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ Drafts Ready
                                 ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ 5. HUMAN-IN-THE-LOOP APPROVAL GATE                            │
  │    Dashboard Review • One-Click Edit • Approve / Reject       │
  └──────────────────────────────┬────────────────────────────────┘
                                 │ Candidate Approved
                                 ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ 6. AUTOMATED DISPATCH & LIFECYCLE SYNC                        │
  │    Email Outreach • Portal Submission • Status Update         │
  │    Gmail Webhooks • Notion / Sheets Bi-directional Sync       │
  └───────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```text
ai-job-search-os/
├── apps/
│   ├── api/          # NestJS application (Auth, REST API, Swagger, Prisma ORM)
│   └── web/          # Next.js 14 frontend (Tailwind CSS, shadcn/ui dashboard)
├── packages/
│   ├── config/       # Shared ESLint, Prettier, and TypeScript configurations
│   ├── prompts/      # Production LLM prompts and templating engine
│   ├── shared/       # Shared utility helpers, sanitizers, and validators
│   ├── types/        # Strongly-typed domain models, contracts, and DTOs
│   └── workers/      # Core computational and LLM orchestration workers
│       ├── anthropic.client.ts            # Production Anthropic Claude API client
│       ├── deterministic-scoring.service.ts # High-throughput pre-filter
│       ├── llm-scoring.service.ts         # Deep Claude semantic reasoning
│       ├── draft-generation.service.ts    # Role-tailored application generator
│       ├── cover-letter.service.ts        # Dynamic cover letter synthesizer
│       ├── deduplication.service.ts       # Title/Company fuzzy hashing
│       └── interview-prep.service.ts      # Interview Q&A briefing engine
├── docker-compose.yml # PostgreSQL 15 & Redis 7 infrastructure
└── package.json       # Monorepo workspaces and unified scripts
```

---

## 🧠 Claude LLM Intelligence

The reasoning core of AI Job Search OS leverages Anthropic's Claude models (`claude-sonnet-4-5`, `claude-3-5-sonnet`, and `claude-ultra`):

1. **Two-Stage Intelligent Filtering:**
   - *Stage 1 (Deterministic Fast Path):* Evaluates explicit constraints (location, base salary floor, remote policy, hard blockers) in `<1ms`.
   - *Stage 2 (Claude Deep Reasoning):* High-context semantic analysis analyzing nuanced tech stack experience, culture-fit criteria, leadership scope, and subtle job requirement alignment.
2. **Explainable Matchmaking:**
   Claude returns structured JSON outputs with exact category breakdowns (Skills Fit, Seniority Fit, Domain Fit), explicit rationales, and flagged potential red flags.
3. **Hyper-Personalized Drafting:**
   Instead of generic template placeholders, Claude correlates candidate achievements directly with the employer's explicit pain points highlighted in the job description.
4. **Resilience & Token Accounting:**
   Built-in exponential backoff retry policies, configurable token limits, structured validation, and multi-provider fallback.

---

## 🚀 Quickstart

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker**: (for PostgreSQL and Redis)
- **Anthropic API Key**: (`export ANTHROPIC_API_KEY=sk-ant-...`)

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/Sebatron777/ai-job-search-os.git
cd ai-job-search-os

# 2. Install dependencies
pnpm install

# 3. Spin up local database and Redis queues
docker-compose up -d

# 4. Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Configure your ANTHROPIC_API_KEY in apps/api/.env

# 5. Initialize Database schema
pnpm db:generate
pnpm db:migrate

# 6. Start the API backend and Web Dashboard concurrently
pnpm dev
```

The services will be available at:
- **Web Dashboard**: `http://localhost:3000`
- **REST API & Swagger Docs**: `http://localhost:3001/api/docs`

---

## 🧪 Testing & Verification

The codebase includes comprehensive unit and integration test coverage across all packages, verified using [Vitest](https://vitest.dev):

```bash
# Run all tests across the monorepo (99 test cases)
pnpm test

# Run worker and LLM engine tests specifically
pnpm --filter @ai-job-search/workers test

# Run API backend tests
pnpm --filter @ai-job-search/api test

# End-to-end integration cycle test
pnpm test:cycle
```

All core algorithms — including **normalization**, **fuzzy deduplication**, **deterministic gate scoring**, **Claude LLM response parsing**, and **billing limit guards** — are covered by automated tests.

---

## 📊 Domain Modules

| Module | Status | Description |
|---|---|---|
| **`auth` & `users`** | ✅ Production | Multi-tenant JWT auth, workspaces, user management |
| **`profiles` & `resumes`**| ✅ Production | Candidate profiles, target roles, experience portfolios |
| **`job-sources` & `ingest`** | ✅ Production | Multi-channel job scrapers, feed aggregators, webhook intake |
| **`normalization`** | ✅ Production | Cleans raw payloads, standardizes salaries, currencies, titles |
| **`matching` (Claude)** | ✅ Production | Two-stage deterministic + Claude semantic scoring engine |
| **`drafting` (Claude)** | ✅ Production | Tailored cover letters, executive summaries, interview prep |
| **`approvals`** | ✅ Production | Human-in-the-loop candidate review dashboard |
| **`communications`** | 🔜 In Progress | Gmail API thread monitoring and reply classification |
| **`sync`** | 🔜 In Progress | Bi-directional Notion and Google Sheets pipeline synchronization |

---

## 🤝 Contributing

We welcome contributions of all kinds! Whether you are adding a new job board scraper, improving Claude prompts, adding UI components, or writing documentation:

1. Read our [Code of Conduct](CODE_OF_CONDUCT.md).
2. Follow our [Contributing Guide](CONTRIBUTING.md) for branch naming, PR conventions, and setup instructions.
3. Open an issue or submit a pull request!

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 Sebatron777.
