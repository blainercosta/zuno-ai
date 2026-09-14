# Varredura de Produto — Oportunidades Não Exploradas (Zuno AI)

> **Data:** 2026-09-14 · **Commit base:** `ec6e55f` (main)
> **Método:** orquestração de 4 especialistas (PM, UX Strategy, SEO, AI Strategy) com verificação cruzada no código. Toda afirmação cita `arquivo:linha`.
> **Pergunta guia:** o que ainda não exploramos que faria *muita gente* se interessar pelo Zuno?

---

## TL;DR

1. **O produto em produção é menor do que o código sugere.** `/post-job`, `/professionals` e os ícones de navegação correspondentes só existem quando `import.meta.env.DEV` é true ([App.tsx:312](../App.tsx#L312), [App.tsx:355](../App.tsx#L355), [App.tsx:485-495](../App.tsx#L485), [JobsPage.tsx:99](../components/JobsPage.tsx#L99)). Para o usuário real, Zuno é um agregador de notícias de IA com job board somente leitura.
2. **O maior ativo subutilizado não é feature nova, é dado já coletado e nunca exposto:** `salary`, `seniority_level`, `company_name`, `requirements` em `vagas_ia`; `niche` em `beta_waitlist`/`subscribers`; `key_takeaway` e `embedding` em `news` ([kubo-ingest.ts:166](../api/kubo-ingest.ts#L166)).
3. **Três vazamentos no funil bloqueiam qualquer growth antes de qualquer feature:** share de notícia sem WhatsApp ([NewsDetailPage.tsx:6](../components/NewsDetailPage.tsx#L6)), checkout "Já paguei" sem verificação ([CheckoutPage.tsx:15-17](../components/CheckoutPage.tsx#L15)), pós-checkout apontando para número placeholder `5511999999999` ([CheckoutSuccessPage.tsx:200](../components/CheckoutSuccessPage.tsx#L200)).

---

## 1. Correções que destravam alcance (esforço baixo, fazer antes de tudo)

| # | Achado | Evidência | Por que trava alcance | Fix |
|---|--------|-----------|----------------------|-----|
| F1 | Share de notícia tem X, LinkedIn, copiar link. **Sem WhatsApp.** | [NewsDetailPage.tsx:6](../components/NewsDetailPage.tsx#L6) importa só `shareOnTwitter, shareOnLinkedIn, copyToClipboard`; `shareOnWhatsApp` já existe em [shareUtils.ts:19](../utils/shareUtils.ts#L19) | WhatsApp é o canal primário declarado (PRD §1). `og-news` e `image-proxy` foram construídos para ele. O botão não existe onde mais importa. | 1 import + 1 botão |
| F2 | Botão "Já paguei" navega para sucesso sem verificar pagamento | [CheckoutPage.tsx:15-17](../components/CheckoutPage.tsx#L15); webhook AbacatePay ausente (PRD P03) | Métrica de conversão é ruído. Qualquer experimento de checkout mede nada. | Edge function `abacatepay-webhook` setando `payment_confirmed_at` |
| F3 | Pós-checkout abre `wa.me/5511999999999` com mensagem redigida pelo próprio cliente | [CheckoutSuccessPage.tsx:200](../components/CheckoutSuccessPage.tsx#L200) | Assinante pago precisa iniciar contato manual com número de teste. Zero entrega automática. | Grupo/bot real + entrega automática do que foi comprado |
| F4 | FAQSchema indexado no Google promete "maior hub de IA do Brasil", "100% gratuito para profissionais" | [JobsPage.tsx:58-68](../components/JobsPage.tsx#L58) | Rich snippet promete professionals + posting que não existem em prod. Bounce garantido. | Reescrever FAQ para o que está no ar |
| F5 | `/job/:slug` sem pré-render para Googlebot. Só `/noticias-ia/*` é coberto | [vercel.json:13](../vercel.json#L13) rewrite só para news; `JobPosting` injetado via `useEffect` em [JobStructuredData.tsx:12-91](../components/JobStructuredData.tsx#L12) | Vagas invisíveis na 1ª onda de indexação. Google for Jobs depende da fila de render JS. | Clonar `api/og-news.ts` para `api/og-job.ts` + rewrite `/job/(.+)` |
| F6 | `similar-jobs` recalcula embedding de até 50 vagas **a cada pageview** | [similar-jobs/index.ts:148](../supabase/functions/similar-jobs/index.ts#L148) em loop; coluna `news.embedding` existe e está ociosa ([002_ingestion_engine.sql](../supabase/migrations/002_ingestion_engine.sql)) | ~US$ 2,50/1k usuários para algo que deveria custar zero. Bloqueia todas as features AI-native abaixo. | `ALTER TABLE vagas_ia ADD COLUMN embedding vector(1536)` + HNSW + backfill (~US$ 0,02 one-off) |
| F7 | Host inconsistente: `robots.txt`/sitemaps em `usezuno.app`, canonical em `www.usezuno.app` | [public/robots.txt](../public/robots.txt), [index.html](../index.html) | Sinal de autoridade dividido entre dois hosts | Escolher `www`, 301 no Vercel |
| F8 | `niche` coletado em todo cadastro e não segmenta nada depois | [types/subscriber.ts:33-42](../types/subscriber.ts#L33) `SUBSCRIBER_NICHES` (Marketing, Finanças, Saúde, Educação…) | Prova que público não-tech já chega, mas conteúdo é genérico | Base para oportunidade O3 |

---

## 2. Oportunidades ranqueadas (impacto de massa × esforço)

Legenda: Impacto/Esforço = **A**lto · **M**édio · **B**aixo. Custo = por 1k usuários, Haiku 4.5 + `text-embedding-3-small`.

| # | Oportunidade | Público novo | Dado/infra já existente | Imp. | Esf. | Custo | Primeiro passo |
|---|-------------|--------------|------------------------|------|------|-------|----------------|
| **O1** | **Modo Leigo** — "Resumo em 1 minuto" + "explique sem jargão" em cada notícia | Curioso, estudante, profissional não-técnico | `news.key_takeaway` gravado em [kubo-ingest.ts:166](../api/kubo-ingest.ts#L166) e **nunca exibido**; `types/news.ts` nem declara o campo | A | B | ~US$ 0,20 (fase 2); fase 1 = US$ 0 | Adicionar `key_takeaway` a `types/news.ts` e renderizar no topo de `NewsDetailPage.tsx` |
| **O2** | **Índice de Exposição à IA por Profissão** — quiz "Seu emprego está em risco?" + landing `/profissoes/:slug` | População economicamente ativa (contador, advogado, professor, dentista). Maior teto de audiência da lista | `vagas_ia.requirements` como lastro; corpus `news`; padrão `quality_score`/`review` do Kubo | A | M | ~US$ 0/usuário (batch ~US$ 2,40 one-off) | Batch Haiku extraindo skills normalizadas para tabela `job_skills` |
| **O3** | **Verticais "IA para [nicho]"** — filtro/hub cruzando news + jobs com os 8 nichos do waitlist | Marketing, Finanças, Saúde, Educação, E-commerce | `SUBSCRIBER_NICHES`; `news.category`/`raw_category` ([006_add_raw_category_to_news.sql](../supabase/migrations/006_add_raw_category_to_news.sql)); rota `/noticias-ia/categoria/:categoria` já existe ([App.tsx:500](../App.tsx#L500)) | A | M | 0 | Mapear categorias de news para nichos; página índice de categorias no sitemap |
| **O4** | **Relatório público "Quanto pagam vagas de IA no Brasil"** por senioridade/tipo/remoto | Estudantes, imprensa, RH, redes sociais | `vagas_ia.salary` (TEXT livre), `seniority_level`, `employment_type`, `workplace_type` ([types/job.ts](../types/job.ts)) | A | B-M | ~0 | Normalizar `salary` → `salary_min/max/period` no mesmo batch de O2; página com OG compartilhável |
| **O5** | **Radar de Skills em alta** — "o que estudar" por mês | Quem quer entrar na área, professores, criadores de curso | Mesmo `job_skills` de O2 | M | B (após O2) | 0 | Agregação mensal + gráfico |
| **O6** | **Reativar `/post-job` em produção** com moderação | Recrutadores, PMEs não-tech | Validação e edge function prontas ([post-job/index.ts](../supabase/functions/post-job/index.ts)); só gate DEV + default `status='active'` | A | B | 0 | Remover gate, default `pending`, view admin mínima |
| **O7** | **Páginas de empresa** `/empresas/:slug` | SEO cauda longa "vagas na [empresa]"; employer branding | `company_name`, `company_url`, `logo_url`, `about_company` em `vagas_ia` | M | B-M | ~US$ 3 one-off | `GROUP BY company_name` + template de pré-render de F5 |
| **O8** | **Alerta de vaga / vagas salvas** por WhatsApp sem login | Candidatos que não criam conta | `whatsapp` validado em `beta_waitlist`/`subscribers` (RB-VAL-04) | A | M | BSP ~R$ 50-100/dia por 1k conversas | Adicionar `consent_whatsapp_at` a `subscribers`; "salvar" em `localStorage` primeiro |
| **O9** | **Digest semanal WhatsApp (texto + áudio)** — "top 5 da semana" | Quem não lê; público já no WhatsApp | [useTopNews.ts](../hooks/useTopNews.ts) já ranqueia por `view_count` 7 dias | A | M-A | LLM ~US$ 0,17/mês total; custo real é BSP | Mesmo pré-requisito de consentimento de O8 |
| **O10** | **Match Currículo ↔ Vagas** ("cole seu CV, veja compatibilidade") | Candidato de qualquer área migrando | Embeddings após F6 | A | M | ~US$ 0,05 (score) a US$ 5 (com explicação) | **Bloqueado**: política de privacidade e termos não existem (PRD §7.7). Escrever antes. Zero-retenção: só embedding + hash |
| **O11** | **Busca semântica unificada** jobs + news | Quem não sabe o nome técnico do que procura | pgvector após F6 | M | B | ~US$ 0,001 | RPC `search_all(query_embedding, kinds[])` |
| **O12** | **Feed personalizado sem login** (vetor de interesse em cookie) | Retenção do anônimo (100% do tráfego hoje) | `news.embedding` + HNSW | M | M | 0 | Média dos embeddings lidos em `localStorage`; consentimento LGPD |
| **O13** | **Programa de indicação** no success screen do beta | Rede dos beta testers atuais | `beta_waitlist.source`, `utm_*`; `UTM_CONFIGS.internal.medium='referral'` já modelado em [utm.ts:112](../utils/utm.ts#L112) sem uso | M | B | 0 | `referred_by` em `beta_waitlist` + link único |
| **O14** | **Glossário de IA em PT-BR** `/glossario-ia/:termo` | Iniciante absoluto; SEO informacional ("o que é RAG") | Corpus `news`; `FAQSchema.tsx` pronto; taxonomia `VALID_NEWS_CATEGORIES` em `kubo-ingest.ts` | M | B | ~US$ 1 one-off | 20-30 verbetes com fonte citada |
| **O15** | **Homepage própria em `/`** em vez de redirect | Termo de marca; primeiro contato | [App.tsx:479](../App.tsx#L479) `Navigate` para `/noticias-ia`; H1 `sr-only` em [NewsPage.tsx:158](../components/NewsPage.tsx#L158) | M | B | 0 | Headline + CTA + últimas news + vagas em destaque |
| **O16** | **Conselheiro de transição de carreira** (wizard 3 perguntas, não chat livre) | Alta empatia, alto share | RAG sobre jobs + news após F6 | M | A | ~US$ 3 (wizard) vs ~US$ 15 (chat) | Só após rate limit (PRD P06 ainda comentado) |
| **O17** | **Vaga em destaque paga** | PMEs querendo visibilidade | `vagas_ia.status`; checkout AbacatePay existente | A | B | 0 | `featured_until` + ordenação em `JobsPage.tsx`. Depende de O6 e F2 |
| **O18** | **Sitemap dinâmico de vagas + categorias** | Suporte a F5, O3, O7 | Padrão de [sitemap-news](../supabase/functions/sitemap-news) | M | B | 0 | `supabase/functions/sitemap-jobs` |

### Descartado
- **Diretório de prompts/ferramentas.** Curadoria commoditizada, não AI-native, abre 4ª vertical antes de fechar a 3ª (`professionals` é mock: [ProfessionalsPage.tsx:11-127](../components/ProfessionalsPage.tsx#L11)).
- **Chat livre de carreira.** Custo ilimitado + prompt injection sem rate limit. Fazer como wizard (O16).

---

## 3. Clusters de keyword PT-BR com volume de massa e zero conteúdo dedicado hoje

- "IA vai substituir [profissão]" / "IA para [advogados, professores, contadores, médicos]" → **O2, O3**
- "vagas de IA sem experiência" / "primeiro emprego em IA" → **O2, O5**
- "salário de [cargo] em IA no Brasil" → **O4**
- "vagas de IA em São Paulo" / "vagas IA remoto" → **F5 + O18** (requer normalizar `location`, hoje texto livre)
- "o que é prompt engineering / RAG / LLM" → **O14**
- "vagas na [empresa]" → **O7**

---

## 4. Sequência recomendada

**Semana 1-2 — tapar vazamentos (F1-F8).** Sem isso, todo experimento mede ruído. Instrumentar PostHog + Sentry junto (PRD P01: zero analytics).

**Semana 3-4 — expor dado que já existe, custo zero.** O1 fase 1 (`key_takeaway`), O15 (home), O13 (referral), O6 (post-job com moderação), O18 (sitemaps).

**Mês 2 — batch AI compartilhado.** Um único job Haiku sobre `vagas_ia` alimenta O2, O4, O5 (tabela `job_skills` + `salary` normalizado). O3 mapeando categorias para nichos. O7 páginas de empresa.

**Mês 3 — features com inferência por usuário.** O11, O12, O1 fase 2, O10 (só após política de privacidade + rate limit).

**Depois — canal WhatsApp ativo.** O8, O9 exigem BSP, `consent_whatsapp_at`, opt-out. Maior custo operacional da lista.

---

## 5. Pré-requisitos de governança (bloqueiam deploy)

- [ ] Política de privacidade e termos publicados (PRD §7.7) — bloqueia O10, O12, O8, O9
- [ ] Rate limit em edge functions (PRD P06, hoje comentado) — bloqueia O10, O16
- [ ] `consent_whatsapp_at` em `subscribers` — bloqueia O8, O9
- [ ] Conteúdo gerado sobre profissões/empresas entra como `status='review'`, nunca `published` direto. Reusar padrão `quality_score ≥ 60` do Kubo. Não repetir o anti-padrão de `post-job` (PRD P02)
- [ ] Score de exposição à IA sempre como faixa + evidência (`evidence_job_ids`), nunca número isolado

---

## 6. Decisões que precisam de humano

1. **Professionals:** reativar com cadastro self-serve ou remover do código. Meio-termo atual (mock em DEV) é custo sem valor.
2. **Persona do checkout:** copy fala com "criadores de conteúdo" ([CheckoutPage.tsx:134](../components/CheckoutPage.tsx#L134)) enquanto o resto do produto fala com candidato/leitor. Qual é o assinante-alvo e o que ele recebe?
3. **Canal WhatsApp ativo (O8/O9):** vale o custo de BSP agora ou depois de ter baseline de analytics?
4. **Host canônico:** `www` ou raiz.
