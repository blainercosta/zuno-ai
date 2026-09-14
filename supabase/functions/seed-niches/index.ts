import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Admin-only, idempotent, re-runnable niche embedding seeder. Mirrors
// backfill-embeddings/index.ts: embeds rows missing `embedding` (or all
// active niches when { force: true } is passed) using OpenAI's array
// input, one HTTP call for the whole batch instead of one per niche.
// There are only 7 niches today, so this never needs the batching/paging
// that backfill-embeddings has for vagas_ia/news.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

interface NicheRow {
  slug: string
  name: string
  headline: string
  description: string
  keywords: string[] | null
}

function nicheText(niche: NicheRow): string {
  const keywords = (niche.keywords || []).join(', ')
  return `${niche.name}. ${niche.headline}. ${niche.description}. Palavras-chave: ${keywords}`
}

// Constant-time secret comparison: hash both sides to fixed length first
async function secretsMatch(provided: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(provided)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ])
  const ua = new Uint8Array(a), ub = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const adminSecret = Deno.env.get('ADMIN_SECRET')
  const providedSecret = req.headers.get('x-admin-secret')

  if (!adminSecret || !providedSecret || !(await secretsMatch(providedSecret, adminSecret))) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const force = body.force === true

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'openai_api_key_missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const openai = new OpenAI({ apiKey: openaiApiKey })

    let query = supabase
      .from('niches')
      .select('slug, name, headline, description, keywords')
      .eq('is_active', true)

    if (!force) {
      query = query.is('embedding', null)
    }

    const { data: rows, error } = await query

    if (error) throw error

    const niches = (rows || []) as NicheRow[]

    if (niches.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, skipped: 0, message: 'nothing to seed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const texts = niches.map(nicheText)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })

    const now = new Date().toISOString()
    let processed = 0
    const errors: { slug: string; message: string }[] = []

    for (let i = 0; i < niches.length; i++) {
      const embedding = response.data[i]?.embedding
      if (!embedding) {
        errors.push({ slug: niches[i].slug, message: 'no embedding returned' })
        continue
      }
      const { error: updateError } = await supabase
        .from('niches')
        .update({ embedding, updated_at: now })
        .eq('slug', niches[i].slug)

      if (updateError) {
        errors.push({ slug: niches[i].slug, message: updateError.message })
      } else {
        processed++
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, force }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in seed-niches function:', error)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
