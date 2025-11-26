-- =====================================================
-- PROFESSIONALS TABLE SETUP FOR SUPABASE
-- =====================================================
-- Execute este SQL no Supabase SQL Editor
-- Vai criar a tabela, triggers, policies e dados de exemplo
-- =====================================================

-- 1. Criar a tabela de profissionais
CREATE TABLE IF NOT EXISTS public.professionals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
  badge TEXT,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  location TEXT,
  skills TEXT[],
  bio TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  email TEXT,
  phone TEXT,
  hourly_rate DECIMAL(10,2),
  availability TEXT,
  years_experience INTEGER,
  total_projects INTEGER NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_professionals_status ON public.professionals(status);
CREATE INDEX IF NOT EXISTS idx_professionals_rating ON public.professionals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_professionals_created_at ON public.professionals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professionals_slug ON public.professionals(slug);
CREATE INDEX IF NOT EXISTS idx_professionals_skills ON public.professionals USING GIN(skills);

-- 3. Criar função para gerar slug automaticamente
CREATE OR REPLACE FUNCTION generate_professional_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Gerar slug base a partir do nome
  base_slug := lower(regexp_replace(
    unaccent(NEW.name),
    '[^a-z0-9\s-]', '', 'gi'
  ));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  -- Adicionar ID ao slug
  final_slug := base_slug || '-' || NEW.id;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para gerar slug antes de inserir
DROP TRIGGER IF EXISTS trigger_generate_professional_slug ON public.professionals;
CREATE TRIGGER trigger_generate_professional_slug
  BEFORE INSERT ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION generate_professional_slug();

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_professionals_updated_at ON public.professionals;
CREATE TRIGGER trigger_update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- 8. Criar política para permitir leitura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON public.professionals;
CREATE POLICY "Enable read access for all users"
  ON public.professionals
  FOR SELECT
  USING (true);

-- 9. Inserir dados de exemplo (profissionais brasileiros de IA/ML)
INSERT INTO public.professionals (
  name, role, image_url, status, badge, rating, location, skills,
  bio, hourly_rate, availability, years_experience, total_projects, total_reviews
) VALUES
  (
    'Blainer Costa',
    'AI Explorer & Full Stack Developer',
    'https://avatars.githubusercontent.com/u/1234567?v=4',
    'online',
    'Novo',
    4.9,
    'São Paulo, BR',
    ARRAY['Machine Learning', 'Deep Learning', 'Python', 'React', 'TypeScript'],
    'Especialista em IA com foco em soluções práticas de ML. Apaixonado por criar produtos que resolvem problemas reais.',
    200.00,
    'Disponível para projetos',
    5,
    47,
    89
  ),
  (
    'Ana Silva',
    'ML Engineer',
    'https://i.pravatar.cc/400?img=5',
    'online',
    'Destaque',
    5.0,
    'Rio de Janeiro, BR',
    ARRAY['NLP', 'TensorFlow', 'PyTorch', 'Python', 'Data Science'],
    'Engenheira de ML com expertise em processamento de linguagem natural e chatbots inteligentes.',
    180.00,
    'Disponível',
    6,
    52,
    96
  ),
  (
    'Carlos Santos',
    'Data Scientist',
    'https://i.pravatar.cc/400?img=12',
    'offline',
    'Novo',
    4.8,
    'Belo Horizonte, BR',
    ARRAY['Data Science', 'Statistics', 'R', 'Python', 'SQL'],
    'Cientista de dados especializado em análise estatística e visualização de dados complexos.',
    150.00,
    'Parcialmente disponível',
    4,
    38,
    72
  ),
  (
    'Marina Lima',
    'AI Researcher',
    'https://i.pravatar.cc/400?img=9',
    'online',
    'Novo',
    5.0,
    'Brasília, BR',
    ARRAY['Research', 'Computer Vision', 'Papers', 'Deep Learning'],
    'Pesquisadora de IA com publicações em conferências internacionais. Especialista em visão computacional.',
    220.00,
    'Disponível para consultorias',
    7,
    29,
    64
  ),
  (
    'Pedro Oliveira',
    'MLOps Engineer',
    'https://i.pravatar.cc/400?img=15',
    'online',
    'Destaque',
    4.7,
    'Curitiba, BR',
    ARRAY['MLOps', 'Kubernetes', 'CI/CD', 'Docker', 'AWS'],
    'Especialista em deploy e monitoramento de modelos de ML em produção. DevOps + ML.',
    190.00,
    'Disponível',
    5,
    43,
    81
  ),
  (
    'Julia Ferreira',
    'Computer Vision Engineer',
    'https://i.pravatar.cc/400?img=16',
    'offline',
    'Novo',
    5.0,
    'Porto Alegre, BR',
    ARRAY['Computer Vision', 'OpenCV', 'YOLO', 'Deep Learning'],
    'Engenheira especializada em reconhecimento de imagens e detecção de objetos em tempo real.',
    175.00,
    'Disponível em breve',
    4,
    35,
    68
  ),
  (
    'Rafael Mendes',
    'AI Product Manager',
    'https://i.pravatar.cc/400?img=13',
    'online',
    'Destaque',
    4.9,
    'São Paulo, BR',
    ARRAY['Product', 'AI Strategy', 'Agile', 'Data-Driven'],
    'PM com experiência em produtos de IA. Ponte entre negócios e tecnologia.',
    210.00,
    'Disponível',
    8,
    62,
    118
  ),
  (
    'Beatriz Alves',
    'Deep Learning Engineer',
    'https://i.pravatar.cc/400?img=20',
    'online',
    'Novo',
    4.8,
    'Florianópolis, BR',
    ARRAY['Deep Learning', 'Neural Networks', 'PyTorch', 'Research'],
    'Especialista em redes neurais profundas e arquiteturas customizadas para problemas complexos.',
    195.00,
    'Disponível',
    5,
    41,
    77
  ),
  (
    'Lucas Rodrigues',
    'Data Engineer',
    'https://i.pravatar.cc/400?img=11',
    'offline',
    'Novo',
    4.6,
    'Recife, BR',
    ARRAY['Data Engineering', 'Spark', 'Airflow', 'Python', 'SQL'],
    'Engenheiro de dados com foco em pipelines de ML e infraestrutura de dados em larga escala.',
    165.00,
    'Parcialmente disponível',
    4,
    36,
    69
  ),
  (
    'Camila Souza',
    'NLP Specialist',
    'https://i.pravatar.cc/400?img=24',
    'online',
    'Destaque',
    5.0,
    'Salvador, BR',
    ARRAY['NLP', 'Transformers', 'BERT', 'GPT', 'Python'],
    'Especialista em processamento de linguagem natural. Experiência com modelos de linguagem grandes.',
    205.00,
    'Disponível para projetos',
    6,
    48,
    92
  ),
  (
    'Fernando Costa',
    'AI Solutions Architect',
    'https://i.pravatar.cc/400?img=14',
    'online',
    'Destaque',
    4.9,
    'São Paulo, BR',
    ARRAY['Architecture', 'Cloud', 'ML', 'System Design'],
    'Arquiteto de soluções de IA com experiência em projetos enterprise de larga escala.',
    230.00,
    'Disponível',
    9,
    71,
    134
  ),
  (
    'Isabela Martins',
    'Robotics & AI Engineer',
    'https://i.pravatar.cc/400?img=25',
    'offline',
    'Novo',
    4.7,
    'Campinas, BR',
    ARRAY['Robotics', 'Computer Vision', 'ROS', 'Python', 'C++'],
    'Engenheira de robótica com foco em IA aplicada a sistemas autônomos.',
    185.00,
    'Disponível em breve',
    5,
    32,
    61
  );

-- 10. Verificar dados inseridos
SELECT
  id,
  name,
  role,
  status,
  badge,
  rating,
  slug,
  created_at
FROM public.professionals
ORDER BY rating DESC, created_at DESC;

-- =====================================================
-- SETUP COMPLETO!
-- =====================================================
-- Agora você pode:
-- 1. Fazer queries na tabela professionals
-- 2. Os slugs são gerados automaticamente
-- 3. RLS está ativo (leitura pública permitida)
-- 4. Índices criados para performance
-- =====================================================
