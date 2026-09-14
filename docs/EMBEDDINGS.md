# Embeddings — vagas_ia & news

## Problem this fixes

`similar-jobs` and `similar-news` used to call `openai.embeddings.create` once
per candidate row on **every request** — up to 50 jobs (or 60 news, across
`news` + `posts`) plus the current item, per page view. That's O(n) OpenAI
round-trips per request instead of O(1), and it does zero caching: the same
job's embedding gets recomputed on every single visitor.

Migration `007_persist_embeddings.sql` adds a persisted `embedding
vector(1536)` column (+ `embedding_updated_at`) to `vagas_ia` and `news`, an
HNSW (cosine) ANN index on each, and two RPCs — `match_jobs` / `match_news` —
that do the candidate search entirely inside Postgres via the `<=>` operator.

The edge functions now:
1. Load the current item. If it has no embedding yet, compute it once via
   OpenAI and persist it (service-role client — RLS blocks anon/authenticated
   writes either way).
2. Call `match_jobs` / `match_news` for the ranked candidates — one Postgres
   RPC call, zero additional OpenAI calls.

Net effect: first view of any given job/news = 1 OpenAI call (embed + persist).
Every subsequent view of that same item, by anyone = 0 OpenAI calls.

## Applying the migration

```bash
supabase db push
# or, against a specific project:
supabase db push --db-url "$SUPABASE_DB_URL"
```

The migration is idempotent (`add column if not exists`, `create index if not
exists`, `create or replace function`) — safe to re-run.

**Unconfirmed assumption:** `news.embedding` may already exist as
`vector(1536)` from `002_ingestion_engine.sql` (it was referenced by the now-
dropped `find_similar_news` RPC). This wasn't independently verified against
the live schema. If the column already exists with a different type/dimension,
the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` will error at apply time rather
than silently doing the wrong thing — if that happens, reconcile manually
(e.g. drop and recreate the column, or adjust the migration to match).

## Backfilling existing rows

New rows get embedded lazily (see below), but existing `vagas_ia`/`news` rows
with `embedding IS NULL` won't get a similarity match until backfilled, and
similar-jobs/similar-news would otherwise embed them one at a time (still
correct, just slower and one call per unique item on its first view).

`backfill-embeddings` embeds a batch of NULL-embedding rows per call, using
OpenAI's array-input embeddings endpoint (one HTTP call per batch instead of
one per row). It's idempotent and safe to re-run or call on a loop/schedule
until `remaining` hits 0.

Requires an `ADMIN_SECRET` env var set on the function, sent back as the
`x-admin-secret` header:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/backfill-embeddings" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"table": "vagas_ia", "batch": 100}'

curl -X POST "https://<project-ref>.supabase.co/functions/v1/backfill-embeddings" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"table": "news", "batch": 100}'
```

Response shape: `{ table, processed, remaining, errors: [{ id, message }] }`.
Re-run (or loop) until `remaining` is `0`.

### One-off cost estimate

`text-embedding-3-small` is $0.02 / 1M tokens. For ~2,000 jobs at roughly
600 tokens each (title + company + location + seniority + type + full
description + requirements):

```
2,000 jobs × 600 tokens = 1,200,000 tokens ≈ $0.024
```

News articles are shorter (title + category + subtitle + first 500 chars of
content, HTML stripped) — a few hundred to a thousand tokens each — so a
one-time backfill of the current news volume is well under a cent as well.
This is a negligible, one-time cost; the ongoing cost is ~1 embedding call
per newly-published job/news article (embedded lazily on its first view, or
picked up by the next backfill run).

## Kubo webhook does not write embeddings

`api/kubo-ingest.ts` inserts `news` rows with `status: 'published'`,
`category`, `raw_category`, etc., but never sets `embedding`. Freshly ingested
news are therefore embedded lazily, on the first `similar-news` request that
touches them (or whenever `backfill-embeddings` next runs against `news`).
There is currently no automatic trigger tying ingestion to embedding — if
near-real-time similarity is ever needed for brand-new articles, either call
`backfill-embeddings` on a schedule (e.g. `pg_cron` + `pg_net`, following the
pattern already scaffolded — then removed — in
`002_ingestion_engine.sql`/`005_remove_local_ingestion.sql`), or have
`kubo-ingest` embed synchronously at insert time.

## Scope note: `posts` table

`similar-news` also merges candidates from the legacy `posts` table (integer
PK, no `embedding` column). That table was out of scope here — it's not
mentioned in the schema this migration touches, and its exact schema wasn't
independently confirmed. `match_news` only searches `news`; `posts` rows are
still included in the response, ranked by category match only (same fallback
logic that existed before), with zero embedding calls. If `posts` ever needs
real semantic ranking, it would need its own `embedding` column, index, and
`match_posts` RPC following the same pattern as `match_news`.
