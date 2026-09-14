-- =====================================================
-- JOB INSIGHTS — normalized salary + extracted skills
--
-- Adds structured salary fields (parsed from the free-text `salary`
-- column by extract-job-insights) and a job_skills table populated
-- by the same function. Two aggregate-only RPCs expose this data to
-- anon without ever leaking per-row salary/company data.
--
-- Idempotent: safe to re-run.
-- =====================================================

-- =====================================================
-- 1. vagas_ia — structured salary columns
-- =====================================================

ALTER TABLE vagas_ia
  ADD COLUMN IF NOT EXISTS salary_min integer,
  ADD COLUMN IF NOT EXISTS salary_max integer,
  ADD COLUMN IF NOT EXISTS salary_period text,
  ADD COLUMN IF NOT EXISTS salary_currency text DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS insights_extracted_at timestamptz;

-- Constraint added separately (can't IF NOT EXISTS a CHECK constraint directly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vagas_ia_salary_period_check'
  ) THEN
    ALTER TABLE vagas_ia
      ADD CONSTRAINT vagas_ia_salary_period_check
      CHECK (salary_period IN ('month', 'year', 'hour') OR salary_period IS NULL);
  END IF;
END $$;

COMMENT ON COLUMN vagas_ia.salary_min IS
  'Normalized lower bound parsed from the free-text `salary` column by extract-job-insights (gpt-4o-mini). NULL when salary is absent, "a combinar", or could not be parsed.';
COMMENT ON COLUMN vagas_ia.salary_max IS
  'Normalized upper bound. Equal to salary_min when the source text stated a single value rather than a range.';
COMMENT ON COLUMN vagas_ia.insights_extracted_at IS
  'Set by extract-job-insights on every attempt (even when nothing was extracted) so a job is never reprocessed.';

CREATE INDEX IF NOT EXISTS idx_vagas_ia_insights_extracted_at
  ON vagas_ia (insights_extracted_at)
  WHERE insights_extracted_at IS NULL;

-- =====================================================
-- 2. job_skills — normalized skills extracted per job
-- =====================================================

CREATE TABLE IF NOT EXISTS job_skills (
  id bigserial PRIMARY KEY,
  job_id text NOT NULL,
  skill text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (job_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills (skill);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills (job_id);

COMMENT ON TABLE job_skills IS
  'Normalized (lowercase, canonical) skills extracted per job by extract-job-insights. job_id references vagas_ia.job_id (the LinkedIn-style external id used across the app, not the UUID primary key) — no FK constraint since vagas_ia rows can be replaced by re-ingestion.';

ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read job skills" ON job_skills;
CREATE POLICY "Public can read job skills"
  ON job_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vagas_ia v
      WHERE v.job_id = job_skills.job_id AND v.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Block job_skills inserts" ON job_skills;
CREATE POLICY "Block job_skills inserts"
  ON job_skills FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block job_skills updates" ON job_skills;
CREATE POLICY "Block job_skills updates"
  ON job_skills FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block job_skills deletes" ON job_skills;
CREATE POLICY "Block job_skills deletes"
  ON job_skills FOR DELETE
  USING (false);
-- Writes only ever happen via the service-role client inside
-- extract-job-insights, which bypasses RLS entirely.

-- =====================================================
-- 3. RPC salary_stats — aggregate salary by seniority
--
-- Aggregates only: no per-row salary or company data is returned.
-- Groups with fewer than 5 matching jobs are dropped (HAVING) to
-- avoid de-anonymizing a single company's posted salary.
-- =====================================================

CREATE OR REPLACE FUNCTION salary_stats(
  seniority text DEFAULT NULL,
  remote_only boolean DEFAULT false
)
RETURNS TABLE (
  seniority_level text,
  n int,
  p25 int,
  median int,
  p75 int
)
LANGUAGE sql STABLE
SET search_path = public, pg_temp
AS $$
  SELECT
    v.seniority_level,
    COUNT(*)::int AS n,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (v.salary_min + v.salary_max) / 2.0)::int AS p25,
    PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY (v.salary_min + v.salary_max) / 2.0)::int AS median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (v.salary_min + v.salary_max) / 2.0)::int AS p75
  FROM vagas_ia v
  WHERE v.status = 'active'
    AND v.salary_min IS NOT NULL
    AND v.salary_max IS NOT NULL
    AND v.salary_period = 'month'
    AND (seniority IS NULL OR v.seniority_level = seniority)
    AND (remote_only IS NOT TRUE OR v.is_remote IS TRUE)
  GROUP BY v.seniority_level
  HAVING COUNT(*) >= 5
  ORDER BY median ASC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION salary_stats(text, boolean) TO anon, authenticated;

-- =====================================================
-- 4. RPC top_skills — aggregate skill frequency
--
-- Aggregates only: skill + share of postings, no per-job linkage.
-- =====================================================

CREATE OR REPLACE FUNCTION top_skills(
  days int DEFAULT 90,
  limit_n int DEFAULT 30
)
RETURNS TABLE (
  skill text,
  category text,
  n int,
  share numeric
)
LANGUAGE sql STABLE
SET search_path = public, pg_temp
AS $$
  WITH active_jobs AS (
    SELECT job_id
    FROM vagas_ia
    WHERE status = 'active'
      AND posted_at >= now() - (LEAST(GREATEST(COALESCE(days, 90), 1), 3650) || ' days')::interval
  ),
  total AS (
    SELECT COUNT(*)::numeric AS n FROM active_jobs
  ),
  skill_counts AS (
    SELECT
      js.skill,
      -- category can vary across jobs for the same skill name (rare
      -- tagging drift); take the most frequent one deterministically.
      MODE() WITHIN GROUP (ORDER BY js.category) AS category,
      COUNT(*)::int AS n
    FROM job_skills js
    JOIN active_jobs aj ON aj.job_id = js.job_id
    GROUP BY js.skill
  )
  SELECT
    sc.skill,
    sc.category,
    sc.n,
    CASE WHEN t.n > 0 THEN ROUND((sc.n / t.n) * 100, 1) ELSE 0 END AS share
  FROM skill_counts sc, total t
  ORDER BY sc.n DESC, sc.skill ASC
  -- Clamp: anon can call this RPC directly via PostgREST; never allow an unbounded dump
  LIMIT LEAST(GREATEST(COALESCE(limit_n, 30), 1), 50);
$$;

GRANT EXECUTE ON FUNCTION top_skills(int, int) TO anon, authenticated;
