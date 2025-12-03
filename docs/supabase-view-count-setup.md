# View Count Setup para News/Posts

## SQL para adicionar coluna view_count

Execute no SQL Editor do Supabase:

```sql
-- Adicionar coluna view_count às tabelas news e posts
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Criar índice para ordenação por view_count
CREATE INDEX IF NOT EXISTS idx_news_view_count ON news(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
```

## RPC para incrementar view_count (opcional)

Se quiser usar uma função RPC para incrementar:

```sql
CREATE OR REPLACE FUNCTION increment_news_view(news_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE news
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_view(post_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Uso no Frontend

O hook `useTopNews` já busca as notícias ordenadas por `view_count` da última semana.

Para incrementar views quando um artigo é aberto, chame a função no componente de detalhe:

```typescript
import { supabase } from '@/lib/supabase';

// No useEffect do NewsDetailPage
useEffect(() => {
  const incrementView = async () => {
    await supabase.rpc('increment_post_view', { post_id: newsId });
  };
  incrementView();
}, [newsId]);
```
