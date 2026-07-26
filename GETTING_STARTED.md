# Getting Started with Quicko

Welcome to Quicko! This guide will get you up and running in minutes.

## What You Just Got

A fully scaffolded quick-commerce delivery platform with:

✅ **Backend API** (Node.js + Express + TypeScript)
- JWT authentication ready
- Prisma ORM with complete database schema
- Stripe payment integration setup
- Twilio phone OTP verification setup
- WebSocket server for real-time tracking

✅ **Customer Web App** (Next.js + Tailwind)
- PWA-enabled (works like a native app)
- Responsive mobile-first design
- Stripe payment UI components
- Real-time order tracking ready

✅ **Delivery Driver App** (Next.js)
- Ready for order acceptance and tracking features

✅ **Admin Dashboard** (Next.js)
- Ready for inventory, order, and analytics management

✅ **Shared Types Package**
- Type-safe contracts across all apps
- Pre-defined models for User, Order, Product, etc.

✅ **Docker Setup**
- PostgreSQL ready to run
- Production Dockerfiles for deployment

## Prerequisites

Before starting, make sure you have:

- ✅ **Node.js 20+** → [Download](https://nodejs.org)
- ✅ **Docker Desktop** → [Download](https://docker.com/products/docker-desktop)
- ✅ **npm 10+** (comes with Node.js)

## 5-Minute Quickstart

### Step 1: Run Setup Script

```bash
cd /Users/balu/Desktop/Quicko
./scripts/setup.sh
```

This will:
- Install all dependencies
- Create environment files
- Start PostgreSQL
- Run database migrations

### Step 2: Configure External Services (Optional for MVP)

For MVP development, you can skip Twilio and Stripe initially. But when ready:

**Get Twilio Credentials** (for phone OTP):
1. Sign up at https://www.twilio.com/try-twilio
2. Get your Account SID, Auth Token, and a phone number
3. Add to `apps/backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Get Stripe Keys** (for payments):
1. Sign up at https://stripe.com
2. Get test API keys from Dashboard
3. Add to `apps/backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Add to `apps/customer-app/.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Step 3: Start Development

```bash
npm run dev
```

This starts all applications:
- 🖥️  **Backend API**: http://localhost:4000
- 📱 **Customer App**: http://localhost:3000
- 🚗 **Delivery App**: http://localhost:3001
- ⚙️  **Admin Dashboard**: http://localhost:3002

### Step 4: Verify Everything Works

Open a new terminal and test:

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-07-25T..."}
```

Then open http://localhost:3000 in your browser.

## What to Build Next

### Phase 1: Authentication (Week 1)

**Goal**: Users can sign up and log in with phone numbers.

**Backend tasks**:
- [ ] POST `/api/auth/send-otp` - Send OTP to phone
- [ ] POST `/api/auth/verify-otp` - Verify OTP and return JWT
- [ ] Middleware for JWT verification
- [ ] GET `/api/auth/me` - Get current user

**Frontend tasks**:
- [ ] Phone number input with US format validation
- [ ] OTP verification screen
- [ ] Store JWT in localStorage/cookies
- [ ] Protected route wrapper

**Files to create**:
- `apps/backend/src/routes/auth.ts`
- `apps/backend/src/middleware/auth.ts`
- `apps/customer-app/src/app/auth/login/page.tsx`
- `apps/customer-app/src/lib/api-client.ts`

### Phase 2: Product Catalog (Week 1-2)

**Goal**: Users can browse products by category.

**Backend tasks**:
- [ ] GET `/api/products` - List products with filters
- [ ] GET `/api/products/:id` - Get product details
- [ ] GET `/api/categories` - List categories
- [ ] Seed database with sample products

**Frontend tasks**:
- [ ] Product grid with images
- [ ] Category filters
- [ ] Search bar
- [ ] Product detail modal

**Files to create**:
- `apps/backend/src/routes/products.ts`
- `apps/backend/src/seeds/products.ts`
- `apps/customer-app/src/app/products/page.tsx`
- `apps/customer-app/src/components/ProductCard.tsx`

### Phase 3: Shopping Cart (Week 2)

**Goal**: Users can add items to cart and adjust quantities.

**Frontend tasks** (cart is client-side):
- [ ] Zustand store for cart state
- [ ] Add/remove/update quantity actions
- [ ] Cart drawer/modal
- [ ] Persistent cart in localStorage

**Files to create**:
- `apps/customer-app/src/store/cart.ts`
- `apps/customer-app/src/components/Cart.tsx`
- `apps/customer-app/src/components/CartItem.tsx`

### Phase 4: Checkout & Payments (Week 2-3)

**Goal**: Users can complete orders with Stripe.

**Backend tasks**:
- [ ] POST `/api/orders` - Create order and payment intent
- [ ] POST `/api/webhooks/stripe` - Handle payment confirmation
- [ ] Calculate subtotal, tax, delivery fee

**Frontend tasks**:
- [ ] Delivery address form
- [ ] Stripe Elements integration
- [ ] Order confirmation screen

**Files to create**:
- `apps/backend/src/routes/orders.ts`
- `apps/backend/src/services/stripe.ts`
- `apps/customer-app/src/app/checkout/page.tsx`
- `apps/customer-app/src/components/StripeCheckout.tsx`

### Phase 5: Real-time Order Tracking (Week 3-4)

**Goal**: Live order status updates via WebSocket.

**Backend tasks**:
- [ ] WebSocket connection handler
- [ ] Order status update events
- [ ] Driver location broadcasts

**Frontend tasks**:
- [ ] WebSocket connection hook
- [ ] Order tracking screen with live map
- [ ] Status timeline component

**Files to create**:
- `apps/backend/src/services/websocket.ts`
- `apps/customer-app/src/hooks/useOrderTracking.ts`
- `apps/customer-app/src/app/orders/[id]/page.tsx`

### Phase 6: Delivery Driver App (Week 4-5)

**Goal**: Drivers can accept and fulfill orders.

**Features**:
- [ ] Login with phone OTP (reuse auth flow)
- [ ] View available orders
- [ ] Accept order
- [ ] Mark as picked up
- [ ] Mark as delivered
- [ ] Geolocation tracking

### Phase 7: Admin Dashboard (Week 5-6)

**Goal**: Admins can manage inventory and orders.

**Features**:
- [ ] Product CRUD operations
- [ ] Order management and status updates
- [ ] Store management
- [ ] User management
- [ ] Basic analytics (orders per day, revenue)

## Project Structure

```
quicko/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts          # Express server entry
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Database schema
│   │   └── package.json
│   │
│   ├── customer-app/
│   │   ├── src/
│   │   │   └── app/               # Next.js pages
│   │   └── package.json
│   │
│   ├── delivery-app/              # Similar structure
│   └── admin-dashboard/           # Similar structure
│
├── packages/
│   └── shared-types/
│       └── src/
│           └── index.ts           # TypeScript types
│
├── README.md                      # Overview and commands
├── ARCHITECTURE.md                # Technical decisions
├── DEVELOPMENT.md                 # Developer workflow
└── docker-compose.yml             # Local infrastructure
```

## Key Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend Runtime | Node.js 20 + TypeScript | Industry standard, great ecosystem |
| Backend Framework | Express.js | Mature, flexible, widely known |
| Database | PostgreSQL 16 | ACID compliance, geospatial support |
| ORM | Prisma | Type-safe queries, great DX |
| Frontend Framework | Next.js 14 | SSR, routing, optimizations built-in |
| UI | Tailwind CSS | Rapid prototyping, consistent design |
| State Management | Zustand | Simple, minimal boilerplate |
| Authentication | JWT + Phone OTP | Industry standard for quick-commerce |
| Payments | Stripe | US-focused, excellent developer experience |
| Real-time | WebSockets | Low latency for order tracking |
| Monorepo | Turborepo | Fast builds, shared dependencies |

## Common Development Tasks

### View Database
```bash
cd apps/backend
npm run prisma:studio
```
Opens GUI at http://localhost:5555

### Add Database Field
1. Edit `apps/backend/prisma/schema.prisma`
2. Run migration:
   ```bash
   cd apps/backend
   npm run prisma:migrate
   ```

### Add API Endpoint
1. Create route file: `apps/backend/src/routes/your-route.ts`
2. Import and use in `apps/backend/src/index.ts`:
   ```typescript
   import yourRoute from './routes/your-route';
   app.use('/api/your-endpoint', yourRoute);
   ```

### Add Frontend Page
1. Create file: `apps/customer-app/src/app/your-page/page.tsx`
2. Accessible at: http://localhost:3000/your-page

### Use Shared Type
```typescript
import { Order, User, Product } from '@quicko/shared-types';
```

## Deployment Checklist

When you're ready to deploy:

- [ ] Replace all `.env.example` values with production credentials
- [ ] Generate a strong JWT_SECRET (use: `openssl rand -base64 32`)
- [ ] Set NODE_ENV=production
- [ ] Configure Stripe webhook endpoint
- [ ] Set up production database (Railway Postgres or AWS RDS)
- [ ] Configure CORS for production domains
- [ ] Add rate limiting to API
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets

See [README.md](./README.md) for deployment instructions.

## Helpful Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe API**: https://stripe.com/docs/api
- **Twilio SMS**: https://www.twilio.com/docs/sms
- **Turborepo**: https://turbo.build/repo/docs

## Need Help?

- 📖 Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed workflow
- 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical decisions
- 🐛 Check the "Common Issues" section in DEVELOPMENT.md

## Next Steps

1. Run `./scripts/setup.sh` to initialize
2. Start with Phase 1 (Authentication)
3. Build iteratively, test frequently
4. Keep the MVP scope tight (4-6 weeks)
5. Get user feedback early and often

Welcome to building Quicko! 🚀
