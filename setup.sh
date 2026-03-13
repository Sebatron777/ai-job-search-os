#!/bin/bash

# Quick Start Script for AI Job Search OS
# Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL 15+, Redis 7+

set -e

echo "🚀 AI Job Search OS - Quick Start"
echo "=================================="

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current: $NODE_VERSION"
    exit 1
fi
echo "✅ Node.js $NODE_VERSION"

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
PNPM_VERSION=$(pnpm -v)
echo "✅ pnpm $PNPM_VERSION"

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL 15 or higher."
    exit 1
fi
echo "✅ PostgreSQL installed"

if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis not found. Please install Redis 7 or higher."
    exit 1
fi
echo "✅ Redis installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f apps/api/.env.local ]; then
    cp apps/api/.env.example apps/api/.env.local
    echo "✅ Created apps/api/.env.local"
    echo "   ⚠️  Please update DATABASE_URL and JWT_SECRET in apps/api/.env.local"
else
    echo "✅ apps/api/.env.local already exists"
fi

if [ ! -f apps/web/.env.local ]; then
    cp apps/web/.env.example apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
else
    echo "✅ apps/web/.env.local already exists"
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."

read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generating Prisma client..."
    pnpm db:generate
    
    echo "Running migrations..."
    pnpm db:migrate
    
    echo "✅ Database setup complete"
else
    echo "⏭️  Skipping database setup"
    echo "   Run 'pnpm db:generate' and 'pnpm db:migrate' when ready"
fi

# Start Redis check
echo ""
echo "🔍 Checking Redis connection..."
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running"
else
    echo "⚠️  Redis is not running. Start it with: redis-server"
    echo "   Or on macOS: brew services start redis"
fi

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update apps/api/.env.local with your database URL and JWT secret"
echo "2. Start Redis: redis-server (or brew services start redis)"
echo "3. Start the dev servers: pnpm dev"
echo ""
echo "Then access:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001"
echo "  Swagger:  http://localhost:3001/api/docs"
echo ""
echo "📚 See SETUP.md for detailed instructions"
echo "=================================="
