# 🚀 Production Environment Variables

## API (Render)

```env
# Application
NODE_ENV=production
PORT=10000

# Database (из Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/ai_job_search

# Redis (опционально, можно использовать Upstash)
REDIS_HOST=your-redis.upstash.io
REDIS_PORT=6379

# Authentication
JWT_SECRET=super-secret-production-key-min-32-chars-long
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=another-super-secret-refresh-key-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=30d

# LLM Provider
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-api03-your-actual-key-here
LLM_MODEL=claude-sonnet-4-5-20250929
LLM_TEMPERATURE=0.3

# Storage (S3 для production)
STORAGE_PROVIDER=s3
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key

# Observability
LOG_LEVEL=info
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Feature Flags
FEATURE_AUTO_APPLY_ENABLED=true
FEATURE_GMAIL_INTEGRATION_ENABLED=true
FEATURE_NOTION_INTEGRATION_ENABLED=true
FEATURE_SHEETS_INTEGRATION_ENABLED=true
```

## Frontend (Vercel)

```env
# Application
NEXT_PUBLIC_API_URL=https://ai-job-search-api.onrender.com
NEXT_PUBLIC_APP_URL=https://ai-job-search-os.vercel.app

# Analytics (опционально)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## 🔐 Как получить ключи:

### PostgreSQL (Render)
1. Создать PostgreSQL на Render
2. Dashboard → Databases → Copy Internal Connection String

### Redis (Upstash - бесплатно)
1. https://upstash.com
2. Create Database → Redis
3. Copy REST URL и REST TOKEN

### LLM (Anthropic)
1. https://console.anthropic.com
2. Get API Keys
3. Copy key

### S3 Storage (AWS - опционально)
1. https://aws.amazon.com/s3
2. Create Bucket
3. Create IAM User с S3 permissions
4. Copy Access Key и Secret Key

---

## ⚠️ Важно!

- **НЕ коммитьте** .env файлы в git!
- Используйте **Environment Variables** в Render/Vercel
- Для локальной разработки копируйте в `.env.local`
