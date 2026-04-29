-- BadgerSkope research library platform (starter DDL, PRD Part III §7.1).
-- Apply to Neon (or Postgres) when moving off file-only export. Enum names are illustrative.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Single-row site / export header (disclaimer text, meta_json for legends, schema version).
CREATE TABLE IF NOT EXISTS library_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  disclaimer_text text NOT NULL,
  meta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  schema_version text NOT NULL DEFAULT '3.0',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance: only connectors with signed-off policy URLs may run in production (§7.2a).
CREATE TABLE IF NOT EXISTS connector_allowlist (
  id text PRIMARY KEY,
  provider text NOT NULL,
  policy_urls text[] NOT NULL,
  allowed_operations text[] NOT NULL,
  notes text,
  reviewed_at timestamptz,
  reviewed_by text
);

CREATE TABLE IF NOT EXISTS compound (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  workflow_state text NOT NULL DEFAULT 'draft',
  scientific_name text,
  next_review_due date,
  sport_context_stale boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  version int NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  UNIQUE (compound_id, version)
);

CREATE TABLE IF NOT EXISTS external_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_type text NOT NULL,
  external_id text NOT NULL,
  title text,
  raw_payload_ref text,
  review_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (work_type, external_id)
);

CREATE TABLE IF NOT EXISTS compound_source (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  external_work_id uuid REFERENCES external_work (id),
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sample_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  audit_version_id uuid REFERENCES audit_version (id),
  species text,
  subject_n int,
  population_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claim (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  audit_version_id uuid REFERENCES audit_version (id),
  claim_text text NOT NULL,
  claim_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_claim_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claim (id) ON DELETE CASCADE,
  verdict text NOT NULL,
  verified_by text,
  verified_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS editorial_grade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  audit_version_id uuid REFERENCES audit_version (id),
  evidence_grade text,
  safety_grade text,
  access_grade text,
  sport_ban_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entry_synthesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compound_id uuid NOT NULL REFERENCES compound (id) ON DELETE CASCADE,
  audit_version_id uuid REFERENCES audit_version (id),
  synthesis_status text NOT NULL DEFAULT 'draft',
  entry_payload jsonb NOT NULL,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id text REFERENCES connector_allowlist (id),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL,
  correlation_id text,
  stats_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS export_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL,
  entry_count int,
  sha256 text,
  git_sha text,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_compound_workflow ON compound (workflow_state);
CREATE INDEX IF NOT EXISTS idx_external_work_review ON external_work (review_status);
