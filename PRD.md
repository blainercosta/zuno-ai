# PRD — Zuno AI

> **Status:** v0.1 — reconstrução reversa a partir do código. Projeto não tinha PRD nem README de produto.
> **Autor:** PM Agent
> **Data:** 2026-04-19
> **Commit base:** `a6a17c5` (main)
> **Como ler:** cada afirmação cita evidência `[arquivo:linha]` do repo. Inferências marcadas `[INFER]`. Decisões pendentes no §7.

---

## 1. Executive Summary

**O que é Zuno AI:** plataforma brasileira em beta que combina **três verticais em torno do ecossistema de IA**:
1. **Job board** de vagas em IA (`vagas_ia`) — listing, detalhe, candidatura externa, posting com moderação
2. **News aggregator** de notícias de IA (`news` + `posts`) — com OG preview otimizado para compartilhamento em WhatsApp
3. **Diretório de profissionais** de IA (`professionals`) — listagem e perfis individuais

Monetização atual: **assinatura de notícias via AbacatePay** (checkout direto) + beta tester gratuito como aquisição. Distribuição primária: WhatsApp (grupo de beta testers + share de conteúdo).

**Estado real:** produto em produção, stack sólida (React 18 + Vite + Supabase + Vercel Edge + OpenAI embeddings), RLS configurado, 6 edge functions deployadas. **Principais gaps: diretório de profissionais ainda é mock fallback, zero observabilidade (sem Sentry, PostHog, GA), acessibilidade mínima, e o produto não tem PRD nem README — dívida estratégica acumulada.**

**Recomendação:** consolidar o PRD (este doc) antes de qualquer feature nova; instrumentar analytics nesta sprint; decidir se "professionals" é pilar ou descartar.

---

## 2. Stack & Arquitetura

**Frontend:** React 18.3 + Vite 6 (SPA, sem SSR) + React Router v7 + TypeScript 5.7 + Tailwind 3.4 + Radix UI (26 pacotes) + React Hook Form + Zod + Sonner (toasts) + DOMPurify + Lucide + Recharts. [[package.json](package.json)]

**Backend:** Supabase (Postgres com RLS habilitado em todas as tabelas públicas) + 6 Edge Functions Deno [[supabase/functions/](supabase/functions/)] + OpenAI (embeddings `text-embedding-3-small` para similaridade de jobs/news).

**Ingestion engine — Kubo (produto externo):** a ingestão de notícias agora é feita pelo produto standalone **Kubo** (`https://hiwzscnqisuweqbwvcpp.supabase.co/functions/v1`). Zuno AI é cliente via webhook em [api/kubo-ingest.ts](api/kubo-ingest.ts) que valida HMAC-SHA256 e faz upsert em `news`. Scraper de vagas (LinkedIn-only) segue descopado. Ver [docs/INGESTION_ENGINE.md](docs/INGESTION_ENGINE.md) como referência histórica da tentativa de internalização que foi abandonada.

**Deploy:** Vercel — SPA com rewrites por User-Agent (detecção de crawlers de OG) + 2 APIs Node: `og-news.ts` (meta tags para crawlers) e `image-proxy.ts` (contorna bloqueio do WhatsApp a domínios externos). [[vercel.json](vercel.json), [api/og-news.ts](api/og-news.ts), [api/image-proxy.ts](api/image-proxy.ts)]

**Pagamento:** AbacatePay (link externo `bill_aJYE06HEdYEUx2fHd3L0mTNa`).

**Observabilidade:** apenas Vercel Speed Insights [[App.tsx:3](App.tsx#L3)]. Sem Sentry, sem PostHog, sem GA — só `console.log/warn/error`.

**Notas de arquitetura:**
- `package.json` tem `name: "job-new"` — nome legado, diverge do branding atual. [[package.json:2](package.json#L2)]
- `middleware.ts.bak` é versão antiga substituída pelo router do Vercel — **deletar**. [[middleware.ts.bak](middleware.ts.bak)]
- `src/` e `services/` praticamente vazios [`src/main.tsx` é o único arquivo em `src/`]. Sinal de estrutura em transição.
- 14 ocorrências de `any` em TS — baixo, mas vale corrigir em `types/subscriber.ts` e `utils/tracking.ts`.

---

## 3. Domínio de Negócio

### 3.1 Personas

| Persona | Objetivo primário | Entidade principal | Evidência |
|---------|-------------------|--------------------|-----------|
| **Candidato IA** | Achar vaga, compartilhar, candidatar | `vagas_ia` | [components/JobsPage.tsx](components/JobsPage.tsx), [components/JobDetailPage.tsx](components/JobDetailPage.tsx) |
| **Recrutador** | Postar vaga (hoje grátis?) | `vagas_ia` | [components/PostJobPage.tsx](components/PostJobPage.tsx), [supabase/functions/post-job/](supabase/functions/) |
| **Leitor de notícias** | Consumir + compartilhar notícia de IA | `news`, `posts` | [components/NewsPage.tsx](components/NewsPage.tsx), [api/og-news.ts](api/og-news.ts) |
| **Assinante** | Pagar para receber conteúdo curado | `subscribers` | [components/CheckoutPage.tsx](components/CheckoutPage.tsx) |
| **Beta tester** | Entrar na comunidade WhatsApp grátis | `beta_waitlist` | [components/BetaTesterPage.tsx](components/BetaTesterPage.tsx) |
| **Profissional listado** | Ser encontrado por contratantes | `professionals` | [components/ProfessionalsPage.tsx](components/ProfessionalsPage.tsx) |

### 3.2 Jobs to Be Done

| JTBD | Atendido hoje? | Nota |
|------|----------------|------|
| "Quero ver vagas de IA filtradas e pesquisáveis" | ✅ Sim | Infinite scroll + search |
| "Quero me candidatar" | ⚠️ Parcial | Redirect externo com UTM, sem confirmação nem histórico |
| "Quero postar uma vaga" | ✅ Sim | Form com validação, insere `status='active'` direto |
| "Quero ler notícias de IA em português" | ✅ Sim | Listagem + detalhe + categorias |
| "Quero compartilhar notícia no WhatsApp" | ✅ Sim | OG preview via API crawler detection |
| "Quero assinar newsletter/conteúdo premium" | ✅ Sim | Checkout AbacatePay |
| "Quero contratar um profissional de IA" | ❌ Não | Diretório usa mock fallback |
| "Quero me cadastrar como profissional" | ❌ Não | Sem formulário de cadastro |

### 3.3 Entidades

Inferidas de [types/](types/) + [supabase/migrations/001_enable_rls_policies.sql](supabase/migrations/001_enable_rls_policies.sql) + edge functions:

```
vagas_ia (Job)                          beta_waitlist
 ├── job_id (string, PK)                 ├── id, name, email (unique)
 ├── title, company_name, logo_url       ├── instagram, whatsapp, niche
 ├── location, seniority_level           ├── source, utm_*
 ├── employment_type, workplace_type     └── created_at
 ├── is_remote, is_easy_apply
 ├── description_full, requirements      subscribers
 ├── responsibilities, benefits          ├── id, name, email, whatsapp
 ├── salary, job_url, posted_at          ├── niche, source (beta_tester | checkout)
 └── status ('active' | ...)             ├── utm_source, utm_medium, utm_campaign
                                         └── payment_confirmed_at (nullable)
news / posts (News)
 ├── id, slug, title                     professionals
 ├── subtitle (news) | excerpt (posts)   ├── id, slug, name, role, bio
 ├── cover_image (news) | image_url      ├── skills (string[]), badge
 ├── author, category                    ├── rating (0–5), hourly_rate
 ├── published_at                        ├── availability, years_experience
 └── status ('published' | ...)          ├── total_projects, location
                                         ├── portfolio_url, github, linkedin
sources, news_metadata, scrape_errors    └── status ('online' | 'offline')
(internos — bloqueados para anon)
```

### 3.4 Regras de Negócio extraídas do código

**Visibilidade & RLS** [[supabase/migrations/001_enable_rls_policies.sql](supabase/migrations/001_enable_rls_policies.sql)]
- RB-VIS-01: `vagas_ia` só retorna `status='active'` para anon.
- RB-VIS-02: `news` e `posts` só retornam `status='published'` para anon.
- RB-VIS-03: `beta_waitlist`, `subscribers`, `user_profiles`, `sources`, `news_metadata`, `scrape_errors` **bloqueados para anon** — escrita só via Edge Function com `service_role`.
- RB-VIS-04: `professionals` público em leitura.

**Validação de entrada**
- RB-VAL-01: nome — min 2 chars, regex `/^[a-zA-ZÀ-ÿ\s]+$/` [BetaTesterPage `[INFER]`].
- RB-VAL-02: e-mail — regex padrão, armazenado lowercase; único em `beta_waitlist`.
- RB-VAL-03: Instagram handle — sem `@`, 2–30 chars, regex `/^[a-z0-9._]+$/`.
- RB-VAL-04: WhatsApp — 10–11 dígitos (Brasil), prefixado com `55` no save (`55${digits}`).
- RB-VAL-05: URL de vaga — passa por `isValidUrl` na edge function. [[supabase/functions/post-job/index.ts](supabase/functions/post-job/index.ts)]
- RB-VAL-06: textos livres passam por `sanitizeText` (remove scripts/tags) e `DOMPurify` no render.

**Jobs**
- RB-JOB-01: postar vaga insere diretamente `status='active'` — **não há moderação**. Qualquer payload que passe validação sobe.
- RB-JOB-02: slug de URL = `title-slugified-{job_id-suffix}`; o handler extrai o id com `slug.split('-').pop()`. [[App.tsx:48](App.tsx#L48)] — frágil se `job_id` contiver `-`.
- RB-JOB-03: botão "Candidatar-se" abre `job.job_url` com UTM `utm_source=zuno&utm_medium=job_board&utm_campaign=apply&utm_content={jobId}`. [[utils/tracking.ts](utils/tracking.ts)]
- RB-JOB-04: candidatura é externa — **nenhuma aplicação é registrada no banco**. Métrica de conversão depende do destino.
- RB-JOB-05: fallback de logo: se `logo_url` ausente/erro, usa `/zuno-mini.svg`.
- RB-JOB-06: "Similar jobs" via OpenAI embedding + cosine similarity. Fallback: se `OPENAI_API_KEY` ausente, retorna aleatórios. [[supabase/functions/similar-jobs/index.ts](supabase/functions/)]

**News**
- RB-NEWS-01: rota pública `/noticias-ia/:slug`. Legacy `/news/:slug` redireciona.
- RB-NEWS-02: detecção de crawler por User-Agent (WhatsApp, Facebook, LinkedIn, Twitter, Slack, Telegram) re-roteia para `/api/og-news` que retorna HTML só com meta tags. [[vercel.json](vercel.json), [api/og-news.ts](api/og-news.ts)]
- RB-NEWS-03: `news.cover_image` e `posts.image_url` são colunas diferentes — `og-news` trata os dois.
- RB-NEWS-04: imagens de capa são proxied via `/api/image-proxy` para contornar bloqueio do WhatsApp. [[api/image-proxy.ts](api/image-proxy.ts)]
- RB-NEWS-05: fallback de OG: `/og-cover.png` se imagem não existe.

**Waitlist / Beta**
- RB-BETA-01: cadastro em 5 steps (nome → email → instagram → whatsapp → nicho). [[components/BetaTesterPage.tsx](components/BetaTesterPage.tsx)]
- RB-BETA-02: save só no step 5, antes do success screen. Erros mostrados inline no step 5. [commit `496c6b1`]
- RB-BETA-03: em DEV mode o step de email é skipped (`[INFER]`, ler código antes de publicar regra).
- RB-BETA-04: após save, mostra link do grupo WhatsApp de beta testers.
- RB-BETA-05: e-mail duplicado retorna erro `23505` (Postgres unique violation) — tratado na UI.
- RB-BETA-06: rate limiting por IP **está comentado** — não implementado. [[supabase/functions/waitlist-signup/](supabase/functions/)]

**Subscribers / Pagamento**
- RB-SUB-01: `source='beta_tester'` se veio do `/beta`; `source='checkout'` se veio do `/checkout`. [[BetaTesterPage.tsx:146](components/BetaTesterPage.tsx#L146) `[INFER]`]
- RB-SUB-02: `payment_confirmed_at` é setado manualmente/por webhook do AbacatePay `[INFER — não há handler de webhook no repo]`.
- RB-SUB-03: nichos fixos (8): Tecnologia, Marketing, Finanças, Saúde, Educação, Design, Empreendedorismo, Outros. `[INFER]`
- RB-SUB-04: UTM é persistido em `utm_source`, `utm_medium`, `utm_campaign`.

**Professionals**
- RB-PRO-01: se Supabase retorna vazio, a UI cai em `MOCK_PROFESSIONALS`. [[components/ProfessionalsPage.tsx:10-70](components/ProfessionalsPage.tsx)]
- RB-PRO-02: rating 0–5. Badges: "Novo", "Destaque". Status: "online" / "offline".
- RB-PRO-03: **não existe fluxo de cadastro** — a tabela é populada manualmente ou por script externo.

### 3.5 Rotas

| Rota | Componente | Acesso | Fonte |
|------|-----------|--------|-------|
| `/jobs` | `JobsPage` | Público | [[App.tsx](App.tsx)] |
| `/job/:slug` | `JobDetailRoute → JobDetailPage` | Público | [[App.tsx:40](App.tsx#L40)] |
| `/post-job` | `PostJobPage` | Público | [[App.tsx](App.tsx)] |
| `/noticias-ia` | `NewsPage` | Público | |
| `/noticias-ia/:slug` | `NewsDetailPage` | Público (crawlers → og-news) | |
| `/news/:slug` | Redirect → `/noticias-ia/:slug` | Legacy | |
| `/professionals` | `ProfessionalsPage` | Público | |
| `/professional/:slug` | `ProfessionalDetailPage` | Público | |
| `/profile` | `ProfileSettingsPage` | **não claro se autenticado** | |
| `/checkout` | `CheckoutPage` | Público | |
| `/checkout/sucesso` | `CheckoutSuccessPage` | Público | |
| `/beta` | `BetaTesterPage` | Público | |

---

## 4. Estado de Implementação

### 4.1 Implementado (produção)
- ✅ Jobs: listing + search + infinite scroll + detalhe + similar jobs + apply externo
- ✅ News/Posts: listing + detalhe + top news + structured data (JSON-LD)
- ✅ OG preview otimizado (crawler detection + image proxy)
- ✅ Beta waitlist 5-step + grupo WhatsApp
- ✅ Checkout AbacatePay
- ✅ Post-job com sanitização
- ✅ Similar jobs/news via embeddings
- ✅ RLS + 6 Edge Functions deployadas
- ✅ Sitemap de news (edge function `sitemap-news`)

### 4.2 Parcial / Placeholder
- ⚠️ `ProfessionalsPage` com MOCK_PROFESSIONALS como fallback
- ⚠️ `ProfileSettingsPage` existe mas sem auth visível no código lido
- ⚠️ `BetaAccessModal` — fluxo exato não mapeado

### 4.3 Código morto / dívida
- `middleware.ts.bak` — deletar
- `src/` e `services/` quase vazios
- `imports/1440WDark-*.tsx` — exports Figma sem uso aparente
- `package.json` name: `"job-new"` — legado
- Rate limiting de waitlist comentado

---

## 5. Problemas Identificados

| # | Severidade | Problema | Evidência | Correção sugerida |
|---|-----------|----------|-----------|-------------------|
| P01 | **Crítico** | **Zero observabilidade de produto** — sem Sentry, sem PostHog/GA, só `console.*`. Impossível medir funil ou detectar bugs em produção. | ausência global | Sentry + PostHog nesta sprint |
| P02 | **Crítico** | **Post-job sem moderação** — qualquer um posta `status='active'` direto. Risco de spam/golpe/vaga falsa. | [supabase/functions/post-job/](supabase/functions/) | Mudar default para `status='pending'` + painel admin |
| P03 | **Crítico** | **Webhook AbacatePay ausente** — não há handler que receba confirmação de pagamento. `payment_confirmed_at` não está sendo atualizado automaticamente. `[INFER — verificar]` | sem arquivo de webhook | Implementar edge function `abacatepay-webhook` |
| P04 | **Alto** | **Candidatura não rastreada** — apply abre URL externo sem registrar intent no banco. Não dá pra medir conversão real nem fechar loop com recrutador. | [utils/tracking.ts](utils/tracking.ts) | Tabela `job_applications { user_id?, job_id, clicked_at, utm, ip_hash }` |
| P05 | **Alto** | **Professionals é vaporware** — vitrine com mock fallback. Confunde visitante sobre o que o produto entrega. | [components/ProfessionalsPage.tsx:10](components/ProfessionalsPage.tsx) | Decidir: remover, marcar "coming soon", ou implementar cadastro |
| P06 | **Alto** | **Rate limit de waitlist não implementado** — endpoint aberto para floods. | [supabase/functions/waitlist-signup/](supabase/functions/) | Upstash Redis ou `check_rate_limit` via SQL |
| P07 | **Alto** | **Slug parsing frágil** — `slug.split('-').pop()` quebra se `job_id` tiver hífen. | [App.tsx:48](App.tsx#L48) | Usar regex com grupo nomeado ou query param separado |
| P08 | **Médio** | **Acessibilidade mínima** — quase nenhum `aria-label`, SVGs sem `role="img"` nem `<title>`, foco de modal não audited. | `[INFER]` grep geral | Passar axe-core; começar por modais e ícones-botão |
| P09 | **Médio** | **Sem Error Boundary React** — qualquer exceção em componente lazy derruba a rota. | [App.tsx](App.tsx) | Envolver `Suspense` com `ErrorBoundary` |
| P10 | **Médio** | **Validação inconsistente** — frontend usa Zod em alguns forms, edge function duplica regex. Drift é questão de tempo. | [supabase/functions/post-job/](supabase/functions/) | Schema Zod compartilhado em `lib/schemas/` |
| P11 | **Médio** | **`any` em tracking e subscriber types** | [types/subscriber.ts](types/subscriber.ts), [utils/tracking.ts](utils/tracking.ts) | Tipar corretamente |
| P12 | **Médio** | **Branding inconsistente** — `package.json` name é "job-new", PostHog/GA ausente, produto chamado "Zuno AI" em outras partes. | [package.json:2](package.json#L2) | Renomear package + alinhar copy |
| P13 | **Baixo** | `middleware.ts.bak` e `imports/` órfãos poluem repo | múltiplos | Deletar |
| P14 | **Baixo** | Nichos do waitlist hardcoded em UI — adicionar/editar é deploy | [components/BetaTesterPage.tsx](components/BetaTesterPage.tsx) | Tabela `niches` ou config JSON |

---

## 6. Roadmap

### Sprint atual (destravar o essencial)
- [ ] **Instrumentar analytics** (PostHog + Sentry) — sem isso todo o resto é cego
- [ ] **Moderação de jobs** — mudar default para `pending` + view admin mínima
- [ ] **Webhook AbacatePay** — confirmar se existe em produção, implementar se não
- [ ] **Rate limit waitlist** (Upstash Redis)
- [ ] **Decidir destino de Professionals** — remover ou roadmapear cadastro
- [ ] Deletar `middleware.ts.bak`, limpar `imports/` órfãos, renomear `package.json` name

### Próximo sprint (fundação)
- [ ] Tabela `job_applications` + botão apply com tracking interno antes do redirect
- [ ] Schemas Zod compartilhados entre frontend e edge functions
- [ ] ErrorBoundary global + páginas 404/500 customizadas
- [ ] Refator do slug parser de job (P07)
- [ ] Auditoria axe-core e fix de top-5 acessibilidade

### Backlog priorizado
- [ ] Autenticação real (magic link via Supabase Auth) — desbloqueia perfil, histórico de candidaturas, painel de recrutador
- [ ] Painel do recrutador (editar/renovar vagas, ver candidatos)
- [ ] Planos pagos para recrutador (vaga destacada, posting pago)
- [ ] Curadoria editorial: review de news antes de `published`
- [ ] Sistema de categorias de jobs (stacks: LLM, CV, RL, MLOps)
- [ ] App mobile (PWA como passo 1)

---

## 7. Open Decisions (precisa de humano)

1. **Professionals é pilar ou distração?** Hoje é a vertical mais fraca (mock fallback, sem cadastro). Decidir: remover, marcar "coming soon", ou investir.
2. **Post-job é grátis para sempre?** Se sim, moderação vira dever; se não, qual tier cobrar (destaque? recorrência? anúncios)?
3. **O que o assinante do AbacatePay recebe exatamente?** Newsletter? Grupo premium? Curadoria? Não está explícito no checkout.
4. **Auth:** prioridade para V1 ou V2? Sem auth, candidatura é anônima e não há perfil real.
5. ~~**Moderação de news/posts:** há pipeline editorial humano ou é 100% scraping + auto-publish?~~ **Respondido:** 100% automático — scrape via Firecrawl + reescrita via Claude Haiku + auto-publish se `quality_score ≥ 60`, senão vai para `review`. Pipeline sendo reconstruído em [docs/INGESTION_ENGINE.md](docs/INGESTION_ENGINE.md).
6. **Branding:** repo/package diz `job-new`, product diz `Zuno AI` — quando virar só Zuno?
7. **LGPD:** armazenamos email + WhatsApp + Instagram — onde está a política de privacidade e termos?

---

## 8. Métricas de sucesso (proposta para instrumentar)

| Camada | Métrica | Ferramenta | Baseline hoje |
|--------|---------|-----------|---------------|
| Aquisição | Visitantes únicos/semana | PostHog | ? (sem medição) |
| Aquisição | Signups beta/semana | Supabase + PostHog | ? |
| Engajamento | Jobs vistos por sessão | PostHog | ? |
| Conversão | CTR de "Candidatar-se" | Redirect-UTM + PostHog | ? |
| Conversão | Checkout → pagamento confirmado | AbacatePay webhook | ? |
| Retenção | Retorno D7 de beta tester | PostHog | ? |
| Qualidade | Share rate de news (WhatsApp) | UTM `utm_source=whatsapp` | ? |
| Saúde | Error rate por rota | Sentry | ? |

Meta v1 (90 dias pós-instrumentação): pelo menos **ter os números**. Sem baseline, qualquer meta numérica é chute.

---

## 9. Apêndice — Mapa rápido de arquivos

| Área | Caminho |
|------|---------|
| Router raiz | [App.tsx](App.tsx) |
| Bootstrap | [src/main.tsx](src/main.tsx) |
| Client Supabase | [lib/supabase.ts](lib/supabase.ts) |
| API wrapper | [lib/api.ts](lib/api.ts) |
| Types | [types/job.ts](types/job.ts), [types/news.ts](types/news.ts), [types/professional.ts](types/professional.ts), [types/subscriber.ts](types/subscriber.ts) |
| Hooks de dados | [hooks/useJobs.ts](hooks/useJobs.ts), [hooks/useNews.ts](hooks/useNews.ts), [hooks/useSimilarJobs.ts](hooks/useSimilarJobs.ts), [hooks/useSimilarNews.ts](hooks/useSimilarNews.ts), [hooks/useTopNews.ts](hooks/useTopNews.ts), [hooks/useCategories.ts](hooks/useCategories.ts) |
| Edge Functions | [supabase/functions/](supabase/functions/) — post-job, waitlist-signup, similar-jobs, similar-news, sitemap-news, subscribe |
| Migrations | [supabase/migrations/](supabase/migrations/) |
| APIs Vercel | [api/og-news.ts](api/og-news.ts), [api/image-proxy.ts](api/image-proxy.ts) |
| Deploy | [vercel.json](vercel.json), [deploy-functions.sh](deploy-functions.sh) |
| Utils | [utils/tracking.ts](utils/tracking.ts), [utils/shareUtils.ts](utils/shareUtils.ts), [utils/utm.ts](utils/utm.ts), [utils/date.ts](utils/date.ts) |
| Docs técnicos | [docs/SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md) |
| **Ingestion Engine** | [docs/INGESTION_ENGINE.md](docs/INGESTION_ENGINE.md) — spec de internalização do pipeline n8n |
