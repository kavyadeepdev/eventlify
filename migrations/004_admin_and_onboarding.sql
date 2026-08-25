-- Migration 004: System Roles, Club Applications, Payment Verification, Custom Roles, and BaaS Keys

-- 1. Add system_role to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS system_role TEXT NOT NULL DEFAULT 'USER';

-- 2. Add status to clubs
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

-- 3. Add payment config to events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS upi_qr_url TEXT;

-- 4. Add payment verification fields to registrations
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'CONFIRMED',
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 5. Create club_applications table
CREATE TABLE IF NOT EXISTS club_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  logo TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create club_roles table (Discord-style dynamic roles)
CREATE TABLE IF NOT EXISTS club_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#7548f5',
  rank INT NOT NULL DEFAULT 1,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create club_member_roles table
CREATE TABLE IF NOT EXISTS club_member_roles (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES club_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, user_id, role_id)
);

-- 8. Create club_api_keys table (Headless BaaS CORS control)
CREATE TABLE IF NOT EXISTS club_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  allowed_origins JSONB NOT NULL DEFAULT '[]'::jsonb,
  rate_limit_per_min INT NOT NULL DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
