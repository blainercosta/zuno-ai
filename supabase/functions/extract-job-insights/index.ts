import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Admin-only, idempotent, re-runnable extraction: reads active jobs whose
// insights_extracted_at IS NULL, asks gpt-4o-mini (JSON mode, batched 10
// jobs/request) to normalize the free-text `salary` column into
// salary_min/salary_max/salary_period and to extract a canonical skills
// list, then persists both onto vagas_ia + job_skills. Mirrors the
// admin-secret pattern and batching approach used by backfill-embeddings.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

const MAX_BATCH = 50
const DEFAULT_BATCH = 20
const JOBS_PER_OPENAI_CALL = 10

// Rough gpt-4o-mini pricing (per 1M tokens) used only for the cost-estimate
// log line — not billed anywhere, just an operator signal.
const INPUT_COST_PER_1M = 0.15
const OUTPUT_COST_PER_1M = 0.6

const VALID_PERIODS = new Set(['month', 'year', 'hour'])
const VALID_CATEGORIES = new Set([
  'linguagem',
  'framework',
  'ferramenta',
  'conceito',
  'soft-skill',
  'cloud',
  'dados',
])

interface JobRow {
  id: string
  job_id: string
  salary: string | null
  requirements: string | null
  description_full: string | null
}

interface ExtractedJob {
  job_id: string
  salary_min: number | null
  salary_max: number | null
  period: 'month' | 'year' | 'hour' | null
  skills: { skill: string; category: string }[]
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

function buildPrompt(jobs: JobRow[]): string {
  const items = jobs.map((job) => ({
    job_id: job.job_id,
    salary: job.salary,
    requirements: (job.requirements || '').slice(0, 1500),
    description: (job.description_full || '').slice(0, 2000),
  }))

  return `Você é um extrator de dados estruturados para vagas de emprego em Inteligência Artificial no Brasil.

Para cada vaga da lista abaixo, extraia:

1. Salário normalizado a partir do campo "salary" (texto livre, ex: "R$ 5.000 - R$ 8.000", "A combinar", null):
   - "salary_min" e "salary_max": números inteiros em reais (BRL), sem separadores. Se for um valor único, use o mesmo número em min e max.
   - "period": "month", "year" ou "hour" conforme o texto indicar (padrão "month" se não especificado mas houver um valor numérico claro). Use null se o salário for "a combinar", vazio, ou não puder ser interpretado com confiança.

2. Skills extraídas de "requirements" e "description":
   - Lista de até 12 skills, cada uma com "skill" (nome canônico em minúsculas, ex: "python", "langchain", "llm", "rag", "sql", "power bi", "prompt engineering") e "category" (uma destas: linguagem, framework, ferramenta, conceito, soft-skill, cloud, dados).
   - Não repita skills equivalentes com grafias diferentes (ex: "PowerBI" e "Power BI" viram "power bi").
   - Se não houver skills identificáveis, use uma lista vazia.

Retorne APENAS um JSON no formato:
{"jobs": [{"job_id": "...", "salary_min": number|null, "salary_max": number|null, "period": "month"|"year"|"hour"|null, "skills": [{"skill": "...", "category": "..."}]}]}

Vagas:
${JSON.stringify(items, null, 2)}`
}

function sanitizeExtracted(raw: unknown, validJobIds: Set<string>): ExtractedJob[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { jobs?: unknown }).jobs)) {
    return []
  }

  const jobs = (raw as { jobs: unknown[] }).jobs
  const result: ExtractedJob[] = []

  for (const item of jobs) {
    if (!item || typeof item !== 'object') continue
    const j = item as Record<string, unknown>
    const jobId = typeof j.job_id === 'string' ? j.job_id : null
    if (!jobId || !validJobIds.has(jobId)) continue

    const period = typeof j.period === 'string' && VALID_PERIODS.has(j.period) ? (j.period as ExtractedJob['period']) : null
    const salaryMin = typeof j.salary_min === 'number' && Number.isFinite(j.salary_min) ? Math.round(j.salary_min) : null
    const salaryMax = typeof j.salary_max === 'number' && Number.isFinite(j.salary_max) ? Math.round(j.salary_max) : null

    // A period without both bounds (or bounds without a period) is not
    // usable by salary_stats — treat as "not extracted" rather than
    // persisting a half-formed value.
    // Plausibility clamp per period (BRL). Out-of-range values are treated as not extracted.
    const RANGE: Record<string, [number, number]> = { month: [500, 200_000], year: [6_000, 2_400_000], hour: [5, 2_000] }
    const inRange = (v: number | null, p: string | null) => v !== null && p !== null && v >= RANGE[p][0] && v <= RANGE[p][1]
    const hasSalary = period !== null && inRange(salaryMin, period) && inRange(salaryMax, period) && (salaryMin as number) <= (salaryMax as number)

    const rawSkills = Array.isArray(j.skills) ? j.skills : []
    const skills = rawSkills
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
      .map((s) => ({
        skill: typeof s.skill === 'string' ? s.skill.trim().toLowerCase() : '',
        category: typeof s.category === 'string' && VALID_CATEGORIES.has(s.category) ? s.category : 'conceito',
      }))
      // Canonical skill names only: letters/digits and a few symbols, 2-40 chars. Blocks prompt-injected text/URLs.
      .filter((s) => /^[a-z0-9à-ú][a-z0-9à-ú .+#/-]{0,38}[a-z0-9à-ú+#]$/.test(s.skill) && !s.skill.includes('http'))
      .slice(0, 12)

    result.push({
      job_id: jobId,
      salary_min: hasSalary ? salaryMin : null,
      salary_max: hasSalary ? salaryMax : null,
      period: hasSalary ? period : null,
      skills,
    })
  }

  return result
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

    const { data: rows, error } = await supabase
      .from('vagas_ia')
      .select('id, job_id, salary, requirements, description_full')
      .eq('status', 'active')
      .is('insights_extracted_at', null)
      .order('posted_at', { ascending: false })
      .limit(batch)

    if (error) throw error

    const jobs = (rows || []) as JobRow[]

    if (jobs.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, remaining: 0, skills_upserted: 0, message: 'nothing to extract' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0
    let skillsUpserted = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    const errors: { job_id: string; message: string }[] = []
    const now = new Date().toISOString()

    for (let i = 0; i < jobs.length; i += JOBS_PER_OPENAI_CALL) {
      const chunk = jobs.slice(i, i + JOBS_PER_OPENAI_CALL)
      const validJobIds = new Set(chunk.map((j) => j.job_id))

      let extracted: ExtractedJob[] = []
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: buildPrompt(chunk) }],
          temperature: 0,
        })

        totalInputTokens += completion.usage?.prompt_tokens || 0
        totalOutputTokens += completion.usage?.completion_tokens || 0

        const content = completion.choices[0]?.message?.content
        const parsed = content ? JSON.parse(content) : null
        extracted = sanitizeExtracted(parsed, validJobIds)
      } catch (chunkError) {
        for (const job of chunk) {
          errors.push({ job_id: job.job_id, message: chunkError instanceof Error ? chunkError.message : 'openai_call_failed' })
        }
        continue
      }

      const extractedByJobId = new Map(extracted.map((e) => [e.job_id, e]))

      for (const job of chunk) {
        const result = extractedByJobId.get(job.job_id)

        // Always stamp insights_extracted_at, even with no result, so this
        // job is never reprocessed on the next run.
        const { error: updateError } = await supabase
          .from('vagas_ia')
          .update({
            salary_min: result?.salary_min ?? null,
            salary_max: result?.salary_max ?? null,
            salary_period: result?.period ?? null,
            insights_extracted_at: now,
          })
          .eq('id', job.id)

        if (updateError) {
          errors.push({ job_id: job.job_id, message: updateError.message })
          continue
        }

        processed++

        if (result && result.skills.length > 0) {
          const skillRows = result.skills.map((s) => ({
            job_id: job.job_id,
            skill: s.skill,
            category: s.category,
          }))

          const { error: skillsError } = await supabase
            .from('job_skills')
            .upsert(skillRows, { onConflict: 'job_id,skill' })

          if (skillsError) {
            errors.push({ job_id: job.job_id, message: `skills upsert failed: ${skillsError.message}` })
          } else {
            skillsUpserted += skillRows.length
          }
        }
      }
    }

    const { count: remaining } = await supabase
      .from('vagas_ia')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('insights_extracted_at', null)

    const estimatedCostUsd =
      (totalInputTokens / 1_000_000) * INPUT_COST_PER_1M +
      (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_1M

    console.log(
      `[extract-job-insights] processed=${processed} skills_upserted=${skillsUpserted} ` +
      `input_tokens=${totalInputTokens} output_tokens=${totalOutputTokens} ` +
      `est_cost_usd=${estimatedCostUsd.toFixed(4)}`
    )

    return new Response(
      JSON.stringify({
        processed,
        remaining: remaining ?? null,
        skills_upserted: skillsUpserted,
        estimated_cost_usd: Number(estimatedCostUsd.toFixed(4)),
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in extract-job-insights function:', error)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
