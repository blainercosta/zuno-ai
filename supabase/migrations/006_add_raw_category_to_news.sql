-- =====================================================
-- Adiciona news.raw_category como fallback do enum
--
-- Kubo gera categorias LLM-free que podem não bater com o enum
-- news_category. Em vez de perder a informação, guardamos o valor
-- cru aqui e o frontend exibe `category ?? raw_category`.
-- =====================================================

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS raw_category TEXT;

COMMENT ON COLUMN news.raw_category IS
  'Categoria crua recebida do Kubo (LLM-gerada). Preenchida sempre. '
  'Use em conjunto com news.category (enum) quando category for NULL.';
