-- =====================================================
-- REMOVE LOCAL INGESTION — cleanup opcional
--
-- Roda só se quiser limpar os artefatos de 002/003 que
-- ficaram ociosos após migração para Kubo.
--
-- SEGURO? Sim: news_ingestion_queue deve estar vazia (discover
-- nunca rodou em produção). Se tiver linhas, REVISE antes.
-- Verificação prévia:
--   SELECT COUNT(*) FROM news_ingestion_queue;
-- =====================================================

-- 1. Remover cron se por algum motivo foi agendado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) AND EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'ingest-news-discover'
  ) THEN
    PERFORM cron.unschedule('ingest-news-discover');
    RAISE NOTICE 'Cron ingest-news-discover removido.';
  END IF;
END $$;

-- 2. Dropar view dependente primeiro
DROP VIEW IF EXISTS ingestion_health;

-- 3. Dropar RPC
DROP FUNCTION IF EXISTS find_similar_news(vector, float, int);

-- 4. Dropar fila
DROP TRIGGER IF EXISTS news_queue_updated_at ON news_ingestion_queue;
DROP FUNCTION IF EXISTS tg_news_queue_updated_at();
DROP TABLE IF EXISTS news_ingestion_queue;

-- 5. Limpar colunas de operação do scraper em sources
--    (mantém kind/config para uso futuro caso volte a precisar)
ALTER TABLE sources
  DROP COLUMN IF EXISTS last_discovered_at,
  DROP COLUMN IF EXISTS last_success_at,
  DROP COLUMN IF EXISTS fail_count;

-- 6. (Opcional, comentado) Remover as 2 sources seedadas
--    Descomente se quiser limpar 100%:
-- DELETE FROM sources WHERE url IN (
--   'https://www.testingcatalog.com/',
--   'https://blog.google/'
-- );

DO $$ BEGIN RAISE NOTICE 'Cleanup de ingestão local concluído.'; END $$;
