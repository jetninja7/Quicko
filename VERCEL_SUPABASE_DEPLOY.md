# Deploy Quicko with Vercel + Supabase (100% Free)

## Step 1: Create Supabase Database

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
   - **Name**: quicko-db
   - **Database Password**: (generate strong password and save it!)
   - **Region**: East US (closest to Saint Louis)
   - **Pricing Plan**: Free
5. Wait 2-3 minutes for database to provision
6. Once ready, click "Connect" → "Connection String" → "URI"
7. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
8. **Save this URL** - you'll need it!

---

## Step 2: Deploy Backend to Vercel

### A. Create Vercel Account
1. Go to: https://vercel.com
2. Sign up with GitHub (free)

### B. Configure Backend for Vercel

The backend is already configured! We just need to deploy it.

### C. Deploy Backend

```bash
cd /Users/balu/Desktop/Quicko/apps/backend

# Install Vercel CLI (if not already)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted:
- **Setup and deploy?** Yes
- **Scope**: Your account
- **Link to existing project?** No
- **Project name**: quicko-backend
- **Directory**: ./
- **Override settings?** Yes
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### D. Add Environment Variables to Backend

```bash
# Add all these variables
vercel env add DATABASE_URL production
# Paste your Supabase connection string

vercel env add JWT_SECRET production
# Paste: yDjNt6R3OYZaJmpZ77Hwt+VPAu8alnv5r53xAZUro5k=

vercel env add JWT_EXPIRES_IN production
# Enter: 7d

vercel env add NODE_ENV production
# Enter: production

vercel env add STRIPE_SECRET_KEY production
# Paste your Stripe secret key (sk_test_...)

vercel env add STRIPE_WEBHOOK_SECRET production
# Leave empty for now

vercel env add ALLOWED_ORIGINS production
# Enter: *
# We'll update this later with actual frontend URLs
```

After adding all variables, redeploy:
```bash
vercel --prod
```

Copy your backend URL (e.g., `quicko-backend.vercel.app`)

### E. Run Database Migrations

You need to run migrations on the Supabase database:

**Option 1: From local machine**
```bash
cd /Users/balu/Desktop/Quicko/apps/backend

# Set DATABASE_URL temporarily
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npx prisma migrate deploy
```

**Option 2: Via Supabase Dashboard**
- Go to Supabase Dashboard → SQL Editor
- Copy content from `apps/backend/prisma/migrations` and run manually

---

## Step 3: Deploy Frontend Apps to Vercel

### Customer App

```bash
cd /Users/balu/Desktop/Quicko/apps/customer-app

vercel --prod
```

When prompted:
- **Project name**: quicko-customer
- Accept defaults

Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://quicko-backend.vercel.app

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://quicko-backend.vercel.app

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter your Stripe publishable key (pk_test_...)
```

Redeploy:
```bash
vercel --prod
```

Copy your customer app URL (e.g., `quicko-customer.vercel.app`)

### Driver App

```bash
cd /Users/balu/Desktop/Quicko/apps/delivery-app

vercel --prod
```

Project name: **quicko-driver**

Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://quicko-backend.vercel.app

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://quicko-backend.vercel.app
```

Redeploy:
```bash
vercel --prod
```

### Admin Dashboard

```bash
cd /Users/balu/Desktop/Quicko/apps/admin-dashboard

vercel --prod
```

Project name: **quicko-admin**

Add environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://quicko-backend.vercel.app
```

Redeploy:
```bash
vercel --prod
```

---

## Step 4: Update CORS Origins

Now that you have all frontend URLs, update the backend CORS:

```bash
cd /Users/balu/Desktop/Quicko/apps/backend

vercel env rm ALLOWED_ORIGINS production
vercel env add ALLOWED_ORIGINS production
# Enter: https://quicko-customer.vercel.app,https://quicko-driver.vercel.app,https://quicko-admin.vercel.app

vercel --prod
```

---

## Step 5: Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://quicko-backend.vercel.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (whsec_...)
7. Add to backend:
```bash
cd /Users/balu/Desktop/Quicko/apps/backend
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the webhook secret

vercel --prod
```

---

## Step 6: Test Your Live Application! 🎉

### Your Live URLs:
- **Customer App**: https://quicko-customer.vercel.app
- **Driver App**: https://quicko-driver.vercel.app
- **Admin Dashboard**: https://quicko-admin.vercel.app
- **Backend API**: https://quicko-backend.vercel.app

### Test:
1. Open customer app
2. Sign up with a phone number
3. Browse products
4. Test checkout flow

---

## Cost: $0/month Forever!

- **Supabase Free Tier**: 500MB database, 2GB bandwidth
- **Vercel Free Tier**: Unlimited deployments, 100GB bandwidth
- **Stripe**: No monthly fee, just transaction fees

---

## Troubleshooting

### Backend not starting?
Check Vercel deployment logs for errors

### Database connection failing?
Verify DATABASE_URL is correct in Vercel environment variables

### CORS errors?
Make sure ALLOWED_ORIGINS has your exact Vercel URLs

### Prisma errors?
Run migrations: `npx prisma migrate deploy` with DATABASE_URL set
