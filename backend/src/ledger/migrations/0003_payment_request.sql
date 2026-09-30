-- 0003 — payment requests (quotes) so rail references survive restarts and are
-- idempotent per (refId, unitRef, rail). A quote issued twice for the same key
-- returns the stored request instead of creating a duplicate reference.

BEGIN;

CREATE TABLE IF NOT EXISTS payment_request (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref_id        TEXT        NOT NULL,
  unit_ref      TEXT        NOT NULL,
  community_id  TEXT        NOT NULL,
  rail          TEXT        NOT NULL,
  reference_code TEXT       NOT NULL,
  amount_basis  BIGINT      NOT NULL,
  currency      TEXT        NOT NULL DEFAULT 'CAD',
  recipient     TEXT        NOT NULL,
  invoice       TEXT        NOT NULL DEFAULT '',
  fiat_locked_basis BIGINT  NOT NULL DEFAULT 0,
  amount_sat    BIGINT      NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  status        TEXT        NOT NULL DEFAULT 'quoted',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ref_id, unit_ref, rail)
);

CREATE INDEX IF NOT EXISTS idx_payment_request_reference ON payment_request (reference_code);
CREATE INDEX IF NOT EXISTS idx_payment_request_unit ON payment_request (unit_ref, status);

COMMIT;