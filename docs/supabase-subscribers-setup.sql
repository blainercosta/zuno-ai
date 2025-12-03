-- =====================================================
-- SUBSCRIBERS TABLE SETUP FOR SUPABASE
-- =====================================================
-- Tabela para salvar assinantes do Zuno AI (WhatsApp news)
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar enum para status do subscriber
DO $$ BEGIN
  CREATE TYPE subscriber_status AS ENUM ('pending', 'active', 'cancelled', 'paused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Criar a tabela de subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
  id BIGSERIAL PRIMARY KEY,

  -- Dados básicos
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  niche TEXT NOT NULL,

  -- Status e pagamento
  status subscriber_status NOT NULL DEFAULT 'pending',
  payment_confirmed_at TIMESTAMPTZ,

  -- Metadados
  source TEXT DEFAULT 'checkout', -- checkout, manual, import
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT whatsapp_min_length CHECK (LENGTH(REGEXP_REPLACE(whatsapp, '\D', '', 'g')) >= 10),
  CONSTRAINT name_min_length CHECK (LENGTH(TRIM(name)) >= 2),
  CONSTRAINT instagram_min_length CHECK (LENGTH(TRIM(instagram)) >= 2)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_whatsapp ON public.subscribers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_niche ON public.subscribers(niche);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- 4. Criar unique constraint para evitar duplicatas (email OU whatsapp)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unique_email ON public.subscribers(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unique_whatsapp
  ON public.subscribers(REGEXP_REPLACE(whatsapp, '\D', '', 'g'));

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER trigger_update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscribers_updated_at();

-- 7. Criar função para normalizar dados antes de inserir
CREATE OR REPLACE FUNCTION normalize_subscriber_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalizar email (lowercase, trim)
  NEW.email := LOWER(TRIM(NEW.email));

  -- Normalizar nome (trim)
  NEW.name := TRIM(NEW.name);

  -- Normalizar instagram (remove @ se presente, lowercase, trim)
  NEW.instagram := LOWER(TRIM(REPLACE(NEW.instagram, '@', '')));

  -- Normalizar whatsapp (mantém apenas números)
  -- Não remove completamente para manter formato original se desejado
  NEW.whatsapp := TRIM(NEW.whatsapp);

  -- Normalizar niche (trim)
  NEW.niche := TRIM(NEW.niche);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para normalização
DROP TRIGGER IF EXISTS trigger_normalize_subscriber ON public.subscribers;
CREATE TRIGGER trigger_normalize_subscriber
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION normalize_subscriber_data();

-- 9. Habilitar Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas de acesso (SEGURAS - apenas service_role pode inserir/ler)
-- Bloquear INSERT público (usa Edge Function com service_role)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.subscribers;
DROP POLICY IF EXISTS "Disable public insert" ON public.subscribers;
CREATE POLICY "Disable public insert"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (false);

-- Bloquear leitura pública (apenas admin via service_role)
DROP POLICY IF EXISTS "Disable public read" ON public.subscribers;
CREATE POLICY "Disable public read"
  ON public.subscribers
  FOR SELECT
  USING (false);

-- NOTA: A Edge Function 'subscribe' usa SUPABASE_SERVICE_ROLE_KEY
-- que bypassa o RLS, permitindo inserções seguras e validadas

-- 11. Lista de nichos válidos (referência)
COMMENT ON TABLE public.subscribers IS 'Assinantes do Zuno AI News. Nichos válidos: Tech & Startups, Marketing Digital, Finanças & Investimentos, Saúde & Bem-estar, Educação, E-commerce, Criadores de Conteúdo, Outro';

-- =====================================================
-- SETUP COMPLETO!
-- =====================================================
-- A tabela subscribers está pronta para uso
-- - Validação de email, whatsapp, nome e instagram
-- - Normalização automática de dados
-- - Índices únicos para email e whatsapp
-- - RLS: INSERT público, SELECT bloqueado
-- =====================================================

-- Exemplo de uso (para testar):
-- INSERT INTO public.subscribers (name, email, instagram, whatsapp, niche)
-- VALUES ('Teste User', 'teste@email.com', 'testeuser', '11999998888', 'Tech & Startups');
