# 🚀 БЫСТРЫЙ ДЕПЛОЙ - VERCEL FRONTEND

## Вариант: Frontend на Vercel, API локально

Это самый быстрый способ увидеть ваш frontend в интернете!

---

## 📦 ШАГ 1: Деплой через Vercel UI

### 1. Откройте Vercel:
**https://vercel.com/new**

### 2. Import Git Repository:
- Нажмите **"Import Git Repository"**
- Выберите GitHub
- Найдите репозиторий: `Sebatron777/ai-job-search-os`
- Нажмите **"Import"**

### 3. Настройте проект:

**Framework Preset:** Next.js (определится автоматически)

**Root Directory:** `apps/web` ← **ВАЖНО!**

**Build Command:** 
```
cd ../.. && pnpm install && pnpm build
```

**Output Directory:** 
```
apps/web/.next
```

### 4. Environment Variables:

Нажмите **"Edit"** и добавьте:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

*(Позже обновите на production URL API)*

### 5. Нажмите **"Deploy"**

---

## ⏱️ Через 2-3 минуты:

Получите URL типа:
```
https://ai-job-search-os.vercel.app
```

---

## 🎯 Что работает:

✅ Лендинг страница  
✅ Login/Register страницы  
✅ Dashboard (после логина)  
✅ UI компоненты  

⚠️ **API вызовы не работают** (API локальное)

---

## 🔧 Чтобы работало полностью:

### Запустите API локально:

```bash
cd "/Users/djo/projekt_ALL/job searcher  AI/apps/api"
pnpm dev
```

### И используйте ngrok для доступа из интернета:

```bash
# В другом терминале
ngrok http 3001
```

Получите URL типа: `https://abc123.ngrok.io`

Обновите Environment Variables на Vercel:
```
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

Сделайте Redeploy на Vercel.

---

## 🎉 Готово!

**Frontend доступен в интернете!**

---

## 📊 Следующие шаги:

1. ✅ Frontend на Vercel - **ГОТОВО**
2. ⏳ API на Railway/Render - потом
3. ⏳ Обновить API URL - потом

---

**Откройте:** https://vercel.com/new
