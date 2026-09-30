-- 0006 — per-council member registry (owner/contact layer).
-- Each council (tenant) owns its member rows. A member links a unit (lot) to
-- the people who own/occupy it, so the unit->payment->form traceability spine
-- gets a human face. Owner/occupant identity is SPA Form K data.

CREATE TABLE IF NOT EXISTS council_member (
  id            BIGSERIAL PRIMARY KEY,
  community_id  TEXT NOT NULL,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  unit_ref      TEXT NOT NULL,
  role_label    TEXT NOT NULL DEFAULT 'owner',   -- owner | tenant | both
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, email)
);

CREATE INDEX IF NOT EXISTS idx_council_member_community
  ON council_member (community_id);
CREATE INDEX IF NOT EXISTS idx_council_member_unit
  ON council_member (community_id, unit_ref);
