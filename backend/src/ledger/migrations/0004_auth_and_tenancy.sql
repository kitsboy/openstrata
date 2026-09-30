-- 0004 — multi-tenant auth: councils + users, and payment_request tenancy.
--
-- A `council` is the tenant (its id is the ledger `community_id`). Users belong
-- to exactly one council and carry a role (admin / treasurer / member). Email
-- is globally unique.
--
-- Also scopes the payment_request idempotency key by community: two councils
-- may both quote the same (refId, unit, rail) without colliding, and every
-- lookup is now council-scoped. Fresh installs create the constrained table via
-- this migration; the old (ref_id, unit_ref, rail) constraint is dropped so a
-- migrated DB ends up with the same shape.

BEGIN;

CREATE TABLE IF NOT EXISTS council (
  id         TEXT PRIMARY KEY,            -- e.g. c-<base36> — also the ledger community_id
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_user (
  id            TEXT PRIMARY KEY,
  council_id    TEXT NOT NULL REFERENCES council(id),
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'treasurer', 'member')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are stored lowercase; global uniqueness across councils.
CREATE UNIQUE INDEX IF NOT EXISTS app_user_email_key ON app_user (email);
CREATE INDEX IF NOT EXISTS app_user_council_idx ON app_user (council_id);

-- Scope the payment-request idempotency key by tenant.
ALTER TABLE payment_request DROP CONSTRAINT IF EXISTS payment_request_ref_id_unit_ref_rail_key;
ALTER TABLE payment_request
  ADD CONSTRAINT payment_request_tenant_key UNIQUE (community_id, ref_id, unit_ref, rail);

COMMIT;
