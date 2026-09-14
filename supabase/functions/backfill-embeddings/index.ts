import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Admin-only, idempotent, re-runnable backfill: embeds rows where embedding IS NULL,
// in batches, using the OpenAI embeddings API's array input (one HTTP call per batch
// instead of one per row). Safe to call repeatedly / on a schedule — each call only
// ever picks up rows still missing an embedding.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

const MAX_BATCH = 100
const DEFAULT_BATCH = 50

type Table = 'vagas_ia' | 'news'

interface JobRow {
  id: string
  job_title: string
  company_name: string
  location?: string | null
  seniority_level?: string | null
  employment_type?: string | null
  workplace_type?: string | null
  description_full?: string | null
  requirements?: string | null
}

interface NewsRow {
  id: string
  title: string
  category?: string | null
  subtitle?: string | null
  content?: string | null
}

function jobText(job: JobRow): string {
  return [
    job.job_title,
    job.company_name,
    job.location || '',
    job.seniority_level || '',
    job.employment_type || '',
    job.workplace_type || '',
    job.description_full || '',
    job.requirements || '',
  ].filter(Boolean).join(' ')
}

function newsText(news: NewsRow): string {
  return [
    news.title,
    news.category || '',
    news.subtitle || '',
    typeof news.content === 'string' ? news.content.replace(/<[^>]*>/g, '').substring(0, 500) : '',
  ].filter(Boolean).join(' ')
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
    const table: Table = body.table
    const batch = Math.min(Math.max(Number(body.batch) || DEFAULT_BATCH, 1), MAX_BATCH)

    if (table !== 'vagas_ia' && table !== 'news') {
      return new Response(
        JSON.stringify({ error: 'invalid_table', message: "table must be 'vagas_ia' or 'news'" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    if (table === 'vagas_ia') {
      const { data: rows, error } = await supabase
        .from('vagas_ia')
        .select('id, job_title, company_name, location, seniority_level, employment_type, workplace_type, description_full, requirements')
        .is('embedding', null)
        .limit(batch)

      if (error) throw error

      const jobs = (rows || []) as JobRow[]

      if (jobs.length === 0) {
        return new Response(
          JSON.stringify({ table, processed: 0, remaining: 0, message: 'nothing to backfill' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const texts = jobs.map(jobText)
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      })

      const now = new Date().toISOString()
      let processed = 0
      const errors: { id: string; message: string }[] = []

      for (let i = 0; i < jobs.length; i++) {
        const embedding = response.data[i]?.embedding
        if (!embedding) {
          errors.push({ id: jobs[i].id, message: 'no embedding returned' })
          continue
        }
        const { error: updateError } = await supabase
          .from('vagas_ia')
          .update({ embedding, embedding_updated_at: now })
          .eq('id', jobs[i].id)

        if (updateError) {
          errors.push({ id: jobs[i].id, message: updateError.message })
        } else {
          processed++
        }
      }

      const { count: remaining } = await supabase
        .from('vagas_ia')
        .select('id', { count: 'exact', head: true })
        .is('embedding', null)

      return new Response(
        JSON.stringify({ table, processed, remaining: remaining ?? null, errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // table === 'news'
    const { data: rows, error } = await supabase
      .from('news')
      .select('id, title, category, subtitle, content')
      .is('embedding', null)
      .limit(batch)

    if (error) throw error

    const news = (rows || []) as NewsRow[]

    if (news.length === 0) {
      return new Response(
        JSON.stringify({ table, processed: 0, remaining: 0, message: 'nothing to backfill' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const texts = news.map(newsText)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })

    const now = new Date().toISOString()
    let processed = 0
    const errors: { id: string; message: string }[] = []

    for (let i = 0; i < news.length; i++) {
      const embedding = response.data[i]?.embedding
      if (!embedding) {
        errors.push({ id: news[i].id, message: 'no embedding returned' })
        continue
      }
      const { error: updateError } = await supabase
        .from('news')
        .update({ embedding, embedding_updated_at: now })
        .eq('id', news[i].id)

      if (updateError) {
        errors.push({ id: news[i].id, message: updateError.message })
      } else {
        processed++
      }
    }

    const { count: remaining } = await supabase
      .from('news')
      .select('id', { count: 'exact', head: true })
      .is('embedding', null)

    return new Response(
      JSON.stringify({ table, processed, remaining: remaining ?? null, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in backfill-embeddings function:', error)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
