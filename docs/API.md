# FundForge API Documentation

**Base URL:** `http://localhost:4000/api/v1`  
**Version:** 1.0.0  
**Auth:** Bearer JWT (access token in `Authorization` header)

---

## Response Format

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Authentication

### POST `/auth/register`
Register a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "CREATOR"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| email | string | ✅ | Valid email |
| password | string | ✅ | ≥8 chars, 1 uppercase, 1 digit |
| firstName | string | ✅ | 1–50 chars |
| lastName | string | ✅ | 1–50 chars |
| role | enum | ✅ | `CREATOR` or `DONOR` |

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "roles": ["DONOR", "CREATOR"],
      "isVerified": false,
      "createdAt": "2025-04-16T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

### POST `/auth/login`
Authenticate and receive tokens.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**Response 200:** Same structure as register.

---

### POST `/auth/refresh`
Rotate refresh token and get new token pair.

**Body:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

> ⚠️ Refresh tokens are single-use. Using an old token revokes all tokens for the user (reuse detection).

---

### POST `/auth/logout`
Revoke a refresh token.

**Body:** `{ "refreshToken": "eyJ..." }`  
**Response:** `204 No Content`

---

### GET `/auth/me`
Get current user profile.

**Auth:** Required  
**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatarUrl": null,
    "roles": ["CREATOR"],
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## Campaigns

### GET `/campaigns`
List campaigns with pagination, filtering, and sorting.

**Auth:** Optional  
**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page (max 100) |
| status | enum | — | `DRAFT`, `ACTIVE`, `COMPLETED`, etc. |
| categoryId | uuid | — | Filter by category |
| search | string | — | Full-text search on title/description |
| isFeatured | boolean | — | Featured campaigns only |
| sortBy | enum | `createdAt` | `createdAt`, `raisedAmount`, `donorsCount`, `endDate` |
| sortOrder | enum | `desc` | `asc` or `desc` |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Eco Smart Water Purifier",
      "slug": "eco-smart-water-purifier",
      "description": "Short description...",
      "goalAmount": 50000,
      "raisedAmount": 32500,
      "progressPercent": 65,
      "currency": "USD",
      "status": "ACTIVE",
      "donorsCount": 142,
      "isFeatured": true,
      "creator": {
        "id": "uuid",
        "user": { "firstName": "Jane", "lastName": "Creator", "avatarUrl": null }
      },
      "category": { "id": "uuid", "name": "Technology", "slug": "technology" },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 48, "totalPages": 4, "hasNext": true, "hasPrev": false }
}
```

---

### GET `/campaigns/:id`
Get campaign by ID (increments view count).

**Auth:** Optional  
**Response 200:** Full campaign object including `rewards`, `updates`, `_count`.

---

### GET `/campaigns/slug/:slug`
Get campaign by URL slug.

**Auth:** Optional

---

### POST `/campaigns`
Create a new campaign.

**Auth:** Required (CREATOR or ADMIN role)

**Body:**
```json
{
  "title": "My Awesome Campaign",
  "categoryId": "uuid",
  "description": "Short description (20–500 chars)",
  "story": "Full campaign story (min 100 chars)...",
  "goalAmount": 25000,
  "currency": "USD",
  "startDate": "2025-05-01T00:00:00Z",
  "endDate": "2025-12-31T00:00:00Z",
  "allowAnonymous": true,
  "minDonation": 5,
  "maxDonation": 10000,
  "coverImageUrl": "https://example.com/image.jpg"
}
```

**Response 201:** Created campaign object.

> Slug is auto-generated from title. Status defaults to `DRAFT`.

---

### PATCH `/campaigns/:id`
Update a campaign.

**Auth:** Required (owner or ADMIN)  
**Body:** Any subset of campaign fields.

> Creators cannot set status to `ACTIVE` — that requires admin review.

---

### DELETE `/campaigns/:id`
Soft-delete a campaign (sets `deletedAt`, status → `CANCELLED`).

**Auth:** Required (owner or ADMIN)  
**Response:** `204 No Content`

---

## Donations

### POST `/donations`
Create a donation (triggers payment processing).

**Auth:** Optional (anonymous donations supported)

**Body:**
```json
{
  "campaignId": "uuid",
  "amount": 150.00,
  "currency": "USD",
  "isAnonymous": false,
  "message": "Keep up the great work!",
  "rewardId": "uuid",
  "paymentProvider": "stripe"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| campaignId | ✅ | Must be an ACTIVE campaign |
| amount | ✅ | Positive decimal, respects campaign min/max |
| rewardId | ❌ | Must belong to campaign, have available claims |
| isAnonymous | ❌ | Hides donor identity publicly |

**Response 201:** Donation object with embedded payment record.

---

### GET `/donations`
List all donations (admin only).

**Auth:** Required (ADMIN)  
**Query:** `page`, `limit`, `campaignId`, `donorId`, `status`, `sortOrder`

---

### GET `/donations/:id`
Get donation by ID.

**Auth:** Required

---

### GET `/campaigns/:campaignId/donations/recent`
Get the 10 most recent completed donations for a campaign.

**Auth:** None  
**Response:** Array of donation objects (anonymous donor info masked).

---

## Analytics

### GET `/analytics/admin`
Platform-wide statistics.

**Auth:** Required (ADMIN)

**Response 200:**
```json
{
  "data": {
    "totalUsers": 1847,
    "totalCampaigns": 156,
    "activeCampaigns": 24,
    "totalRevenue": 415230.50,
    "totalDonations": 3291,
    "recentDonations": [...],
    "campaignsByStatus": [
      { "status": "ACTIVE", "_count": { "id": 24 } }
    ],
    "topCampaigns": [...]
  }
}
```

---

### GET `/analytics/creator`
Stats for the authenticated creator.

**Auth:** Required (CREATOR or ADMIN)

```json
{
  "data": {
    "campaigns": [...],
    "totalRaised": 78400,
    "totalDonations": 412,
    "recentDonations": [...],
    "monthlyRevenue": [
      { "month": "2025-01", "revenue": 4200 },
      { "month": "2025-02", "revenue": 6800 }
    ]
  }
}
```

---

### GET `/analytics/donor`
Stats for the authenticated donor.

**Auth:** Required (DONOR)

```json
{
  "data": {
    "totalDonated": 1250.00,
    "totalDonations": 8,
    "supportedCampaigns": 5,
    "donations": [...]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request / Validation error |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 429 | Rate limited (100 req / 15 min) |
| 500 | Internal server error |

---

## Role Permissions

| Endpoint | ADMIN | CREATOR | DONOR | Guest |
|----------|-------|---------|-------|-------|
| GET /campaigns | ✅ | ✅ | ✅ | ✅ |
| POST /campaigns | ✅ | ✅ | ❌ | ❌ |
| PATCH /campaigns | ✅ | Own only | ❌ | ❌ |
| DELETE /campaigns | ✅ | Own only | ❌ | ❌ |
| POST /donations | ✅ | ✅ | ✅ | ✅ |
| GET /donations | ✅ | ❌ | ❌ | ❌ |
| GET /analytics/admin | ✅ | ❌ | ❌ | ❌ |
| GET /analytics/creator | ✅ | ✅ | ❌ | ❌ |
| GET /analytics/donor | ✅ | ❌ | ✅ | ❌ |
