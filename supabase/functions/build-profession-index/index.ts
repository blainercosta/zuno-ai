import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Admin-only, idempotent, re-runnable generator for the "profissoes"
// AI-exposure hub. For each target profession: (1) embeds
// name+descriptor (lazy, unless { force: true }); (2) finds evidence —
// top active jobs and published news by cosine similarity to that
// embedding, plus the skills extracted from those jobs
// (job_skills, populated by extract-job-insights); (3) asks
// gpt-4o-mini (JSON mode) to evaluate the profession's exposure to
// generative AI in Brazil over the next 3-5 years, using ONLY that
// evidence; (4) persists the verdict with status='review' — this
// function NEVER sets status='published'. A human always reviews the
// summary/score in Studio before flipping it live (docs/PROFESSIONS.md).
//
// Mirrors extract-job-insights: admin-secret auth, batching, JSON mode,
// gpt-4o-mini, per-item error isolation (one bad profession never
// aborts the run), cost estimate in the response.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

const MAX_BATCH = 10
const DEFAULT_BATCH = 5
const MODEL = 'gpt-4o-mini'

// Rough gpt-4o-mini pricing (per 1M tokens) used only for the cost-estimate
// log line / response field — not billed anywhere, just an operator signal.
const INPUT_COST_PER_1M = 0.15
const OUTPUT_COST_PER_1M = 0.6

const VALID_BANDS = new Set(['baixa', 'media', 'alta'])
const SUMMARY_MAX_CHARS = 900
const ARRAY_MAX_ITEMS = 8
const ITEM_MAX_CHARS = 120
// Same canonical-skill charset as extract-job-insights: letters/digits and a
// few symbols, 2-40 chars. Blocks prompt-injected text/URLs from bridge_skills.
const SKILL_PATTERN = /^[a-z0-9à-ú][a-z0-9à-ú .+#/-]{0,38}[a-z0-9à-ú+#]$/

interface ProfessionRow {
  slug: string
  name: string
  descriptor: string
  embedding: number[] | null
}

interface JobEvidenceRow {
  job_id: string
  job_title: string
  seniority_level: string | null
  requirements: string | null
}

interface NewsEvidenceRow {
  id: string
  title: string
}

interface ExposureVerdict {
  exposure_score: number
  exposure_band: 'baixa' | 'media' | 'alta'
  summary: string
  tasks_augmented: string[]
  tasks_at_risk: string[]
  bridge_skills: string[]
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

function buildPrompt(
  profession: ProfessionRow,
  jobs: JobEvidenceRow[],
  news: NewsEvidenceRow[],
  skills: string[]
): string {
  const jobItems = jobs.map((j) => ({
    title: j.job_title,
    seniority: j.seniority_level,
    requirements: (j.requirements || '').slice(0, 800),
  }))
  const newsTitles = news.map((n) => n.title)

  return `Você é um analista que avalia o grau de exposição de profissões brasileiras à inteligência artificial generativa.

Profissão: "${profession.name}"
Descrição da profissão: "${profession.descriptor}"

Evidências disponíveis (use APENAS estas evidências, não use conhecimento externo sobre a profissão):

Vagas de emprego relacionadas (título, senioridade, requisitos):
${JSON.stringify(jobItems, null, 2)}

Skills mais demandadas nessas vagas:
${JSON.stringify(skills, null, 2)}

Manchetes de notícias recentes relacionadas:
${JSON.stringify(newsTitles, null, 2)}

Com base SOMENTE nessas evidências, avalie a exposição dessa profissão à IA generativa no Brasil nos próximos 3-5 anos. Retorne um JSON com:

- "exposure_score": número inteiro de 0 a 100 (0 = nenhuma exposição, 100 = exposição máxima).
- "exposure_band": "baixa" (0-33), "media" (34-66) ou "alta" (67-100), consistente com exposure_score.
- "summary": um veredito em português, de 3 a 5 frases, usando linguagem não determinística ("tende a", "parte das tarefas", "é provável que") — NUNCA afirme com certeza absoluta que a profissão "será extinta" ou "não será afetada". Baseie o texto nas evidências fornecidas.
- "tasks_augmented": lista de até 8 tarefas do dia a dia que a IA tende a apoiar/potencializar (não substituir), cada item com até 120 caracteres.
- "tasks_at_risk": lista de até 8 tarefas que têm maior probabilidade de serem automatizadas, cada item com até 120 caracteres.
- "bridge_skills": lista de até 8 habilidades que ajudam essa profissão a se adaptar à IA, preferencialmente escolhidas ou próximas das skills listadas acima, em minúsculas, cada item com até 120 caracteres.

Retorne APENAS o JSON, no formato:
{"exposure_score": number, "exposure_band": "baixa"|"media"|"alta", "summary": "...", "tasks_augmented": ["..."], "tasks_at_risk": ["..."], "bridge_skills": ["..."]}`
}

function sanitizeVerdict(raw: unknown): ExposureVerdict | null {
  if (!raw || typeof raw !== 'object') return null
  const v = raw as Record<string, unknown>

  const score = typeof v.exposure_score === 'number' && Number.isFinite(v.exposure_score)
    ? Math.min(100, Math.max(0, Math.round(v.exposure_score)))
    : null
  const band = typeof v.exposure_band === 'string' && VALID_BANDS.has(v.exposure_band)
    ? (v.exposure_band as ExposureVerdict['exposure_band'])
    : null
  const summary = typeof v.summary === 'string' ? v.summary.trim().slice(0, SUMMARY_MAX_CHARS) : ''

  if (score === null || band === null || !summary) return null

  const sanitizeArray = (input: unknown, pattern?: RegExp): string[] => {
    if (!Array.isArray(input)) return []
    return input
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim().slice(0, ITEM_MAX_CHARS))
      .filter((s) => s.length > 0)
      .filter((s) => !pattern || pattern.test(s.toLowerCase()))
      .slice(0, ARRAY_MAX_ITEMS)
  }

  return {
    exposure_score: score,
    exposure_band: band,
    summary,
    tasks_augmented: sanitizeArray(v.tasks_augmented),
    tasks_at_risk: sanitizeArray(v.tasks_at_risk),
    bridge_skills: sanitizeArray(v.bridge_skills, SKILL_PATTERN).map((s) => s.toLowerCase()),
  }
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
    const batch = Math.min(Math.max(Number(body.batch) || DEFAULT_BATCH, 1), MAX_BATCH)
    const force = body.force === true
    const requestedSlugs: string[] = Array.isArray(body.slugs)
      ? body.slugs.filter((s: unknown): s is string => typeof s === 'string')
      : []

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
      .from('professions')
      .select('slug, name, descriptor, embedding')
      .order('sort_order', { ascending: true })

    if (requestedSlugs.length > 0) {
      // Explicit slugs may include published rows (operator intent), but still capped per run
      query = query.in('slug', requestedSlugs.slice(0, batch)).limit(batch)
    } else if (!force) {
      query = query.eq('status', 'draft').limit(batch)
    } else {
      // force without slugs must never silently unpublish live pages
      query = query.neq('status', 'published').limit(batch)
    }

    const { data: rows, error } = await query
    if (error) throw error

    const targets = (rows || []) as ProfessionRow[]

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, skipped: 0, errors: [], message: 'nothing to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0
    let skipped = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    const errors: { slug: string; message: string }[] = []
    const now = new Date().toISOString()

    for (const profession of targets) {
      try {
        // 1. Embed (lazy — skip if already embedded and not forcing a refresh)
        let embedding = profession.embedding
        if (!embedding || force) {
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: `${profession.name}. ${profession.descriptor}`,
          })
          embedding = embeddingResponse.data[0]?.embedding || null
          if (!embedding) {
            errors.push({ slug: profession.slug, message: 'no embedding returned' })
            continue
          }
          await supabase.from('professions').update({ embedding }).eq('slug', profession.slug)
        }

        // 2. Evidence — jobs + news by cosine similarity, via the internal
        // SECURITY DEFINER helpers (pgvector ORDER BY isn't expressible
        // through PostgREST filters).
        const [{ data: jobIdRows, error: jobIdErr }, { data: newsIdRows, error: newsIdErr }] = await Promise.all([
          supabase.rpc('_match_jobs_for_embedding', { query_embedding: embedding, match_count: 15 }),
          supabase.rpc('_match_news_for_embedding', { query_embedding: embedding, match_count: 8 }),
        ])
        if (jobIdErr) throw jobIdErr
        if (newsIdErr) throw newsIdErr

        const jobIds: string[] = (jobIdRows || []).map((r: { job_id: string }) => r.job_id)
        const newsIds: string[] = (newsIdRows || []).map((r: { news_id: string }) => r.news_id)

        // Governance rule (docs/PROFESSIONS.md): never persist a verdict
        // without job evidence backing it.
        if (jobIds.length === 0) {
          errors.push({ slug: profession.slug, message: 'no_job_evidence' })
          continue
        }

        const [{ data: jobRows, error: jobRowsErr }, { data: newsRows, error: newsRowsErr }, { data: skillRows, error: skillRowsErr }] =
          await Promise.all([
            supabase.from('vagas_ia').select('job_id, job_title, seniority_level, requirements').in('job_id', jobIds),
            newsIds.length > 0
              ? supabase.from('news').select('id, title').in('id', newsIds)
              : Promise.resolve({ data: [], error: null }),
            supabase.from('job_skills').select('skill').in('job_id', jobIds),
          ])
        if (jobRowsErr) throw jobRowsErr
        if (newsRowsErr) throw newsRowsErr
        if (skillRowsErr) throw skillRowsErr

        const jobs = (jobRows || []) as JobEvidenceRow[]
        const news = (newsRows || []) as NewsEvidenceRow[]
        const skills = Array.from(new Set((skillRows || []).map((s: { skill: string }) => s.skill))).slice(0, 30)

        // 3. LLM exposure evaluation
        const completion = await openai.chat.completions.create({
          model: MODEL,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: buildPrompt(profession, jobs, news, skills) }],
          temperature: 0.4,
        })

        totalInputTokens += completion.usage?.prompt_tokens || 0
        totalOutputTokens += completion.usage?.completion_tokens || 0

        const content = completion.choices[0]?.message?.content
        const parsed = content ? JSON.parse(content) : null
        const verdict = sanitizeVerdict(parsed)

        if (!verdict) {
          errors.push({ slug: profession.slug, message: 'invalid_llm_response' })
          continue
        }

        // 4. Persist — always status='review'. This function never
        // publishes; a human reviews the verdict in Studio and flips
        // status to 'published' (docs/PROFESSIONS.md).
        const { error: updateError } = await supabase
          .from('professions')
          .update({
            exposure_score: verdict.exposure_score,
            exposure_band: verdict.exposure_band,
            summary: verdict.summary,
            tasks_augmented: verdict.tasks_augmented,
            tasks_at_risk: verdict.tasks_at_risk,
            bridge_skills: verdict.bridge_skills,
            evidence_job_ids: jobIds,
            evidence_news_ids: newsIds,
            status: 'review',
            generated_at: now,
            model: MODEL,
            updated_at: now,
          })
          .eq('slug', profession.slug)

        if (updateError) {
          errors.push({ slug: profession.slug, message: updateError.message })
          continue
        }

        processed++
      } catch (professionError) {
        errors.push({
          slug: profession.slug,
          message: professionError instanceof Error ? professionError.message : 'processing_failed',
        })
      }
    }

    skipped = targets.length - processed - errors.length

    const estimatedCostUsd =
      (totalInputTokens / 1_000_000) * INPUT_COST_PER_1M +
      (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_1M

    console.log(
      `[build-profession-index] processed=${processed} skipped=${skipped} errors=${errors.length} ` +
      `input_tokens=${totalInputTokens} output_tokens=${totalOutputTokens} ` +
      `est_cost_usd=${estimatedCostUsd.toFixed(4)}`
    )

    return new Response(
      JSON.stringify({
        processed,
        skipped,
        estimated_cost_usd: Number(estimatedCostUsd.toFixed(4)),
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in build-profession-index function:', error)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
