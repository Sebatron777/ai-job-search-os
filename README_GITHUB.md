# AI Job Search OS 🚀

AI-powered job search and application automation platform.

## ✨ Features

- 🎯 AI-powered job matching
- 📝 Automated cover letter generation
- 🔄 Multi-source job ingestion
- 📊 Application tracking
- 🎨 Modern UI (Next.js + Tailwind)

## 🚀 Quick Deploy

### Frontend (Vercel)

1. Import this repo on Vercel
2. Root Directory: `apps/web`
3. Build: `cd ../.. && pnpm install && pnpm build`
4. Deploy!

### API (Render)

1. Create Web Service
2. Root Directory: `apps/api`
3. Build: `pnpm install && pnpm db:generate && pnpm build`
4. Start: `pnpm start:prod`
5. Add PostgreSQL database

## 📚 Documentation

- [DEPLOY.md](./DEPLOY.md) - Deployment guide
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Vercel specific guide
- [QUICKSTART.md](./QUICKSTART.md) - Local development

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS

**Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- Redis + BullMQ

**Integrations:**
- Anthropic/OpenAI (LLM)
- Mock Job Sources

## 📊 Stats

- 88/88 tests passing ✅
- 46+ API endpoints
- 35+ database models
- 5 frontend pages

## 🎯 Demo

Frontend: https://your-app.vercel.app  
API: https://your-api.onrender.com  
Swagger: https://your-api.onrender.com/api/docs

---

**Ready to deploy!** 🚀
