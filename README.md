# AI Job Search OS

A modular platform that helps candidates collect, normalize, score, and apply to jobs intelligently.

## 🎯 Mission

- Collect jobs from multiple sources
- Normalize and deduplicate them
- Score relevance against candidate profile
- Generate personalized application drafts
- Attach correct resume/portfolio/website
- Optionally submit applications automatically
- Monitor email replies
- Update pipeline status
- Sync progress to Notion/Google Sheets
- Provide analytics on conversion and source performance

## 🏗️ Architecture

Modular monolith with clear domain boundaries:

```
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── config/       # Shared configs (TS, ESLint, etc.)
│   ├── types/        # Shared TypeScript types
│   ├── shared/       # Shared utilities
│   └── prompts/      # LLM prompt templates
└── workers/
    ├── ingest/       # Job ingestion worker
    ├── match/        # Matching/scoring worker
    ├── apply/        # Application automation worker
    ├── mail/         # Email monitoring worker
    └── sync/         # Notion/Sheets sync worker
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- NestJS
- TypeScript
- REST APIs with Swagger/OpenAPI
- PostgreSQL + Prisma ORM
- Redis + BullMQ for async jobs

**Integrations:**
- Playwright for automation
- Gmail API
- Notion API
- Google Sheets API

**Observability:**
- OpenTelemetry
- Structured logging

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Quick Start (Russian)

```bash
# Быстрый старт
./setup.sh

# Или вручную
pnpm install
cp apps/api/.env.example apps/api/.env.local
pnpm db:generate
pnpm db:migrate
pnpm dev
```

**Документация:**
- [Настройка и запуск](SETUP.md)
- [Фаза 1: Фундамент](IMPLEMENTATION_SUMMARY.md)
- [Фаза 2: Импорт вакансий](PHASE_2_SUMMARY_ru.md)

### Environment Variables

See `apps/api/.env.example` and `apps/web/.env.example` for required configuration.

## 📦 Domain Modules

### ✅ Phase 1: Foundation
- **auth** - Authentication and authorization (JWT)
- **users** - User management
- **workspaces** - Multi-tenant workspace support
- **profiles** - Candidate profiles and preferences
- **resumes** - Resume and asset management (scaffold)
- **analytics** - Funnel metrics (scaffold)

### ✅ Phase 2: Job Ingestion
- **job-sources** - Job source integrations
- **ingestion** - Job collection pipeline
- **normalization** - Job data normalization
- **matching** - Relevance scoring engine (scaffold)
- **queue** - BullMQ job queues

### 🔜 Phase 3: Matching & Applications
- **applications** - Application lifecycle
- **approvals** - Approval workflows
- **automation** - Auto-apply orchestration

### 🔜 Phase 4: Communications
- **communications** - Email tracking
- **gmail** - Gmail integration

### 🔜 Phase 5: External Sync
- **notion** - Notion sync
- **sheets** - Google Sheets sync

### 🔜 Phase 6: Observability
- **audit** - Audit logging
- **observability** - Metrics and tracing
- **feature-flags** - Feature flag system

## 📊 Job Lifecycle

```
discovered → normalized → scored → shortlisted → rejected
```

## 📊 Application Lifecycle

```
draft → ready_to_apply → pending_approval → approved → applying → applied
→ reply_received → interview → test_task → rejected/offer → archived
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## 📝 License

MIT
