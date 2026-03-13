# ✅ PRE-DEPLOY CHECKLIST

## Перед деплоем

### ✅ Код и Git
- [x] Код закоммичен
- [x] Запушено на GitHub
- [x] .gitignore настроен
- [x] .renderignore создан
- [x] vercel.json настроен

### ✅ Тесты
- [x] Все тесты проходят (88/88)
- [x] Нет ошибок компиляции
- [x] TypeScript проверяет типы

### ✅ Конфигурация
- [x] .env.example файлы существуют
- [x] PRODUCTION_ENV.md создан
- [x] CORS настроен
- [x] Ports настроены (API: 10000, Frontend: 3000)

### ✅ База данных
- [x] Prisma schema готова
- [x] Миграции созданы
- [x] Seed данные (опционально)

### ✅ Документация
- [x] README.md
- [x] DEPLOY_INSTRUCTION.md
- [x] RENDER_API.md
- [x] PRODUCTION_ENV.md
- [x] QUICKSTART.md

---

## Деплой API (Render)

### 1. Создать Web Service
- [ ] Открыть https://dashboard.render.com
- [ ] Login через GitHub
- [ ] New + → Web Service
- [ ] Connect repository: `ai-job-search-os`

### 2. Настройки
- [ ] Name: `ai-job-search-api`
- [ ] Branch: `main`
- [ ] Root Directory: `apps/api`
- [ ] Build Command: `pnpm install && pnpm db:generate && pnpm build`
- [ ] Start Command: `pnpm start:prod`
- [ ] Instance: Free

### 3. PostgreSQL
- [ ] New + → PostgreSQL
- [ ] Name: `ai-job-search-db`
- [ ] Database: `ai_job_search`
- [ ] Скопировать Internal Connection String

### 4. Environment Variables
- [ ] NODE_ENV=production
- [ ] DATABASE_URL=<из шага 3>
- [ ] JWT_SECRET=<генерировать случайный 32+ символа>
- [ ] LLM_PROVIDER=mock (или anthropic с ключом)
- [ ] PORT=10000

### 5. Deploy
- [ ] Нажать "Create Web Service"
- [ ] Подождать 5-10 минут
- [ ] Проверить health: `https://<url>/health`
- [ ] Проверить Swagger: `https://<url>/api/docs`

---

## Деплой Frontend (Vercel)

### 1. Import
- [ ] Открыть https://vercel.com/new
- [ ] Import Git Repository
- [ ] Выбрать `ai-job-search-os`

### 2. Настройки
- [ ] Framework Preset: Next.js
- [ ] Root Directory: `apps/web`
- [ ] Build Command: `cd ../.. && pnpm install && pnpm build`
- [ ] Output Directory: `apps/web/.next`

### 3. Environment Variables
- [ ] NEXT_PUBLIC_API_URL=`https://<ваш-api>.onrender.com`
- [ ] NEXT_PUBLIC_APP_URL=`https://<ваш-app>.vercel.app`

### 4. Deploy
- [ ] Нажать "Deploy"
- [ ] Подождать 2-3 минуты
- [ ] Открыть URL
- [ ] Проверить что лендинг загружается

---

## Post-Deploy Проверка

### API
- [ ] GET /health возвращает `{"status":"ok"}`
- [ ] GET /api/docs открывает Swagger
- [ ] POST /auth/register работает
- [ ] POST /auth/login работает

### Frontend
- [ ] Лендинг загружается
- [ ] Login страница работает
- [ ] Register страница работает
- [ ] Dashboard открывается после логина
- [ ] Jobs страница загружается

### Интеграция
- [ ] Frontend подключается к API
- [ ] Регистрация создаёт пользователя
- [ ] Логин возвращает токен
- [ ] Dashboard показывает данные

---

## Troubleshooting

### API не запускается
- Проверить логи в Render Dashboard
- Проверить DATABASE_URL
- Проверить что PORT=10000

### Frontend показывает 404
- Очистить кэш браузера (Cmd+Shift+R)
- Проверить Root Directory: `apps/web`
- Проверить build логи в Vercel

### CORS ошибки
- Проверить FRONTEND_URL в API
- Добавить домен Vercel в CORS

### База данных не подключается
- Проверить что PostgreSQL создан
- Скопировать правильный connection string
- Проверить что DATABASE_URL установлен

---

## Финальные шаги

### После успешного деплоя:
- [ ] Сохранить все URL
- [ ] Обновить документацию
- [ ] Протестировать полный flow
- [ ] Настроить мониторинг (опционально)
- [ ] Добавить аналитику (опционально)

### URL которые нужно сохранить:
```
GitHub:    https://github.com/Sebatron777/ai-job-search-os
API:       https://ai-job-search-api.onrender.com
Frontend:  https://ai-job-search-os.vercel.app
Swagger:   https://ai-job-search-api.onrender.com/api/docs
```

---

## 🎉 ГОТОВО!

Если все пункты отмечены ✅ - поздравляю, проект задеплоен!

**Следующие шаги:**
- Добавить реальные job sources
- Подключить настоящий LLM (Anthropic)
- Настроить Gmail интеграцию
- Добавить пользователей

**Успехов!** 🚀
