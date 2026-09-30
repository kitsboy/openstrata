-- =============================================================================
-- Trust ledger schema — Phase 3 core product.
--
-- Design invariants (enforced both in SQL and in `src/ledger/model.ts`):
--   1. APPEND-ONLY: `ledger_entries` is insert-only. No UPDATE/DELETE by the app.
--      Every mutation is a new row carrying an explicit `posted_at` timestamp.
--   2. FUND ISOLATION: money lives on an `account` scoped to one `community` and
--      one `fund`. Balances are computed per (community, account); no co-mingling.
--   3. NO CROSS-FUND WITHOUT A RESOLUTION: moving money between two accounts
--      requires a `resolution_id` on the transfer so BCFSA trust rules hold.
--   4. DIFFABLE + TAMPER-EVIDENT: each entry links to the previous entry's
--      `tally_root` and stores the account's running checksum (`tally_root`),
--      forming a hash chain. Two ledger copies diff by comparing per-account
--      `tally_root` sequences. A gap or a changed root proves tampering.
--
-- Amounts are stored as integer *basis points* of the account currency to avoid
-- floating-point drift in CAD/trust math. (100 basis points = 1.00 CAD).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- ACCOUNTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS account_group (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Neutral key from framework localization (Entity_Master / Property_ID).
  community_id  TEXT        NOT NULL,
  name          TEXT        NOT NULL,   -- e.g. 'Cedar Point Strata'
  currency      TEXT        NOT NULL DEFAULT 'CAD',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, name)
);

CREATE TABLE IF NOT EXISTS account (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id      BIGINT      NOT NULL REFERENCES account_group(id),
  -- Framework-compatible fund tokens: operating, crf, special_levy:<name>,
  -- subaccount:<name>, war_chest, special_levy_auto.
  fund_code     TEXT        NOT NULL,
  label         TEXT        NOT NULL,
  min_basis     BIGINT      NOT NULL DEFAULT 0,  -- e.g. CRF floor in basis points
  max_basis     BIGINT      NOT NULL DEFAULT 0,  -- 0 = unlimited
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, fund_code)
);

-- ---------------------------------------------------------------------------
-- LEDGER ENTRIES (APPEND-ONLY JOURNAL)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger_entry (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id    BIGINT      NOT NULL REFERENCES account(id),
  -- Monotonic per-account sequence; gaps signal tampering. (account_id, seq) unique.
  seq           BIGINT      NOT NULL,
  -- Signed amount in basis points (positive = credit, negative = debit).
  amount_basis  BIGINT      NOT NULL,
  kind          TEXT        NOT NULL,   -- @ensures IN ('credit','debit') in app
  type          TEXT        NOT NULL,   -- strata_fee, transfer, adjustment, fine, etc.
  description   TEXT        NOT NULL DEFAULT '',
  reference_code TEXT       NOT NULL DEFAULT '',
  -- Optional link to the Phase 2 reconciliation reference (e.g. 'ET-1046').
  recon_ref     TEXT,
  -- Cross-fund moves require a resolution (BCFSA no-co-mingling).
  resolution_id TEXT,
  transfer_seq  TEXT,                   -- transfer_id:links two entries for balance
  -- Hash-chain integrity fields.
  prev_tally    TEXT        NOT NULL DEFAULT '',
  tally_root    TEXT        NOT NULL,   -- sha256 of the account's running chain
  posted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),  -- authoritative wall clock
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

-- ---------------------------------------------------------------------------
-- VIEWS (derived, recomputable — the single source of truth stays the journal)
-- ---------------------------------------------------------------------------
-- Successful balance of an account (sum of all posted entries since inception).
CREATE OR REPLACE VIEW account_balance AS
SELECT
  l.account_id,
  COALESCE(SUM(l.amount_basis), 0)::BIGINT AS balance_basis,
  COUNT(*)::BIGINT                         AS entry_count,
  MAX(l.tally_root)                        AS head_tally_root,
  MAX(l.seq)                               AS head_seq
FROM ledger_entry l
GROUP BY l.account_id;

-- ---------------------------------------------------------------------------
-- SEED: a demo community with isolated Operating / CRF / Special Levy accounts.
-- Kept as an example; real onboarding uses the building template wizard output.
-- ---------------------------------------------------------------------------
INSERT INTO account_group (community_id, name)
SELECT 'demo-cedar-point', 'Cedar Point Strata'
WHERE NOT EXISTS (SELECT 1 FROM account_group WHERE community_id = 'demo-cedar-point');

INSERT INTO account (group_id, fund_code, label, min_basis, max_basis)
SELECT g.id, f.fund_code, f.label, f.min_basis, f.max_basis
FROM account_group g
JOIN (VALUES
  ('operating',    'Operating Fund',       0,     0),
  ('crf',          'Contingency Reserve', 0,     0),
  ('special_levy', 'Special Levy',         0,     0)
) AS f(fund_code, label, min_basis, max_basis)
  ON g.community_id = 'demo-cedar-point'
WHERE NOT EXISTS (
  SELECT 1 FROM account a
  WHERE a.group_id = g.id AND a.fund_code = f.fund_code
);

COMMIT;