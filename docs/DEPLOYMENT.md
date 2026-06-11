# Deployment Guide

This guide covers deploying MeraShop to production environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Build & Deploy](#build--deploy)
- [Vercel Deployment](#vercel-deployment-recommended)
- [Docker Deployment](#docker-deployment)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Bun (recommended) | ≥ 1.0 | Package manager & runtime |
| Git | ≥ 2.30 | Version control |
| Razorpay Account | — | Payment processing (optional for demo) |

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/merashop.git
cd merashop
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
# Database (required)
DATABASE_URL="file:./db/custom.db"

# Razorpay (required for payments)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# NextAuth (required for authentication)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"
```

> **Tip**: Generate a secure `NEXTAUTH_SECRET` with:
> ```bash
> openssl rand -base64 32
> ```

---

## Database Setup

### Development (SQLite)

SQLite requires zero configuration. The database file is created automatically.

```bash
# Push schema to database (creates tables)
bun run db:push

# Generate Prisma client
bun run db:generate

# (Optional) Seed with demo data
bun run prisma db seed
```

### Production (PostgreSQL)

For production, we recommend migrating to PostgreSQL:

1. **Update `prisma/schema.prisma`**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Update `DATABASE_URL`**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/merashop?schema=public"
```

3. **Run migrations**:

```bash
bun run db:migrate
bun run db:generate
```

---

## Build & Deploy

### Production Build

```bash
# Create optimized production build
bun run build

# Start production server
bun run start
```

The build output is in `.next/standalone/` with static assets in `.next/static/`.

### Build Output

- **Standalone server**: `.next/standalone/server.js`
- **Static assets**: `.next/static/`
- **Public assets**: `public/`

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js deployment, offering zero-configuration deploys.

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `RAZORPAY_KEY_ID` | Your Razorpay live key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `NEXTAUTH_SECRET` | Generated secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### Step 4: Configure Build Settings

Vercel auto-detects these, but verify:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `bun run build` |
| Output Directory | `.next` |
| Install Command | `bun install` |

### Step 5: Deploy

Click **Deploy**. Vercel will build and deploy automatically.

### Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `merashop.in`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

---

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run db:generate
RUN bun run build

# Production
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./db/custom.db
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    volumes:
      - db-data:/app/db

volumes:
  db-data:
```

### Deploy with Docker

```bash
# Build the image
docker compose build

# Start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### With PostgreSQL

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://merashop:password@db:5432/merashop
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: merashop
      POSTGRES_PASSWORD: password
      POSTGRES_DB: merashop
    volumes:
      - pg-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pg-data:
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | `file:./db/custom.db` | Prisma database connection string |
| `RAZORPAY_KEY_ID` | ❌ | — | Razorpay API key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | ❌ | — | Razorpay API key secret |
| `NEXTAUTH_SECRET` | ❌ | — | Secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | ❌ | `http://localhost:3000` | Canonical URL of the application |

### Demo Mode

MeraShop runs in **demo mode** without Razorpay credentials:
- Payment page shows a friendly error message
- All other features (browsing, cart, checkout form, admin) work normally
- Any password works for login (no password hashing in demo mode)

---

## Post-Deployment Checklist

- [ ] **Database**: Schema pushed and seeded with initial data
- [ ] **Environment Variables**: All required variables set
- [ ] **Payments**: Razorpay checkout tested in test mode
- [ ] **Authentication**: Login and registration working
- [ ] **Images**: Product images loading correctly
- [ ] **SEO**: Meta tags, sitemap, and robots.txt accessible
- [ ] **Dark Mode**: Theme toggle working correctly
- [ ] **Mobile**: Responsive layout working on all screen sizes
- [ ] **Performance**: Lighthouse score > 90 for performance
- [ ] **Security**: HTTPS enabled, environment variables not exposed
- [ ] **Monitoring**: Error logging configured (e.g., Sentry)
- [ ] **Backups**: Database backup strategy in place
- [ ] **Admin Access**: Default admin account secured with strong password
- [ ] **Rate Limiting**: API rate limiting configured
- [ ] **CDN**: Static assets served via CDN (Vercel handles this automatically)

---

## Troubleshooting

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
bun run db:generate

# Rebuild
bun run build
```

### Database Issues

```bash
# Reset database (WARNING: destroys all data)
bun run db:reset

# Push schema changes
bun run db:push
```

### Hydration Errors

Common causes:
1. Browser extensions modifying the DOM
2. Date/time rendering that differs between server and client
3. `typeof window` checks without proper guards

Solution: Use the `useHydrated` hook from `src/hooks/use-hydrated.ts` to gate client-only rendering.

### Razorpay Not Working

1. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
2. Use test keys for development: keys starting with `rzp_test_`
3. Check Razorpay dashboard for API status
4. Ensure the amount is in paise (multiply ₹ by 100)
