-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA: Habilitar RLS e Criar Políticas
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Tabelas principais
ALTER TABLE IF EXISTS vagas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS beta_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS professionals ENABLE ROW LEVEL SECURITY;

-- Tabelas auxiliares/internas (apenas tabelas, não views)
-- NOTA: professionals_online, top_professionals e scrape_health são VIEWS
-- Views herdam a segurança das tabelas subjacentes automaticamente
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scrape_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news_metadata ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. REMOVER POLÍTICAS EXISTENTES (para evitar conflitos)
-- =====================================================

-- vagas_ia
DROP POLICY IF EXISTS "Public can read active jobs" ON vagas_ia;
DROP POLICY IF EXISTS "Block direct inserts on jobs" ON vagas_ia;
DROP POLICY IF EXISTS "Block direct updates on jobs" ON vagas_ia;
DROP POLICY IF EXISTS "Block direct deletes on jobs" ON vagas_ia;

-- news
DROP POLICY IF EXISTS "Public can read published news" ON news;
DROP POLICY IF EXISTS "Block news inserts" ON news;
DROP POLICY IF EXISTS "Block news updates" ON news;
DROP POLICY IF EXISTS "Block news deletes" ON news;

-- posts
DROP POLICY IF EXISTS "Public can read published posts" ON posts;
DROP POLICY IF EXISTS "Block posts inserts" ON posts;
DROP POLICY IF EXISTS "Block posts updates" ON posts;
DROP POLICY IF EXISTS "Block posts deletes" ON posts;

-- beta_waitlist
DROP POLICY IF EXISTS "Block public read on waitlist" ON beta_waitlist;
DROP POLICY IF EXISTS "Block waitlist updates" ON beta_waitlist;
DROP POLICY IF EXISTS "Block waitlist deletes" ON beta_waitlist;

-- professionals
DROP POLICY IF EXISTS "Public can read professionals" ON professionals;
DROP POLICY IF EXISTS "Block professional inserts" ON professionals;
DROP POLICY IF EXISTS "Block professional updates" ON professionals;
DROP POLICY IF EXISTS "Block professional deletes" ON professionals;

-- Tabelas internas (não inclui views como scrape_health)
DROP POLICY IF EXISTS "Block all on scrape_errors" ON scrape_errors;
DROP POLICY IF EXISTS "Block all on sources" ON sources;
DROP POLICY IF EXISTS "Block all on news_metadata" ON news_metadata;
DROP POLICY IF EXISTS "Block all on user_profiles" ON user_profiles;

-- =====================================================
-- 3. POLÍTICAS PARA vagas_ia (JOBS)
-- =====================================================

-- Permitir leitura apenas de vagas ativas
CREATE POLICY "Public can read active jobs"
ON vagas_ia FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Bloquear INSERT direto (usar Edge Function)
CREATE POLICY "Block direct inserts on jobs"
ON vagas_ia FOR INSERT
TO anon
WITH CHECK (false);

-- Bloquear UPDATE direto
CREATE POLICY "Block direct updates on jobs"
ON vagas_ia FOR UPDATE
TO anon
USING (false);

-- Bloquear DELETE direto
CREATE POLICY "Block direct deletes on jobs"
ON vagas_ia FOR DELETE
TO anon
USING (false);

-- =====================================================
-- 4. POLÍTICAS PARA news
-- =====================================================

-- Permitir leitura apenas de notícias publicadas
CREATE POLICY "Public can read published news"
ON news FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Bloquear todas as modificações
CREATE POLICY "Block news inserts"
ON news FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block news updates"
ON news FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block news deletes"
ON news FOR DELETE
TO anon
USING (false);

-- =====================================================
-- 5. POLÍTICAS PARA posts
-- =====================================================

-- Permitir leitura apenas de posts publicados
CREATE POLICY "Public can read published posts"
ON posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Bloquear todas as modificações
CREATE POLICY "Block posts inserts"
ON posts FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block posts updates"
ON posts FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block posts deletes"
ON posts FOR DELETE
TO anon
USING (false);

-- =====================================================
-- 6. POLÍTICAS PARA beta_waitlist
-- =====================================================

-- IMPORTANTE: Bloquear leitura pública (dados sensíveis!)
CREATE POLICY "Block public read on waitlist"
ON beta_waitlist FOR SELECT
TO anon
USING (false);

-- Bloquear UPDATE
CREATE POLICY "Block waitlist updates"
ON beta_waitlist FOR UPDATE
TO anon
USING (false);

-- Bloquear DELETE
CREATE POLICY "Block waitlist deletes"
ON beta_waitlist FOR DELETE
TO anon
USING (false);

-- NOTA: INSERT via Edge Function (service_role bypass RLS)

-- =====================================================
-- 7. POLÍTICAS PARA professionals
-- =====================================================

-- Permitir leitura pública
CREATE POLICY "Public can read professionals"
ON professionals FOR SELECT
TO anon, authenticated
USING (true);

-- Bloquear todas as modificações
CREATE POLICY "Block professional inserts"
ON professionals FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Block professional updates"
ON professionals FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Block professional deletes"
ON professionals FOR DELETE
TO anon
USING (false);

-- =====================================================
-- 8. TABELAS INTERNAS (BLOQUEAR TUDO PARA anon)
-- NOTA: Views (professionals_online, top_professionals, scrape_health)
-- não precisam de políticas próprias - herdam das tabelas base
-- =====================================================

-- scrape_errors
CREATE POLICY "Block all on scrape_errors"
ON scrape_errors FOR ALL
TO anon
USING (false);

-- sources
CREATE POLICY "Block all on sources"
ON sources FOR ALL
TO anon
USING (false);

-- news_metadata
CREATE POLICY "Block all on news_metadata"
ON news_metadata FOR ALL
TO anon
USING (false);

-- user_profiles
CREATE POLICY "Block all on user_profiles"
ON user_profiles FOR ALL
TO anon
USING (false);

-- =====================================================
-- 9. VERIFICAÇÃO
-- =====================================================

-- Execute esta query para verificar se RLS está habilitado:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
--
-- 1. Service Role Key (usada nas Edge Functions) SEMPRE bypassa RLS
-- 2. Anon Key respeita as políticas RLS definidas acima
-- 3. Para fazer INSERT em vagas_ia ou beta_waitlist, use as Edge Functions
-- 4. Nunca exponha a Service Role Key no frontend
--
-- =====================================================
