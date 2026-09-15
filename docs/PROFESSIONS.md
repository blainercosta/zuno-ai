# Professions — "Sua profissão está em risco?" hub + quiz

## What this is

A hub of 40 Brazilian professions at `/profissoes` (index) and
`/profissoes/:slug` (one per profession), each showing an AI-exposure
verdict — how much of the day-to-day tends to be augmented vs. likely
automated by generative AI in Brazil over the next 3-5 years — backed by
real job postings and news, not a generic take. A `/quiz` flow lets a
visitor pick their profession (grouped by cluster) and land on the
matching verdict page.

Same architecture as `docs/NICHES.md`: one embedding per profession
(`professions.embedding vector(1536)`, computed once from
`name + '. ' + descriptor`), then ANN search against the existing
`news.embedding` / `vagas_ia.embedding` columns via `<=>` (cosine
distance) to surface relevant jobs/news on each profession page. The
exposure verdict itself (score, band, summary, task lists, bridge
skills) is generated once by the `build-profession-index` edge function
from that same evidence, using gpt-4o-mini in JSON mode.

## Governance rules (read before running the generator)

1. **Never publish automatically.** `build-profession-index` only ever
   writes `status='review'`. Flipping a profession to `'published'` is a
   manual step in Studio — see "Review workflow" below.
2. **The exposure score is a band, not a fact.** Treat `exposure_score`
   as directional (`exposure_band`: baixa/média/alta), not a precise
   measurement. The `summary` is written with non-deterministic language
   ("tende a", "parte das tarefas") on purpose — never rewrite it into an
   absolute claim ("essa profissão será extinta").
3. **Evidence is required.** The function refuses to persist a verdict
   when it finds zero matching active jobs for a profession's embedding
   (`evidence_job_ids` would be empty) — it logs `no_job_evidence` for
   that slug and moves on. A profession stuck in `status='draft'` with no
   verdict usually means there's no job-market signal for it yet; don't
   force a verdict without evidence.
4. **Regenerating resets review.** Running the generator again for a
   slug (with `force: true`) always writes `status='review'`, even if the
   profession was previously `'published'` — a changed verdict must be
   re-reviewed before it goes live again.

## Applying the migration

```bash
supabase db push
```

`012_professions.sql` is idempotent: `CREATE TABLE IF NOT EXISTS`,
`CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION/VIEW`, and the
seed `INSERT ... ON CONFLICT (slug) DO UPDATE` (which only touches
`name`/`cluster`/`descriptor`/`sort_order` — see "Editing a profession"
below). Safe to re-run.

This creates:
- `professions` table — locked down for anon/authenticated (RLS
  `USING (false)` + `REVOKE ALL`), same rationale as `niches`: a
  straightforward "anon can read published professions" policy would
  also expose `embedding`/`descriptor`.
- `professions_public` view — the only public surface: all columns
  except `embedding`/`descriptor`, `WHERE status = 'published'`. Granted
  `SELECT` to `anon, authenticated`.
- `_match_jobs_for_embedding` / `_match_news_for_embedding` — internal
  `SECURITY DEFINER` helpers used only by `build-profession-index`
  (never granted to anon/authenticated). pgvector's `ORDER BY embedding
  <=> query_embedding` isn't expressible through PostgREST filters, so
  the generator needs these to do ANN search from an
  attacker-uncontrolled, server-computed embedding.
- `profession_jobs(profession_slug, match_count)` /
  `profession_news(profession_slug, match_count)` /
  `quiz_professions()` RPCs — `SECURITY DEFINER`, each re-applying the
  same row filters `vagas_ia`/`news`'s own RLS policies already enforce
  (active-only, published-only) plus `status = 'published'` on the
  profession itself and a `LEAST(GREATEST(...), 24)` clamp on
  `match_count`.
- 40 seeded professions across the 10 clusters, all `status='draft'`
  with `embedding = NULL` until the generator runs.

## Running the generator

Run in batches of up to 10 (`MAX_BATCH`) — with 40 draft professions,
that's about 4 runs to cover everything once:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/build-profession-index" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"batch": 10}'

# repeat ~4x — each run picks up the next batch of status='draft' professions
```

Response shape: `{ processed, skipped, estimated_cost_usd, errors }`.
`errors` is a list of `{ slug, message }` — a bad profession never
aborts the run (mirrors `extract-job-insights`'s per-item error
isolation). Common `message` values:
- `no_job_evidence` — refused per governance rule 3 above.
- `invalid_llm_response` — the model's JSON didn't pass validation
  (missing/out-of-range `exposure_score`, empty `summary`, etc.) — safe
  to retry.

Each run: embeds any profession missing `embedding` (skipped if already
embedded and `force` isn't set), finds up to 15 active jobs + 8 published
news items by cosine similarity, pulls the skills extracted from those
jobs (`job_skills`, populated by `extract-job-insights` — run that first
for the freshest skill vocabulary), asks gpt-4o-mini for the verdict, and
writes it with `status='review'`.

### Cost estimate

~US$0.01 per profession (one `text-embedding-3-small` call +
one `gpt-4o-mini` JSON-mode call with ~15 jobs + 8 news titles +
skills as context). The response's `estimated_cost_usd` field reports
the actual input/output token cost for that run; running all 40 once
costs well under $1.

## Review workflow (Studio)

1. Open the `professions` table in Supabase Studio, filter
   `status = 'review'`.
2. Read `summary`, `exposure_score`, `exposure_band`,
   `tasks_augmented`, `tasks_at_risk`, `bridge_skills` against
   `evidence_job_ids`/`evidence_news_ids` (spot-check a couple of the
   referenced jobs/news for sanity).
3. Adjust text directly in Studio if the phrasing is off (e.g. too
   absolute, awkward translation) — editing these columns doesn't
   require re-running the generator.
4. When satisfied: set `status = 'published'` and `reviewed_at = now()`.
   Only published professions appear in `professions_public`,
   `profession_jobs`, `profession_news`, `quiz_professions`, and the
   sitemap.
5. If the verdict is unusable (bad evidence, hallucinated skills): set
   `status = 'rejected'` (kept for audit, never re-surfaces) rather than
   deleting the row, or re-run the generator with `force: true` for that
   slug once the underlying descriptor/evidence improves.

## Regenerating one profession with `force`

After editing a profession's `descriptor` in the migration (see
"Editing a profession" below), or to refresh a stale verdict:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/build-profession-index" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"force": true, "slugs": ["advogado"]}'
```

`slugs` bypasses the `status = 'draft'` default targeting — with `force:
true` this re-embeds and re-evaluates the listed profession(s)
regardless of current status, and writes `status='review'` (governance
rule 4 — a previously published profession goes back to review, it does
not stay published with stale data).

## Editing a profession

1. Edit the `INSERT ... VALUES (...)` block in
   `supabase/migrations/012_professions.sql` (add a new row, or change
   an existing profession's `name`/`cluster`/`descriptor`/`sort_order`).
2. Re-run the migration: `supabase db push`. The
   `ON CONFLICT (slug) DO UPDATE` updates only the descriptive columns —
   `embedding`, `status`, and every generated field are left untouched,
   so existing verdicts don't silently disappear mid-edit.
3. If the `descriptor` changed, re-embed and re-evaluate with `force:
   true` (see above) so the new copy is actually reflected in the
   verdict — editing the descriptor alone does not change
   `embedding`/`summary`/etc.

## Contract reference

- Table `professions`: `slug` (pk), `name`, `cluster` (one of
  `negocios, saude, educacao, juridico, financas, marketing, tecnologia,
  criativo, operacoes, servicos`), `descriptor`, `exposure_score` (0-100),
  `exposure_band` (`baixa|media|alta`), `summary`, `tasks_augmented`,
  `tasks_at_risk`, `bridge_skills` (all `jsonb` string arrays),
  `evidence_job_ids` (`text[]`), `evidence_news_ids` (`uuid[]`),
  `embedding` (`vector(1536)`), `status`
  (`draft|review|published|rejected`), `generated_at`, `model`,
  `reviewed_at`, `sort_order`, `updated_at`.
- View `professions_public`: all columns except `embedding`/`descriptor`,
  `WHERE status = 'published'`.
- RPCs (granted to `anon`): `profession_jobs(profession_slug, match_count
  default 12)`, `profession_news(profession_slug, match_count default
  6)`, `quiz_professions()`.

Until a profession has both an embedding and `status='published'`,
`profession_jobs`/`profession_news` return an empty set for it (not an
error) — the profession page renders its empty states rather than
breaking.
