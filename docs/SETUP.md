# FundForge — Production Crowdfunding Platform

A full-stack crowdfunding management platform built with Node.js, TypeScript, Prisma, PostgreSQL, React, and TailwindCSS.

---

## Architecture Overview

```
fundforge/
├── backend/                    # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma       # Full normalized schema (15 models)
│   │   └── seed.ts             # Database seeder
│   └── src/
│       ├── config/
│       │   ├── env.ts          # Zod-validated environment config
│       │   └── database.ts     # Prisma client singleton
│       ├── types/
│       │   └── errors.ts       # ApiError class + HttpStatus enum
│       ├── utils/
│       │   ├── response.ts     # ResponseBuilder + pagination meta
│       │   ├── jwt.ts          # Token signing/verification
│       │   ├── slug.ts         # URL slug generation
│       │   └── pagination.ts   # Query param helpers
│       ├── middleware/
│       │   ├── auth.middleware.ts      # JWT + RBAC
│       │   ├── validate.middleware.ts  # Zod schema validation
│       │   └── error.middleware.ts     # Centralized error handler
│       ├── dtos/
│       │   ├── auth.dto.ts
│       │   ├── campaign.dto.ts
│       │   └── donation.dto.ts
│       ├── repositories/           # Data access layer (Prisma)
│       │   ├── auth.repository.ts
│       │   ├── campaign.repository.ts
│       │   ├── donation.repository.ts
│       │   └── analytics.repository.ts
│       ├── services/               # Business logic layer
│       │   ├── auth.service.ts
│       │   ├── campaign.service.ts
│       │   └── donation.service.ts
│       ├── controllers/            # HTTP handlers (thin layer)
│       │   ├── auth.controller.ts
│       │   ├── campaign.controller.ts
│       │   ├── donation.controller.ts
│       │   └── analytics.controller.ts
│       ├── routes/
│       │   └── index.ts            # All route definitions
│       ├── app.ts                  # Express app setup
│       └── index.ts                # Server entry + graceful shutdown
│
├── frontend/                   # React + TailwindCSS SPA
│   └── src/
│       ├── services/
│       │   └── api.ts          # Axios instance + token refresh interceptor
│       ├── store/
│       │   └── auth.store.ts   # Zustand auth store (persisted)
│       ├── hooks/
│       │   └── useApi.ts       # React Query hooks for all entities
│       ├── types/
│       │   └── index.ts        # TypeScript domain types
│       ├── components/
│       │   ├── ui/             # Reusable: Button, Input, Badge, Modal…
│       │   ├── layout/         # AppShell, Sidebar, Topbar, PageWrapper
│       │   ├── dashboard/      # StatCard, RevenueChart, ActivityFeed…
│       │   ├── campaigns/      # CampaignCard, CampaignForm, RewardPicker
│       │   └── auth/           # LoginForm, RegisterForm, ProtectedRoute
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── CampaignsPage.tsx
│       │   ├── CampaignDetailPage.tsx
│       │   ├── CreateCampaignPage.tsx
│       │   └── DonatePage.tsx
│       └── App.tsx             # Router + QueryClientProvider
│
└── docs/
    ├── API.md                  # Full API reference
    └── SETUP.md                # This file
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| PostgreSQL | ≥ 14 |
| Git | any |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/fundforge.git
cd fundforge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/fundforge"
JWT_ACCESS_SECRET="change-this-to-a-64-char-random-string"
JWT_REFRESH_SECRET="change-this-to-another-64-char-random-string"
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE fundforge;"

# Run migrations
cd backend
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed with sample data
npm run prisma:seed
```

### 4. Start the backend

```bash
cd backend
npm run dev
# → API running at http://localhost:4000
# → Health check: GET http://localhost:4000/health
```

### 5. Start the frontend

```bash
cd frontend
# Create .env.local
echo "VITE_API_URL=http://localhost:4000/api/v1" > .env.local

npm run dev
# → App running at http://localhost:5173
```

---

## Default Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundforge.io | Admin123! |
| Creator | creator@fundforge.io | Admin123! |
| Donor | donor@fundforge.io | Admin123! |

---

## Development Workflow

### Running Prisma Studio (visual DB browser)
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### Adding a new migration
```bash
npx prisma migrate dev --name describe_your_change
```

### Reset database (dev only)
```bash
npx prisma migrate reset
```

### Type checking
```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx tsc --noEmit
```

---

## Production Deployment

### Backend

```bash
cd backend
npm run build          # Compiles TypeScript → dist/
npm start              # Runs compiled output
```

Required environment changes for production:
```env
NODE_ENV=production
DATABASE_URL=postgresql://...  # Use connection pooling (e.g., PgBouncer)
JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend

```bash
cd frontend
npm run build          # Output in dist/
```

Serve `dist/` with Nginx, Caddy, or deploy to Vercel/Netlify.

**Nginx example for SPA routing:**
```nginx
server {
    listen 80;
    root /var/www/fundforge/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT access tokens expire in 15 minutes
- [x] Refresh token rotation with reuse detection
- [x] All inputs validated with Zod before reaching services
- [x] Role-based authorization on all sensitive routes
- [x] Rate limiting: 100 requests per 15-minute window
- [x] Helmet.js security headers
- [x] CORS restricted to configured origin
- [x] Prisma parameterized queries (SQL injection proof)
- [x] Soft deletes preserve data integrity
- [x] Prisma transactions for donation + payment atomicity
- [ ] HTTPS / TLS (configure at reverse proxy level)
- [ ] Refresh tokens stored in HttpOnly cookie (recommended upgrade)
- [ ] Input sanitization for XSS in rich text fields

---

## Extending the Platform

### Add a new entity (e.g., FAQ)

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_faq`
3. Create `src/dtos/faq.dto.ts` (Zod schema)
4. Create `src/repositories/faq.repository.ts`
5. Create `src/services/faq.service.ts`
6. Create `src/controllers/faq.controller.ts`
7. Register routes in `src/routes/index.ts`

### Integrate real payment gateway (Stripe)

Replace the simulated payment block in `donation.service.ts`:

```typescript
// In the $transaction:
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(dto.amount * 100),
  currency: dto.currency.toLowerCase(),
  metadata: { donationId: donation.id, campaignId: dto.campaignId },
});

await tx.payment.create({
  data: {
    donationId: donation.id,
    provider: 'stripe',
    externalId: paymentIntent.id,
    amount: dto.amount,
    currency: dto.currency,
    status: PaymentStatus.PROCESSING,
    gatewayResponse: paymentIntent as unknown as Prisma.JsonObject,
  },
});
// Return client_secret to frontend for card confirmation
```

---

## Database Schema Summary

| Model | Relations |
|-------|-----------|
| User | has many UserRoles, RefreshTokens; 1:1 Creator or Donor |
| Creator | belongs to User; has many Campaigns |
| Campaign | belongs to Creator, Category; has many Rewards, Donations, Updates, Comments, Reports |
| Reward | belongs to Campaign; referenced by Donations |
| Donor | belongs to User; has many Donations |
| Donation | belongs to Campaign, Donor (optional), Reward (optional); has one Payment |
| Payment | belongs to Donation |
| Comment | belongs to Campaign, User; self-referential (replies) |
| Update | belongs to Campaign |
| Report | belongs to User (reporter); polymorphic: Campaign or Comment |
| Category | has many Campaigns |
| Role | has many UserRoles |
| UserRole | junction: User ↔ Role |
| RefreshToken | belongs to User; rotated on each refresh |
