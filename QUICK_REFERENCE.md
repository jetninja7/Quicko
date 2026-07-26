# Quick Reference

Handy commands for daily development on Quicko.

## First Time Setup

```bash
./scripts/setup.sh
```

## Daily Development

### Start Everything
```bash
npm run dev
```

### Start Individual Apps
```bash
npm run dev --filter=@quicko/backend
npm run dev --filter=@quicko/customer-app
npm run dev --filter=@quicko/delivery-app
npm run dev --filter=@quicko/admin-dashboard
```

### Access Points
- Backend API: http://localhost:4000
- Customer App: http://localhost:3000
- Delivery App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- Prisma Studio: http://localhost:5555 (after running `npm run prisma:studio`)

## Database Commands

```bash
cd apps/backend

# View database in GUI
npm run prisma:studio

# Create new migration (after schema change)
npm run prisma:migrate

# Regenerate Prisma Client (after schema change)
npm run prisma:generate

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

## Docker Commands

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset everything (including volumes)
docker-compose down -v
```

## Type Checking & Linting

```bash
# Check all apps
npm run type-check
npm run lint

# Check specific app
npm run type-check --filter=@quicko/backend
npm run lint --filter=@quicko/customer-app
```

## Building

```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=@quicko/backend
npm run build --filter=@quicko/customer-app
```

## Cleaning

```bash
# Clean all build artifacts
npm run clean

# Nuclear option: delete everything and reinstall
npm run clean
rm -rf package-lock.json
npm install
```

## Testing API Endpoints

```bash
# Health check
curl http://localhost:4000/health

# With JSON body (example for future endpoints)
curl -X POST http://localhost:4000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# With JWT auth (example for future endpoints)
curl http://localhost:4000/api/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Check status
git status

# Stage and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name
```

## Environment Variables

### Quick Setup (Development)

Backend (`apps/backend/.env`):
```bash
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quicko?schema=public"
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

Customer App (`apps/customer-app/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Common Issues & Solutions

### Port already in use
```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or change the port in .env
```

### Database connection failed
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check it's running
docker ps
```

### Module not found error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client errors
```bash
cd apps/backend
npm run prisma:generate
```

### Next.js build errors
```bash
cd apps/customer-app
rm -rf .next
npm run dev
```

## Useful File Paths

```
Backend entry point:        apps/backend/src/index.ts
Database schema:            apps/backend/prisma/schema.prisma
Shared types:               packages/shared-types/src/index.ts

Customer app pages:         apps/customer-app/src/app/
Customer app components:    apps/customer-app/src/components/ (create this)
Customer app styles:        apps/customer-app/src/app/globals.css

Delivery app pages:         apps/delivery-app/src/app/ (create this)
Admin app pages:            apps/admin-dashboard/src/app/ (create this)
```

## Project Stats

```bash
# Count lines of code
find apps packages -name "*.ts" -o -name "*.tsx" | xargs wc -l

# List all TODO comments
grep -r "TODO" apps packages --include="*.ts" --include="*.tsx"

# List all API endpoints (after adding routes)
grep -r "app\.\(get\|post\|put\|delete\)" apps/backend/src
```

## Performance & Debugging

```bash
# Clear Turbo cache
rm -rf .turbo

# Clear Next.js cache
rm -rf apps/customer-app/.next
rm -rf apps/delivery-app/.next
rm -rf apps/admin-dashboard/.next

# View real-time database queries (add to schema.prisma):
# log = ["query", "info", "warn", "error"]
```

## Deployment (When Ready)

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Docker Build (Local)
```bash
# Build backend
docker build -f apps/backend/Dockerfile -t quicko-backend .

# Build customer app
docker build -f apps/customer-app/Dockerfile -t quicko-customer-app .

# Run
docker run -p 4000:4000 --env-file apps/backend/.env quicko-backend
```

## VS Code Tips

### Recommended Extensions
- Prisma
- ESLint
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Package Management

```bash
# Add dependency to specific app
npm install package-name --workspace=@quicko/backend

# Add dev dependency
npm install -D package-name --workspace=@quicko/customer-app

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

## Keyboard Shortcuts (If configured in IDE)

- `Cmd+Shift+P`: Command palette
- `Cmd+P`: Quick file open
- `Cmd+Shift+F`: Search across all files
- `Cmd+/`: Toggle comment
- `Cmd+B`: Toggle sidebar

## URLs to Bookmark

- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs
- Stripe Docs: https://stripe.com/docs
- Twilio Docs: https://www.twilio.com/docs

---

For detailed explanations, see:
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Initial setup and roadmap
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed workflows
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical decisions
