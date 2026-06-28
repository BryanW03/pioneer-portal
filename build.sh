#!/bin/bash
# ============================================================
# Pioneer Portal - Render Build Script
# ============================================================
set -e

echo "🔧 Installing dependencies..."
npm ci

echo "🔑 Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing database schema..."
npx prisma db push --skip-generate

echo "🏗️  Building Next.js..."
npm run build

echo "✅ Build complete!"
