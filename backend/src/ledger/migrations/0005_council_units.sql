-- 0005 — per-council unit registry.
--
-- The `unit` table replaces the process-wide demo registry with tenant-scoped
-- unit master data: every council owns its own building. `community_id` is the
-- council id (the ledger `community_id`), so a unit is always addressed as
-- (community_id, unit_ref) and two councils can both have a "302".
--
-- This is the unit→payment→form traceability spine: the ledger AR account for
-- a unit is derived from its `unit_ref` (`ar:unit-<n>`), and payment requests
-- reference the same unit_ref, so unit detail can be assembled from one row.

BEGIN;

CREATE TABLE IF NOT EXISTS unit (
  community_id TEXT NOT NULL REFERENCES council(id),
  unit_ref     TEXT NOT NULL,
  floor        INTEGER NOT NULL,
  sqft         INTEGER,
  occupancy    TEXT NOT NULL DEFAULT 'occupied'
               CHECK (occupancy IN ('occupied', 'vacant', 'short-term')),
  tenant       TEXT,
  rent         INTEGER,
  eht          BOOLEAN NOT NULL DEFAULT FALSE,
  ev_charger   BOOLEAN NOT NULL DEFAULT FALSE,
  form_k       TEXT NOT NULL DEFAULT 'missing'
               CHECK (form_k IN ('signed', 'missing')),
  owner        TEXT,
  occupants    TEXT NOT NULL DEFAULT '[]',   -- JSON array of occupant names
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, unit_ref)
);

CREATE INDEX IF NOT EXISTS unit_community_idx ON unit (community_id);

COMMIT;
