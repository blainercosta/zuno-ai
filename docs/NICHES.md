# Niches — "IA para [nicho]" vertical hubs

## What this is

Vertical landing pages at `/ia-para` (index) and `/ia-para/:slug` (one per
niche) that show news and jobs filtered to a specific non-tech audience —
"IA para Educação", "IA para Saúde & Bem-estar", etc. The 7 niches mirror
`SUBSCRIBER_NICHES` in `types/subscriber.ts` (everything except `'Outro'`,
which has no fixed identity to build a hub around).

Same architecture as `docs/EMBEDDINGS.md`: one embedding per niche
(`niches.embedding vector(1536)`, computed once from the niche's
name/headline/description/keywords), then ANN search against the existing
`news.embedding` / `vagas_ia.embedding` columns via `<=>` (cosine distance).
Zero per-request OpenAI calls.

## Applying the migration

```bash
supabase db push
```

`010_niches.sql` is idempotent: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF
NOT EXISTS`, `CREATE OR REPLACE FUNCTION/VIEW`, and the seed `INSERT ... ON
CONFLICT (slug) DO UPDATE` (which never touches `embedding` — see "Editing a
niche" below). Safe to re-run.

This creates:
- `niches` table — locked down for anon/authenticated (RLS `USING (false)` +
  `REVOKE ALL`), because a straightforward "anon can read active niches"
  policy would also expose the `embedding` column (RLS is row-level, not
  column-level).
- `niches_public` view — the only public surface, same columns minus
  `embedding`. Granted `SELECT` to `anon, authenticated`.
- `niche_news(niche_slug, match_count)` / `niche_jobs(niche_slug,
  match_count)` RPCs — `SECURITY DEFINER` (required to read
  `niches.embedding`, which anon has no grant on), each re-applying the same
  row filters `news`/`vagas_ia`'s own RLS policies already enforce
  (published-only, active-only) plus a 90-day recency window for news and a
  `LEAST(GREATEST(...), 24)` clamp on `match_count` either way.

## Seeding niche embeddings

The migration inserts the 7 niches with `embedding = NULL`. Run `seed-niches`
once after applying the migration:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/seed-niches" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

This embeds every active niche whose `embedding IS NULL`. Response shape:
`{ processed, errors, force }`.

Until a niche has an embedding, `niche_news`/`niche_jobs` return an empty set
for it (not an error) — the niche page renders its empty states ("Ainda não
temos notícias/vagas suficientes...") rather than breaking.

## Adding or editing a niche

1. Edit the `INSERT ... VALUES (...)` block in
   `supabase/migrations/010_niches.sql` (add a new row, or change an
   existing niche's `name`/`headline`/`description`/`keywords`).
2. Re-run the migration: `supabase db push`. The `ON CONFLICT (slug) DO
   UPDATE` updates the descriptive columns but leaves `embedding` untouched
   — so existing niches don't silently lose their ranking mid-edit.
3. Re-embed the changed/new niche(s) with `force: true` so the new copy is
   actually reflected in `embedding`:

   ```bash
   curl -X POST "https://<project-ref>.supabase.co/functions/v1/seed-niches" \
     -H "x-admin-secret: $ADMIN_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"force": true}'
   ```

   `force: true` re-embeds every active niche (there are only 7 — this is
   cheap, see below), not just the one you changed. There's no per-slug
   selector today; add one if the niche count grows enough to matter.
4. If you add a new slug, also add its route to
   `public/sitemap-pages.xml` (`/ia-para/<slug>`) and give it a sensible
   `sort_order` so it lands where you expect on `/ia-para` and the HomePage
   section.

## Cost

`text-embedding-3-small` is $0.02 / 1M tokens. Each niche's embedding text is
name + headline + description + keywords — a couple hundred tokens at most.

```
7 niches × ~250 tokens ≈ 1,750 tokens ≈ $0.000035
```

Effectively free, even re-run with `force: true` on every copy edit.

## Frontend pieces

- `hooks/useNicheFeed.ts` — `useNiches()` reads `niches_public` ordered by
  `sort_order`; `useNicheFeed(slug)` calls both RPCs and maps the (narrower)
  RPC row shapes onto `News`/`Job` so the existing preview cards can render
  them unmodified.
- `components/PreviewCards.tsx` — `NewsPreviewCard`/`JobPreviewCard`,
  extracted from `HomePage.tsx` (previously defined locally there) so
  `NichePage.tsx` can reuse the same look without duplicating markup.
  `HomePage.tsx`'s own rendering is unchanged.
- `components/NichesIndexPage.tsx` (`/ia-para`) — grid of all niches.
- `components/NichePage.tsx` (`/ia-para/:slug`) — hero, up to 12 news, up to
  12 jobs, WhatsApp-first share buttons, and a CTA to `/beta?niche=<name>`.
  An unknown slug (once niches have loaded) redirects to `/ia-para`.
- `components/HomePage.tsx` — new "IA para a sua área" section linking to
  each niche.

## Known limitation

`/beta?niche=<name>` is a hint, not a guarantee — `BetaTesterPage.tsx` was
being edited concurrently by another agent working on
`components/BetaTesterPage.tsx` and `supabase/functions/waitlist-signup/`,
so this change deliberately does not touch either file. Today the query
param is inert; `BetaTesterPage` would need a follow-up to read
`?niche=` and preselect it in the niche step.
