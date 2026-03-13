# 🚀 Деплой на Railway - БЫСТРАЯ ИНСТРУКЦИЯ

## ✅ Преимущество Railway:
- $5 кредит бесплатно (хватит на 2-3 недели)
- PostgreSQL включён
- Redis включён
- Нет лимита часов
- Проще чем Render

---

## ШАГ 1: Login

1. Откройте https://railway.app
2. Нажмите **"Login"** → **"Sign in with GitHub"**
3. Авторизуйтесь через GitHub

---

## ШАГ 2: Создать проект для API

1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите репозиторий: `ai-job-search-os`

---

## ШАГ 3: Настроить API

### Вкладка "Variables" (сразу добавьте):

```env
ROOT_DIRECTORY=apps/api
PORT=10000
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=railway-production-secret-key-abc123xyz789
LLM_PROVIDER=mock
```

### Вкладка "Settings":

- **Build Command:** `pnpm install && pnpm db:generate && pnpm build`
- **Start Command:** `pnpm start:prod`
- **Root Directory:** `apps/api`

---

## ШАГ 4: Добавить PostgreSQL

1. Нажмите **"+ New"** → **"PostgreSQL"**
2. Railway автоматически создаст базу
3. **Скопируйте DATABASE_URL** из переменных PostgreSQL

---

## ШАГ 5: Deploy!

1. Нажмите **"Deploy"**
2. Подождите 5-7 минут
3. Получите URL: `https://ai-job-search-api-production.up.railway.app`

---

## ШАГ 6: Проверить API

Откройте в браузере:
```
https://<ваш-url>.railway.app/health
https://<ваш-url>.railway.app/api/docs
```

Должно вернуться:
```json
{"status":"ok","timestamp":"..."}
```

---

## ШАГ 7: Деплой Frontend на Vercel

1. Откройте https://vercel.com/new
2. Import: `ai-job-search-os`
3. **Root Directory:** `apps/web`
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://<ваш-api>.railway.app
   ```
5. **Deploy!**

---

## ⏱️ Время:
- API на Railway: ~7 минут
- Frontend на Vercel: ~3 минуты
- **ИТОГО:** ~10 минут

---

## 💰 Стоимость:

- **Бесплатно:** $5 кредит (хватит на 2-3 недели)
- **Потом:** ~$5-10/месяц за API + PostgreSQL

---

## 🔧 Troubleshooting

### API не запускается
- Проверьте логи в Railway Dashboard
- Проверьте что DATABASE_URL установлен
- Проверьте PORT=10000

### Ошибки базы данных
- Убедитесь что PostgreSQL создан
- Проверьте что DATABASE_URL ссылается на `${{Postgres.DATABASE_URL}}`

### Frontend не подключается
- Обновите NEXT_PUBLIC_API_URL в Vercel
- Проверьте CORS (должен разрешать Vercel домен)

---

## 🎉 Готово!

Сохраните URL:
```
GitHub:    https://github.com/Sebatron777/ai-job-search-os
API:       https://<your-app>.railway.app
Frontend:  https://ai-job-search-os.vercel.app
Swagger:   https://<your-app>.railway.app/api/docs
```

**Успехов!** 🚀
