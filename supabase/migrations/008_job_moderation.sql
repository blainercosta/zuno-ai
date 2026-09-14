-- =====================================================
-- JOB MODERATION — reactivate public /post-job with manual review
--
-- Context: post-job edge function now inserts vagas_ia rows with
-- status = 'pending' instead of 'active' (PRD P02). There is no
-- admin UI in this phase — moderation happens by hand in Supabase
-- Studio's table editor: filter status = 'pending', read the row,
-- then set status to 'active' or 'rejected' (see docs/JOB_MODERATION.md).
--
-- This migration only adds the columns/view/index that workflow
-- needs. It does not touch RLS policies.
--
-- RLS confirmation (read from 001_enable_rls_policies.sql):
--   CREATE POLICY "Public can read active jobs"
--   ON vagas_ia FOR SELECT TO anon, authenticated
--   USING (status = 'active');
-- That policy is a USING clause scoped to status = 'active', so it
-- already excludes 'pending' (and 'rejected') rows for anon/authenticated
-- readers without any change here. Direct INSERT/UPDATE/DELETE by anon
-- are separately blocked by the same migration's other policies, so
-- pending rows are only reachable via the service-role key (used by
-- the edge function and by Studio, which connects as postgres).
-- =====================================================

-- =====================================================
-- 1. Columns for moderation workflow
-- =====================================================

ALTER TABLE IF EXISTS vagas_ia
  ADD COLUMN IF NOT EXISTS moderation_note text;

ALTER TABLE IF EXISTS vagas_ia
  ADD COLUMN IF NOT EXISTS submitted_by_email text;

ALTER TABLE IF EXISTS vagas_ia
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- SHA-256 of the submitter IP, used only for per-IP rate limiting (raw IP never stored)
ALTER TABLE vagas_ia
  ADD COLUMN IF NOT EXISTS submitter_ip_hash text;
CREATE INDEX IF NOT EXISTS idx_vagas_ia_submitter_ip_hash_submitted_at
  ON vagas_ia (submitter_ip_hash, submitted_at DESC);

COMMENT ON COLUMN vagas_ia.moderation_note IS
  'Free-text note left by whoever reviewed this submission in Supabase Studio (why approved/rejected).';
COMMENT ON COLUMN vagas_ia.submitted_by_email IS
  'Optional contact e-mail provided by the person who submitted the job via /post-job.';
COMMENT ON COLUMN vagas_ia.submitted_at IS
  'When the job was submitted for moderation, distinct from posted_at (which reflects listing freshness).';

-- =====================================================
-- 2. Index to make the Studio moderation queue fast
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vagas_ia_status_posted_at
  ON vagas_ia (status, posted_at DESC);

-- =====================================================
-- 3. Read-only view of the moderation queue
--
-- security_invoker means this view enforces the RLS policies of the
-- querying role instead of the view owner's — so it is NOT a way to
-- bypass "Public can read active jobs". It is intentionally not
-- granted to anon/authenticated: only roles that already bypass RLS
-- (service_role, postgres — i.e. the edge function and Supabase
-- Studio) can select from it.
-- =====================================================

CREATE OR REPLACE VIEW public.pending_jobs
WITH (security_invoker = true) AS
SELECT
  id,
  job_id,
  job_title,
  company_name,
  job_url,
  submitted_by_email,
  submitted_at,
  posted_at,
  status,
  moderation_note
FROM vagas_ia
WHERE status = 'pending'
ORDER BY submitted_at DESC;

REVOKE ALL ON public.pending_jobs FROM anon, authenticated;
