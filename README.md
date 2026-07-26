# Quicko

Quick-commerce grocery and essentials delivery platform for the US market. 10-30 minute delivery from local micro-fulfillment centers.

## Architecture

Turborepo monorepo with the following structure:

```
quicko/
├── apps/
│   ├── backend/              # Node.js + Express API (TypeScript)
│   ├── customer-app/         # Next.js customer web app (PWA-enabled)
│   ├── delivery-app/         # Next.js delivery driver app
│   └── admin-dashboard/      # Next.js admin dashboard
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   └── ui-components/        # Shared React components (future)
└── docker-compose.yml        # Local development stack
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT with phone number OTP (Twilio)
- **Payments**: Stripe (US-focused)
- **Real-time**: WebSockets (ws library)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod validation
- **PWA**: Manifest + service workers for native-like experience

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Deployment targets**: Railway, Render, or AWS ECS
- **Monorepo**: Turborepo for build orchestration

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose (for local development)
- Postgres 16 (if not using Docker)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` files in each app and configure:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Customer App
cp apps/customer-app/.env.example apps/customer-app/.env
```

Update the values in each `.env` file:
- **Twilio**: Add your Account SID, Auth Token, and phone number for OTP
- **Stripe**: Add your secret and publishable keys (test mode)
- **JWT**: Generate a strong secret key
- **Database**: Use the provided connection string or update if needed

### 3. Start the database

```bash
docker-compose up postgres -d
```

### 4. Run database migrations

```bash
cd apps/backend
npm run prisma:migrate
npm run prisma:generate
cd ../..
```

### 5. Start all apps in development mode

```bash
npm run dev
```

This starts:
- **Backend API**: http://localhost:4000
- **Customer App**: http://localhost:3000
- **Delivery App**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002

### 6. Test the health endpoint

```bash
curl http://localhost:4000/health
```

## Project Structure

### Backend (`apps/backend/`)
- `src/index.ts` - Express server entry point
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

### Customer App (`apps/customer-app/`)
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (to be added)
- `public/manifest.json` - PWA configuration

### Shared Types (`packages/shared-types/`)
- `src/index.ts` - Common TypeScript types used across all apps

## Development Commands

```bash
# Run all apps in dev mode
npm run dev

# Build all apps
npm run build

# Type check all apps
npm run type-check

# Lint all apps
npm run lint

# Clean all build artifacts and node_modules
npm run clean
```

### Backend-specific commands

```bash
cd apps/backend

# Run Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

## Docker Deployment

### Build and run all services

```bash
docker-compose up --build
```

### Run in detached mode

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f
```

## Deployment

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Add Postgres: `railway add postgresql`
5. Deploy backend: `railway up --service backend`
6. Deploy frontend: `railway up --service customer-app`

### Render

1. Create a new Blueprint from repo
2. Configure services in `render.yaml`
3. Add environment variables in Render dashboard
4. Deploy automatically on push to main

### AWS ECS (Fargate)

1. Build and push Docker images to ECR
2. Create ECS cluster and task definitions
3. Configure ALB for routing
4. Set up RDS PostgreSQL instance
5. Deploy via ECS services

## Environment Variables Reference

### Backend
- `PORT` - Server port (default: 4000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `ALLOWED_ORIGINS` - CORS allowed origins

### Customer App
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Database Schema

The Prisma schema includes models for:
- **User**: Customer, delivery driver, and admin accounts
- **OtpVerification**: Phone number OTP verification
- **Store**: Micro-fulfillment centers / dark stores
- **Product**: Grocery and essential items
- **Order**: Customer orders with status tracking
- **OrderItem**: Line items in orders
- **Address**: Customer delivery addresses
- **Payment**: Stripe payment records
- **PaymentMethod**: Saved payment methods

## API Architecture

### Authentication Flow
1. Customer enters phone number
2. Backend sends OTP via Twilio
3. Customer enters OTP
4. Backend verifies and returns JWT
5. JWT used for subsequent API calls

### Order Flow
1. Customer browses products
2. Adds items to cart
3. Selects delivery address
4. Enters payment method (Stripe)
5. Places order
6. Real-time updates via WebSocket
7. Delivery driver picks up and delivers
8. Order marked as delivered

### Real-time Updates
- WebSocket connection established on order placement
- Server pushes status updates to customer and driver
- Driver location shared in real-time during delivery

## Roadmap

- [ ] Authentication (phone OTP)
- [ ] Product catalog and search
- [ ] Shopping cart
- [ ] Checkout with Stripe
- [ ] Order management
- [ ] Real-time order tracking
- [ ] Delivery driver app
- [ ] Admin dashboard
- [ ] Push notifications
- [ ] Analytics and reporting

## Contributing

This is a private project. Please contact the project owner for contribution guidelines.

## License

Proprietary - All rights reserved
