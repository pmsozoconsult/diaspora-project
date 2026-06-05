# Sozo Diaspora Services (v1)

Web platform for diaspora clients: free registration, power of attorney (POA) with fee, then paid service requests with per-request chat and staff-managed statuses.

## Portals

| Portal | URL | Who |
|--------|-----|-----|
| Public site | `/` | Everyone |
| **Client portal** | `/portal` | `CLIENT` role |
| **Staff portal** | `/staff` | `STAFF` and `ADMIN` |

- **Client login:** `/login`
- **Staff login:** `/staff/login`
- **ADMIN** (first seeded super user) can create staff accounts at `/staff/team`

## Stack

- Next.js 15 (App Router)
- PostgreSQL + Prisma
- Auth.js (credentials)
- Local file uploads in dev (`STORAGE_MODE=local`)
- Mock payments in dev (`MOCK_PAYMENTS=true`) — Stripe ready for production

## Local setup

```bash
cd /root/docker/diaspora-project

# Start Postgres (port 5433 on host)
docker compose up -d

cp .env.example .env   # or use existing .env
# Set AUTH_SECRET: openssl rand -base64 32

npm install
npx prisma db push
npm run db:seed
npm run dev
```

`npm run build` has been verified — production build succeeds.

Open http://localhost:3000

**Seed admin (staff portal):**

- Email: `admin@sozo.local` (or `SEED_ADMIN_EMAIL`)
- Password: `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`)

## Client workflow

1. Register (free) → login → `/portal`
2. POA: pay fee → see instructions → staff marks **In progress** → upload scan → **POA completed**
3. New service request: select services → pay → **Submitted**
4. Staff updates status; chat is per request (by reference number)

## Deploy (Vercel)

1. Push repo to GitHub, import in Vercel
2. Set env vars from `.env.example` (Neon `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, Stripe, R2 when ready)
3. Run migrations: `npx prisma migrate deploy` in build or manually
4. Seed admin once against production DB

## Production notes

- Set `MOCK_PAYMENTS=false` and configure Stripe keys
- Set `STORAGE_MODE` and R2 credentials for POA scans
- Change seed admin password immediately
