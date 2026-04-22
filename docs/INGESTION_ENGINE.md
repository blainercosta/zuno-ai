# Ingestion Engine — Spec de Internalização

> ## ⚠️ SUPERSEDED — Referência histórica
>
> Este doc descrevia a reconstrução interna do motor de ingestão no próprio Zuno.
> **Essa abordagem foi abandonada.** O motor virou produto standalone: **Kubo**
> (`https://hiwzscnqisuweqbwvcpp.supabase.co/functions/v1`).
>
> O Zuno agora é **cliente do Kubo**. Integração via webhook em
> [api/kubo-ingest.ts](../api/kubo-ingest.ts). Contrato da API documentado na
> conversa que cadastrou o delivery.
>
> Mantenha este doc para entender a lógica original (prompts, validações, quality
> score) se algum dia precisar operar algo parecido internamente.
>
> ---

> **Status:** v0.1 — spec (histórica)
> **Autor:** PM + DEV (orquestrador)
> **Contexto:** o motor de ingestão (scrape + reescrita de notícias; scrape + publicação de vagas) rodava 100% em n8n com Claude, Firecrawl, OpenAI e Supabase. O n8n foi perdido sem export. Este doc era o blueprint para reconstruir internamente usando a stack atual (Supabase + Vercel) sem serviços de workflow externos.
>
> **Fontes desta spec:**
> - Documentação técnica recuperada do workflow `Zuno News V3` (fornecida pelo usuário, ver §10)
> - Inspeção do repo atual (`supabase/migrations/001_enable_rls_policies.sql`, tabelas existentes `sources`, `news_metadata`, `scrape_errors`, `scrape_health` view)
> - Secrets do repo (`OPENAI_API_KEY` já configurado para similar-jobs)

---

## 1. Objetivo

Reconstruir o pipeline de **notícias** end-to-end, interno ao projeto, sem depender de n8n:

**Pipeline News:** descobrir URLs em fontes cadastradas → scrapear artigos → filtrar/validar → pré-classificar relevância (cheap) → reescrever com Claude → gerar embedding → publicar em `news`.

**Jobs está fora do escopo nesta fase** — o scraper antigo era LinkedIn-only e será retomado em projeto separado. §5 parkado.

Critérios de sucesso:
1. Pipeline roda sozinho em cron, sem orquestrador externo.
2. Falhas logadas em `scrape_errors` e reprocessáveis.
3. Custo operacional ≤ $15/mês para o volume atual (~6 artigos novos/2h), com otimizações de token (prompt caching + pre-filter + dedupe semântico).
4. Performance: discover < 2min por execução; process < 30s por artigo (p90).
5. Qualidade: ≥ 80% dos artigos que entram na fila saem com `status='published'` (`quality_score ≥ 60`). Resto vai para `review` — humano decide.
6. Código versionado no repo — um engenheiro novo entende o fluxo em < 30min lendo este doc + `supabase/functions/`.
7. Observabilidade: dashboard mínimo mostra sucessos/falhas/quality por fonte.

---

## 2. Decisão de arquitetura

### 2.1 Opções avaliadas

| Opção | Prós | Contras | Veredito |
|-------|------|---------|----------|
| **Supabase Edge Functions (Deno) + `pg_cron` + fila no Postgres** | Mesma stack, zero infra nova, secrets centralizados, queue natural via Postgres. **`pg_cron` + `pg_net` disponíveis no Free tier** (confirmado) | Edge wall time 150s — exige dividir em fases | **✓ Escolhida** |
| Vercel Cron + Serverless | Já há deploy Vercel | Timeout 10s free / 300s Pro, sem state, precisa bolt-on de queue | ✗ Timeout incompatível com Claude 90s + chain |
| Inngest / Trigger.dev | DX ótima, retry/queue built-in | Serviço externo pago, vendor lock-in, duplica orquestrador que acabou de ser removido | ✗ Traz de volta o problema que queremos resolver |
| Worker Node dedicado (Fly.io/Railway) | Máximo controle | Ops overhead, custo fixo, reinventa queue | ✗ Over-engineering para o volume |

### 2.2 Arquitetura escolhida — duas fases + fila

```
┌─────────────────────────────────────────────────────────────────────┐
│                         pg_cron (Postgres)                          │
│                                                                     │
│   every 2h ──► SELECT net.http_post('ingest-news-discover')        │
│   every 5m ──► SELECT net.http_post('ingest-news-process')         │
│   every 2h ──► SELECT net.http_post('ingest-jobs-discover')        │
│   every 5m ──► SELECT net.http_post('ingest-jobs-process')         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Supabase Edge Functions (Deno)                                     │
│                                                                     │
│  ingest-news-discover                                               │
│   1. SELECT * FROM sources WHERE active = true AND kind='news'      │
│   2. Firecrawl listing → extract URLs (regex filters)              │
│   3. Dedupe vs news.url (últimos 7d)                                │
│   4. Firecrawl article por URL                                      │
│   5. Valida (min chars/words, idade, not-blocked, not-category)    │
│   6. INSERT em news_ingestion_queue (status='pending')              │
│                                                                     │
│  ingest-news-process (batch=3)                                      │
│   1. SELECT ... WHERE status='pending' ORDER BY created_at LIMIT 3 │
│   2. UPDATE status='processing'                                     │
│   3. Para cada:                                                     │
│      - Extract media do markdown                                    │
│      - Claude rewrite (Haiku 4.5)                                   │
│      - Validate + quality score                                     │
│      - OpenAI embedding (text-embedding-3-small)                    │
│      - Upsert news                                                  │
│   4. UPDATE status='published'|'review'|'failed'                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Por quê 2 fases:**
- **Discover** é I/O intenso (scrape paralelo) mas CPU barata — cabe em 1 execução de 2h em 2min.
- **Process** é CPU/LLM-caro por item (Claude 90s + embed) — 3 itens/batch = ~3min/run cabe tranquilo nos 150s do Edge.
- Falha num item não derruba o lote: fica em `failed` e dá pra reprocessar.
- Observabilidade: vejo no banco o que tá `pending`, `processing`, `failed` sem abrir logs.

### 2.3 Secrets necessários

Configurar em Supabase Edge Function secrets (`supabase secrets set`):

| Secret | Uso | Fonte |
|--------|-----|-------|
| `FIRECRAWL_API_KEY` | Scrape de listing + artigo | firecrawl.dev |
| `ANTHROPIC_API_KEY` | Claude Haiku rewrite | console.anthropic.com |
| `OPENAI_API_KEY` | Embeddings (já existe) | platform.openai.com |
| `SUPABASE_SERVICE_ROLE_KEY` | Upsert e queue mgmt (padrão Supabase) | já existe |

---

## 3. Schema de banco

### 3.1 Ajustes em tabelas existentes

**`sources`** — adicionar colunas:

```sql
ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'news'
    CHECK (kind IN ('news', 'jobs')),
  ADD COLUMN IF NOT EXISTS last_discovered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fail_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_sources_active_kind
  ON sources (kind, active) WHERE active = true;
```

`config` guarda settings específicos (seletores CSS alternativos, headers extras, limite por fonte, etc) sem precisar de migration por fonte nova.

### 3.2 Tabelas novas

**`news_ingestion_queue`** — fila de artigos descobertos e em reescrita:

```sql
CREATE TABLE news_ingestion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  source_name TEXT,
  source_language TEXT DEFAULT 'en',
  original_title TEXT,
  original_author TEXT,
  original_publish_date TIMESTAMPTZ,
  raw_content TEXT,             -- markdown truncado (< 8k)
  word_count INT,
  cover_image TEXT,
  extracted_media JSONB,        -- { images, videos, tweets, cover }
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','published','review','failed','skipped')),
  status_reason TEXT,           -- motivo de skip/fail
  attempts INT NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,       -- lock ótimo para evitar race
  processed_at TIMESTAMPTZ,
  news_id UUID,                 -- preenchido após upsert final
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_pending ON news_ingestion_queue (created_at)
  WHERE status = 'pending';

CREATE INDEX idx_queue_status ON news_ingestion_queue (status, created_at);

-- RLS: bloqueado para anon (padrão do projeto)
ALTER TABLE news_ingestion_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Block all on news_ingestion_queue"
  ON news_ingestion_queue FOR ALL TO anon USING (false);
```

*(Jobs queue descopada nesta fase — ver §5.)*

### 3.3 Views / health

Aproveitar `scrape_health` (já existe como view) ou recriar:

```sql
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
    SELECT COUNT(*) FROM news
    WHERE source_id = s.id AND published_at > NOW() - INTERVAL '24 hours'
  ) AS published_24h;
```

---

## 4. Pipeline A — News (detalhado)

### 4.1 Node 1 · Discover (Edge Function `ingest-news-discover`)

**Trigger:** `pg_cron` a cada 2h.

**Pseudocódigo:**

```ts
// supabase/functions/ingest-news-discover/index.ts
const { data: sources } = await supabase
  .from('sources')
  .select('*')
  .eq('kind', 'news')
  .eq('active', true);

for (const source of sources) {
  try {
    const listing = await firecrawl.scrape(source.url, { formats: ['markdown'] });
    const urls = extractArticleUrls(listing.markdown, source.url); // aplica regex filters
    const candidates = urls.slice(0, 6); // cap por fonte

    const { data: recent } = await supabase
      .from('news')
      .select('url')
      .eq('source_id', source.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3600e3).toISOString());

    const existingUrls = new Set(recent.map(r => r.url));
    const newUrls = candidates.filter(c => !existingUrls.has(c.url));

    for (const candidate of newUrls) {
      const article = await firecrawl.scrape(candidate.url, {
        formats: ['markdown'],
        timeout: 45000,
      });
      const validation = validateArticle(article); // §4.1.2
      if (!validation.ok) {
        await logSkip(candidate, validation.reason);
        continue;
      }

      await supabase.from('news_ingestion_queue').insert({
        url: candidate.url,
        content_hash: md5(candidate.url),
        source_id: source.id,
        source_name: source.name,
        source_language: validation.language,
        original_title: validation.title,
        original_author: validation.author,
        original_publish_date: validation.publishedAt,
        raw_content: validation.content,
        word_count: validation.wordCount,
        cover_image: validation.coverImage,
        extracted_media: extractMedia(validation.content),
        status: 'pending',
      });
    }

    await supabase.from('sources')
      .update({ last_discovered_at: new Date(), fail_count: 0 })
      .eq('id', source.id);
  } catch (e) {
    await supabase.from('scrape_errors').insert({
      source_id: source.id,
      error: String(e),
      payload: { stage: 'discover' },
    });
    await supabase.from('sources')
      .update({ fail_count: source.fail_count + 1 })
      .eq('id', source.id);
  }
}
```

#### 4.1.1 Regex de extração de URLs (do doc original)

```ts
const EXCLUDE_PATTERNS = [
  /\/(tag|category|author|page|about|contact|privacy|terms|login|signup|newsletter|subscribe|feed|rss|sitemap|search|archive|wp-content|wp-admin)/i,
  /\.(jpg|jpeg|png|gif|webp|svg|pdf|mp4|mp3|css|js|xml|json)(\?|$)/i,
  /[#?].*utm_/i,
  /\/\d{4}\/\d{2}\/?$/,
  /\/(es|fr|de|it|ja|ko|zh)\//i,
];
```

- Extrai `[título](url)` do markdown.
- Mantém apenas URLs do mesmo domínio da fonte.
- Máximo 6 por fonte/execução.

#### 4.1.2 Validação de artigo

Reject se:
- `content.length < 500`
- `words < 100`
- `age > 168h` (7 dias)
- markdown bate com `CATEGORY_PAGE_PATTERNS` (lista abaixo)
- markdown bate com `CLOUDFLARE_BLOCKED_PATTERNS`

```ts
const CATEGORY_PAGE_PATTERNS = [
  /^#\s*(Research|Developer tools|News|Blog|Articles|Category)/i,
  /^#\s*[A-Z][a-z]+\s*$/m,
  /All the Latest/i,
  /## All the Latest/i,
  /Let's stay in touch\. Get the latest/i,
];

const CLOUDFLARE_BLOCKED_PATTERNS = [
  'Checking your Browser',
  'Verifying...',
  'challenges.cloudflare.com',
  'Just a moment...',
  'Please wait while we verify',
  'Enable JavaScript and cookies',
];
```

Extrair metadados:
- Título: `og:title` → `title` HTML → título descoberto no link
- Autor: `author` → `article-author` → `twitter:data1`
- Data: `publishedTime` → `article:published_time` → `datePublished`
- Cover: `og:image` → primeira imagem do markdown
- Idioma: heurística — contar palavras PT vs EN ≥ 60% = PT

**Truncamento inteligente** se `content.length > 8000`:
- 40% inicial
- 10 linhas com dados numéricos do meio (regex `/\d/`)
- 30% final

### 4.2 Node 2 · Process (Edge Function `ingest-news-process`)

**Trigger:** `pg_cron` a cada 5min, batch=3.

**Lock ótimo** para não reprocessar em paralelo:

```sql
UPDATE news_ingestion_queue
SET status = 'processing', claimed_at = NOW(), attempts = attempts + 1
WHERE id IN (
  SELECT id FROM news_ingestion_queue
  WHERE status = 'pending'
    AND (attempts < 3)
  ORDER BY created_at
  LIMIT 3
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

Para cada item:

1. **Claude Rewrite** — system prompt verbatim do n8n (§4.2.1), user prompt injeta `rawContent` + media extraída + `_context`. Modelo: `claude-haiku-4-5-20251001`, `max_tokens=4096`, timeout 90s, retry 2x (5s delay).
2. **Merge context** — extrai `_context` do JSON retornado; fallback para `_contextData` preservado localmente (ver §4.2.2, bug conhecido).
3. **Validate** — `content` array ≥ 5 blocos, `title` não vazio, `wordCount(blocks) ≥ 200`, `category ∈ VALID_CATEGORIES`.
4. **Quality score** (§4.2.3).
5. **Slug** — `slugify(title)` normalizado, max 80 chars.
6. **Embedding text** — `title + '\n' + subtitle + '\n' + primeiros 2 paragraphs`, max 2000 chars.
7. **OpenAI embedding** — `text-embedding-3-small`.
8. **Upsert em `news`** — status `'published'` se quality ≥ 60, senão `'review'`.
9. **Update queue** — `status='published'|'review'|'failed'`, `news_id`, `processed_at`.

#### 4.2.1 System prompt do Claude (verbatim)

```
Você é editor-chefe do Zuno, publicação brasileira de tech/AI para profissionais. Seu público já entende o básico.

## VOZ E TOM
- Técnica mas acessível
- Questiona hype, valoriza substância
- Contextualiza impacto no mercado brasileiro quando relevante
- Sem floreios, direto ao ponto

## PROIBIDO
- Palavras: 'revolucionário', 'game-changer', 'disruptivo', 'inovador', 'transformador'
- Introduções genéricas: 'No mundo de hoje...', 'Com o avanço da tecnologia...'
- Conclusões vazias: 'resta ver', 'o tempo dirá', 'será interessante acompanhar'
- Repetir informações

## ESTRUTURA OBRIGATÓRIA (8-12 blocos)

1. Gancho (1 paragraph): Fato mais impactante primeiro
2. Contexto (1 paragraph): O 'por que agora'
3. Mídia Principal (image ou video): OBRIGATÓRIO após os 2 primeiros parágrafos
4. Detalhes Técnicos (heading level 2 + 2-3 paragraphs)
5. Mídia Secundária (image, video ou tweet): Se disponível
6. Crítica/Limitações (heading level 2 + 1-2 paragraphs): OBRIGATÓRIO
7. Implicação Prática (1 paragraph)

## BLOCOS DISPONÍVEIS

{"type": "paragraph", "text": "string"}
{"type": "heading", "text": "string", "level": 2|3}
{"type": "image", "url": "string", "caption": "string"}
{"type": "video", "platform": "youtube|vimeo", "id": "string", "caption": "string|null"}
{"type": "tweet", "id": "string"}
{"type": "quote", "text": "string", "source": "string|null"}
{"type": "list", "items": ["string"], "ordered": boolean}
{"type": "callout", "text": "string", "style": "info|warning|insight"}

## USO DE MÍDIA

- OBRIGATÓRIO: usar pelo menos 2 elementos de mídia
- Prioridade: vídeos > imagens > tweets
- Caption sempre descritiva
- Posicione mídia após parágrafos introdutórios

## CATEGORIAS

OpenAI | Google | Anthropic | xAI | Meta | Microsoft | Mistral | Amazon | Apple | Nvidia | Texto | Imagem | Video | Audio | Codigo | Agentes | Robotica | Mercado | Ferramentas | Tutoriais | Regulacao | Pesquisa

## OUTPUT

APENAS JSON válido, sem markdown. Inclua _context copiado:

{"title": "string", "subtitle": "string", "content": [...], "category": "string", "key_takeaway": "string", "_context": {COPIE O OBJETO _context FORNECIDO}}
```

#### 4.2.2 User prompt template

```ts
const userPrompt = `
ARTIGO PARA REESCREVER

Título: ${item.original_title}
Fonte: ${item.source_name}

---

MÍDIA EXTRAÍDA (USE OBRIGATORIAMENTE):

IMAGENS:
${media.images.join('\n')}

VÍDEOS:
${JSON.stringify(media.videos)}

TWEETS:
${JSON.stringify(media.tweets)}

COVER: ${media.cover}

---

_context (COPIE EXATAMENTE NO OUTPUT):
${JSON.stringify(contextData)}

---

CONTEÚDO:
${item.raw_content}
`;
```

**Nota — bug corrigido em relação ao n8n original:** aqui NÃO usamos `.first()` global. O `contextData` vem do próprio item do loop, então o bug de "Merge Context pega item errado" do n8n original não existe mais. Ainda assim, validamos pós-resposta: se Claude não devolveu `_context`, usamos o `contextData` local como fallback.

#### 4.2.3 Quality score (0–100)

```ts
function qualityScore(article, blocks): number {
  let score = 50;
  const wc = wordCount(blocks);

  if (wc >= 400 && wc <= 700) score += 25;
  else if (wc >= 250) score += 15;

  if (blocks.some(b => b.type === 'image')) score += 15;
  if (blocks.some(b => b.type === 'video')) score += 15;
  if (blocks.some(b => b.type === 'tweet')) score += 10;

  const companyCats = ['OpenAI','Google','Anthropic','xAI','Meta','Microsoft','Mistral','Amazon','Apple','Nvidia'];
  const techCats = ['Texto','Imagem','Video','Audio','Codigo','Agentes','Robotica','Multimodal'];
  if (companyCats.includes(article.category)) score += 20;
  else if (techCats.includes(article.category)) score += 10;

  const hasHeading = blocks.some(b => b.type === 'heading');
  const hasParagraph = blocks.some(b => b.type === 'paragraph');
  if (hasHeading && hasParagraph) score += 10;

  if (blocks.some(b => b.type === 'quote')) score += 10;
  if (blocks.some(b => b.type === 'callout')) score += 10;
  if (blocks.some(b => b.type === 'list')) score += 5;

  // Análise crítica: heading com palavras-gatilho
  const critical = blocks.some(b =>
    b.type === 'heading' &&
    /crítica|limitaç|problema|desafio/i.test(b.text)
  );
  if (critical) score += 10;

  if (article.key_takeaway?.length > 20) score += 5;

  return Math.min(100, Math.max(0, score));
}
```

`published` se `>= 60`, senão `review` (não aparece no feed público; admin decide).

#### 4.2.4 Slug

```ts
function slug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
```

Em conflito (mesmo slug), sufixo `-{shortHash(url)}`.

### 4.3 Otimizações — performance, qualidade e tokens

Três vetores de otimização, ordenados por impacto/esforço:

#### 4.3.1 Prompt caching do Anthropic (economia de tokens)

O system prompt (§4.2.1) tem ~1500 tokens e é idêntico em toda chamada. Ativar `cache_control` corta input cost em 10x após o primeiro hit dentro da janela de 5min. Como o `process` roda a cada 5min, praticamente toda chamada aproveita o cache.

```ts
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 4096,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,                     // ~1500 tokens, fixo
      cache_control: { type: 'ephemeral' },    // cache de 5min
    },
  ],
  messages: [{ role: 'user', content: userPrompt }],
});
```

**Impacto:** ~7% de economia por chamada em regime, mais resiliência se o system prompt crescer.

#### 4.3.2 Pre-filter cheap (qualidade + tokens)

Antes da reescrita cara, classificar relevância com uma chamada Haiku de ~300 tokens in / 10 out. Descarta promocional, rehash e off-topic sem gastar na reescrita.

```ts
const RELEVANCE_PROMPT = `Você classifica relevância de notícias tech/AI para profissionais brasileiros.
Responda APENAS com um número 0-10.

Critérios:
+ importância para o mercado (empresas big tech, modelos novos, regulação)
+ novidade real vs rehash de notícia velha
+ ângulo técnico/prático com impacto
- promocional, patrocinado, "how to subscribe"
- opinativo sem substância`;

const pre = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 10,
  system: [{ type: 'text', text: RELEVANCE_PROMPT, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: `Título: ${item.original_title}\nPrimeiros 800 chars:\n${item.raw_content.slice(0, 800)}` }],
});
const score = parseInt(pre.content[0].text.trim()) || 0;

if (score < 6) {
  await supabase.from('news_ingestion_queue')
    .update({ status: 'skipped', status_reason: `low_relevance_${score}` })
    .eq('id', item.id);
  continue;
}
```

**Custo do filtro:** ~$0.001/artigo. **Economia por skip:** ~$0.013. Se 30% dos artigos são descartados, economia líquida ≈ 28% do budget total. Além disso, sobra mais ar para tomar decisões editoriais melhores via ajuste do threshold (hoje 6, ajustável via env).

#### 4.3.3 Dedupe semântico (qualidade)

URL-based dedupe captura a mesma matéria de 3 fontes diferentes? Não. Embedding-based sim.

Antes de chamar Claude para reescrever, checar se artigo semanticamente equivalente já foi publicado nas últimas 48h:

```ts
// Gerar embedding barato do título + primeiros 500 chars
const quickEmbedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: item.original_title + '\n' + item.raw_content.slice(0, 500),
});

// Buscar similar no banco (pgvector)
const { data: similar } = await supabase.rpc('find_similar_news', {
  query_embedding: quickEmbedding.data[0].embedding,
  threshold: 0.92,
  hours_window: 48,
});

if (similar?.length) {
  await supabase.from('news_ingestion_queue')
    .update({ status: 'skipped', status_reason: `semantic_duplicate_of_${similar[0].id}` })
    .eq('id', item.id);
  continue;
}
```

RPC function:

```sql
CREATE OR REPLACE FUNCTION find_similar_news(
  query_embedding vector,
  threshold float,
  hours_window int
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT id, 1 - (embedding <=> query_embedding) AS similarity
  FROM news
  WHERE published_at > NOW() - (hours_window || ' hours')::interval
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > threshold
  ORDER BY embedding <=> query_embedding
  LIMIT 1;
$$;
```

**Custo adicional:** 1 embedding barato ($0.00002/artigo). **Benefício:** mata republicação de mesma notícia de 3 fontes + melhora signal/noise do feed.

#### 4.3.4 Paralelismo no discover (performance)

Scrape de artigos em paralelo respeitando rate limit do Firecrawl. Implementação via `p-limit` (Deno) ou manual:

```ts
async function parallelMap<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...await Promise.all(batch.map(fn)));
  }
  return results;
}

const articles = await parallelMap(newUrls, 4, url =>
  firecrawl.scrape(url, { formats: ['markdown'], timeout: 45000 })
);
```

Concorrência 4 = ~12s para scrape de 6 artigos vs ~75s sequencial.

#### 4.3.5 Truncamento mais agressivo (tokens)

Cap atual do n8n era 8000 chars. Baixar para **6000 chars** corta ~25% do input sem perder qualidade — a estrutura de 40%/10 linhas numéricas/30% continua, só com janelas menores.

```ts
const MAX_CONTENT = 6000;
if (content.length > MAX_CONTENT) {
  const head = content.slice(0, MAX_CONTENT * 0.4);
  const numericLines = content.split('\n').filter(l => /\d/.test(l)).slice(0, 10).join('\n');
  const tail = content.slice(-MAX_CONTENT * 0.3);
  content = `${head}\n\n[...]\n\n${numericLines}\n\n[...]\n\n${tail}`;
}
```

#### 4.3.6 Ordem recomendada no `process`

```
1. Claim pending items                 (postgres, free)
2. Truncate content                    (local, free)
3. Semantic dedupe                     (1 embed ~ $0.00002)
4. Pre-filter relevância               (Haiku ~ $0.001, skip 30%)
5. Extract media                       (local, free)
6. Claude rewrite                      (Haiku ~ $0.013 com cache)
7. Quality score                       (local, free)
8. Embedding final                     (OpenAI ~ $0.0001)
9. Upsert news                         (postgres, free)
10. Update queue status                (postgres, free)
```

Ordem importa: dedupe e pre-filter são **antes** da reescrita cara.

### 4.4 Categorias válidas (atualizadas)

Lista final (merge com a do doc original + espaço para extensão via config):

```
OpenAI, Google, Anthropic, xAI, Meta, Microsoft, Mistral, Amazon, Apple, Nvidia,
Runway, Stability, Midjourney, Adobe, Salesforce,
Texto, Imagem, Video, Audio, Codigo, Agentes, Robotica, Multimodal,
Mercado, Ferramentas, Tutoriais, Regulacao, Pesquisa, Hardware
```

### 4.5 Erros e retry

- Falha de Firecrawl: `attempts++`, volta para `pending`. Após 3 tentativas → `failed`.
- Falha de Claude (timeout, JSON inválido): `failed` com `status_reason`.
- Quality < 60: status `review` (não é falha, é curadoria).
- Duplicado por `content_hash` em outra fonte: `skipped`.

### 4.6 Cron via `pg_cron`

```sql
-- Habilitar extensões (uma vez)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Discover a cada 2h
SELECT cron.schedule(
  'ingest-news-discover',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/ingest-news-discover',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_token')
    )
  );
  $$
);

-- Process a cada 5min
SELECT cron.schedule(
  'ingest-news-process',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/ingest-news-process',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_token')
    )
  );
  $$
);
```

`app.cron_token` é um token dedicado guardado em `ALTER DATABASE` settings — Edge Function valida antes de executar.

---

## 5. Pipeline Jobs — descopado

Fora do escopo desta fase. O scraper antigo (LinkedIn-only, perdido junto com o resto do n8n) será retomado num ciclo separado. Tabela `vagas_ia` segue sendo populada só via `/post-job` manual até lá.

---

## 6. Admin & observabilidade

Não precisa ser bonito; precisa existir.

### 6.1 Painel simples (fase 1)

Rota `/admin/ingestion` (protegida por senha ou magic link restrito por email):
- Tabela `ingestion_health` (sources + contadores 24h)
- Tabela `news_ingestion_queue` com filtro por `status` — permitir retry/reject de items em `review` e `failed`
- Ações: pausar fonte (`UPDATE sources SET active=false`), forçar discover, reprocessar item.

### 6.2 Logs

- Edge Functions logam em `scrape_errors` com `{stage, source_id, queue_id, error, payload}`.
- `console.error` para Supabase Logs também.
- Quando tiver Sentry (PRD P01), plugar aqui.

### 6.3 Alertas

- Se nenhuma fonte teve `last_success_at` nas últimas 6h → notificar (webhook Discord/Slack, ou e-mail via Resend).
- Se `failures_24h > 5` numa fonte → mesmo canal.
- MVP: função cron separada que envia webhook simples.

---

## 7. Roadmap de implementação

Stories atômicas, priorizadas. Cada uma vira PR pequeno.

### Sprint 1 — Infra + News Discover

- [ ] **S1.1** — Migrations: `ALTER TABLE sources` + `CREATE TABLE news_ingestion_queue` + view `ingestion_health` + RPC `find_similar_news` (RLS padrão).
- [ ] **S1.2** — Seed inicial de `sources`: Testing Catalog, Google Blog (TechCrunch `active=false` com nota).
- [ ] **S1.3** — Edge Function `ingest-news-discover` com Firecrawl + extract + validate + insert na queue. **Inclui paralelismo (§4.3.4) e truncamento 6k (§4.3.5).**
- [ ] **S1.4** — Setup `pg_cron` + `pg_net` + cron job 2h.
- [ ] **S1.5** — Testes manuais: `curl` para a função, inspecionar queue, confirmar dedupe por URL.

### Sprint 2 — News Process (rewrite + publish) com otimizações desde o dia 1

- [ ] **S2.1** — Módulo compartilhado `supabase/functions/_shared/`: claude client (**com prompt caching §4.3.1**), openai client, quality score, slug, media extractor, parallel util.
- [ ] **S2.2** — Edge Function `ingest-news-process` com lock ótimo + **dedupe semântico §4.3.3** + **pre-filter §4.3.2** + Claude rewrite + embedding final + upsert. Ordem do §4.3.6.
- [ ] **S2.3** — Cron 5min.
- [ ] **S2.4** — Testes E2E: inserir 3 itens fake (1 bom, 1 rehash, 1 promocional), rodar manual, verificar: 1 published, 1 skipped como semantic_duplicate, 1 skipped como low_relevance.
- [ ] **S2.5** — Dry-run real em 1 fonte ativa; medir custo por artigo e tempo p90.

### Sprint 3 — Admin mínimo + alertas

- [ ] **S3.1** — Rota `/admin/ingestion` (auth gate: email whitelist via env até termos auth real).
- [ ] **S3.2** — View de queue com retry/reject de items em `review` e `failed`; tuning do threshold de relevância via form.
- [ ] **S3.3** — Alerta Discord/Slack para `last_success_at` > 6h e failures > 5/24h.

### Sprint 4 — Polimento

- [ ] **S4.1** — Retry inteligente (backoff exponencial por tipo de erro).
- [ ] **S4.2** — Bypass Cloudflare para TechCrunch (Browserless/ScrapingBee) — reativa fonte.
- [ ] **S4.3** — Dashboard de quality score médio por fonte; alert se fonte cai abaixo de threshold.
- [ ] **S4.4** — Expandir fontes (The Verge, Ars Technica, Hacker News top AI, etc).

---

## 8. Custos estimados (com otimizações)

Baseline: 6 artigos descobertos/run × 12 runs/dia × 30 dias = **2160 artigos/mês atacados** (pré-filtros).

Aplicando skips:
- ~15% descartados por dedupe semântico (§4.3.3)
- ~30% descartados por pre-filter de relevância (§4.3.2)
- Efetivamente reescritos: ~1280/mês

| Serviço | Cálculo | Custo/mês |
|---------|---------|-----------|
| Firecrawl (listings + articles) | ~1100 scrapes, plano pago já ativo | incluso no plano |
| Embeddings de dedupe | 2160 × $0.00002 | $0.04 |
| Haiku pre-filter | 2160 × ~$0.001 | $2.16 |
| Claude Haiku rewrite (com prompt cache) | 1280 × ~$0.013 | $16.64 |
| OpenAI embedding final | 1280 × $0.0001 | $0.13 |
| Supabase Free (Edge Functions) | 300/dia × 30 = 9k invocações (limite 500k) | $0 |
| Supabase Free (pg_cron, pg_net) | disponíveis no Free | $0 |
| **Total** | | **~$19/mês** |

**Sem otimizações** (baseline do n8n): 2160 × $0.014 = $30/mês. **Ganho: ~37%.**

**Alavancas se precisar economizar mais:**
- Baixar threshold de relevância de 6 para 7 → mais skips, custo ↓ 15%
- Reduzir frequência de discover para 4h → runs/mês ↓ 50%
- Truncar para 4k chars em vez de 6k → input tokens ↓ ~33%

---

## 9. Perguntas abertas ao usuário

Não-bloqueadores mas úteis antes de começar Sprint 1:

- Qual o `<project-ref>` do Supabase para preencher os URLs do cron?
- Fontes seed inicial: manter Testing Catalog + Google Blog? Outras que quer adicionar?
- Threshold inicial do pre-filter de relevância: começo com 6 (padrão, ~30% skip) — ajustável depois por dashboard.
- Canal de alerta: Discord webhook ou Slack? (para avisar sobre falhas).
- Email whitelist pro painel admin (`/admin/ingestion`): quais endereços?

---

## 10. Referências

- Doc original do n8n: `Zuno News V3` — fornecida pelo usuário na conversa, integralmente preservada abaixo deste §10 em versões futuras se desejar.
- [supabase/migrations/001_enable_rls_policies.sql](../supabase/migrations/001_enable_rls_policies.sql) — RLS das tabelas internas.
- [supabase/functions/similar-news](../supabase/functions/similar-news/) — padrão de Edge Function Deno + OpenAI já estabelecido no projeto.
- PRD principal: [../PRD.md](../PRD.md) — seção §4 (Estado de Implementação) e §5 (Problemas) serão atualizadas após esta spec virar código.
