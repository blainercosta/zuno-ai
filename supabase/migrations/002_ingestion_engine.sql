-- =====================================================
-- INGESTION ENGINE — Schema (DEPRECATED)
--
-- Este schema foi aplicado em produção como preparação para
-- internalizar o pipeline de scraping. Superseded: a ingestão
-- agora é feita pelo produto externo Kubo (webhook em
-- /api/kubo-ingest). As tabelas criadas aqui estão ociosas.
--
-- Para dropar, rode supabase/migrations/005_remove_local_ingestion.sql
-- (opcional — mantê-las vazias não custa nada).
-- =====================================================

-- Extensões necessárias (pg_net para cron chamar Edge Functions)
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Nota: pg_cron é habilitado no Dashboard (Database > Extensions)
-- porque exige install em schema cron que só role postgres pode criar.

-- =====================================================
-- 1. SOURCES — estender com metadados operacionais
-- =====================================================

ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'news'
    CHECK (kind IN ('news', 'jobs')),
  ADD COLUMN IF NOT EXISTS last_discovered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fail_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- url deve ser único (seed depende disso para ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sources_url_key' AND conrelid = 'sources'::regclass
  ) THEN
    ALTER TABLE sources ADD CONSTRAINT sources_url_key UNIQUE (url);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sources_active_kind
  ON sources (kind, active) WHERE active = true;

-- =====================================================
-- 2. NEWS_INGESTION_QUEUE — fila de artigos descobertos
-- =====================================================

CREATE TABLE IF NOT EXISTS news_ingestion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  source_name TEXT,
  source_language TEXT DEFAULT 'en',
  original_title TEXT,
  original_author TEXT,
  original_publish_date TIMESTAMPTZ,
  raw_content TEXT,
  word_count INT,
  cover_image TEXT,
  extracted_media JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','published','review','failed','skipped')),
  status_reason TEXT,
  attempts INT NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  news_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_pending
  ON news_ingestion_queue (created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_queue_status
  ON news_ingestion_queue (status, created_at);
CREATE INDEX IF NOT EXISTS idx_queue_content_hash
  ON news_ingestion_queue (content_hash);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION tg_news_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS news_queue_updated_at ON news_ingestion_queue;
CREATE TRIGGER news_queue_updated_at
  BEFORE UPDATE ON news_ingestion_queue
  FOR EACH ROW EXECUTE FUNCTION tg_news_queue_updated_at();

-- RLS: bloqueado para anon (só service_role opera)
ALTER TABLE news_ingestion_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block all on news_ingestion_queue" ON news_ingestion_queue;
CREATE POLICY "Block all on news_ingestion_queue"
  ON news_ingestion_queue FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- 3. RPC find_similar_news — dedupe semântico (Sprint 2)
-- =====================================================

CREATE OR REPLACE FUNCTION find_similar_news(
  query_embedding vector,
  threshold float DEFAULT 0.92,
  hours_window int DEFAULT 48
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id, 1 - (embedding <=> query_embedding) AS similarity
  FROM news
  WHERE published_at > NOW() - (hours_window || ' hours')::interval
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > threshold
  ORDER BY embedding <=> query_embedding
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION find_similar_news FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_similar_news TO service_role;

-- =====================================================
-- 4. VIEW ingestion_health — status operacional
-- =====================================================

CREATE OR REPLACE VIEW ingestion_health AS
SELECT
  s.id AS source_id,
  s.name,
  s.kind,
  s.active,
  s.last_discovered_at,
  s.last_success_at,
  s.fail_count,
  (
    SELECT COUNT(*) FROM news_ingestion_queue q
    WHERE q.source_id = s.id AND q.status = 'pending'
  ) AS queue_pending,
  (
    SELECT COUNT(*) FROM news_ingestion_queue q
    WHERE q.source_id = s.id AND q.status = 'failed'
      AND q.created_at > NOW() - INTERVAL '24 hours'
  ) AS failures_24h,
  (
    SELECT COUNT(*) FROM news_ingestion_queue q
    WHERE q.source_id = s.id AND q.status = 'skipped'
      AND q.created_at > NOW() - INTERVAL '24 hours'
  ) AS skipped_24h,
  (
    SELECT COUNT(*) FROM news
    WHERE source_id = s.id AND published_at > NOW() - INTERVAL '24 hours'
  ) AS published_24h
FROM sources s;

-- Views herdam RLS das tabelas base (documentado em 001_enable_rls_policies.sql)
