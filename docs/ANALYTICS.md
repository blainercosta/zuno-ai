# Product Analytics (PostHog)

Zuno AI had zero product analytics in production (only Vercel Speed Insights,
which measures performance, not behavior). This adds PostHog as a
privacy-conscious, intentional-events layer. Sentry/error monitoring is out of
scope for now — product decided PostHog only.

## How it works

- `lib/analytics.ts` is the only file that imports `posthog-js`. Every call site
  goes through `initAnalytics`, `track`, `trackPageview`, or `identifyEmail`.
- **Silent no-op by default.** If `VITE_POSTHOG_KEY` is not set, or the visitor
  has `navigator.doNotTrack` enabled, every exported function becomes a no-op.
  This means dev, preview, and production are all analytics-off until the key
  is configured.
- `capture_pageview: false` is set on init because this is an SPA — pageviews
  are sent manually by `RouteTracker` (in `App.tsx`) on every route change,
  using `location.pathname` plus an **allowlisted** query string
  (`perfil`, `niche`, `categoria` only — everything else, including `ref` and
  anything that looks like `email`, is stripped before it reaches PostHog).
- `autocapture: false` — every event is explicit and named, no automatic click
  tracking noise.
- `persistence: 'localStorage+cookie'` and `capture_pageleave: true` are set to
  get reliable session/funnel data across page loads.

## Setting the key in Vercel

1. Vercel dashboard → Project → Settings → Environment Variables.
2. Add `VITE_POSTHOG_KEY` as a **Config** variable (not a Secret) — it's
   prefixed with `VITE_`, so Vite inlines it into the client bundle at build
   time. It is public by design (this is how every PostHog client-side key
   works), so treat it like any other public API key, not a credential.
3. Optionally add `VITE_POSTHOG_HOST` if not using the default
   `https://us.i.posthog.com` (e.g. self-hosted or EU-hosted PostHog).
4. Redeploy. Until step 2 is done, the app runs exactly as it does today —
   analytics stays a no-op.

## Event catalog

All events and their typed props live in `lib/analytics.ts` (`EVENTS` +
`EventProps`). Props are intentionally free of PII — no names, emails, or
phone numbers.

| Event | Props | Fired from |
|---|---|---|
| `job_viewed` | `job_id, company, is_remote, seniority` | `JobDetailPage` on load |
| `job_apply_clicked` | `job_id, company, source_page` | `JobsPage` (list), `JobDetailPage` |
| `job_shared` | `job_id, channel` | `JobDetailPage` share buttons |
| `news_viewed` | `news_id, category` | `NewsDetailPage` on load |
| `news_shared` | `news_id, channel` | `NewsDetailPage` share buttons |
| `checkout_started` | — | `CheckoutPage` after PIX is generated |
| `checkout_pix_opened` | `billing_id` | `CheckoutPage` when the PIX tab opens |
| `checkout_already_paid` | — | `CheckoutPage` when the API reports already paid |
| `beta_step_completed` | `step` | `BetaTesterPage`, `CheckoutSuccessPage` onboarding steps |
| `beta_signup_completed` | `niche, has_ref` | `BetaTesterPage`, `CheckoutSuccessPage`, `BetaAccessModal` |
| `referral_link_copied` | — | `BetaTesterPage` → `ReferralInvite` |
| `referral_shared` | `channel` | `BetaTesterPage` → `ReferralInvite` |
| `quiz_started` | — | `QuizPage` on mount |
| `quiz_step_completed` | `step` | `QuizPage` per step |
| `quiz_completed` | `profession_slug, perfil` | `QuizPage` on finish |
| `profession_viewed` | `slug, band` | `ProfessionPage` on load |
| `profession_shared` | `slug, channel` | `ProfessionPage` share buttons |
| `post_job_submitted` | — | `PostJobPage` on successful submit |
| `salarios_viewed` | — | defined in the catalog, **not wired yet** — `SalariosPage.tsx` is outside this change's scope |

`channel` is always one of `whatsapp \| twitter \| linkedin \| facebook \| copy`.

## Funnels to build first

1. **News engagement**: `news_viewed` → `news_shared`
2. **Job conversion**: `job_viewed` → `job_apply_clicked`
3. **Checkout conversion**: `checkout_started` → `checkout_pix_opened`
4. **Quiz → profession**: `quiz_started` → `quiz_completed` → `profession_viewed`

## LGPD notes

- `identifyEmail(email)` never sends a raw email to PostHog. It hashes the
  (trimmed, lowercased) email with SHA-256 via `crypto.subtle` and calls
  `posthog.identify(hashedEmail)`. Only non-PII props (currently `niche`, via
  `posthog.people.set`) are attached to the person.
- Analytics respects `navigator.doNotTrack` — if set, `initAnalytics` never
  calls `posthog.init` and every subsequent call is a no-op.
- No event prop in the catalog carries a name, email, or phone number.
- **Pending**: there is no privacy policy page on the site yet. Before
  turning the PostHog key on in production, product/legal should add one and
  link it from wherever collection forms live (checkout, beta signup, post-job).
