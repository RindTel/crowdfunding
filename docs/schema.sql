-- FundForge Database Schema (PostgreSQL)
-- Equivalent to prisma/schema.prisma

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'CREATOR', 'DONOR');
CREATE TYPE "CampaignStatus" AS ENUM (
  'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED',
  'COMPLETED', 'CANCELLED', 'REJECTED'
);
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED'
);
CREATE TYPE "ReportReason" AS ENUM (
  'SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'MISLEADING', 'COPYRIGHT', 'OTHER'
);
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- ─────────────────────────────────────────────
-- AUTH & USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(50) NOT NULL,
  last_name     VARCHAR(50) NOT NULL,
  avatar_url    VARCHAR(500),
  is_active     BOOLEAN DEFAULT TRUE,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_deleted_at ON users (deleted_at);

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        "RoleName" UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       VARCHAR(500) UNIQUE NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_revoked  BOOLEAN DEFAULT FALSE,
  replaced_by VARCHAR(500),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_token   ON refresh_tokens (token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- ─────────────────────────────────────────────
-- DOMAIN
-- ─────────────────────────────────────────────
CREATE TABLE creators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio           TEXT,
  website_url   VARCHAR(500),
  social_links  JSONB,
  is_verified   BOOLEAN DEFAULT FALSE,
  total_raised  DECIMAL(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_creators_user_id ON creators (user_id);

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  icon_url    VARCHAR(500),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_categories_slug ON categories (slug);

CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES creators(id),
  category_id     UUID NOT NULL REFERENCES categories(id),
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) UNIQUE NOT NULL,
  description     VARCHAR(500) NOT NULL,
  story           TEXT NOT NULL,
  goal_amount     DECIMAL(12,2) NOT NULL,
  raised_amount   DECIMAL(12,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'USD',
  status          "CampaignStatus" DEFAULT 'DRAFT',
  cover_image_url VARCHAR(500),
  video_url       VARCHAR(500),
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  donors_count    INTEGER DEFAULT 0,
  donations_count INTEGER DEFAULT 0,
  views_count     INTEGER DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  allow_anonymous BOOLEAN DEFAULT TRUE,
  min_donation    DECIMAL(10,2),
  max_donation    DECIMAL(10,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT chk_amounts CHECK (raised_amount >= 0 AND goal_amount > 0),
  CONSTRAINT chk_dates CHECK (end_date IS NULL OR end_date > start_date)
);
CREATE INDEX idx_campaigns_creator_id  ON campaigns (creator_id);
CREATE INDEX idx_campaigns_category_id ON campaigns (category_id);
CREATE INDEX idx_campaigns_status      ON campaigns (status);
CREATE INDEX idx_campaigns_slug        ON campaigns (slug);
CREATE INDEX idx_campaigns_deleted_at  ON campaigns (deleted_at);

CREATE TABLE rewards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  description         TEXT NOT NULL,
  minimum_amount      DECIMAL(10,2) NOT NULL,
  estimated_delivery  TIMESTAMPTZ,
  max_claims          INTEGER,
  claims_count        INTEGER DEFAULT 0,
  is_available        BOOLEAN DEFAULT TRUE,
  image_url           VARCHAR(500),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  CONSTRAINT chk_claims CHECK (max_claims IS NULL OR claims_count <= max_claims)
);
CREATE INDEX idx_rewards_campaign_id ON rewards (campaign_id);

CREATE TABLE donors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_donated   DECIMAL(12,2) DEFAULT 0,
  donations_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_donors_user_id ON donors (user_id);

CREATE TABLE donations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES campaigns(id),
  donor_id     UUID REFERENCES donors(id),
  reward_id    UUID REFERENCES rewards(id),
  amount       DECIMAL(10,2) NOT NULL,
  currency     CHAR(3) DEFAULT 'USD',
  is_anonymous BOOLEAN DEFAULT FALSE,
  message      VARCHAR(500),
  status       "DonationStatus" DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_amount CHECK (amount > 0)
);
CREATE INDEX idx_donations_campaign_id ON donations (campaign_id);
CREATE INDEX idx_donations_donor_id    ON donations (donor_id);
CREATE INDEX idx_donations_status      ON donations (status);
CREATE INDEX idx_donations_created_at  ON donations (created_at DESC);

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id       UUID UNIQUE NOT NULL REFERENCES donations(id),
  external_id       VARCHAR(255) UNIQUE,
  provider          VARCHAR(50) NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  currency          CHAR(3) NOT NULL,
  status            "PaymentStatus" DEFAULT 'PENDING',
  gateway_response  JSONB,
  refunded_at       TIMESTAMPTZ,
  refund_amount     DECIMAL(10,2),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_donation_id ON payments (donation_id);
CREATE INDEX idx_payments_status      ON payments (status);

CREATE TABLE updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  image_url   VARCHAR(500),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_updates_campaign_id ON updates (campaign_id);

CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  parent_id   UUID REFERENCES comments(id),
  content     TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_hidden   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_comments_campaign_id ON comments (campaign_id);
CREATE INDEX idx_comments_user_id     ON comments (user_id);
CREATE INDEX idx_comments_parent_id   ON comments (parent_id);

CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  campaign_id UUID REFERENCES campaigns(id),
  comment_id  UUID REFERENCES comments(id),
  reason      "ReportReason" NOT NULL,
  description TEXT,
  status      "ReportStatus" DEFAULT 'PENDING',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_report_target CHECK (
    (campaign_id IS NOT NULL AND comment_id IS NULL) OR
    (campaign_id IS NULL AND comment_id IS NOT NULL)
  )
);
CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_status      ON reports (status);

-- ─────────────────────────────────────────────
-- SEED: Default roles
-- ─────────────────────────────────────────────
INSERT INTO roles (name, description) VALUES
  ('ADMIN',   'Platform administrator with full access'),
  ('CREATOR', 'User who can create and manage campaigns'),
  ('DONOR',   'User who can donate to campaigns')
ON CONFLICT (name) DO NOTHING;
