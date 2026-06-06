# FundForge Backend — From First Principles

A complete, layer-by-layer walkthrough of the FundForge backend, written so you can
understand *and explain* how the system actually works. References point at real files
(e.g. `src/services/donation.service.ts:62`) so you can jump straight to the code.

---

## 0. The one-sentence mental model

> **FundForge is a crowdfunding REST API. It's an Express + TypeScript server that sits in
> front of a PostgreSQL database (accessed through Prisma), and every request flows through
> the same pipeline: middleware → route → controller → service → repository → database, then
> back out as a uniform JSON envelope.**

Everything below is detail hanging off that pipeline.

---

## 1. System Overview

It's the backend for a Kickstarter/GoFundMe-style platform. Three kinds of users
(`ADMIN`, `CREATOR`, `DONOR` — see `prisma/schema.prisma:309`):

- **Creators** publish **campaigns** (a fundraising project with a goal amount, story, rewards).
- **Donors** give money to campaigns, optionally claiming a **reward** tier, optionally anonymously.
- **Admins** moderate — approve campaigns, resolve abuse **reports**, manage users, view analytics.

In production terms the server's job is: **authenticate who's calling, authorize what they're
allowed to do, validate their input, run the business rule, mutate the database safely, and
return a consistent JSON response.** It does *not* render HTML — the frontend (a Vite/React
app) is completely separate and talks to it over HTTP/JSON.

---

## 2. Architecture Breakdown — the layers

`backend/src/` is a clean **layered (n-tier) architecture**. Each layer has one job and only
talks to the layer directly below it:

```
HTTP request
   │
   ▼
[ Middleware ]   security, auth, validation        src/middleware/*
   │
   ▼
[ Routes ]       URL + method → controller fn       src/routes/index.ts
   │
   ▼
[ Controllers ]  HTTP in/out only, no logic         src/controllers/*
   │
   ▼
[ Services ]     BUSINESS LOGIC lives here          src/services/*
   │
   ▼
[ Repositories ] all Prisma/DB queries              src/repositories/*
   │
   ▼
[ Prisma Client ] → PostgreSQL                       src/config/database.ts
```

Supporting layers: **DTOs** (`src/dtos/*`, Zod schemas defining valid input), **utils**
(`jwt`, `slug`, `pagination`, `response`), **types** (`errors.ts`), **config**
(`env.ts`, `database.ts`).

### What each layer does and why

**Controllers** (`src/controllers/campaign.controller.ts`) are deliberately *dumb*. Every
method has the same shape:

```ts
async create(req, res, next) {
  try {
    const campaign = await service.create(req.body, req.user!.sub);
    return ResponseBuilder.created(res, campaign, 'Campaign created successfully');
  } catch (err) { next(err); }   // hand errors to the error middleware
}
```

A controller only: pulls data off the request (`req.body`, `req.params`, `req.user`), calls
one service method, and shapes the HTTP response. **No business rules, no SQL.**

**Services** (`campaign.service.ts`, `donation.service.ts`) are the brain. The *rules* live
here: "only creators can create campaigns" (`campaign.service.ts:34`), "campaigns must be
reviewed before activation" (`:75`), "donation amount must respect min/max"
(`donation.service.ts:33`). Services orchestrate — they call multiple repositories and wrap
multi-table writes in transactions.

**Repositories** (`donation.repository.ts`) are the *only* place that knows Prisma exists.
They translate intent ("find all donations for this campaign, paginated, with donor + payment
joined") into Prisma queries. No business rules.

### Separation of concerns — why it matters

Each reason to change touches exactly one layer:

- Change the JSON response format? → only `utils/response.ts`.
- Switch Postgres → MySQL, or Prisma → raw SQL? → only the repositories.
- Change a business rule (e.g. minimum donation)? → only the service.
- Add auth to an endpoint? → only the route line.

This is the **Single Responsibility Principle** at architectural scale. It also makes the code
testable: unit-test a service by mocking its repository, no HTTP or DB required.

---

## 3. Frontend → Backend Communication

### How the frontend calls the backend

The frontend uses **Axios**, configured once in `frontend/src/services/api.ts`:

**(a) Request interceptor (`api.ts:12`)** — attaches the JWT to every outgoing request:

```ts
const token = localStorage.getItem('accessToken');
if (token) config.headers.Authorization = `Bearer ${token}`;
```

**(b) Response interceptor with token-refresh (`api.ts:30`)** — when any request returns
`401`, the interceptor:

1. Pauses the failed request.
2. Calls `POST /auth/refresh` with the refresh token to get a fresh access token.
3. Retries the original request transparently.
4. If several requests 401 at once, it **queues** them (`failedQueue`) so only *one* refresh
   call fires, then replays all of them. If refresh fails → wipe storage, redirect to `/login`.

So the session never visibly breaks even though access tokens expire every 15 minutes
(`env.ts: JWT_ACCESS_EXPIRES_IN default '15m'`).

### Full request lifecycle (inside `app.ts` — the order of `app.use()` *is* the pipeline)

1. **`helmet()`** (`app.ts:14`) — security headers.
2. **`cors()`** (`:15`) — checks origin against `CORS_ORIGIN`; answers browser preflight `OPTIONS`.
3. **Rate limiter** (`:22`) — max 100 requests / 15 min per IP on `/api`. Over limit → `429`, never reaches your code.
4. **Body parsing** (`:32`) — `express.json()` turns the raw body into `req.body` (max 10 MB).
5. **Compression + logging** (`:34`, `:38`).
6. **Routing** — `app.use('/api/v1', routes)` hands off to `routes/index.ts`.
7. **Per-route middleware** — e.g. `authenticate`, `authorize('CREATOR')`, `validate(dto)`. Any can short-circuit via `next(error)`.
8. **Controller** runs → **service** → **repositories** → **Prisma** → **Postgres**.
9. **Response** serialized via `ResponseBuilder` into the standard envelope.
10. If anything threw → skip straight to **`errorHandler`** (`:51`), the last middleware.

### Concrete example: creating a campaign

`POST /api/v1/campaigns`. Route line `routes/index.ts:38`:

```ts
router.post('/campaigns', authenticate, authorize('CREATOR', 'ADMIN'),
            validate(createCampaignDto), CampaignController.create);
```

Read left to right, that's the gauntlet: *valid token?* → *CREATOR or ADMIN?* → *body matches
schema?* → *only then* run the controller. Each step either calls `next()` (pass) or
`next(error)` (reject).

---

## 4. API Design

A **RESTful**, **resource-oriented**, **versioned** API. Everything under `/api/v1`
(`app.ts:47`) — versioning lets you ship `/v2` later without breaking clients. Resources are
nouns: `/campaigns`, `/donations`, `/users`, `/reports`, `/categories`.

### Why each HTTP method

| Method | Meaning | Example | Why |
|--------|---------|---------|-----|
| `GET` | Read, no side effects (idempotent, safe) | `GET /campaigns/:id` | Fetching never mutates |
| `POST` | Create a new resource | `POST /donations` | Not idempotent — two POSTs = two donations |
| `PATCH` | **Partial** update | `PATCH /campaigns/:id` | Send only changed fields (`campaign.service.ts:79` spreads only defined fields) |
| `PUT` | Full replace | *(not used)* | Design favors PATCH — you rarely replace whole records |
| `DELETE` | Remove | `DELETE /campaigns/:id` | Actually a **soft** delete (see §5) |

Sub-resources are nested logically: `GET /campaigns/:campaignId/comments`
(`routes/index.ts:49`) — comments *belong to* a campaign.

### Endpoint groups (`routes/index.ts`)

- **Auth** (`/auth/*`) — register, login, refresh, logout, me.
- **Campaigns** + nested **rewards / comments / updates** — the core content.
- **Donations** — the money flow. Public `POST` (even logged-out), admin-only list.
- **Users / Reports** — admin moderation.
- **Analytics** — three role-scoped dashboards (`/analytics/admin`, `/creator`, `/donor`).

### Request/response format — one envelope everywhere (`utils/response.ts`)

```jsonc
// Success
{ "success": true, "data": { ... }, "message": "Success" }
// Paginated
{ "success": true, "data": [...], "message": "Success",
  "meta": { "page": 1, "limit": 20, "total": 53, "totalPages": 3, "hasNext": true, "hasPrev": false } }
// Error
{ "success": false, "message": "Campaign not found", "data": null }
```

The frontend writes *one* response handler (`ApiResponse<T>` in `api.ts:80`) for every
endpoint. Consistency is a feature.

---

## 5. Database Layer

### Connection — a singleton (`config/database.ts`)

```ts
export const prisma = globalForPrisma.prisma || new PrismaClient({...});
if (config.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Prisma manages a **connection pool**. `new PrismaClient()` everywhere would exhaust DB
connections; the `globalForPrisma` trick stops dev-mode hot-reload from spawning a new client
(and pool) on every save. `index.ts:7` calls `prisma.$connect()` at boot and disconnects
gracefully on `SIGTERM`/`SIGINT`.

### Schema — single source of truth (`prisma/schema.prisma`)

Prisma generates both the SQL migrations and the fully typed TS client from this file. Key
relationships:

- **User ↔ Role** — many-to-many via `UserRole` join table (`:50`). A user can be DONOR *and* CREATOR.
- **User → Creator / Donor** — optional 1-to-1 profiles. You get a `Creator` row only when you register as one (`auth.service.ts:30`).
- **Creator → Campaign → Donation** — the core chain.
- **Donation → Payment** — 1-to-1 (`donationId @unique`), tracks the gateway.
- **Comment → Comment** — self-referential (`parentId`, `:274`) for threaded replies.

**Denormalized counters**: `Campaign.raisedAmount/donorsCount/donationsCount`,
`Donor.totalDonated`. Pre-computed aggregates kept in sync on write, so reading a campaign card
doesn't need a `SUM()` every time. Fast reads, more careful writes.

**Indexes** (`@@index`) on FKs and frequently-filtered columns (`status`, `slug`, `deletedAt`)
keep `WHERE` clauses fast.

### Querying & updating

Only repositories touch Prisma. `donation.repository.ts:16` runs a paginated list **and** a
count in one `$transaction([...])` so page and total are consistent:

```ts
const [donations, total] = await prisma.$transaction([
  prisma.donation.findMany({ where, skip, take: limit, orderBy, include: {...} }),
  prisma.donation.count({ where }),
]);
```

`include` is Prisma's JOIN — eager-loads relations in one go, avoiding the N+1 problem.

### Consistency

1. **DB-level**: foreign keys + `onDelete: Cascade`, unique constraints (`email`, `slug`).
2. **App-level transactions**: multi-table writes run inside `prisma.$transaction()` →
   **atomic**, all-or-nothing. The donation flow (§8) is the prime example.

### Soft deletes

`DELETE /campaigns/:id` sets `deletedAt` (`campaign.service.ts:104`) instead of removing the
row; reads filter `deletedAt: null`. Keeps an audit trail, allows restore, and doesn't orphan
attached donations.

---

## 6. Business Logic Layer

### Where it lives

**Services, and only services.** If asked "where would you add rule X?" the answer is almost
always "the relevant service."

### Transformations / calculations

- **Decimal → Number**: Postgres `Decimal` returns as a Prisma `Decimal` object, not a JS
  number. Each service has a `formatX` method converting it for JSON
  (`donation.service.ts:142`, `campaign.service.ts:107`).
- **Derived fields**: `campaign.service.ts:123` computes
  `progressPercent = min(round(raised/goal * 100), 100)`.
- **Slug generation**: `campaign.service.ts:37` turns "Save the Bees!" into `save-the-bees`,
  looping to append `-1`, `-2` on collision (`slugExists`).
- **Pagination meta**: `buildPaginationMeta` (`utils/response.ts:52`).

### Validation — done in TWO places, deliberately

1. **Schema validation (the shape)** — Zod DTOs at the *edge*, via `validate` middleware
   *before* the controller. `donation.dto.ts:3`:
   ```ts
   amount: z.number().positive().multipleOf(0.01),  // money-shaped
   campaignId: z.string().uuid(),
   ```
   Failure → `400` + per-field errors (`validate.middleware.ts:11`); never reaches your logic.

2. **Business validation (the rules)** — inside the service, because it needs *DB state*.
   `donation.service.ts:28`:
   ```ts
   if (campaign.status !== CampaignStatus.ACTIVE) throw badRequest('not accepting donations');
   if (campaign.minDonation && dto.amount < min) throw badRequest(...);
   if (reward.maxClaims && reward.claimsCount >= reward.maxClaims) throw badRequest('fully claimed');
   ```

**Why split?** Cheap structural checks at the door (no DB); expensive stateful checks in the
service. Fail fast, fail cheap.

---

## 7. Error Handling & Edge Cases

### Centralized error handling

No controller ever builds an error response — they all just `catch (err) { next(err); }`. That
forwards the error to the single `errorHandler` middleware registered *last* (`app.ts:51`).

### Creating errors

Services throw a typed `ApiError` (`types/errors.ts`) via semantic factories:

```ts
throw ApiError.notFound('Campaign');           // → 404
throw ApiError.forbidden('Only creators...');  // → 403
throw ApiError.badRequest('...', fieldErrors); // → 400 + details
```

### Translating errors to responses (`error.middleware.ts`)

A classifier:

- `ApiError` → use its `statusCode`/`message` (expected, operational errors).
- `Prisma.PrismaClientKnownRequestError` → mapped by code (`:42`): `P2002` (unique) → `409`,
  `P2025` (not found) → `404`, `P2003` (FK fail) → `400`. DB constraint errors become clean
  HTTP statuses instead of leaking a 500.
- Anything else → generic `500`.
- In `development` only, the stack trace is included (`:35`) — never in production.

### DB failure mid-write

Multi-table writes inside `prisma.$transaction()` **roll back everything** on failure. In the
donation flow, if updating campaign stats failed after creating the donation, the whole
transaction aborts — no orphaned donation, no half-updated counters.

### Notable edge cases already handled

- **Route not found** → `notFoundHandler` (`error.middleware.ts:58`) → clean 404.
- **Refresh token reuse / theft** → `auth.service.ts:72`: a revoked/expired refresh token
  triggers **revoke-all** of that user's tokens (assumes compromise). Token rotation.
- **Anonymous donation** → `donorId` left null (`donation.service.ts:56`); `donorsCount` only
  bumped when there's a donor (`:105`).
- **Slug collision** → retry loop (§6).

---

## 8. End-to-End System Flow — ONE complete example

**A logged-in donor gives $50 to a campaign, claiming a reward tier.**

**Request:**
```
POST /api/v1/donations
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{ "campaignId": "abc-uuid", "rewardId": "rwd-uuid", "amount": 50, "currency": "USD", "isAnonymous": false }
```

**Step 1 — Frontend.** `http.post('/donations', body)` (`api.ts`). Request interceptor attaches the Bearer token.

**Step 2 — App middleware (`app.ts`).** helmet → cors → rate-limit → `express.json()` parses body into `req.body`.

**Step 3 — Route (`routes/index.ts:66`).**
```ts
router.post('/donations', optionalAuth, validate(createDonationDto), DonationController.create);
```
- `optionalAuth` (`auth.middleware.ts:37`): valid token → decodes JWT, sets `req.user = { sub, email, roles }`. (No token would still proceed — donations allowed anonymously.)
- `validate(createDonationDto)`: Zod checks shape. Passes; `req.body` is now typed, parsed data.

**Step 4 — Controller (`donation.controller.ts:23`).**
```ts
const donation = await service.create(req.body, req.user?.sub);
```
Pulls the donor's user id off `req.user.sub` and delegates.

**Step 5 — Service: business rules (`donation.service.ts:25`), in order:**
1. Load campaign (`campaignRepo.findById`). Not found → `404`.
2. Campaign `status === ACTIVE`? Else → `400 "not accepting donations"`.
3. `$50` within campaign min/max? ✓
4. `rewardId` given → load reward; check it belongs to this campaign, is available, `$50 ≥ minimumAmount`, not fully claimed (`maxClaims`).
5. Resolve `donorId`: logged in and not anonymous → look up the `Donor` row.

**Step 6 — Service: the transaction (`donation.service.ts:62`), all atomic:**
```ts
await prisma.$transaction(async (tx) => {
  1. create Donation (status PENDING)
  2. create Payment   (status PROCESSING, externalId)
  3. update Payment   → SUCCEEDED        // simulated gateway
  4. update Donation  → COMPLETED
  5. update Campaign: raisedAmount += 50, donationsCount += 1, donorsCount += 1
  6. update Donor:    totalDonated += 50, donationsCount += 1
  7. update Reward:   claimsCount += 1
});
```
The transaction guarantees all 7 happen or none do — the denormalized counters can never drift
from the donation. `increment` is an atomic DB op, so concurrent donations can't clobber each
other's counts.

**Step 7 — Repository read-back (`donation.service.ts:131`).** Re-fetches with all relations
joined (`donation.repository.ts:35`); `formatDonation` converts `Decimal` → number.

**Step 8 — Response.** `ResponseBuilder.created(res, donation, 'Donation successful')` → `201`:
```json
{ "success": true, "data": { "id": "...", "amount": 50, "status": "COMPLETED", "campaign": {...}, "payment": {...} }, "message": "Donation successful" }
```

**Step 9 — Back to frontend.** Axios resolves; the component reads `response.data` and updates the UI.

**If any step threw** (e.g. reward fully claimed): service throws `ApiError.badRequest`,
controller's `catch` calls `next(err)`, the transaction rolls back, `errorHandler` returns
`400 { success: false, message: "Reward is fully claimed" }`. No partial writes.

---

## 9. Senior-Level Insight

### What's genuinely good

- **Strict layering with one-way dependencies.** Controllers never touch Prisma; repositories never know about HTTP.
- **A single error funnel** + typed `ApiError` + Prisma-error mapping. Consistent errors, clean controllers.
- **Validation at the boundary with Zod, types inferred** (`z.infer`). One source of truth for valid input.
- **Env validation at boot** (`env.ts`) — refuses to start if misconfigured (e.g. JWT secret < 32 chars).
- **Real auth hygiene** — short-lived access tokens + rotating refresh tokens + reuse detection + bcrypt (12 rounds). Money flow is atomic.
- **Prisma singleton** done right for dev hot-reload.

### What a senior would criticize / optimize

1. **Denormalized counters are a consistency risk.** `Campaign.raisedAmount` is only correct if
   *every* write path goes through the transaction. A refund, admin edit, or future bug bypassing
   it silently drifts the total. Add a periodic **reconciliation job** (recompute from
   `SUM(donations)`).
2. **`donorsCount` is incremented on every donation** (`donation.service.ts:105`), not every
   *unique* donor — a repeat donor double-counts. Likely a bug; needs a "has this donor given before?" check.
3. **The payment is faked** (`donation.service.ts:76`). Production needs a real gateway (Stripe)
   with a **webhook**; the donation should stay `PENDING` until the webhook confirms, not flip to
   `COMPLETED` synchronously. External network calls don't belong inside a DB transaction (can't
   roll back, hold locks open).
4. **No idempotency key on `POST /donations`.** A network retry could double-charge.
5. **Offset pagination** (`skip/take`) degrades on large tables. Cursor-based scales better for feeds.
6. **Services instantiate their own repos.** Dependency injection would make testing/mocking cleaner.
7. **No automated tests, no structured logging/observability** (morgan is request logging only);
   `errorHandler` doesn't ship 500s to Sentry. Also: a stray `{backend/` directory from a botched
   shell brace-expansion should be deleted.
8. **`getById` increments views on every call** (`campaign.service.ts:21`) — a write on a read
   endpoint, inflated by bots/refreshes. Better: fire-and-forget / batch / queue it.

---

## ⭐ 1-Minute Exam Answer

> "FundForge is a crowdfunding REST API built with Express, TypeScript, and Prisma over
> PostgreSQL. It uses a strict layered architecture: requests pass through middleware —
> security, JWT authentication, role authorization, and Zod schema validation — then hit a thin
> **controller** whose only job is HTTP in and out. The controller delegates to a **service**,
> which holds all business logic and validation that needs database state, and the service calls
> **repositories**, the only layer that talks to Prisma. Responses always come back in a uniform
> JSON envelope — `success`, `data`, `message` — and all errors funnel through one centralized
> error-handling middleware that maps typed `ApiError`s and Prisma errors to the right HTTP status.
>
> The signature flow is a **donation**: the service validates the campaign is active and the
> amount fits the campaign and reward limits, then runs everything in a single Prisma
> `$transaction` — it creates the donation and payment, marks them complete, and atomically
> increments the campaign's raised amount, the donor's lifetime total, and the reward's claim
> count. The transaction guarantees these denormalized counters can never drift out of sync with
> the donation, because it's all-or-nothing.
>
> Authentication uses short-lived JWT access tokens with rotating refresh tokens and reuse
> detection, and the frontend's Axios interceptor refreshes them transparently on a 401. The
> design's biggest strengths are separation of concerns and consistent error handling; in
> production I'd replace the simulated payment with a real Stripe webhook flow — keeping network
> calls out of the DB transaction — add idempotency keys to prevent double-charges, and a
> reconciliation job to guard the denormalized totals."
