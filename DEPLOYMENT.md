# Quicko Deployment Guide - Saint Louis, MO

## Deployment Architecture

### Recommended Stack
- **Database**: Railway PostgreSQL (or Supabase)
- **Backend API**: Railway (or Render)
- **Frontend Apps**: Vercel
  - Customer App: `quicko-stl.com`
  - Driver App: `driver.quicko-stl.com`
  - Admin Dashboard: `admin.quicko-stl.com`

## Step-by-Step Deployment

### 1. Database Setup (Railway)

1. Create account at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from Railway dashboard
4. Note: Railway provides `DATABASE_URL` automatically

### 2. Backend Deployment (Railway)

1. In Railway project, click "New" → "GitHub Repo"
2. Select this repository
3. Set root directory: `apps/backend`
4. Add environment variables:
   ```
   DATABASE_URL=<from Railway PostgreSQL>
   JWT_SECRET=<generate secure random string>
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=<your stripe secret key>
   STRIPE_WEBHOOK_SECRET=<stripe webhook secret>
   NODE_ENV=production
   PORT=4000
   ALLOWED_ORIGINS=https://quicko-stl.com,https://driver.quicko-stl.com,https://admin.quicko-stl.com
   ```
5. Railway will auto-detect Node.js and deploy
6. Get public URL (e.g., `quicko-api.up.railway.app`)

### 3. Run Database Migrations

After backend is deployed:
```bash
# In Railway backend service, run:
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
```

### 4. Frontend Apps Deployment (Vercel)

#### Customer App
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to customer app:
   ```bash
   cd apps/customer-app
   vercel --prod
   ```
3. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://quicko-api.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://quicko-api.up.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your stripe publishable key>
   ```
4. Configure custom domain: `quicko-stl.com`

#### Driver App
```bash
cd apps/delivery-app
vercel --prod
```
- Environment: Same as customer app
- Domain: `driver.quicko-stl.com`

#### Admin Dashboard
```bash
cd apps/admin-dashboard
vercel --prod
```
- Environment: Same as customer app
- Domain: `admin.quicko-stl.com`

### 5. Domain Configuration

Buy domain (e.g., from Namecheap, Google Domains):
- Main: `quicko-stl.com`
- Subdomains: `driver.quicko-stl.com`, `admin.quicko-stl.com`

Point DNS to Vercel:
- Add CNAME records provided by Vercel
- Configure SSL (automatic with Vercel)

### 6. Stripe Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://quicko-api.up.railway.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to Railway backend env vars

### 7. Production Checklist

- [ ] Database deployed and accessible
- [ ] Backend API running and health check responding
- [ ] All three frontends deployed
- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Seed data added (stores in Saint Louis)
- [ ] Stripe in production mode
- [ ] Domains configured with SSL
- [ ] CORS configured for production domains
- [ ] Test complete user flow: signup → browse → order → payment

## Alternative: One-Click Deploy Options

### Option A: Use Vercel for Everything
- Deploy backend as Vercel Serverless Functions
- Use Vercel Postgres for database
- All apps in one Vercel project

### Option B: Use Render
- Database + Backend on Render
- Frontends on Vercel
- Render provides free PostgreSQL and web services

## Cost Estimate

### Railway (Recommended)
- PostgreSQL: $5/month (500MB) to $20/month (8GB)
- Backend service: $5-10/month
- **Total: ~$10-30/month**

### Vercel
- Hobby: Free (perfect for testing)
- Pro: $20/month (for production)

### Domain
- ~$12/year for .com domain

### Stripe
- No monthly fee, only transaction fees (2.9% + 30¢)

**Grand Total: $22-50/month + transaction fees**

## Quick Start Commands

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy customer app
cd apps/customer-app
vercel --prod

# 4. Deploy driver app
cd ../delivery-app
vercel --prod

# 5. Deploy admin dashboard
cd ../admin-dashboard
vercel --prod
```

## Saint Louis Specific Setup

After deployment, add Saint Louis stores via admin dashboard:

1. Login to `admin.quicko-stl.com`
2. Navigate to Stores section
3. Add stores:
   - **Schnucks** - 1234 Market St, Saint Louis, MO 63103
   - **Dierbergs** - 5678 Clayton Rd, Saint Louis, MO 63110
   - **Local Harvest Grocery** - 3108 Morgan Ford Rd, Saint Louis, MO 63116

4. Add products for each store
5. Set delivery radius and operating hours

## Monitoring & Maintenance

- **Uptime Monitoring**: Use UptimeRobot (free)
- **Error Tracking**: Sentry (free tier available)
- **Analytics**: Vercel Analytics (included)
- **Database Backups**: Railway auto-backup (daily)

## Support

- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com
