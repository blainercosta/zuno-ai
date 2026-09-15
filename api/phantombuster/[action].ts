// =====================================================
// /api/phantombuster/:action — thin relay to the `phantombuster`
// Supabase edge function.
//
// Why a relay: Phantombuster can only call plain URLs (no custom headers),
// and this gives it a stable www.usezuno.app address that survives a
// Supabase project change. Secret validation, mapping and upserts all live
// in supabase/functions/phantombuster/index.ts — this file only forwards.
//
//   POST /api/phantombuster/webhook?secret=…      ← Phantom notification
//   GET  /api/phantombuster/search-urls?secret=…  ← Phantom spreadsheet input
// =====================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { api: { bodyParser: false } };

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const ALLOWED: Record<string, 'GET' | 'POST'> = { webhook: 'POST', 'search-urls': 'GET' };

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? '');
  const expectedMethod = ALLOWED[action];
  if (!expectedMethod) return res.status(404).json({ error: 'unknown_action' });
  if (req.method !== expectedMethod) return res.status(405).json({ error: 'method_not_allowed' });
  if (!supabaseUrl) {
    console.error('[phantombuster relay] SUPABASE_URL missing');
    return res.status(500).json({ error: 'supabase_url_missing' });
  }

  const secret = typeof req.query.secret === 'string' ? req.query.secret : '';
  if (!secret) return res.status(401).json({ error: 'missing_secret' });

  const upstream = new URL(`${supabaseUrl}/functions/v1/phantombuster/${action}`);
  upstream.searchParams.set('secret', secret);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (anonKey) {
    headers.apikey = anonKey;
    headers.Authorization = `Bearer ${anonKey}`;
  }

  try {
    const upstreamRes = await fetch(upstream.toString(), {
      method: expectedMethod,
      headers,
      body: expectedMethod === 'POST' ? await readRawBody(req) : undefined,
    });
    const body = await upstreamRes.text();
    res.setHeader('Content-Type', upstreamRes.headers.get('content-type') ?? 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstreamRes.status).send(body);
  } catch (err) {
    console.error('[phantombuster relay] upstream error:', err);
    return res.status(502).json({ error: 'upstream_unreachable' });
  }
}
