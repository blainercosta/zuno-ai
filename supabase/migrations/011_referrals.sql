-- =====================================================
-- REFERRALS — zero-cost referral loop (opportunity O13)
--
-- Adds a referral_code (given out) and referred_by (redeemed) pair to
-- every table that captures a beta signup, so any signup can share a
-- personal link and see how many people joined through it.
--
-- Two tables get this treatment, not one:
--   - beta_waitlist  → written by supabase/functions/waitlist-signup,
--                      the endpoint BetaAccessModal.tsx posts to.
--   - subscribers    → written by supabase/functions/subscribe, the
--                      endpoint the actual 5-step /beta flow
--                      (BetaTesterPage.tsx) posts to.
-- See docs/REFERRALS.md for why both exist and are documented in
-- full.
--
-- No FK between referral_code and referred_by: a referrer's row can
-- be on either table and we never want a bad/stale ref value to block
-- a signup, so it is validated (or silently dropped) in the edge
-- function instead of at the database layer.
--
-- Idempotent: safe to re-run.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. beta_waitlist — referral columns
-- =====================================================

ALTER TABLE IF EXISTS beta_waitlist
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_waitlist')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'beta_waitlist_referral_code_key'
     ) THEN
    ALTER TABLE beta_waitlist ADD CONSTRAINT beta_waitlist_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_beta_waitlist_referred_by ON beta_waitlist (referred_by);

-- Backfill existing rows before the NOT NULL-by-trigger default applies to new ones
UPDATE beta_waitlist
SET referral_code = encode(gen_random_bytes(8), 'hex')
WHERE referral_code IS NULL;

-- =====================================================
-- 2. subscribers — same referral columns
--
-- subscribers is provisioned out-of-band via
-- docs/supabase-subscribers-setup.sql (run manually in the Supabase
-- SQL editor, not tracked as a migration) — guarded with IF EXISTS
-- so this migration no-ops cleanly in an environment that hasn't run
-- that script yet.
-- =====================================================

ALTER TABLE IF EXISTS subscribers
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_referral_code_key'
     ) THEN
    ALTER TABLE subscribers ADD CONSTRAINT subscribers_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscribers_referred_by ON subscribers (referred_by);

UPDATE subscribers
SET referral_code = encode(gen_random_bytes(8), 'hex')
WHERE referral_code IS NULL;

-- =====================================================
-- 3. Shared trigger — assigns referral_code to new rows
--
-- Loops on collision (64 bits of entropy from gen_random_bytes(8),
-- collisions are already near-impossible at waitlist scale, but the
-- retry is nearly free and removes any doubt).
-- =====================================================

CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  candidate text;
  collision boolean;
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    candidate := encode(gen_random_bytes(8), 'hex');
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE referral_code = $1)', TG_TABLE_NAME)
      INTO collision
      USING candidate;
    EXIT WHEN NOT collision;
  END LOOP;

  NEW.referral_code := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_beta_waitlist_referral_code ON beta_waitlist;
CREATE TRIGGER trg_beta_waitlist_referral_code
  BEFORE INSERT ON beta_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers') THEN
    DROP TRIGGER IF EXISTS trg_subscribers_referral_code ON subscribers;
    CREATE TRIGGER trg_subscribers_referral_code
      BEFORE INSERT ON subscribers
      FOR EACH ROW
      EXECUTE FUNCTION set_referral_code();
  END IF;
END $$;

-- =====================================================
-- 4. RPCs — referral counts only, no PII
--
-- anon stays blocked from SELECT on beta_waitlist/subscribers
-- (existing RLS policies, untouched); these RPCs are the only way to
-- read anything derived from either table pre-login, and they return
-- nothing but a count for the given code.
-- =====================================================

CREATE OR REPLACE FUNCTION referral_stats(code text)
RETURNS TABLE (referrals_count int)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::int AS referrals_count
  FROM beta_waitlist
  -- 16 hex chars = 64 bits: not enumerable. Reject anything else outright.
  WHERE code ~ '^[0-9a-f]{16}$' AND referred_by = code;
$$;

GRANT EXECUTE ON FUNCTION referral_stats(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION subscriber_referral_stats(code text)
RETURNS TABLE (referrals_count int)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::int AS referrals_count
  FROM subscribers
  -- 16 hex chars = 64 bits: not enumerable. Reject anything else outright.
  WHERE code ~ '^[0-9a-f]{16}$' AND referred_by = code;
$$;

GRANT EXECUTE ON FUNCTION subscriber_referral_stats(text) TO anon, authenticated;
