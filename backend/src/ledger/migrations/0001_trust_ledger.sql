-- 0001 — Trust ledger core (append-only journal, fund isolation, hash chains).
-- See backend/src/ledger/schema.sql for the same design as a human-readable
-- reference. This file is the migration of record used by scripts/migrate.mjs.

BEGIN;

CREATE TABLE IF NOT EXISTS account_group (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  community_id  TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  currency      TEXT        NOT NULL DEFAULT 'CAD',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, name)
);

CREATE TABLE IF NOT EXISTS account (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id      BIGINT      NOT NULL REFERENCES account_group(id),
  fund_code     TEXT        NOT NULL,
  label         TEXT        NOT NULL,
  min_basis     BIGINT      NOT NULL DEFAULT 0,
  max_basis     BIGINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, fund_code)
);

CREATE TABLE IF NOT EXISTS ledger_entry (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id    BIGINT      NOT NULL REFERENCES account(id),
  seq           BIGINT      NOT NULL,
  amount_basis  BIGINT      NOT NULL,
  kind          TEXT        NOT NULL,
  type          TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  reference_code TEXT       NOT NULL DEFAULT '',
  recon_ref     TEXT,
  resolution_id TEXT,
  transfer_seq  TEXT,
  prev_tally    TEXT        NOT NULL DEFAULT '',
  tally_root    TEXT        NOT NULL,
  posted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, seq),
  CHECK (amount_basis <> 0),
  CHECK (
    (kind = 'credit' AND amount_basis > 0)
    OR (kind = 'debit'  AND amount_basis < 0)
  ),
  CHECK (resolution_id <> '' OR transfer_seq IS NULL),
  CHECK (tally_root <> '')
);

CREATE INDEX IF NOT EXISTS idx_ledger_account_seq    ON ledger_entry (account_id, seq);
CREATE INDEX IF NOT EXISTS idx_ledger_account_ts     ON ledger_entry (account_id, posted_at);
CREATE INDEX IF NOT EXISTS idx_ledger_recon_ref      ON ledger_entry (recon_ref);
CREATE INDEX IF NOT EXISTS idx_ledger_transfer_seq   ON ledger_entry (transfer_seq);

CREATE OR REPLACE VIEW account_balance AS
SELECT
  l.account_id,
  COALESCE(SUM(l.amount_basis), 0)::BIGINT AS balance_basis,
  COUNT(*)::BIGINT                         AS entry_count,
  MAX(l.tally_root)                        AS head_tally_root,
  MAX(l.seq)                               AS head_seq
FROM ledger_entry l
GROUP BY l.account_id;

COMMIT;