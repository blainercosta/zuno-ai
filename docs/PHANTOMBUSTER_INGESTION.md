# Phantombuster → vagas_ia — automated LinkedIn job ingestion

Until now jobs were inserted by hand: run a Phantom, download the export,
paste rows into `vagas_ia`. This flow removes the manual step and makes the
searches themselves data-driven.

```
job_search_queries ──► GET /api/phantombuster/search-urls  (CSV)
                              │
                              ▼  spreadsheet input
                  Phantombuster "LinkedIn Job Scraper" (scheduled daily)
                              │
                              ▼  webhook on finish
                 POST /api/phantombuster/webhook?secret=…
                              │  (Vercel relay → Supabase edge function)
                              ▼
        phantombuster edge fn: map → filter → dedupe → insert/update
                              │
              ┌───────────────┼──────────────────┐
              ▼               ▼                  ▼
        vagas_ia        ingestion_runs     backfill-embeddings +
   (active | pending)   (counters/errors)  extract-job-insights
```

## Files

| File | Role |
|---|---|
| `supabase/migrations/013_phantombuster_ingestion.sql` | provenance columns, `job_search_queries`, `ingestion_runs`, unique `job_id` |
| `supabase/functions/phantombuster/index.ts` | search-urls / webhook / ingest / launch |
| `api/phantombuster/[action].ts` | Vercel relay (stable public URL for Phantombuster) |
| `docs/JOB_MODERATION.md` | how `pending` rows are reviewed (unchanged) |

## 1. Apply the migration

```bash
npx supabase db push --project-ref "$SUPABASE_PROJECT_REF"
```

The unique index on `vagas_ia.job_id` is skipped with a `WARNING` if
duplicates already exist. Find and resolve them, then re-run:

```sql
select job_id, count(*), array_agg(id order by created_at) as ids
from vagas_ia group by job_id having count(*) > 1;

-- keep the oldest row of each group, mark the rest rejected (nothing deleted)
update vagas_ia v set status = 'rejected', moderation_note = 'duplicate job_id'
from (
  select id, row_number() over (partition by job_id order by created_at) rn
  from vagas_ia
) d where d.id = v.id and d.rn > 1;
```

## 2. Secrets

```bash
npx supabase secrets set \
  PHANTOMBUSTER_API_KEY=... \
  PHANTOMBUSTER_AGENT_ID=... \
  PHANTOMBUSTER_WEBHOOK_SECRET="$(openssl rand -hex 24)" \
  --project-ref "$SUPABASE_PROJECT_REF"
```

- `PHANTOMBUSTER_API_KEY` — Phantombuster → Settings → API key (used by
  `launch` and by the result fallback fetch).
- `PHANTOMBUSTER_AGENT_ID` — numeric id in the Phantom's URL.
- `PHANTOMBUSTER_WEBHOOK_SECRET` — any random string. Phantombuster cannot
  send headers, so it travels in `?secret=`.
- Optional: `PHANTOMBUSTER_AUTO_APPROVE=false` (everything lands `pending`),
  `PHANTOMBUSTER_MAX_AGE_DAYS=45`.
- Already present: `ADMIN_SECRET`, `OPENAI_API_KEY` (enrichment chain).

Vercel env vars for the relay: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
(the relay adds them as `apikey`/`Authorization` so it works whether or not
JWT verification is on for the function).

## 3. Deploy

```bash
./deploy-functions.sh          # includes phantombuster
git push                       # Vercel picks up api/phantombuster/[action].ts
```

## 4. Configure the Phantom (one time)

Use **LinkedIn Job Scraper** (or the equivalent job-search export Phantom).

1. **Input** → "Spreadsheet URL":
   `https://www.usezuno.app/api/phantombuster/search-urls?secret=<SECRET>`
   Column to read: `searchUrl`.
2. **Behaviour**: results per search ~25–50; enable "only new results /
   skip already processed" if the Phantom offers it. Dedupe also happens on
   our side, so re-scraping is safe.
3. **Schedule**: repeated launch, once a day (LinkedIn search URLs use
   `f_TPR=r86400` = last 24h, so daily runs see everything).
4. **Notifications → Advanced → Webhook URL**:
   `https://www.usezuno.app/api/phantombuster/webhook?secret=<SECRET>`

Phantombuster gives the webhook 11 s. The function answers `202` at once and
ingests in the background (`EdgeRuntime.waitUntil`).

### How results are read (in order)

1. `resultObject` inside the webhook body (when the Phantom sets it)
2. `GET /api/v2/containers/fetch-result-object?id=<containerId>`
3. Cumulative `result.json` of the agent on S3 (`agents/fetch` → `s3Folder`)

Option 3 returns every job the Phantom ever scraped. That's fine: rows are
deduped on `job_id` and anything older than `MAX_AGE_DAYS` is skipped.

## 5. Managing searches

Searches live in `job_search_queries`. Add, disable or reprioritise with SQL —
no redeploy:

```sql
insert into job_search_queries (label, keywords, remote_only, priority)
values ('Engenheiro de IA remoto', 'engenheiro de IA', true, 15);

update job_search_queries set is_active = false where label = 'Deep learning';
```

Each row becomes
`https://www.linkedin.com/jobs/search/?keywords=…&location=Brasil&geoId=106057199&f_TPR=r86400&sortBy=DD`
(`f_WT=2` when `remote_only`). Lower `priority` runs first — put the searches
that matter most at the top in case the Phantom hits its per-launch limit.

Tuning tips:

- Keep searches specific. `"inteligência artificial"` in Brazil returns
  hundreds of listings a day, many not AI roles; the relevance filter sends
  those to `pending`.
- Set `time_window_seconds` to `604800` (7 days) on a new query for its first
  run, then back to `86400`.
- `last_run_at` on each query is stamped every time the Phantom fetches the
  CSV — a query with a stale `last_run_at` means the Phantom is not running.

## 6. Ingest rules

| Rule | Behaviour |
|---|---|
| `job_id` missing | extracted from `/jobs/view/<id>`; row skipped if none |
| not `https`, shortener URL, no title/company | skipped (same rules as `/post-job`) |
| `posted_at` older than `MAX_AGE_DAYS` | skipped |
| `job_id` already in `vagas_ia` | only `last_seen_at` + null fields updated; **status untouched** |
| new + title/description match `AI_KEYWORDS` | `status = 'active'` |
| new + no match | `status = 'pending'` → moderate as in `docs/JOB_MODERATION.md` |
| after inserts | `backfill-embeddings` + `extract-job-insights` triggered (batch 50) |

Provenance: `source = 'phantombuster'`, `source_run_id = containerId`,
`last_seen_at`. Jobs whose `last_seen_at` stops advancing have left LinkedIn:

```sql
-- candidates to expire
select job_id, job_title, company_name, last_seen_at
from vagas_ia
where source = 'phantombuster' and status = 'active'
  and last_seen_at < now() - interval '14 days';
```

## 7. Operating

Every run writes to `ingestion_runs`:

```sql
select id, external_run_id, status, rows_received, rows_inserted, rows_updated,
       rows_skipped, rows_pending, unknown_columns, errors, started_at, finished_at
from ingestion_runs order by started_at desc limit 20;
```

- `unknown_columns` non-empty → the Phantom's output changed; add the new
  name to `ALIASES` in `index.ts`.
- `errors` contains `skip:<reason>=<n>` counters (`too_old`, `missing_job_id`,
  `missing_title`, …) plus real errors.

Manual operations (all need `x-admin-secret`):

```bash
BASE="https://<project-ref>.supabase.co/functions/v1/phantombuster"

# launch the Phantom now (uses its saved config)
curl -X POST "$BASE/launch" -H "x-admin-secret: $ADMIN_SECRET"

# re-ingest a finished run
curl -X POST "$BASE/ingest" -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" -d '{"containerId":"3358014727012763"}'

# ingest a downloaded export (result.json) without Phantombuster API
curl -X POST "$BASE/ingest" -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" -d "{\"rows\": $(cat result.json)}"

# preview the CSV the Phantom receives
curl "$BASE/search-urls" -H "x-admin-secret: $ADMIN_SECRET"
```

### Optional: launch from Postgres instead of Phantombuster's scheduler

If you prefer one scheduler, use `pg_cron` + `pg_net` (both available on
Supabase) and disable the repeated launch in Phantombuster:

```sql
select cron.schedule(
  'phantombuster-daily-launch', '0 9 * * *',  -- 09:00 UTC = 06:00 BRT
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/phantombuster/launch',
    headers := jsonb_build_object('Content-Type','application/json','x-admin-secret', '<ADMIN_SECRET>'),
    body := '{}'::jsonb
  );
  $$
);
```

Store `<ADMIN_SECRET>` in Supabase Vault rather than inline if the SQL is
committed anywhere.

## Known limits

- Phantombuster output column names differ between Phantoms and versions.
  The mapper accepts common aliases (`jobUrl`/`url`, `title`/`jobTitle`,
  `companyName`/`company`, `postDate`/`postedDate`, …). Check
  `unknown_columns` after the first run.
- Relevance filter is keyword-based, not an LLM. False negatives go to
  `pending`, never lost. False positives (non-AI job matching e.g. "AI" in
  a company name) go `active`; reject them in Studio — the rejection sticks
  across re-scrapes.
- LinkedIn `description` from the scraper is a single blob; it lands in
  `description_full`. `responsibilities`/`requirements` stay null (the
  detail page already falls back to `description_full`).
