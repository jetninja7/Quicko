#!/bin/bash
set -e

echo "🚀 Setting up Quicko development environment..."

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Visit https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Visit https://docker.com"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 or higher is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ All prerequisites met"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Set up environment files
echo ""
echo "🔧 Setting up environment files..."
[ ! -f apps/backend/.env ] && cp apps/backend/.env.example apps/backend/.env && echo "Created apps/backend/.env"
[ ! -f apps/customer-app/.env.local ] && cp apps/customer-app/.env.example apps/customer-app/.env.local && echo "Created apps/customer-app/.env.local"

# Start database
echo ""
echo "🗄️  Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo ""
echo "🔄 Running database migrations..."
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update environment variables in apps/backend/.env"
echo "2. Add your Twilio and Stripe credentials"
echo "3. Run 'npm run dev' to start all applications"
echo ""
echo "Applications will be available at:"
echo "  - Backend API: http://localhost:4000"
echo "  - Customer App: http://localhost:3000"
echo "  - Delivery App: http://localhost:3001"
echo "  - Admin Dashboard: http://localhost:3002"
echo ""
