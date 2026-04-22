-- =====================================================
-- SEED — Fontes iniciais (DEPRECATED)
--
-- As fontes agora são gerenciadas no Kubo (produto externo)
-- via POST /api-sources. As 2 linhas abaixo continuam na tabela
-- `sources` mas não alimentam nenhum worker.
-- =====================================================

-- Testing Catalog — agregador tech/AI
INSERT INTO sources (id, name, url, active, kind, config)
VALUES (
  gen_random_uuid(),
  'Testing Catalog',
  'https://www.testingcatalog.com/',
  true,
  'news',
  '{"max_urls_per_run": 6, "notes": "tech/AI news agregador"}'::jsonb
)
ON CONFLICT (url) DO UPDATE
  SET name = EXCLUDED.name,
      active = EXCLUDED.active,
      kind = EXCLUDED.kind,
      config = sources.config || EXCLUDED.config;

-- Google Blog — anúncios oficiais
INSERT INTO sources (id, name, url, active, kind, config)
VALUES (
  gen_random_uuid(),
  'Google Blog',
  'https://blog.google/',
  true,
  'news',
  '{"max_urls_per_run": 6, "notes": "anúncios oficiais Google"}'::jsonb
)
ON CONFLICT (url) DO UPDATE
  SET name = EXCLUDED.name,
      active = EXCLUDED.active,
      kind = EXCLUDED.kind,
      config = sources.config || EXCLUDED.config;

-- Nota: TechCrunch fica de fora até termos bypass de Cloudflare (Sprint 4).
-- Reativar via:
--   UPDATE sources SET active = true WHERE url = 'https://techcrunch.com/';
-- Após configurar proxy/Browserless.

-- Verificação
DO $$
DECLARE
  active_news_sources INT;
BEGIN
  SELECT COUNT(*) INTO active_news_sources
  FROM sources WHERE kind = 'news' AND active = true;
  RAISE NOTICE 'Fontes de news ativas: %', active_news_sources;
END $$;
