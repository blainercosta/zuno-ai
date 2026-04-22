// =====================================================
// kubo-ingest — webhook receiver
// Recebe POSTs do Kubo quando uma notícia vira published e
// faz upsert na tabela `news` do Zuno.
// Ver docs do Kubo: janela antirreplay 5min, HMAC-SHA256.
// =====================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Desabilita parse automático — precisamos do raw body para HMAC
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const kuboSecret = process.env.KUBO_WEBHOOK_SECRET || '';

interface KuboBlock {
  type: string;
  text?: string;
  level?: number;
  url?: string;
  caption?: string;
  id?: string;
  platform?: string;
  source?: string;
}

interface KuboPayload {
  event: string;
  content_id: string;
  data: {
    url: string;
    slug: string;
    title: string;
    subtitle?: string;
    content: KuboBlock[];
    cover_image?: string;
    category?: string;
    taxonomy_path?: string[];
    author?: string;
    key_takeaway?: string;
    read_time?: number;
    word_count?: number;
    quality_score?: number;
    source_fidelity_score?: number;
    published_at: string;
    source_name?: string;
    source_language?: string;
    original_title?: string;
    original_author?: string;
  };
}

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function verifySignature(rawBody: string, signature: string, timestamp: string, secret: string): boolean {
  // Janela antirreplay ±5min
  const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(skew) || skew > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Config checks — erros separados pra debug direto sem log
  if (!supabaseUrl) {
    console.error('[kubo-ingest] Supabase URL ausente (checou SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, VITE_SUPABASE_URL)');
    return res.status(500).json({ error: 'supabase_url_missing' });
  }
  if (!supabaseServiceKey) {
    console.error('[kubo-ingest] SUPABASE_SERVICE_ROLE_KEY ausente');
    return res.status(500).json({ error: 'service_role_key_missing' });
  }
  if (!kuboSecret) {
    console.error('[kubo-ingest] KUBO_WEBHOOK_SECRET ausente');
    return res.status(500).json({ error: 'webhook_secret_missing' });
  }

  const signature = req.headers['x-ingest-signature'];
  const timestamp = req.headers['x-ingest-timestamp'];
  if (typeof signature !== 'string' || typeof timestamp !== 'string') {
    return res.status(401).json({ error: 'missing_signature_headers' });
  }

  const rawBody = await readRawBody(req);
  if (!verifySignature(rawBody, signature, timestamp, kuboSecret)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  let payload: KuboPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  if (payload.event !== 'content.published' || !payload.data?.url || !payload.data?.slug || !payload.data?.title) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  const d = payload.data;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const row = {
    url: d.url,
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle ?? null,
    content: d.content,
    cover_image: d.cover_image ?? null,
    category: d.category ?? null,
    author: d.author ?? 'Zuno AI',
    key_takeaway: d.key_takeaway ?? null,
    read_time: d.read_time ?? null,
    word_count: d.word_count ?? null,
    quality_score: d.quality_score ?? null,
    published_at: d.published_at,
    source_name: d.source_name ?? null,
    source_language: d.source_language ?? null,
    original_title: d.original_title ?? null,
    original_author: d.original_author ?? null,
    status: 'published',
  };

  const { data, error } = await supabase
    .from('news')
    .upsert(row, { onConflict: 'url' })
    .select('id')
    .single();

  if (error) {
    console.error('[kubo-ingest] upsert falhou:', error);
    return res.status(500).json({ error: 'upsert_failed', details: error.message });
  }

  return res.status(200).json({ ok: true, news_id: data?.id, content_id: payload.content_id });
}
