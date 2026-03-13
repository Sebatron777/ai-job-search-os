# 🚀 Деплой API на Render

## Шаг 1: Открыть Render

https://dashboard.render.com

## Шаг 2: Создать Web Service

1. Нажмите **New +** → **Web Service**
2. **Connect repository:** Выберите `ai-job-search-os`
3. **Configure:**

   - **Name:** `ai-job-search-api`
   - **Branch:** `main`
   - **Root Directory:** `apps/api`
   - **Build Command:** `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command:** `pnpm start:prod`
   - **Instance:** Free

## Шаг 3: Создать PostgreSQL

1. **New +** → **PostgreSQL**
2. **Name:** `ai-job-search-db`
3. **Database Name:** `ai_job_search`
4. **Скопируйте Internal Connection String**

## Шаг 4: Environment Variables

В настройках Web Service добавьте:

```
NODE_ENV=production
DATABASE_URL=postgresql://... (из шага 3)
REDIS_HOST=upstash-host.com (или используйте Render Redis)
REDIS_PORT=6379
JWT_SECRET=super-secret-key-change-this-in-production
LLM_PROVIDER=mock
```

## Шаг 5: Deploy!

Нажмите **Create Web Service**

Через 5-10 минут API будет доступно:
```
https://ai-job-search-api.onrender.com
/api/docs - Swagger
/health - Health check
```
