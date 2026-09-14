# Job Moderation

`/post-job` is public in production again. To keep quality up without building
an admin UI yet, every submission lands as `status = 'pending'` and is
reviewed by hand in Supabase Studio before it becomes visible on `/jobs`.

## Why pending jobs don't leak to the public site

`vagas_ia` has RLS policy `"Public can read active jobs"` (from
`001_enable_rls_policies.sql`):

```sql
CREATE POLICY "Public can read active jobs"
ON vagas_ia FOR SELECT
TO anon, authenticated
USING (status = 'active');
```

The `USING (status = 'active')` clause means `pending` (and `rejected`) rows
are invisible to `anon`/`authenticated` no matter how they're queried — the
frontend, `/jobs`, search, everything goes through this same policy. Only the
service-role key (used by the `post-job` edge function, and by Supabase
Studio, which connects as `postgres`) can see pending rows. No RLS change was
needed for this — `008_job_moderation.sql` only adds columns/index/view.

## How to moderate

1. Open **Supabase Studio → Table Editor → vagas_ia** (or query
   `public.pending_jobs`, a read-only view scoped to `status = 'pending'`,
   ordered by `submitted_at desc` — not granted to `anon`/`authenticated`).
2. Filter: `status = eq.pending`.
3. Read the job. Check for:
   - Real company / real opportunity (not a scam, MLM, or unrelated ad)
   - `job_url` points to an actual application page
   - Content isn't copy-pasted spam or duplicate of an existing active job
4. Decide:
   - **Approve** → set `status = 'active'`
   - **Reject** → set `status = 'rejected'`
5. Optionally write a short note in `moderation_note` (why you approved/rejected —
   useful if the same company submits again, or if you need to explain a
   rejection later).

### SQL snippets

List the queue (oldest first, so nothing sits forever):

```sql
select id, job_title, company_name, job_url, submitted_by_email, submitted_at
from public.pending_jobs
order by submitted_at asc;
```

Approve one job:

```sql
update vagas_ia
set status = 'active', moderation_note = 'Approved: real listing, checked company site'
where id = <id>;
```

Reject one job:

```sql
update vagas_ia
set status = 'rejected', moderation_note = 'Rejected: shortened URL redirected to unrelated survey'
where id = <id>;
```

Bulk-reject anything older than 30 days still pending (stale, likely no longer relevant):

```sql
update vagas_ia
set status = 'rejected', moderation_note = 'Auto-rejected: pending > 30 days'
where status = 'pending' and submitted_at < now() - interval '30 days';
```

## Anti-spam controls already in place (`supabase/functions/post-job/index.ts`)

These run server-side before a row is ever inserted, so most spam never
reaches the moderation queue:

- **Honeypot** — hidden `website` field. Real users never see or fill it
  (`display` via absolute off-screen positioning + `tabIndex={-1}` +
  `autoComplete="off"` in `PostJobPage.tsx`). If it arrives non-empty, the
  function returns a fake success response without writing to the database —
  so bots don't learn they were blocked.
- **Minimum content length** — `about_company` + `responsibilities` +
  `requirements` + `description_full` combined must be at least 80 characters.
  Filters out empty-ish spam submissions that only fill required fields with
  the bare minimum.
- **URL shortener denylist** — `job_url` is rejected if its host is `bit.ly`,
  `t.co`, `tinyurl.com` (or a subdomain of one). Shorteners mask the real
  destination and are common in spam/phishing links.
- **HTTPS required** — `job_url` must use `https://`.
- **Rate limiting** — unchanged from before: max 3 submissions per 5-minute
  window across all IPs (see `index.ts`, this is intentionally coarse; revisit
  if it starts blocking legitimate bursts).
- **Optional contact e-mail** — `submitted_by_email`, if provided, must match
  a basic e-mail pattern. Stored so moderators can follow up (e.g. to ask
  a company to fix a broken `job_url`) but never shown publicly.

None of this replaces human review — it just reduces how much junk a human
has to look at.
