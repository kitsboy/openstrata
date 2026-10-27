-- 0008 — migration checksum guardrail.
-- The runner first pins the pre-checksum migration contents in the same
-- transaction, then applies this migration and records its own checksum.
ALTER TABLE _schema_version ADD COLUMN IF NOT EXISTS checksum TEXT;
