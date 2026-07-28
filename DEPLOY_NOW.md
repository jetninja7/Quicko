# Deploy Quicko - Step by Step

## Prerequisites
- GitHub account
- Stripe account (get at stripe.com)
- Railway account (get at railway.app)
- Vercel account (get at vercel.com)

---

## Step 1: Get Your API Keys

### Stripe (5 minutes)
1. Go to https://dashboard.stripe.com/register
2. Complete signup
3. Go to Developers → API Keys
4. Copy **Publishable key** (starts with `pk_`)
5. Copy **Secret key** (starts with `sk_`)
6. Keep these safe - you'll need them soon!

---

## Step 2: Deploy Backend to Railway (10 minutes)

### A. Create Database
1. Go to https://railway.app
2. Click "Start a New Project"
3. Click "Provision PostgreSQL"
4. Wait for it to spin up (30 seconds)
5. Click on PostgreSQL service → Click "Connect"
6. Copy the **DATABASE_URL** (starts with `postgresql://`)

### B. Deploy Backend
1. In Railway, click "New" → "GitHub Repo"
2. Connect your GitHub account
3. Select the Quicko repository
4. Select `apps/backend` as root directory
5. Click "Deploy"

### C. Add Environment Variables
1. Click on the backend service
2. Go to "Variables" tab
3. Add these variables:

```
DATABASE_URL=<paste the PostgreSQL URL from step A>
JWT_SECRET=<generate random string - use: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=<your sk_... key from Step 1>
STRIPE_WEBHOOK_SECRET=<leave blank for now>
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://quicko-customer.vercel.app,https://quicko-driver.vercel.app,https://quicko-admin.vercel.app
```

4. Click "Deploy" again to restart with new variables
5. Wait for deployment (2-3 minutes)
6. Click "Settings" → Copy your **public domain** (e.g., `quicko-backend-production.up.railway.app`)

### D. Run Database Migrations
1. In Railway backend service, click "Settings" → "Deploy Triggers"
2. Or SSH into service and run:
```bash
npx prisma migrate deploy
```

---

## Step 3: Deploy Frontends to Vercel (15 minutes)

### Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### A. Deploy Customer App
```bash
cd /Users/balu/Desktop/Quicko/apps/customer-app
vercel
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name:** quicko-customer
- **Directory:** ./
- **Override settings?** Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `.next`
  - **Install Command:** `npm install`

Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Paste: https://your-railway-domain.up.railway.app

vercel env add NEXT_PUBLIC_WS_URL
# Paste: wss://your-railway-domain.up.railway.app

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Paste: pk_...your_stripe_publishable_key
```

Deploy to production:
```bash
vercel --prod
```

Copy the production URL (e.g., `quicko-customer.vercel.app`)

### B. Deploy Driver App
```bash
cd /Users/balu/Desktop/Quicko/apps/delivery-app
vercel
```

Same prompts as customer app but name it: **quicko-driver**

Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Paste: https://your-railway-domain.up.railway.app

vercel env add NEXT_PUBLIC_WS_URL
# Paste: wss://your-railway-domain.up.railway.app
```

Deploy:
```bash
vercel --prod
```

### C. Deploy Admin Dashboard
```bash
cd /Users/balu/Desktop/Quicko/apps/admin-dashboard
vercel
```

Name it: **quicko-admin**

Add environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Paste: https://your-railway-domain.up.railway.app
```

Deploy:
```bash
vercel --prod
```

---

## Step 4: Configure Stripe Webhooks (5 minutes)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-railway-domain.up.railway.app/api/webhooks/stripe`
4. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go back to Railway → Backend Variables
8. Update `STRIPE_WEBHOOK_SECRET` with the signing secret
9. Redeploy backend

---

## Step 5: Update CORS in Railway (2 minutes)

1. Go to Railway → Backend → Variables
2. Update `ALLOWED_ORIGINS` with your actual Vercel URLs:
```
ALLOWED_ORIGINS=https://quicko-customer.vercel.app,https://quicko-driver.vercel.app,https://quicko-admin.vercel.app
```
3. Redeploy

---

## Step 6: Test Your Deployment! 🎉

### Test Customer App
1. Open `https://quicko-customer.vercel.app`
2. Click "Sign Up"
3. Enter a test phone number
4. Should receive OTP (check Railway logs if needed)

### Test Admin Dashboard
1. Open `https://quicko-admin.vercel.app`
2. Login with admin credentials
3. Add a store in Saint Louis:
   - Name: Schnucks Downtown
   - Address: 1234 Market St, Saint Louis, MO 63103
   - Operating Hours: 8:00 AM - 10:00 PM

### Test Driver App
1. Open `https://quicko-driver.vercel.app`
2. Login with driver credentials

---

## Step 7: Add Saint Louis Stores (via Admin Dashboard)

1. Login to admin dashboard
2. Navigate to "Stores" → "Add New Store"
3. Add these Saint Louis locations:

**Schnucks Downtown**
- Address: 1234 Market St, Saint Louis, MO 63103
- Phone: (314) 555-0100

**Dierbergs Clayton**
- Address: 5678 Clayton Rd, Saint Louis, MO 63110
- Phone: (314) 555-0200

**Local Harvest Grocery**
- Address: 3108 Morgan Ford Rd, Saint Louis, MO 63116
- Phone: (314) 555-0300

4. Add products for each store
5. Set delivery zones and hours

---

## Troubleshooting

### Backend not starting?
- Check Railway logs
- Verify DATABASE_URL is correct
- Make sure all env variables are set

### Frontend build failing?
- Check Vercel deployment logs
- Verify NEXT_PUBLIC_API_URL is set
- Try: `vercel --prod --force`

### Database migration errors?
- SSH into Railway backend
- Run: `npx prisma migrate deploy`
- Check PostgreSQL connection

### CORS errors?
- Update ALLOWED_ORIGINS in Railway
- Must include exact Vercel URLs
- Redeploy backend after changes

---

## Your Live URLs

After deployment, save these:

- **Customer App:** https://quicko-customer.vercel.app
- **Driver App:** https://quicko-driver.vercel.app  
- **Admin Dashboard:** https://quicko-admin.vercel.app
- **Backend API:** https://your-railway-domain.up.railway.app

---

## Cost Breakdown

- **Railway:** $5-10/month (PostgreSQL + Backend)
- **Vercel:** FREE for hobby tier
- **Stripe:** No monthly fee, just 2.9% + 30¢ per transaction
- **Total:** ~$5-10/month to start!

---

## Optional: Custom Domain

### Buy Domain
1. Go to Namecheap/Google Domains
2. Buy: `quicko-stl.com` (~$12/year)

### Configure DNS
In Vercel project settings:
1. Add domain: `quicko-stl.com`
2. Add subdomains:
   - `driver.quicko-stl.com`
   - `admin.quicko-stl.com`
3. Follow Vercel's DNS instructions
4. SSL certificates auto-provision

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs

**Estimated Total Time: 35-45 minutes**

Good luck! 🚀
