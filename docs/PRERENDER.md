# Prerendering for crawlers

The SPA renders everything client-side, so crawlers that don't execute
JavaScript (or execute it unreliably) would otherwise see an empty shell.
`vercel.json` intercepts requests from known crawler user agents on specific
routes and serves them a server-rendered HTML page instead — full `<title>`,
meta description, canonical, Open Graph/Twitter tags, JSON-LD, and visible
body content (headings, paragraphs, lists) that doesn't depend on JS.

Real visitors (non-crawler user agents) always get the normal SPA — the
routing rule only matches when the `user-agent` header matches the crawler
pattern.

## Prerendered routes

| Route | Handler | Query |
|---|---|---|
| `/noticias-ia/:slug` | `api/og-news.ts` | — |
| `/job/:slug` | `api/og-job.ts` | — |
| `/profissoes` | `api/og-page.ts` | `type=professions` |
| `/profissoes/:slug` | `api/og-page.ts` | `type=profession&slug=:slug` |
| `/ia-para` | `api/og-page.ts` | `type=niches` |
| `/ia-para/:slug` | `api/og-page.ts` | `type=niche&slug=:slug` |
| `/salarios-ia` | `api/og-page.ts` | `type=salarios` |
| `/quiz` | `api/og-page.ts` | `type=quiz` |

`api/og-page.ts` is a single handler for all six of the newer routes — it
takes `type` (strictly allowlisted) and, for the two detail types, `slug`
(validated against `^[a-z0-9-]{1,80}$`). An unknown/unpublished slug 302s to
the corresponding list page; an invalid `type` 302s to `/`; any unexpected
error also 302s to `/` — this handler must never return a 500 with a stack
trace to a crawler.

`api/og-job.ts` and `api/og-news.ts` predate `og-page.ts` and are not
consolidated into it — they're kept as-is (different data sources: a single
job/news row plus employment-type mapping / image-proxying logic that
doesn't apply to the profession/niche/salarios/quiz pages).

## Adding a new prerendered type

1. Add a `render<Type>()` function in `api/og-page.ts` that returns the full
   HTML string via the shared `renderPage()` helper (title, description,
   canonical path, OG type, JSON-LD array, body HTML).
2. Add the type to `ALLOWED_TYPES` and wire it into the `switch` in the
   default export.
3. Add a route to `vercel.json` immediately after the existing
   crawler-gated routes (same `has` user-agent condition, before the
   `/api/(.*)` catch-all) pointing at `/api/og-page?type=<type>`.
4. If the page renders through a Supabase table/view or RPC, read the
   relevant migration in `supabase/migrations/` for the exact column/RPC
   signature — don't guess field names.

## SPA/prerender parity rule

The prerendered HTML and the client-rendered page must show the **same**
title, meta description, canonical URL, and JSON-LD `@type`/fields for a
given route. When either side changes (e.g. `ProfessionPage.tsx`'s
`ProfessionPageSEO` component, or the corresponding `render*()` function in
`api/og-page.ts`), update the other to match. This matters for two reasons:

- Search engines that do execute JS may compare the prerendered response
  against the client-rendered DOM; large mismatches read as cloaking.
- Anyone diffing "what does Google see" vs. "what does a user see" should
  find them equivalent.

The body content doesn't need to be pixel-identical (the prerendered body
is plain semantic HTML — headings, paragraphs, `<ul>`/`<li>` — not the
styled React tree), but the *information* it conveys (profession summary,
task lists, related jobs/news) must match what the SPA fetches for the same
slug.

## Testing

Simulate a crawler hit locally or against a deployment:

```bash
curl -A "Googlebot" https://www.usezuno.app/profissoes/contador
curl -A "Googlebot" https://www.usezuno.app/profissoes
curl -A "Googlebot" https://www.usezuno.app/ia-para/tech-startups
curl -A "Googlebot" https://www.usezuno.app/ia-para
curl -A "Googlebot" https://www.usezuno.app/salarios-ia
curl -A "Googlebot" https://www.usezuno.app/quiz
```

Check for:
- `<title>` and `<meta name="description">` matching the SPA's values for
  that route.
- A `<link rel="canonical">` pointing at the clean `https://www.usezuno.app/...`
  URL (no query string, no trailing crawler artifacts).
- A `<script type="application/ld+json">` block that parses as valid JSON
  (`... | node -e "JSON.parse(require('fs').readFileSync(0,'utf8').match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s)[1])"`
  or just eyeball it).
- Visible `<h1>`/`<p>`/`<ul>` content in `<body>` — not an empty shell.

Without the `-A "Googlebot"` flag, the same URL redirects (302) to the SPA
route — that's the "direct hit, not a crawler" branch and is expected.

An unknown or unpublished slug should redirect (302) to the list page:

```bash
curl -A "Googlebot" -I https://www.usezuno.app/profissoes/this-slug-does-not-exist
# expect: HTTP/2 302, location: /profissoes
```
