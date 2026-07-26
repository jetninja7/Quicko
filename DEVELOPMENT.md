# Development Guide

This guide covers common development workflows for Quicko.

## Quick Start

### Automated Setup (Recommended)

```bash
./scripts/setup.sh
```

This script will:
- Check prerequisites (Node.js 20+, Docker)
- Install all dependencies
- Create environment files from templates
- Start PostgreSQL in Docker
- Run database migrations
- Generate Prisma client

### Manual Setup

If you prefer manual control:

```bash
# 1. Install dependencies
npm install

# 2. Create environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/customer-app/.env.example apps/customer-app/.env.local

# 3. Start database
docker-compose up -d postgres

# 4. Run migrations
cd apps/backend
npm run prisma:migrate
npm run prisma:generate
cd ../..

# 5. Start all apps
npm run dev
```

## Development Workflow

### Starting the Development Environment

```bash
# Start everything (backend + all frontends)
npm run dev

# Start only specific apps
npm run dev --filter=@quicko/backend
npm run dev --filter=@quicko/customer-app
```

### Making Database Changes

1. **Edit the Prisma schema**: `apps/backend/prisma/schema.prisma`

2. **Create a migration**:
```bash
cd apps/backend
npm run prisma:migrate
```

3. **View your database** (optional):
```bash
npm run prisma:studio
```

4. **Regenerate Prisma Client** (if schema changed):
```bash
npm run prisma:generate
```

### Adding a New Shared Type

1. Edit `packages/shared-types/src/index.ts`
2. Build the package:
```bash
cd packages/shared-types
npm run build
```
3. Types are now available in all apps via `@quicko/shared-types`

### Code Style and Type Safety

```bash
# Type check all apps
npm run type-check

# Lint all apps
npm run lint

# Type check specific app
npm run type-check --filter=@quicko/backend
```

## Testing Your Changes

### Manual Testing

1. **Backend API**:
```bash
# Health check
curl http://localhost:4000/health

# Test with Postman or Thunder Client
# Import the collection from docs/api-collection.json (when available)
```

2. **Customer App**:
- Open http://localhost:3000
- Test on mobile viewport in Chrome DevTools
- Test PWA: Chrome → View → Developer → "Install Quicko"

3. **Real-time Updates**:
- Open customer app in two browser windows
- Create an order in one
- Watch for status updates in both

### Database Inspection

```bash
cd apps/backend
npm run prisma:studio
```

Opens a GUI at http://localhost:5555 to browse/edit data.

## Common Issues

### Port Already in Use

If you see `EADDRINUSE` errors:

```bash
# Find process using port 4000
lsof -ti:4000

# Kill it
kill -9 $(lsof -ti:4000)
```

Or change the port in `apps/backend/.env`:
```
PORT=4001
```

### Database Connection Failed

1. Check Docker is running: `docker ps`
2. Check PostgreSQL is healthy: `docker-compose logs postgres`
3. Restart the database: `docker-compose restart postgres`

### Prisma Client Not Found

```bash
cd apps/backend
npm run prisma:generate
```

### TypeScript Errors After Pulling

```bash
# Clean and reinstall
npm run clean
npm install
```

## Working with External Services

### Twilio (Phone OTP)

1. Sign up at https://www.twilio.com/try-twilio
2. Get a phone number with SMS capability
3. Add credentials to `apps/backend/.env`:
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

**Testing without Twilio**: Implement a bypass in development:
```typescript
// In OTP verification logic
if (process.env.NODE_ENV === 'development' && code === '000000') {
  return { verified: true };
}
```

### Stripe (Payments)

1. Sign up at https://stripe.com
2. Get test API keys (pk_test_... and sk_test_...)
3. Add to environment files:

Backend (`apps/backend/.env`):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Customer App (`apps/customer-app/.env.local`):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Test cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3DS: `4000 0025 0000 3155`

## Debugging

### Backend

```bash
cd apps/backend
NODE_ENV=development npm run dev
```

- Add `console.log` or use `debugger` statements
- Attach VS Code debugger (see `.vscode/launch.json` if configured)

### Frontend (Next.js)

- Use React Developer Tools extension
- Check browser console for errors
- Use `console.log` in components or API routes
- Network tab to inspect API calls

### Database Queries

Enable Prisma query logging in `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

## Environment Variables

### Backend Required Variables

```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quicko?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Customer App Required Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Git Workflow

### Branch Naming

- `feature/add-checkout-flow`
- `fix/order-status-bug`
- `chore/upgrade-dependencies`

### Commit Messages

Follow conventional commits:
- `feat: add checkout flow`
- `fix: order status not updating`
- `chore: upgrade prisma to 5.14`
- `docs: update README with deployment steps`

### Before Committing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build to ensure no build errors
npm run build
```

## Docker Development

### Rebuild After Dependency Changes

```bash
docker-compose up --build
```

### View Container Logs

```bash
docker-compose logs -f backend
docker-compose logs -f customer-app
```

### Access PostgreSQL Container

```bash
docker exec -it quicko-postgres psql -U postgres -d quicko
```

### Reset Database (Nuclear Option)

```bash
docker-compose down -v
docker-compose up -d postgres
cd apps/backend
npm run prisma:migrate
```

## Performance Tips

### Turbo Cache

Turborepo caches build outputs. Clear if needed:

```bash
rm -rf .turbo
```

### Next.js Cache

```bash
cd apps/customer-app
rm -rf .next
```

### Node Modules

If dependencies act strange:

```bash
npm run clean
rm -rf package-lock.json
npm install
```

## Useful Commands

```bash
# Count lines of code
find apps packages -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Search for TODO comments
grep -r "TODO" apps packages --include="*.ts" --include="*.tsx"

# Find all API endpoints
grep -r "app\.\(get\|post\|put\|delete\)" apps/backend/src

# Show database schema in SQL
cd apps/backend
npx prisma db pull --print
```

## VS Code Extensions (Recommended)

- **Prisma**: Syntax highlighting for `.prisma` files
- **ESLint**: Real-time linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind class autocomplete
- **Thunder Client**: API testing (Postman alternative)

## Next Steps

Once you have the basics working:

1. Implement phone OTP authentication flow
2. Build product catalog with search
3. Add shopping cart functionality
4. Integrate Stripe checkout
5. Build real-time order tracking with WebSocket
6. Create delivery driver app
7. Build admin dashboard

See [README.md](./README.md) for full roadmap.
