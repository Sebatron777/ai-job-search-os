# 🚀 Быстрый Деплой на Vercel

## Способ 1: Через GitHub (рекомендуется)

### Шаг 1: Запушить код на GitHub

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI"

# Инициализировать git если нет
git init

# Добавить все файлы
git add .

# Сделать коммит
git commit -m "Initial commit - AI Job Search OS"

# Создать репозиторий на GitHub и запушить
git remote add origin https://github.com/YOUR_USERNAME/ai-job-search-os.git
git push -u origin main
```

### Шаг 2: Задеплоить на Vercel

1. **Открыть** https://vercel.com/new
2. **Import Git Repository**
3. **Выбрать** ваш репозиторий `ai-job-search-os`
4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm build`
   - **Output Directory**: `apps/web/.next`

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

6. **Click "Deploy"**

### Шаг 3: Готово!

Через 1-2 минуты получите URL:
```
https://ai-job-search-os.vercel.app
```

---

## Способ 2: Vercel CLI

### 1. Установить Vercel CLI

```bash
npm i -g vercel
```

### 2. Залогиниться

```bash
vercel login
```

Откроется браузер для логина.

### 3. Задеплоить

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI"
vercel --prod
```

### 4. Получить URL

```
Production: https://your-project.vercel.app
```

---

## ⚠️ Важно: API должно быть доступно

Frontend на Vercel должен иметь доступ к API.

### Варианты:

**1. Оставить API локально (для тестов):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
⚠️ Будет работать только локально!

**2. Задеплоить API на Render:**
- https://render.com
- Бесплатно 750 часов/месяц
- PostgreSQL включён

**3. Задеплоить API на Railway:**
- https://railway.app
- $5 кредит бесплатно
- Проще чем Render

**4. Задеплоить API на Vercel (Serverless):**
Нужно адаптировать NestJS под serverless функции.

---

## 🎯 Рекомендуемый план:

### Для демонстрации (бесплатно):

1. **Frontend** → Vercel (бесплатно)
2. **API** → Render (бесплатно 750 часов)
3. **PostgreSQL** → Render (встроенная)
4. **Redis** → Upstash (бесплатно 10K команд/день)

### Для production (платно ~$20-30/месяц):

1. **Frontend** → Vercel Pro ($20)
2. **API** → Render Starter ($7)
3. **PostgreSQL** → Render Standard ($7)
4. **Redis** → Upstash Plus ($10)

---

## 📝 Пошаговая инструкция для Render + Vercel

### 1. API на Render:

1. Зайти на https://render.com
2. **New +** → **Web Service**
3. Connect GitHub repo
4. **Configure**:
   - **Name**: ai-job-search-api
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command**: `pnpm start:prod`
   - **Instance**: Free

5. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://user:pass@db:5432/ai_job_search
   REDIS_HOST=your-redis.upstash.io
   REDIS_PORT=6379
   JWT_SECRET=your-secret-key-here
   ```

6. **Create Database**:
   - New + → PostgreSQL
   - Name: ai-job-search-db
   - Copy connection string

7. **Deploy!**

### 2. Frontend на Vercel:

1. Зайти на https://vercel.com/new
2. Import GitHub repo
3. **Root Directory**: `apps/web`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://ai-job-search-api.onrender.com
   ```
5. **Deploy!**

---

## 🔧 Troubleshooting

### Frontend не подключается к API:

**Проблема:** CORS или неверный URL

**Решение:**
1. Проверить `NEXT_PUBLIC_API_URL` в Vercel settings
2. Добавить CORS в API:
   ```typescript
   // apps/api/src/main.ts
   app.enableCors({
     origin: ['https://your-app.vercel.app'],
     credentials: true,
   });
   ```

### API не запускается на Render:

**Проблема:** База данных не подключена

**Решение:**
1. Создать PostgreSQL на Render
2. Скопировать connection string
3. Добавить в Environment Variables как `DATABASE_URL`

### Build fails на Vercel:

**Проблема:** Неправильный build command

**Решение:**
```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "installCommand": "pnpm install"
}
```

---

## 📊 Ссылки

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Upstash Console**: https://console.upstash.io

---

## ✨ Готово!

После деплоя получите:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-api.onrender.com`
- **Swagger**: `https://your-api.onrender.com/api/docs`

**Можно делиться ссылкой!** 🎉
