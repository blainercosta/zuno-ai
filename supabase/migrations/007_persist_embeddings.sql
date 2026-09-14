-- =====================================================
-- PERSIST EMBEDDINGS — vagas_ia + news
--
-- Problem: similar-jobs/similar-news called OpenAI embeddings.create
-- once per candidate row on EVERY request (up to 50 jobs / 60 news
-- per call, plus the current item). That's O(n) OpenAI round-trips
-- per page view instead of O(1). This migration adds persistent
-- embedding columns + pgvector ANN indexes + RPCs so the edge
-- functions can embed once (on first view) and then do the
-- candidate search entirely in Postgres via <=> (cosine distance).
--
-- Schema assumption (UNCONFIRMED — could not inspect live DB):
-- news.embedding vector(1536) may already exist. It was referenced
-- by find_similar_news() in 002_ingestion_engine.sql, but that RPC
-- (and the local-ingestion pipeline that wrote to it) was dropped in
-- 005_remove_local_ingestion.sql. 005 does NOT drop the news.embedding
-- column itself, only the RPC/queue/view — so the column likely
-- survived, but 002/005 give no CREATE TABLE for `news`, so its exact
-- type/dimension isn't visible from migration history. The
-- `add column if not exists` below is idempotent either way: if the
-- column already exists as vector(1536) this is a no-op; if it
-- exists with a different dimension, this ALTER will fail loudly at
-- apply time instead of silently corrupting data — check the error
-- and reconcile manually if that happens.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 1. vagas_ia — embedding columns
-- =====================================================

ALTER TABLE vagas_ia
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN vagas_ia.embedding IS
  'text-embedding-3-small (1536d) over job_title+company_name+location+seniority_level+'
  'employment_type+workplace_type+description_full+requirements. Populated lazily by '
  'similar-jobs (service-role client) on first view, or via the backfill-embeddings '
  'function. NULL until first embedded. Not writable by anon/authenticated — RLS on '
  'vagas_ia blocks all UPDATE for those roles (001_enable_rls_policies.sql); only the '
  'service-role key used by edge functions can set it.';

-- =====================================================
-- 2. news — embedding columns (idempotent even if 002 already added it)
-- =====================================================

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN news.embedding IS
  'text-embedding-3-small (1536d) over title+category+subtitle+first 500 chars of '
  'content (HTML stripped). Populated lazily by similar-news (service-role client) on '
  'first view of a news-table article, or via the backfill-embeddings function. '
  'Kubo-ingest (api/kubo-ingest.ts) does not set this on insert, so freshly ingested '
  'news are embedded lazily on first similar-news request. Not writable by '
  'anon/authenticated — RLS on news blocks all UPDATE for those roles '
  '(001_enable_rls_policies.sql); only the service-role key can set it.';

-- =====================================================
-- 3. ANN indexes (HNSW, cosine distance)
--
-- Build cost: HNSW index build is CPU/memory-heavy relative to
-- IVFFlat and scales with row count — for the volumes here
-- (~2k jobs, low-thousands of news) this is a one-time few-second
-- cost, not a concern. Revisit only if these tables grow to
-- hundreds of thousands of rows, at which point also consider
-- non-default (m, ef_construction) tuning and CONCURRENTLY builds
-- to avoid locking writes during rebuild.
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vagas_ia_embedding_hnsw
  ON vagas_ia USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_news_embedding_hnsw
  ON news USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- 4. RPC match_jobs — ANN candidate search for similar-jobs
--
-- Returns SETOF vagas_ia (whole row, including embedding) rather
-- than a hand-typed RETURNS TABLE column list: the exact column
-- set/types of vagas_ia were not independently confirmed against a
-- live schema, and `SELECT *` from a `SETOF <table>` function lets
-- Postgres infer types itself instead of risking a mismatch. The
-- edge function strips `embedding`/`embedding_updated_at` before
-- returning JSON to the client, so the heavy vector column never
-- reaches the browser.
--
-- SECURITY INVOKER (default, no SECURITY DEFINER): runs with the
-- caller's own RLS. Fine here because "Public can read active jobs"
-- (001_enable_rls_policies.sql) already grants anon/authenticated
-- SELECT on status = 'active' rows — this RPC exposes nothing they
-- couldn't already read directly.
-- =====================================================

CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding vector(1536),
  exclude_job_id text,
  match_count int DEFAULT 5
)
RETURNS SETOF vagas_ia
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM vagas_ia
  WHERE status = 'active'
    AND embedding IS NOT NULL
    AND (exclude_job_id IS NULL OR id::text <> exclude_job_id)
  ORDER BY embedding <=> query_embedding
  -- Clamp: anon can call this RPC directly via PostgREST; never allow a bulk dump
  LIMIT LEAST(GREATEST(COALESCE(match_count, 5), 1), 20);
$$;

GRANT EXECUTE ON FUNCTION match_jobs(vector, text, int) TO anon, authenticated;

-- =====================================================
-- 5. RPC match_news — ANN candidate search for similar-news
--
-- Same SETOF-table rationale as match_jobs. Mirrors the existing
-- `.or('status.eq.published,status.is.null')` filter used by
-- similar-news today (some legacy news rows have a NULL status and
-- are still treated as published).
--
-- Scope note: similar-news also merges candidates from the
-- unrelated `posts` table (legacy blog posts, integer PK, no
-- embedding column). That table was out of scope for this migration
-- (not mentioned in the task, no confirmed schema) — match_news only
-- covers `news`. The refactored similar-news function keeps `posts`
-- in the response via the pre-existing category-match fallback
-- (no per-row embedding calls), it's just not part of the ANN ranking.
-- =====================================================

CREATE OR REPLACE FUNCTION match_news(
  query_embedding vector(1536),
  exclude_id uuid,
  match_count int DEFAULT 5
)
RETURNS SETOF news
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM news
  WHERE (status = 'published' OR status IS NULL)
    AND embedding IS NOT NULL
    AND (exclude_id IS NULL OR id <> exclude_id)
  ORDER BY embedding <=> query_embedding
  LIMIT LEAST(GREATEST(COALESCE(match_count, 5), 1), 20);
$$;

GRANT EXECUTE ON FUNCTION match_news(vector, uuid, int) TO anon, authenticated;
