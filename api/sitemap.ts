import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxies /sitemap-news.xml, /sitemap-jobs.xml and /sitemap-professions.xml
// to the corresponding Supabase Edge Function, since the project's Supabase
// URL is only available via env vars (not a literal in the repo) and can't
// be hardcoded into a vercel.json rewrite.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';

const FALLBACK_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type } = req.query;

  if (type !== 'news' && type !== 'jobs' && type !== 'professions') {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(404).send(FALLBACK_XML);
  }

  if (!supabaseUrl) {
    console.error('Supabase URL missing for sitemap proxy');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(FALLBACK_XML);
  }

  try {
    const upstreamUrl = `${supabaseUrl}/functions/v1/sitemap-${type}`;
    const upstreamRes = await fetch(upstreamUrl);
    const body = await upstreamRes.text();

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(upstreamRes.ok ? 200 : 502).send(upstreamRes.ok ? body : FALLBACK_XML);
  } catch (err) {
    console.error('Error proxying sitemap:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(FALLBACK_XML);
  }
}
