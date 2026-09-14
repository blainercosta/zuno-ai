# Job Insights — salary normalization + skills extraction

Extracts structured salary data and canonical skills from the free-text
`vagas_ia` columns (`salary`, `requirements`, `description_full`) using
`gpt-4o-mini`, then exposes aggregate-only stats (median salary by
seniority, top skills) to the public `/salarios-ia` page via two RPCs.

## Files

- `supabase/migrations/009_job_insights.sql` — schema (salary columns,
  `job_skills` table, RLS, `salary_stats`/`top_skills` RPCs).
- `supabase/functions/extract-job-insights/index.ts` — admin-secret
  protected extraction job.
- `hooks/useJobInsights.ts` — `useSalaryStats()` / `useTopSkills(days)`.
- `components/SalariosPage.tsx` — public page.

## 1. Apply the migration

```bash
npx supabase db push --project-ref "$SUPABASE_PROJECT_REF"
```

or paste `supabase/migrations/009_job_insights.sql` into the Supabase SQL
Editor. Idempotent — safe to re-run.

## 2. Deploy the function

```bash
./deploy-functions.sh
# or directly:
npx supabase functions deploy extract-job-insights --project-ref "$SUPABASE_PROJECT_REF"
```

Requires the `ADMIN_SECRET` and `OPENAI_API_KEY` secrets already used by
`backfill-embeddings` — no new secret to configure.

## 3. Run the extraction

```bash
curl -X POST \
  "https://<project-ref>.supabase.co/functions/v1/extract-job-insights" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"batch": 20}'
```

- `batch` (optional, default 20, max 50): how many not-yet-processed
  active jobs to pull per call. Jobs are grouped 10-per-OpenAI-request
  inside that batch, so `batch: 20` makes 2 OpenAI calls.
- Response: `{ processed, remaining, skills_upserted, estimated_cost_usd, errors }`.
- Safe to call repeatedly (cron or manually) — only jobs with
  `insights_extracted_at IS NULL` are selected, and the column is always
  stamped after an attempt (even when nothing was extracted), so nothing
  is ever reprocessed.

Call it repeatedly (loop, or a few times a day) until `remaining` hits 0,
then rely on the refresh cadence below for new jobs.

## Cost estimate

`gpt-4o-mini` pricing used for the in-function estimate: $0.15 / 1M input
tokens, $0.60 / 1M output tokens (verify current pricing before relying on
this for budgeting). Each OpenAI call bundles 10 jobs (~150-400 tokens of
requirements/description each, truncated) plus a fixed instruction
prompt — roughly 2,000-4,000 input tokens and 300-800 output tokens per
call of 10 jobs. For ~2,000 active jobs (full backfill, 200 calls):
roughly $0.10-$0.30 total. The function logs the actual token counts and
estimated cost per run (`[extract-job-insights] ... est_cost_usd=...`).

## Refresh cadence

New jobs ingested daily will have `insights_extracted_at IS NULL` and
salary/skills columns empty. Options:

- **Manual**: re-run the curl command above periodically (e.g. once a
  day, after ingestion).
- **pg_cron** (if enabled on the project): schedule a `net.http_post` to
  the function URL with the `x-admin-secret` header, e.g. weekly or
  daily. Example (adjust URL/secret and confirm `pg_net` is enabled):

  ```sql
  select cron.schedule(
    'extract-job-insights-daily',
    '0 6 * * *',
    $$
    select net.http_post(
      url := 'https://<project-ref>.supabase.co/functions/v1/extract-job-insights',
      headers := jsonb_build_object('x-admin-secret', '<ADMIN_SECRET>', 'Content-Type', 'application/json'),
      body := '{"batch": 50}'::jsonb
    );
    $$
  );
  ```

  A daily run with `batch: 50` comfortably keeps up with normal daily
  ingestion volume; increase batch or run twice if the backlog grows.

## Caveats

- `salary_stats` only returns a seniority group when `n >= 5` matching
  jobs exist (`HAVING COUNT(*) >= 5` in the RPC) — this avoids exposing
  what is effectively a single company's self-reported salary as a
  "market" figure. Groups below the threshold are silently omitted from
  the response, not zeroed out.
- Salaries are self-reported free text from job postings, not a
  systematic salary survey — treat this as directional, not
  authoritative. The page copy says as much ("Não é pesquisa salarial").
- Only jobs with `salary_period = 'month'` feed `salary_stats`; annual
  and hourly postings are extracted and stored but excluded from the
  monthly-median aggregate to avoid mixing units.
- Skills are extracted independently per job by an LLM call with
  `temperature: 0`, not a fixed taxonomy — near-duplicate skill names
  are asked to be normalized in the prompt, but drift is still possible
  over many runs. If skill fragmentation shows up in `top_skills`
  output, consider adding a periodic normalization pass (rename rows in
  `job_skills`) rather than re-extracting.
