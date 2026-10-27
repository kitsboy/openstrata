-- 0007 — durable ledger idempotency.
-- The key record points at the committed ledger entry so the response can be
-- replayed exactly without duplicating the journal side effect.
BEGIN;

CREATE TABLE IF NOT EXISTS ledger_idempotency (
  community_id    TEXT NOT NULL,
  idempotency_key TEXT NOT NULL CHECK (idempotency_key ~ '^[A-Za-z0-9._:-]{1,128}$'),
  fingerprint     TEXT NOT NULL CHECK (fingerprint ~ '^[a-f0-9]{64}$'),
  ledger_entry_id BIGINT NOT NULL REFERENCES ledger_entry(id),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS ledger_idempotency_expiry_idx
  ON ledger_idempotency (expires_at);

COMMIT;
