# Referral loop (O13)

Zero-cost referral loop for the beta waitlist, per opportunity O13 in
`docs/PRODUCT_OPPORTUNITIES.md`: every person who signs up gets a personal
link; anyone who signs up through it counts toward their referral total,
shown on the success screen.

## Why there are two tables, not one

O13 was written assuming a single flow ("beta_waitlist" + "waitlist-signup").
In the actual codebase there are **two independent signup flows** that both
end at a "you're in" screen:

| Flow | Component | Edge function | Table | Fields |
|---|---|---|---|---|
| 5-step `/beta` page | `components/BetaTesterPage.tsx` | `subscribe` | `subscribers` | name, email, instagram, whatsapp, niche, source, utm_* |
| Landing-page modal | `components/BetaAccessModal.tsx` | `waitlist-signup` | `beta_waitlist` | name, email, phone |

Both are real signup surfaces, so migration `011_referrals.sql` adds the
identical referral columns/trigger to **both** tables, and there are **two**
RPCs (`referral_stats` for `beta_waitlist`, `subscriber_referral_stats` for
`subscribers`) rather than one. If the two flows are ever consolidated, drop
whichever pair becomes dead code.

`beta_waitlist` schema was inferred from `supabase/functions/waitlist-signup/index.ts`'s
insert — there is no DDL for it in this repo (unlike `subscribers`, which has
`docs/supabase-subscribers-setup.sql`). Assumed columns: `id, name, email,
phone, created_at`.

## Schema

Added to both `beta_waitlist` and `subscribers` by `supabase/migrations/011_referrals.sql`:

- `referral_code text unique` — this row's own shareable code. Assigned
  automatically by a `BEFORE INSERT` trigger (`set_referral_code()`) when
  `NULL`, as 8 lowercase hex characters (`encode(gen_random_bytes(6), 'hex')`,
  truncated). The trigger retries on collision, though at waitlist scale
  (48 bits of entropy) that never fires in practice.
- `referred_by text` — the `referral_code` of whoever referred this row, or
  `NULL`. No foreign key: a referral code can point to a row in the *other*
  table, and an invalid/stale code must never block a signup, so it's
  validated in the edge function (silently ignored if not found) rather than
  enforced by the database.
- An index on `referred_by` on each table, for the count lookup below.

RLS is untouched: `anon` still cannot `SELECT` from either table. The only
way to read anything derived from them pre-login is:

```sql
-- beta_waitlist
select referral_stats('a1b2c3d4');            -- { referrals_count: int }

-- subscribers
select subscriber_referral_stats('a1b2c3d4');  -- { referrals_count: int }
```

Both are granted to `anon, authenticated` and return only a count — no name,
email, or other PII for the code being queried.

## Flow

1. Someone finishes a signup and gets back their own `referral_code` in the
   edge function's success response.
2. The success screen shows `https://www.usezuno.app/beta?ref=<code>` with a
   copy button and a WhatsApp share button, plus "N pessoas entraram pelo seu
   link" once N > 0 (fetched via the matching RPC).
3. A visitor opens that link. `BetaTesterPage` reads `?ref=` on mount and
   stores it in `sessionStorage.zuno_ref` so it survives all 5 steps even if
   the tab is closed and reopened; `BetaAccessModal` reads the same key at
   submit time. `?niche=` is also read on `/beta` and preselects a niche if
   it matches `SUBSCRIBER_NICHES`.
4. On submit, the stored `ref` is sent to the edge function
   (`subscribe` or `waitlist-signup`). The function checks whether a row with
   that `referral_code` exists in the relevant table; if it does, the new
   row's `referred_by` is set to it. If not — expired link, typo, garbage —
   it's silently ignored and the signup proceeds with `referred_by: null`.
5. On a duplicate-email submit, the function still looks up and returns that
   existing row's `referral_code`, so a returning visitor sees their share
   link again instead of an error with no way forward.

## Seeing top referrers

Read-only, run in the Supabase SQL editor (service role / dashboard only —
there is no admin UI for this):

```sql
-- beta_waitlist
select referred_by as referral_code, count(*) as referrals
from beta_waitlist
where referred_by is not null
group by referred_by
order by referrals desc
limit 20;

-- subscribers
select referred_by as referral_code, count(*) as referrals
from subscribers
where referred_by is not null
group by referred_by
order by referrals desc
limit 20;

-- to see who owns a given code (has the PII the RPCs deliberately withhold)
select name, email, referral_code, created_at
from subscribers -- or beta_waitlist
where referral_code = 'a1b2c3d4';
```

## Future reward (not implemented)

No reward is granted today — the loop is purely social ("look how many
people you brought in"). If/when a reward is added, options in rough order
of implementation cost:

1. **Static milestone badge** on the success screen (e.g. "you've referred
   5 people") — pure frontend, reads the existing RPC, no schema change.
2. **Priority beta access** — flip a `priority` boolean (new column) when
   `referrals_count` crosses a threshold; read by whatever process invites
   people off the waitlist.
3. **Monetary/credit reward** — needs an idempotent ledger (a `referral_rewards`
   table keyed by `(referrer_code, referred_id)` with a unique constraint) so
   a referral is never paid out twice; out of scope for a zero-cost loop and
   should get its own PRD before building.
