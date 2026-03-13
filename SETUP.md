# Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** 15+
- **Redis** 7+

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

#### Backend (.env.local)

```bash
cp apps/api/.env.example apps/api/.env.local
```

Edit `apps/api/.env.local` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_job_search?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (generate secure secrets for production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Storage (optional for MVP)
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# LLM (optional for MVP)
LLM_API_KEY=
```

#### Frontend (.env.local)

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database
pnpm db:seed
```

### 4. Start Redis

```bash
# macOS (with Homebrew)
brew services start redis

# Or run manually
redis-server
```

### 5. Start Development Servers

```bash
# Start both API and Web
pnpm dev

# Or start individually
pnpm dev:api   # API on http://localhost:3001
pnpm dev:web   # Web on http://localhost:3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: `pnpm db:studio`

## Running Tests

```bash
# All tests
pnpm test

# API tests only
pnpm --filter @ai-job-search/api test

# Shared package tests
pnpm --filter @ai-job-search/shared test

# E2E tests
pnpm test:e2e
```

## Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Create a new migration
pnpm --filter @ai-job-search/api prisma migrate dev --name your_migration_name

# Apply migrations to production
pnpm db:migrate:deploy

# Reset database (WARNING: deletes all data)
pnpm db:migrate:reset

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database
pnpm db:seed
```

## Project Structure

```
ai-job-search-os/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/    # User management
│   │   │   ├── workspaces/ # Workspaces
│   │   │   ├── profiles/ # Candidate profiles
│   │   │   ├── resumes/  # Resume assets
│   │   │   ├── job-sources/ # Job source integrations
│   │   │   ├── jobs/     # Job listings
│   │   │   ├── matching/ # Matching engine
│   │   │   ├── applications/ # Applications
│   │   │   ├── integrations/ # External integrations
│   │   │   └── analytics/ # Analytics
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/              # Next.js frontend
│       └── src/
│           ├── app/      # App Router pages
│           ├── components/ # React components
│           └── lib/      # Utilities
├── packages/
│   ├── config/           # Shared configs (TS, ESLint)
│   ├── types/            # Shared TypeScript types
│   ├── shared/           # Shared utilities
│   └── prompts/          # LLM prompt templates
└── workers/              # Background workers (TODO)
    ├── ingest/
    ├── match/
    ├── apply/
    ├── mail/
    └── sync/
```

## Architecture Overview

### Backend (NestJS)

- **Modules**: Domain-driven modules (auth, users, profiles, jobs, etc.)
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis + BullMQ (for async jobs)
- **Auth**: JWT-based authentication
- **API**: REST with Swagger/OpenAPI documentation

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **State**: TanStack Query for server state, Zustand for client state
- **UI**: Tailwind CSS + shadcn/ui components
- **Type Safety**: Full TypeScript with shared types

### Shared Packages

- **@ai-job-search/types**: Domain types and interfaces
- **@ai-job-search/shared**: Utility functions
- **@ai-job-search/prompts**: LLM prompt templates

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update current user

### Workspaces
- `GET /workspaces` - List user's workspaces
- `GET /workspaces/:slug` - Get workspace by slug
- `POST /workspaces` - Create workspace
- `PUT /workspaces/:id` - Update workspace

### Profiles
- `GET /profiles/me` - Get candidate profile
- `POST /profiles` - Create profile
- `PUT /profiles/:id` - Update profile
- `POST /profiles/:id/preferences` - Set job preferences

### Jobs
- `GET /jobs` - List jobs
- `GET /jobs/:id` - Get job details

### Applications
- `GET /applications` - List applications
- `GET /applications/:id` - Get application details

### Analytics
- `GET /analytics/funnel` - Get funnel metrics

Full API documentation: http://localhost:3001/api/docs

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and run tests**
   ```bash
   pnpm test
   ```

3. **Type check**
   ```bash
   pnpm --filter @ai-job-search/api typecheck
   pnpm --filter @ai-job-search/web typecheck
   ```

4. **Commit and push**
   ```bash
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **Create a pull request**

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS with Homebrew)
brew services restart postgresql@15
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Issues

```bash
# Regenerate Prisma client
pnpm db:generate

# Reset and migrate
pnpm db:migrate:reset
pnpm db:migrate
```

## Next Steps

After setup, follow the implementation phases:

1. **Phase 1**: ✅ Repo structure, auth, candidate profile
2. **Phase 2**: Job source abstractions, ingestion, deduplication
3. **Phase 3**: Matching engine, application generation
4. **Phase 4**: Approval workflow, apply automation
5. **Phase 5**: Gmail integration, email monitoring
6. **Phase 6**: Notion/Sheets sync, analytics, hardening

See README.md for detailed phase descriptions.
