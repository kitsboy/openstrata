-- 0009 — privileged-action audit log + revocable sessions.
--
-- Two gaps this closes, both about credentials and accountability rather than
-- features:
--
-- 1. `audit_event` — an append-only record of who did what. Twenty routes are
--    role-gated (admin: bylaw fines, unit/member deletion, user management;
--    treasurer: ledger posts, billing runs, bill links, PSBT plans) and none of
--    them left a trace of the actor. Evidence cannot be backfilled, so this is
--    the one table that has to exist before the first privileged action.
--
-- 2. `auth_session` — access tokens were stateless bearer credentials with a
--    12h lifetime and no way to kill one. A treasurer removed at an evening
--    meeting kept full write access until morning, and a token captured from a
--    shared laptop could not be revoked at all. A session row makes login a
--    thing the server can end, list, and rotate.
--
-- Tenant note: `audit_event` deliberately carries NO foreign key to `council`
-- or `app_user`. The log must survive its subject (and a SET NULL cascade is an
-- UPDATE, which the append-only trigger below refuses), so the identifiers are
-- plain text with the tenant kept for scoping reads. Integrity here is
-- append-only-ness, not referential integrity.
--
-- Migrations own their transaction boundaries where needed; the runner strips
-- the wrappers so DDL + the version/checksum row commit together.
BEGIN;

CREATE TABLE IF NOT EXISTS audit_event (
  seq          BIGSERIAL PRIMARY KEY,
  at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  community_id TEXT,
  actor_id     TEXT,
  actor_role   TEXT CHECK (actor_role IS NULL OR actor_role IN ('admin', 'treasurer', 'member')),
  action       TEXT NOT NULL CHECK (action ~ '^[a-z0-9:._-]{3,120}$'),
  outcome      TEXT NOT NULL CHECK (outcome IN ('success', 'denied', 'error')),
  target       TEXT,
  http_status  INTEGER NOT NULL CHECK (http_status BETWEEN 100 AND 599),
  ip           TEXT,
  user_agent   TEXT
);

-- Council-facing reads are newest-first within one tenant; `seq` is the cursor.
CREATE INDEX IF NOT EXISTS audit_event_community_idx
  ON audit_event (community_id, seq DESC);
CREATE INDEX IF NOT EXISTS audit_event_actor_idx
  ON audit_event (actor_id, seq DESC);

-- Append-only in the database, not only in the code that writes it. A log that
-- can be edited after the fact is not evidence, and the whole point of this
-- table is to answer "who authorized this" for an auditor years later.
CREATE OR REPLACE FUNCTION audit_event_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_event is append-only (% is refused)', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS audit_event_no_update ON audit_event;
CREATE TRIGGER audit_event_no_update
  BEFORE UPDATE OR DELETE ON audit_event
  FOR EACH ROW EXECUTE FUNCTION audit_event_append_only();

CREATE TABLE IF NOT EXISTS auth_session (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  community_id   TEXT NOT NULL,
  -- Role at the moment of login. A token whose `role` claim no longer matches
  -- is refused, so promoting or demoting an account cannot leave a stale
  -- privileged credential alive inside its TTL.
  role           TEXT NOT NULL CHECK (role IN ('admin', 'treasurer', 'member')),
  -- SHA-256 of the current refresh token. The token itself is never stored, so
  -- a database read does not yield a usable credential.
  refresh_hash   TEXT NOT NULL CHECK (refresh_hash ~ '^[a-f0-9]{64}$'),
  -- The token rotated away on the last refresh. Presenting it again is the
  -- signature of a stolen copy, and revokes the session.
  previous_hash  TEXT CHECK (previous_hash IS NULL OR previous_hash ~ '^[a-f0-9]{64}$'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL,
  revoked_at     TIMESTAMPTZ,
  revoked_reason TEXT,
  ip             TEXT,
  user_agent     TEXT
);

CREATE INDEX IF NOT EXISTS auth_session_user_idx ON auth_session (user_id);
CREATE INDEX IF NOT EXISTS auth_session_refresh_idx ON auth_session (refresh_hash);
-- Replay detection looks up a rotated-away token by this column.
CREATE INDEX IF NOT EXISTS auth_session_previous_idx ON auth_session (previous_hash);
CREATE INDEX IF NOT EXISTS auth_session_community_idx ON auth_session (community_id);

COMMIT;
