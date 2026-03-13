# 🚀 ДЕПЛОЙ НА VERCEL - ПОШАГОВАЯ ИНСТРУКЦИЯ

## ✅ Всё готово к деплою!

Git репозиторий инициализирован, код закоммичен.

---

## 📝 ШАГ 1: Создать репозиторий на GitHub

1. **Открыть:** https://github.com/new
2. **Repository name:** `ai-job-search-os`
3. **Public** или **Private** (на ваш выбор)
4. **НЕ нажимать** "Add README"
5. **Нажать:** "Create repository"

---

## 📝 ШАГ 2: Запушить код на GitHub

Выполнить в терминале:

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI"

# Добавить remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-job-search-os.git

# Запушить
git push -u origin main
```

**Готово!** Код на GitHub.

---

## 📝 ШАГ 3: Задеплоить Frontend на Vercel

### Вариант A: Через Vercel UI (проще)

1. **Открыть:** https://vercel.com/new
2. **Нажать:** "Import Git Repository"
3. **Выбрать:** GitHub и ваш репозиторий `ai-job-search-os`
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && pnpm install && pnpm build`
   - **Output Directory:** `apps/web/.next`
   
5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

6. **Нажать:** "Deploy"

### Вариант B: Через Vercel CLI

```bash
# Установить Vercel CLI
npm install -g vercel

# Залогиниться
vercel login

# Задеплоить
cd "/Users/djo/projekt_ALL/job searcher  AI"
vercel --prod
```

---

## 📝 ШАГ 4: Проверить деплой

Через 2-3 минуты после деплоя:

1. **Открыть URL:** `https://ai-job-search-os-xxxx.vercel.app`
2. **Проверить:**
   - ✅ Лендинг загружается
   - ✅ Кнопки работают
   - ✅ Login/Register страницы открываются

---

## ⚠️ ВАЖНО: API должно быть доступно

Frontend на Vercel должен подключаться к API.

### Варианты:

**1. Локальное API (для тестов):**
- Оставить API запущенным локально
- Использовать ngrok для доступа из интернета:
  ```bash
  ngrok http 3001
  ```
- Обновить `NEXT_PUBLIC_API_URL` в Vercel settings

**2. API на Render (рекомендуется):**
- https://render.com
- Бесплатно 750 часов/месяц
- См. инструкцию ниже

**3. API на Railway:**
- https://railway.app
- $5 кредит бесплатно
- Проще чем Render

---

## 🎯 ДЕПЛОЙ API НА RENDER

### 1. Создать Web Service

1. **Открыть:** https://dashboard.render.com
2. **New +** → **Web Service**
3. **Connect repository:** Выбрать ваш `ai-job-search-os`
4. **Configure:**
   - **Name:** `ai-job-search-api`
   - **Root Directory:** `apps/api`
   - **Build Command:** `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command:** `pnpm start:prod`
   - **Instance:** Free

### 2. Создать PostgreSQL

1. **New +** → **PostgreSQL**
2. **Name:** `ai-job-search-db`
3. **Database Name:** `ai_job_search`
4. **Скопировать Internal Connection String**

### 3. Добавить Environment Variables

В Render Dashboard вашего API:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/ai_job_search
REDIS_HOST=upstash-host.com
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
```

### 4. Deploy!

Нажать "Create Web Service"

Через 5-10 минут API будет доступно по URL:
```
https://ai-job-search-api.onrender.com
```

---

## 📝 ШАГ 5: Обновить Frontend URL

После деплоя API:

1. **Открыть:** https://vercel.com/dashboard
2. **Выбрать:** ваш проект `ai-job-search-os`
3. **Settings** → **Environment Variables**
4. **Edit** `NEXT_PUBLIC_API_URL`:
   ```
   https://ai-job-search-api.onrender.com
   ```
5. **Сохранить**
6. **Redeploy:** Deploy → Redeploy

---

## ✨ ГОТОВО!

### Ваши URL:

- **Frontend:** `https://ai-job-search-os.vercel.app`
- **API:** `https://ai-job-search-api.onrender.com`
- **Swagger:** `https://ai-job-search-api.onrender.com/api/docs`

### Можно делиться ссылкой! 🎉

---

## 🔧 Troubleshooting

### Frontend показывает 404:
- Очистить кэш браузера: `Cmd + Shift + R`
- Проверить что Root Directory: `apps/web`

### API не подключается:
- Проверить CORS в API
- Убедиться что `NEXT_PUBLIC_API_URL` правильный

### Build fails на Vercel:
- Проверить логи в Vercel Dashboard
- Убедиться что build command правильный

---

## 📊 Ссылки

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **GitHub Repo:** https://github.com/YOUR_USERNAME/ai-job-search-os

---

**Успехов с деплоем!** 🚀
