-- =====================================================
-- PHANTOMBUSTER JOB INGESTION
--
-- Automates the LinkedIn job import that was done by hand from
-- Phantombuster exports. See docs/PHANTOMBUSTER_INGESTION.md.
--
-- Adds:
--   1. Provenance columns on vagas_ia (source, source_run_id, last_seen_at)
--   2. Unique index on vagas_ia.job_id (guarded: skipped if duplicates exist)
--   3. job_search_queries — the LinkedIn searches the Phantom runs, served
--      as a CSV to Phantombuster by the `phantombuster` edge function
--   4. ingestion_runs — one row per Phantom launch, with counters/errors
--
-- RLS: both new tables are service-role only. anon/authenticated get no
-- policies, so RLS denies everything. Idempotent — safe to re-run.
-- =====================================================

-- 1. Provenance -----------------------------------------------------------

ALTER TABLE vagas_ia ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE vagas_ia ADD COLUMN IF NOT EXISTS source_run_id text;
ALTER TABLE vagas_ia ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

COMMENT ON COLUMN vagas_ia.source IS
  'Where the row came from: manual (Studio/legacy), post_job (public form), phantombuster (LinkedIn scraper).';
COMMENT ON COLUMN vagas_ia.source_run_id IS
  'Phantombuster containerId of the launch that first inserted this job. NULL for non-scraped rows.';
COMMENT ON COLUMN vagas_ia.last_seen_at IS
  'Last time a scraper run returned this job_id. Used to detect listings that disappeared from LinkedIn.';

CREATE INDEX IF NOT EXISTS idx_vagas_ia_source_last_seen ON vagas_ia (source, last_seen_at DESC);

-- 2. Unique job_id (guarded) ---------------------------------------------

DO $$
DECLARE
  dup_count int;
BEGIN
  SELECT count(*) INTO dup_count
  FROM (SELECT job_id FROM vagas_ia GROUP BY job_id HAVING count(*) > 1) d;

  IF dup_count > 0 THEN
    RAISE WARNING 'vagas_ia has % duplicated job_id values; unique index NOT created. Resolve with the query in docs/PHANTOMBUSTER_INGESTION.md and re-run.', dup_count;
  ELSIF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_vagas_ia_job_id') THEN
    CREATE UNIQUE INDEX uq_vagas_ia_job_id ON vagas_ia (job_id);
  END IF;
END $$;

-- 3. Search queries -------------------------------------------------------

CREATE TABLE IF NOT EXISTS job_search_queries (
  id bigserial PRIMARY KEY,
  label text NOT NULL,
  keywords text NOT NULL,
  location text NOT NULL DEFAULT 'Brasil',
  geo_id text NOT NULL DEFAULT '106057199', -- LinkedIn geoId for Brazil
  remote_only boolean NOT NULL DEFAULT false,
  time_window_seconds int NOT NULL DEFAULT 86400, -- f_TPR: 86400 = last 24h
  priority int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (keywords, location, remote_only)
);

COMMENT ON TABLE job_search_queries IS
  'LinkedIn job searches executed by the Phantombuster "LinkedIn Job Scraper". The phantombuster edge function turns each active row into a search URL and serves the list as CSV (Phantom spreadsheet input). Lower priority runs first.';

ALTER TABLE job_search_queries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON job_search_queries FROM anon, authenticated;

INSERT INTO job_search_queries (label, keywords, priority) VALUES
  ('IA (pt)',                 'inteligência artificial',          10),
  ('AI engineer',             'AI engineer',                      20),
  ('Machine learning',        'machine learning',                 30),
  ('Engenheiro de ML',        'engenheiro machine learning',      40),
  ('Cientista de dados',      'cientista de dados',               50),
  ('Data scientist',          'data scientist',                   60),
  ('LLM',                     'LLM',                              70),
  ('Generative AI',           'generative AI',                    80),
  ('IA generativa',           'IA generativa',                    90),
  ('MLOps',                   'MLOps',                           100),
  ('NLP',                     'NLP processamento linguagem natural', 110),
  ('Visão computacional',     'visão computacional',             120),
  ('Prompt engineer',         'prompt engineer',                 130),
  ('Engenheiro de dados IA',  'engenheiro de dados IA',          140),
  ('Deep learning',           'deep learning',                   150)
ON CONFLICT (keywords, location, remote_only) DO NOTHING;

-- 4. Ingestion runs -------------------------------------------------------

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id bigserial PRIMARY KEY,
  source text NOT NULL DEFAULT 'phantombuster',
  external_run_id text,              -- Phantombuster containerId
  agent_id text,
  status text NOT NULL DEFAULT 'running', -- running | done | failed
  rows_received int NOT NULL DEFAULT 0,
  rows_inserted int NOT NULL DEFAULT 0,
  rows_updated int NOT NULL DEFAULT 0,
  rows_skipped int NOT NULL DEFAULT 0,
  rows_pending int NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  unknown_columns text[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE (source, external_run_id)
);

COMMENT ON TABLE ingestion_runs IS
  'One row per scraper launch processed by the phantombuster edge function. unknown_columns lists Phantom output fields the mapper did not recognise — check it after changing the Phantom.';

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started_at ON ingestion_runs (started_at DESC);

ALTER TABLE ingestion_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ingestion_runs FROM anon, authenticated;
