-- =====================================================
-- NICHES — vertical hubs "IA para [nicho]"
--
-- Product goal: non-tech visitors landing on a niche-specific page
-- ("IA para Educação", "IA para Saúde & Bem-estar", ...) see news and
-- jobs semantically relevant to their field, without needing to know
-- IA terminology to search for it themselves.
--
-- Approach mirrors 007_persist_embeddings.sql: one embedding per niche
-- (computed once from name+headline+description+keywords), then ANN
-- search against the existing news.embedding / vagas_ia.embedding
-- columns via <=> (cosine distance). No per-request OpenAI calls.
--
-- Niche embeddings are populated by the seed-niches edge function
-- (admin-secret protected), not by this migration — this migration
-- only creates the schema and seeds the descriptive columns.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 1. niches — table
-- =====================================================

CREATE TABLE IF NOT EXISTS niches (
  slug text PRIMARY KEY,
  name text NOT NULL,
  headline text NOT NULL,
  description text NOT NULL,
  keywords text[],
  embedding vector(1536),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN niches.embedding IS
  'text-embedding-3-small (1536d) over "{name}. {headline}. {description}. Palavras-chave: '
  '{keywords.join(\", \")}". Populated by the seed-niches edge function (service-role '
  'client) — never computed client-side, never written by anon/authenticated. NULL '
  'until first seeded; niche_news/niche_jobs return an empty set for a niche whose '
  'embedding is still NULL.';

CREATE INDEX IF NOT EXISTS idx_niches_embedding_hnsw
  ON niches USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- 2. RLS — the table itself is never readable by anon/authenticated.
--
-- Rationale: a straightforward "anon can SELECT active niches" policy
-- on the table would also expose the `embedding` column (RLS is
-- row-level, not column-level — PostgREST/Supabase has no per-column
-- grant story here). Instead: lock the table down entirely for public
-- roles and expose a view (niches_public) that simply omits the
-- embedding column. The view is owned by the migration role, so it
-- reads the base table under the view owner's privileges — anon never
-- needs (and never gets) direct grants on `niches`.
-- =====================================================

ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON niches FROM anon, authenticated;

DROP POLICY IF EXISTS "Block direct select on niches" ON niches;
CREATE POLICY "Block direct select on niches"
ON niches FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Block direct writes on niches" ON niches;
CREATE POLICY "Block direct writes on niches"
ON niches FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- =====================================================
-- 3. niches_public — view without `embedding`, the only public surface
-- =====================================================

CREATE OR REPLACE VIEW niches_public AS
SELECT slug, name, headline, description, keywords, sort_order, is_active, updated_at
FROM niches
WHERE is_active = true;

GRANT SELECT ON niches_public TO anon, authenticated;

-- =====================================================
-- 4. Seed — 7 niches (SUBSCRIBER_NICHES minus 'Outro', types/subscriber.ts)
--
-- ON CONFLICT updates the descriptive columns only — `embedding` is
-- deliberately left out of the UPDATE SET so re-running this
-- migration (e.g. after editing copy) never wipes an already-seeded
-- embedding. Re-embed explicitly via seed-niches with { force: true }
-- after changing name/headline/description/keywords.
-- =====================================================

INSERT INTO niches (slug, name, headline, description, keywords, sort_order) VALUES
(
  'tech-startups',
  'Tech & Startups',
  'IA para Tech & Startups',
  'Inteligência artificial virou parte do dia a dia de quem constrói produtos digitais: da automação de tarefas repetitivas ao uso de copilots de código, passando por como startups estão levantando rodadas com IA no centro do pitch. Aqui você acompanha as notícias e vagas que mais importam para quem trabalha com tecnologia e produto.',
  ARRAY['startups', 'produto digital', 'engenharia de software', 'IA generativa', 'copilots', 'venture capital', 'SaaS', 'devtools'],
  1
),
(
  'marketing',
  'Marketing Digital',
  'IA para Marketing Digital',
  'De geração de criativos a automação de campanhas e personalização em escala, a inteligência artificial está mudando como times de marketing planejam, produzem e medem resultado. Reunimos as notícias e vagas de IA que ajudam profissionais de marketing a se manterem competitivos.',
  ARRAY['marketing digital', 'automação de marketing', 'geração de conteúdo', 'IA generativa', 'growth', 'performance', 'redes sociais', 'copywriting'],
  2
),
(
  'financas',
  'Finanças & Investimentos',
  'IA para Finanças & Investimentos',
  'Bancos, fintechs e investidores já usam inteligência artificial para análise de risco, detecção de fraude e recomendação de investimentos. Acompanhe as notícias e vagas de IA voltadas para quem trabalha ou se interessa pelo mercado financeiro brasileiro.',
  ARRAY['fintech', 'investimentos', 'análise de risco', 'detecção de fraude', 'mercado financeiro', 'open finance', 'trading algorítmico', 'bancos digitais'],
  3
),
(
  'saude',
  'Saúde & Bem-estar',
  'IA para Saúde & Bem-estar',
  'Diagnóstico assistido por imagem, triagem automatizada e novos medicamentos descobertos com ajuda de modelos de IA: a saúde é uma das áreas onde a inteligência artificial já salva tempo e vidas. Veja as notícias e vagas de IA voltadas para profissionais de saúde e bem-estar.',
  ARRAY['saúde digital', 'diagnóstico por imagem', 'telemedicina', 'healthtech', 'bem-estar', 'medicina', 'biotecnologia', 'triagem clínica'],
  4
),
(
  'educacao',
  'Educação',
  'IA para Educação',
  'Tutores virtuais, correção automática e trilhas de aprendizado personalizadas estão mudando como se ensina e se aprende. Reunimos notícias e vagas de IA para quem trabalha com educação, seja em escolas, edtechs ou plataformas de ensino online.',
  ARRAY['edtech', 'educação online', 'tutoria com IA', 'personalização de ensino', 'ensino a distância', 'avaliação automatizada', 'aprendizado adaptativo'],
  5
),
(
  'ecommerce',
  'E-commerce',
  'IA para E-commerce',
  'Recomendação de produtos, chatbots de atendimento e precificação dinâmica já são parte da operação de quem vende online. Acompanhe as notícias e vagas de IA que ajudam lojistas e times de e-commerce a vender mais e melhor.',
  ARRAY['e-commerce', 'varejo online', 'recomendação de produtos', 'chatbot de atendimento', 'precificação dinâmica', 'marketplace', 'logística', 'conversão'],
  6
),
(
  'criadores-de-conteudo',
  'Criadores de Conteúdo',
  'IA para Criadores de Conteúdo',
  'Edição de vídeo automatizada, geração de roteiros e ferramentas que aceleram a produção de conteúdo estão redesenhando o trabalho de criadores e produtores. Veja as notícias e vagas de IA voltadas para quem vive de criar conteúdo.',
  ARRAY['criação de conteúdo', 'edição de vídeo com IA', 'geração de imagem', 'redes sociais', 'produção audiovisual', 'roteirização', 'creator economy'],
  7
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- =====================================================
-- 5. RPC niche_news — ANN candidate search scoped to one niche
--
-- SECURITY DEFINER: anon has no grant on `niches` (see section 2), so
-- an invoker-rights function couldn't read niches.embedding to rank
-- against it. The function itself re-applies the same row filters
-- `news`'s own RLS policy already enforces (status = 'published' or
-- NULL) plus a 90-day recency window and NULL-embedding exclusion, so
-- SECURITY DEFINER here doesn't leak anything beyond what
-- "Public can read published news" (001_enable_rls_policies.sql)
-- already allows.
--
-- Returns empty automatically when the niche is unknown or its
-- embedding is still NULL: the inner JOIN + `ni.embedding IS NOT NULL`
-- filter yields zero rows in both cases.
-- =====================================================

CREATE OR REPLACE FUNCTION niche_news(
  niche_slug text,
  match_count int DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  subtitle text,
  cover_image text,
  category text,
  published_at timestamptz,
  author text,
  read_time text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT n.id, n.slug, n.title, n.subtitle, n.cover_image, n.category, n.published_at, n.author, n.read_time
  FROM news n
  JOIN niches ni ON ni.slug = niche_slug
  WHERE ni.embedding IS NOT NULL
    AND n.embedding IS NOT NULL
    AND (n.status = 'published' OR n.status IS NULL)
    AND n.published_at >= now() - interval '90 days'
  ORDER BY n.embedding <=> ni.embedding
  -- Clamp: anon can call this RPC directly via PostgREST; never allow a bulk dump
  LIMIT LEAST(GREATEST(COALESCE(match_count, 12), 1), 24);
$$;

REVOKE ALL ON FUNCTION niche_news(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION niche_news(text, int) TO anon, authenticated;

-- =====================================================
-- 6. RPC niche_jobs — ANN candidate search scoped to one niche
--
-- Same SECURITY DEFINER rationale as niche_news. Re-applies the
-- `status = 'active'` filter that "Public can read active jobs"
-- (001_enable_rls_policies.sql) already enforces for anon.
--
-- job_url is included even though it wasn't in the original column
-- list handed down for this task — the card component being reused
-- here (PreviewCards.tsx JobPreviewCard) needs it to build the
-- "Candidatar" apply link (utils/tracking.ts getJobApplicationUrl),
-- and it's already public data (same RLS-visible column anon reads
-- directly on /jobs).
-- =====================================================

CREATE OR REPLACE FUNCTION niche_jobs(
  niche_slug text,
  match_count int DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  job_id text,
  job_title text,
  company_name text,
  job_url text,
  logo_url text,
  location text,
  is_remote boolean,
  seniority_level text,
  posted_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.job_id, v.job_title, v.company_name, v.job_url, v.logo_url, v.location, v.is_remote, v.seniority_level, v.posted_at
  FROM vagas_ia v
  JOIN niches ni ON ni.slug = niche_slug
  WHERE ni.embedding IS NOT NULL
    AND v.embedding IS NOT NULL
    AND v.status = 'active'
  ORDER BY v.embedding <=> ni.embedding
  LIMIT LEAST(GREATEST(COALESCE(match_count, 12), 1), 24);
$$;

REVOKE ALL ON FUNCTION niche_jobs(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION niche_jobs(text, int) TO anon, authenticated;
