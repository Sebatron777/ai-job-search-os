# 🚀 Deployment Guide

## Вариант 1: Vercel (Frontend) + Local API

### Шаг 1: Установить Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2: Залогиниться

```bash
vercel login
```

### Шаг 3: Создать vercel.json для frontend

```bash
cd apps/web
```

Создать файл `apps/web/vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Шаг 4: Обновить .env.local для frontend

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Шаг 5: Задеплоить

```bash
cd apps/web
vercel --prod
```

---

## Вариант 2: Vercel (Frontend) + Render (API)

### Frontend на Vercel:

1. Зайти на https://vercel.com
2. Import GitHub репозиторий
3. Root Directory: `apps/web`
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`
6. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```

### API на Render:

1. Зайти на https://render.com
2. Create New Web Service
3. Connect GitHub repo
4. Root Directory: `apps/api`
5. Build Command: `pnpm install && pnpm db:generate && pnpm build`
6. Start Command: `pnpm start:prod`
7. Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   REDIS_HOST=...
   JWT_SECRET=...
   ```

---

## Вариант 3: Docker Deploy (локально)

### Запустить всё в Docker:

```bash
docker-compose up -d
```

### Проверить:

```bash
docker-compose ps
docker-compose logs -f
```

---

## 🎯 Быстрый деплой на Vercel (прямо сейчас)

### 1. Создать vercel.json в корне проекта:

```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

### 2. Задеплоить:

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI"
vercel --prod
```

### 3. Получить URL:

```
https://your-project.vercel.app
```

---

## ⚡ Super Quick Deploy

Просто выполните:

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI"

# Установить Vercel CLI
npm install -g vercel

# Залогиниться
vercel login

# Задеплоить
vercel --prod
```

**Готово!** 🎉

---

## 🔧 Что нужно для production:

### Frontend (.env.production):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### API (на отдельном сервере):
- PostgreSQL (Render/Railway)
- Redis (Upstash)
- JWT Secret
- LLM API Key

---

## 📊 Рекомендуемая архитектура:

```
┌─────────────┐
│   Vercel    │  Frontend (Next.js)
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTPS
       │
       ▼
┌─────────────┐
│   Render    │  API (NestJS)
│    (API)    │
└──────┬──────┘
       │
       ├──────► PostgreSQL (Render DB)
       │
       └──────► Redis (Upstash)
```

---

## 💰 Бесплатные тарифы:

| Сервис | Бесплатно |
|--------|-----------|
| Vercel | ✅ 100GB bandwidth |
| Render | ✅ 750 hours/month |
| Railway | ✅ $5 credit |
| Upstash Redis | ✅ 10,000 commands/day |

---

**Выбирайте вариант и давайте задеплоим!** 🚀
