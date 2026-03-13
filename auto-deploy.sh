#!/bin/bash

# 🚀 Auto-Deploy Script for AI Job Search OS
# Этот скрипт автоматически подготовит всё для деплоя на Vercel

set -e

echo "🎨 AI Job Search OS - Auto Deploy Script"
echo "========================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Шаг 1: Проверка Git
echo "📦 Шаг 1/5: Проверка Git..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Git не инициализирован!${NC}"
    echo "Выполните: git init"
    exit 1
fi
echo -e "${GREEN}✅ Git найден${NC}"
echo ""

# Шаг 2: Проверка GitHub CLI
echo "🔧 Шаг 2/5: Проверка GitHub CLI..."
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI найден${NC}"
    echo ""
    echo "📝 Хотите создать репозиторий через GitHub CLI? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Создаём репозиторий..."
        gh repo create ai-job-search-os --public --source=. --remote=origin --push
        echo -e "${GREEN}✅ Репозиторий создан!${NC}"
    else
        NEED_PUSH=true
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI не найден${NC}"
    echo ""
    echo "Установить GitHub CLI? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install gh
        else
            echo "Пожалуйста, установите gh вручную: https://cli.github.com/"
        fi
    fi
    NEED_PUSH=true
fi
echo ""

# Шаг 3: Проверка Vercel CLI
echo "🔷 Шаг 3/5: Проверка Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI найден${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel CLI не найден${NC}"
    echo ""
    echo "Установить Vercel CLI? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm install -g vercel
        echo -e "${GREEN}✅ Vercel CLI установлен${NC}"
    else
        echo "Vercel CLI необходим для деплоя!"
        exit 1
    fi
fi
echo ""

# Шаг 4: Логин в Vercel
echo "🔷 Шаг 4/5: Логин в Vercel..."
vercel whoami
if [ $? -ne 0 ]; then
    echo "Выполните логин в Vercel..."
    vercel login
fi
echo -e "${GREEN}✅ Vercel логин выполнен${NC}"
echo ""

# Шаг 5: Деплой
echo "🚀 Шаг 5/5: Деплой на Vercel..."
echo ""
echo "Выберите тип деплоя:"
echo "1) Frontend (Vercel) + API останется локальным"
echo "2) Полный деплой (Frontend + API на Render)"
echo "3) Только тестовый деплой (preview)"
echo ""
read -r deploy_choice

case $deploy_choice in
    1)
        echo ""
        echo "📦 Деплой frontend на Vercel..."
        echo ""
        echo "⚠️  Важно: API должно быть запущено локально или доступно по HTTPS"
        echo ""
        echo "Введите URL API (или нажмите Enter для http://localhost:3001):"
        read -r api_url
        if [ -z "$api_url" ]; then
            api_url="http://localhost:3001"
        fi
        
        # Создаём vercel.json с правильными настройками
        cat > vercel.json << EOF
{
  "buildCommand": "cd apps/web && pnpm build",
  "devCommand": "cd apps/web && pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next",
  "env": {
    "NEXT_PUBLIC_API_URL": "$api_url"
  }
}
EOF
        
        echo "📝 Deploying..."
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Деплой завершён!${NC}"
        echo ""
        echo "📱 Ваш frontend доступен по URL выше"
        echo "⚠️  Не забудьте настроить API!"
        ;;
        
    2)
        echo ""
        echo "📦 Полный деплой..."
        echo ""
        echo "1. Сначала задеплойте API на Render:"
        echo "   https://dashboard.render.com"
        echo "   → New Web Service"
        echo "   → Root Directory: apps/api"
        echo ""
        echo "2. Затем задеплойте Frontend на Vercel:"
        echo "   https://vercel.com/new"
        echo "   → Import Git Repository"
        echo "   → Root Directory: apps/web"
        echo ""
        echo "Открыть инструкцию в браузере? (y/n)"
        read -r open_instr
        if [[ "$open_instr" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            open DEPLOY_INSTRUCTION.md
        fi
        ;;
        
    3)
        echo ""
        echo "🧪 Тестовый деплой (preview)..."
        vercel
        ;;
        
    *)
        echo -e "${RED}❌ Неверный выбор${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Готово!${NC}"
echo ""
echo "📚 Полезные ссылки:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Документация: https://vercel.com/docs"
echo "   - Инструкция: ./DEPLOY_INSTRUCTION.md"
echo ""
echo "📱 Следующие шаги:"
echo "   1. Откройте URL вашего приложения"
echo "   2. Проверьте что frontend работает"
echo "   3. Настройте API если нужно"
echo ""
