import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =====================================================
// phantombuster — LinkedIn job ingestion pipeline
//
// Replaces the manual "export from Phantombuster, paste into vagas_ia"
// flow. One function, four routes (matched on the URL path suffix):
//
//   GET  /phantombuster/search-urls?secret=…   CSV of LinkedIn search URLs
//                                              (Phantom "spreadsheet" input)
//   POST /phantombuster/webhook?secret=…       Phantombuster "agent finished"
//                                              notification → async ingest
//   POST /phantombuster/ingest                 admin: { containerId } | { rows }
//   POST /phantombuster/launch                 admin: launch the Phantom now
//
// Phantombuster cannot set request headers on webhooks or spreadsheet
// fetches, so those two routes authenticate with `?secret=` compared
// against PHANTOMBUSTER_WEBHOOK_SECRET. Admin routes use x-admin-secret,
// same as backfill-embeddings / extract-job-insights.
//
// Ingest rules:
//   - dedupe on vagas_ia.job_id (LinkedIn numeric id); existing rows only
//     get last_seen_at (+ null fields filled), status is never overwritten
//     so manual rejections stick
//   - new rows: status 'active' when title/description match AI_KEYWORDS,
//     otherwise 'pending' for the Studio moderation queue
//   - rows older than MAX_AGE_DAYS or without a valid https URL are skipped
//   - every run is recorded in ingestion_runs, then backfill-embeddings and
//     extract-job-insights are triggered so new jobs get vectors + skills
// See docs/PHANTOMBUSTER_INGESTION.md.
// =====================================================

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const PB_API = 'https://api.phantombuster.com/api/v2'
const MAX_AGE_DAYS = Number(Deno.env.get('PHANTOMBUSTER_MAX_AGE_DAYS') || 45)
const MAX_ROWS_PER_RUN = 2000
const AUTO_APPROVE = (Deno.env.get('PHANTOMBUSTER_AUTO_APPROVE') || 'true') !== 'false'

// Title/description must hit one of these to be auto-approved. Everything
// else lands as 'pending' — cheaper than an LLM call and keeps the queue
// honest. Lowercase, accent-insensitive comparison.
const AI_KEYWORDS = [
  'inteligencia artificial', 'artificial intelligence', ' ia ', ' ai ', 'ai/ml', ' ml ',
  'machine learning', 'aprendizado de maquina', 'deep learning', 'llm', 'large language',
  'generative', 'generativa', 'gpt', 'openai', 'anthropic', 'claude', 'gemini',
  'nlp', 'linguagem natural', 'computer vision', 'visao computacional',
  'data scientist', 'cientista de dados', 'mlops', 'prompt', ' rag ', 'embedding',
  'rede neural', 'neural network', 'transformer', 'copilot', 'chatbot', 'agentes de ia', 'ai agent',
]

const SHORTENER_DENYLIST = ['bit.ly', 't.co', 'tinyurl.com']

// ---------- auth helpers ----------

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

async function checkQuerySecret(url: URL): Promise<boolean> {
  const expected = Deno.env.get('PHANTOMBUSTER_WEBHOOK_SECRET')
  const provided = url.searchParams.get('secret')
  if (!expected || !provided) return false
  return secretsMatch(provided, expected)
}

async function checkAdminSecret(req: Request): Promise<boolean> {
  const expected = Deno.env.get('ADMIN_SECRET')
  const provided = req.headers.get('x-admin-secret')
  if (!expected || !provided) return false
  return secretsMatch(provided, expected)
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ---------- LinkedIn search URLs ----------

interface SearchQuery {
  id: number
  label: string
  keywords: string
  location: string
  geo_id: string
  remote_only: boolean
  time_window_seconds: number
}

function buildLinkedInSearchUrl(q: SearchQuery): string {
  const params = new URLSearchParams({
    keywords: q.keywords,
    location: q.location,
    geoId: q.geo_id,
    f_TPR: `r${q.time_window_seconds}`,
    sortBy: 'DD', // most recent first
  })
  if (q.remote_only) params.set('f_WT', '2')
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`
}

async function loadActiveQueries(supabase: SupabaseClient): Promise<SearchQuery[]> {
  const { data, error } = await supabase
    .from('job_search_queries')
    .select('id, label, keywords, location, geo_id, remote_only, time_window_seconds')
    .eq('is_active', true)
    .order('priority', { ascending: true })
  if (error) throw new Error(`job_search_queries: ${error.message}`)
  return (data ?? []) as SearchQuery[]
}

function toCsv(queries: SearchQuery[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = ['searchUrl,label']
  for (const q of queries) lines.push(`${esc(buildLinkedInSearchUrl(q))},${esc(q.label)}`)
  return lines.join('\n') + '\n'
}

// ---------- Phantombuster API ----------

function pbHeaders(): HeadersInit {
  const key = Deno.env.get('PHANTOMBUSTER_API_KEY')
  if (!key) throw new Error('PHANTOMBUSTER_API_KEY not set')
  return { 'X-Phantombuster-Key': key, 'Content-Type': 'application/json' }
}

async function fetchResultObject(containerId: string): Promise<unknown[] | null> {
  const res = await fetch(`${PB_API}/containers/fetch-result-object?id=${encodeURIComponent(containerId)}`, {
    headers: pbHeaders(),
  })
  if (!res.ok) return null
  const body = await res.json()
  return parseResultObject(body?.resultObject)
}

function parseResultObject(raw: unknown): unknown[] | null {
  if (!raw) return null
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

// Fallback: the Phantom's cumulative result.json on S3. Contains every
// launch since the last "delete results", so it can be large — dedupe and
// the MAX_AGE_DAYS filter make that harmless.
async function fetchAgentResultFile(agentId: string): Promise<unknown[]> {
  const res = await fetch(`${PB_API}/agents/fetch?id=${encodeURIComponent(agentId)}`, { headers: pbHeaders() })
  if (!res.ok) throw new Error(`agents/fetch ${res.status}`)
  const agent = await res.json()
  const orgFolder = agent?.orgS3Folder, folder = agent?.s3Folder
  if (!orgFolder || !folder) throw new Error('agent has no s3Folder yet (never ran?)')
  const fileRes = await fetch(`https://phantombuster.s3.amazonaws.com/${orgFolder}/${folder}/result.json`)
  if (!fileRes.ok) throw new Error(`result.json ${fileRes.status}`)
  const data = await fileRes.json()
  return Array.isArray(data) ? data : []
}

async function launchAgent(agentId: string, argument?: Record<string, unknown>): Promise<string> {
  const body: Record<string, unknown> = { id: agentId }
  if (argument) body.argument = argument
  const res = await fetch(`${PB_API}/agents/launch`, {
    method: 'POST',
    headers: pbHeaders(),
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`agents/launch ${res.status}: ${JSON.stringify(data)}`)
  return String(data?.containerId ?? '')
}

// ---------- row mapping ----------

type Raw = Record<string, unknown>

const ALIASES: Record<string, string[]> = {
  job_url: ['jobUrl', 'url', 'link', 'jobLink'],
  job_id: ['jobId', 'id'],
  job_title: ['title', 'jobTitle', 'name', 'position'],
  company_name: ['companyName', 'company'],
  company_url: ['companyUrl', 'companyLinkedinUrl', 'companyLink'],
  company_id: ['companyId'],
  logo_url: ['companyLogo', 'companyLogoUrl', 'logoUrl', 'logo'],
  location: ['location', 'jobLocation'],
  posted_at: ['postDate', 'postedDate', 'postedAt', 'publishedAt', 'date', 'listedAt'],
  seniority_level: ['seniorityLevel', 'seniority', 'experienceLevel'],
  employment_type: ['employmentType', 'jobType', 'contractType'],
  workplace_type: ['workplaceType', 'workType', 'remoteType'],
  is_easy_apply: ['isEasyApply', 'easyApply'],
  description_full: ['description', 'jobDescription', 'descriptionText'],
  salary: ['salary', 'salaryRange', 'compensation'],
}
// Phantom bookkeeping fields we knowingly ignore (not reported as unknown)
const IGNORED = new Set(['timestamp', 'query', 'error', 'category', 'jobFunction', 'industries', 'applyUrl', 'applicantsCount', 'isPromoted', 'searchUrl', 'label', 'profileUrl'])

const KNOWN = new Set([...Object.values(ALIASES).flat(), ...IGNORED])

function pick(row: Raw, field: string): unknown {
  for (const alias of ALIASES[field]) {
    const v = row[alias]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function str(v: unknown): string | null {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function stripHtml(text: string | null): string | null {
  if (!text) return null
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
}

function normalize(text: string): string {
  return ` ${text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()} `
}

function isAiRelated(title: string | null, description: string | null): boolean {
  const hay = normalize(`${title ?? ''} ${(description ?? '').slice(0, 3000)}`)
  return AI_KEYWORDS.some((kw) => hay.includes(kw))
}

function parseBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (['true', 'yes', 'sim', '1'].includes(s)) return true
    if (['false', 'no', 'nao', 'não', '0'].includes(s)) return false
  }
  return null
}

// Accepts ISO dates, epoch ms, and LinkedIn relative strings ("há 3 dias",
// "2 weeks ago"). Unknown → null (caller falls back to now()).
function parseDate(v: unknown): Date | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'number') return new Date(v > 1e12 ? v : v * 1000)
  const s = String(v).trim()
  const iso = new Date(s)
  if (!Number.isNaN(iso.getTime())) return iso
  const rel = s.toLowerCase().match(/(\d+)\s*(minuto|minute|hora|hour|dia|day|semana|week|m[eê]s|month)/)
  if (rel) {
    const n = Number(rel[1])
    const unit = rel[2]
    const ms =
      unit.startsWith('min') ? 60_000 :
      unit.startsWith('h') ? 3_600_000 :
      unit.startsWith('d') ? 86_400_000 :
      unit.startsWith('s') || unit.startsWith('w') ? 7 * 86_400_000 :
      30 * 86_400_000
    return new Date(Date.now() - n * ms)
  }
  return null
}

function extractLinkedInJobId(url: URL): string | null {
  const m = url.pathname.match(/\/jobs\/view\/(?:[^/]*-)?(\d{6,})/)
  if (m) return m[1]
  const q = url.searchParams.get('currentJobId')
  return q && /^\d{6,}$/.test(q) ? q : null
}

function inferRemote(location: string | null, workplace: string | null, title: string | null): boolean {
  const hay = normalize(`${location ?? ''} ${workplace ?? ''} ${title ?? ''}`)
  return hay.includes('remot') || hay.includes('home office') || hay.includes('anywhere')
}

interface MappedJob {
  job_id: string
  job_url: string
  job_title: string
  company_name: string
  company_url: string | null
  company_id: string | null
  logo_url: string | null
  location: string | null
  posted_at: string
  seniority_level: string | null
  employment_type: string | null
  workplace_type: string | null
  is_remote: boolean
  is_easy_apply: boolean
  description_full: string | null
  salary: string | null
  status: 'active' | 'pending'
}

type MapResult = { ok: true; job: MappedJob } | { ok: false; reason: string }

function mapRow(row: Raw): MapResult {
  const rawUrl = str(pick(row, 'job_url'))
  if (!rawUrl) return { ok: false, reason: 'missing_url' }
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return { ok: false, reason: 'invalid_url' }
  }
  if (url.protocol !== 'https:') return { ok: false, reason: 'not_https' }
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  if (SHORTENER_DENYLIST.some((d) => host === d || host.endsWith(`.${d}`))) return { ok: false, reason: 'shortener' }

  const jobId = str(pick(row, 'job_id')) ?? extractLinkedInJobId(url)
  if (!jobId) return { ok: false, reason: 'missing_job_id' }

  const title = str(pick(row, 'job_title'))
  const company = str(pick(row, 'company_name'))
  if (!title || title.length < 3) return { ok: false, reason: 'missing_title' }
  if (!company || company.length < 2) return { ok: false, reason: 'missing_company' }

  const posted = parseDate(pick(row, 'posted_at')) ?? new Date()
  if (Date.now() - posted.getTime() > MAX_AGE_DAYS * 86_400_000) return { ok: false, reason: 'too_old' }

  // Strip LinkedIn tracking params so the same job always yields one URL
  url.search = ''
  url.hash = ''

  const description = stripHtml(str(pick(row, 'description_full')))?.slice(0, 20_000) ?? null
  const location = str(pick(row, 'location'))
  const workplace = str(pick(row, 'workplace_type'))

  return {
    ok: true,
    job: {
      job_id: jobId,
      job_url: url.toString(),
      job_title: stripHtml(title)!.slice(0, 200),
      company_name: stripHtml(company)!.slice(0, 200),
      company_url: str(pick(row, 'company_url')),
      company_id: str(pick(row, 'company_id')),
      logo_url: str(pick(row, 'logo_url')),
      location: location?.slice(0, 200) ?? null,
      posted_at: posted.toISOString(),
      seniority_level: str(pick(row, 'seniority_level')),
      employment_type: str(pick(row, 'employment_type')),
      workplace_type: workplace,
      is_remote: inferRemote(location, workplace, title),
      is_easy_apply: parseBool(pick(row, 'is_easy_apply')) ?? false,
      description_full: description,
      salary: str(pick(row, 'salary'))?.slice(0, 200) ?? null,
      status: AUTO_APPROVE && isAiRelated(title, description) ? 'active' : 'pending',
    },
  }
}

// ---------- ingest ----------

interface IngestStats {
  received: number
  inserted: number
  updated: number
  skipped: number
  pending: number
  errors: string[]
  unknownColumns: string[]
  skipReasons: Record<string, number>
}

async function ingestRows(
  supabase: SupabaseClient,
  rows: unknown[],
  runMeta: { containerId: string | null; agentId: string | null },
): Promise<IngestStats> {
  const stats: IngestStats = {
    received: rows.length, inserted: 0, updated: 0, skipped: 0, pending: 0,
    errors: [], unknownColumns: [], skipReasons: {},
  }

  const { data: runRow, error: runErr } = await supabase
    .from('ingestion_runs')
    .upsert(
      { source: 'phantombuster', external_run_id: runMeta.containerId ?? `manual_${Date.now()}`, agent_id: runMeta.agentId, status: 'running', rows_received: rows.length },
      { onConflict: 'source,external_run_id' },
    )
    .select('id')
    .single()
  if (runErr) stats.errors.push(`ingestion_runs: ${runErr.message}`)
  const runId = runRow?.id as number | undefined

  const unknown = new Set<string>()
  const mapped = new Map<string, MappedJob>() // dedupe within the batch

  for (const raw of rows.slice(0, MAX_ROWS_PER_RUN)) {
    if (!raw || typeof raw !== 'object') { stats.skipped++; continue }
    const row = raw as Raw
    for (const k of Object.keys(row)) if (!KNOWN.has(k)) unknown.add(k)
    if (row.error) { stats.skipped++; stats.skipReasons.phantom_error = (stats.skipReasons.phantom_error ?? 0) + 1; continue }
    const result = mapRow(row)
    if (!result.ok) {
      stats.skipped++
      stats.skipReasons[result.reason] = (stats.skipReasons[result.reason] ?? 0) + 1
      continue
    }
    mapped.set(result.job.job_id, result.job)
  }
  stats.unknownColumns = [...unknown].sort()

  const ids = [...mapped.keys()]
  const now = new Date().toISOString()

  // Existing rows: only refresh last_seen_at and fill nulls. Never touch status.
  const existing = new Map<string, Raw>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await supabase
      .from('vagas_ia')
      .select('job_id, description_full, salary, logo_url, company_url, seniority_level, employment_type')
      .in('job_id', ids.slice(i, i + 200))
    if (error) { stats.errors.push(`select existing: ${error.message}`); continue }
    for (const r of data ?? []) existing.set(r.job_id as string, r as Raw)
  }

  const toInsert: Record<string, unknown>[] = []
  for (const [jobId, job] of mapped) {
    const prev = existing.get(jobId)
    if (!prev) {
      toInsert.push({
        ...job,
        submitted_at: now,
        last_seen_at: now,
        source: 'phantombuster',
        source_run_id: runMeta.containerId,
        about_company: null, responsibilities: null, requirements: null,
        differentials: null, benefits: null, process: null,
      })
      if (job.status === 'pending') stats.pending++
      continue
    }
    const patch: Record<string, unknown> = { last_seen_at: now }
    for (const f of ['description_full', 'salary', 'logo_url', 'company_url', 'seniority_level', 'employment_type'] as const) {
      if (!prev[f] && job[f]) patch[f] = job[f]
    }
    const { error } = await supabase.from('vagas_ia').update(patch).eq('job_id', jobId)
    if (error) stats.errors.push(`update ${jobId}: ${error.message}`)
    else stats.updated++
  }

  for (let i = 0; i < toInsert.length; i += 100) {
    const chunk = toInsert.slice(i, i + 100)
    const { error } = await supabase.from('vagas_ia').insert(chunk)
    if (!error) { stats.inserted += chunk.length; continue }
    // Fall back to row-by-row so one bad row does not sink the chunk
    for (const r of chunk) {
      const { error: e } = await supabase.from('vagas_ia').insert(r)
      if (e) stats.errors.push(`insert ${r.job_id}: ${e.message}`)
      else stats.inserted++
    }
  }

  if (runId) {
    await supabase.from('ingestion_runs').update({
      status: stats.errors.length && !stats.inserted && !stats.updated ? 'failed' : 'done',
      rows_received: stats.received,
      rows_inserted: stats.inserted,
      rows_updated: stats.updated,
      rows_skipped: stats.skipped,
      rows_pending: stats.pending,
      errors: [...stats.errors.slice(0, 50), ...Object.entries(stats.skipReasons).map(([k, v]) => `skip:${k}=${v}`)],
      unknown_columns: stats.unknownColumns,
      finished_at: new Date().toISOString(),
    }).eq('id', runId)
  }

  if (stats.inserted > 0) await triggerEnrichment(stats)
  return stats
}

// New rows have no embedding / insights. Kick both admin jobs (same
// project, same ADMIN_SECRET). Failures are logged, not fatal.
async function triggerEnrichment(stats: IngestStats): Promise<void> {
  const base = Deno.env.get('SUPABASE_URL')
  const admin = Deno.env.get('ADMIN_SECRET')
  const anon = Deno.env.get('SUPABASE_ANON_KEY')
  if (!base || !admin) return
  const headers = { 'Content-Type': 'application/json', 'x-admin-secret': admin, ...(anon ? { apikey: anon, Authorization: `Bearer ${anon}` } : {}) }
  const calls: [string, unknown][] = [
    ['backfill-embeddings', { table: 'vagas_ia', batch: 50 }],
    ['extract-job-insights', { batch: 50 }],
  ]
  for (const [fn, body] of calls) {
    try {
      const res = await fetch(`${base}/functions/v1/${fn}`, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!res.ok) stats.errors.push(`${fn}: HTTP ${res.status}`)
    } catch (e) {
      stats.errors.push(`${fn}: ${(e as Error).message}`)
    }
  }
}

async function resolveRows(payload: Raw): Promise<{ rows: unknown[]; via: string }> {
  const inline = parseResultObject(payload.resultObject)
  if (inline && inline.length) return { rows: inline, via: 'resultObject' }
  const containerId = str(payload.containerId)
  if (containerId) {
    const fetched = await fetchResultObject(containerId)
    if (fetched && fetched.length) return { rows: fetched, via: 'fetch-result-object' }
  }
  const agentId = str(payload.agentId)
  if (agentId) return { rows: await fetchAgentResultFile(agentId), via: 'result.json' }
  return { rows: [], via: 'none' }
}

// ---------- handler ----------

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const route = url.pathname.split('/').filter(Boolean).pop() ?? ''

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'supabase_config_missing' }, 500)
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // ---- GET /search-urls : CSV consumed by the Phantom as spreadsheet input
    if (route === 'search-urls') {
      if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)
      if (!(await checkQuerySecret(url)) && !(await checkAdminSecret(req))) return json({ error: 'unauthorized' }, 401)
      const queries = await loadActiveQueries(supabase)
      await supabase.from('job_search_queries').update({ last_run_at: new Date().toISOString() }).in('id', queries.map((q) => q.id))
      return new Response(toCsv(queries), {
        headers: { ...corsHeaders, 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    }

    // ---- POST /webhook : Phantombuster notification. Must answer < 11s,
    // so we acknowledge immediately and ingest in the background.
    if (route === 'webhook') {
      if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      if (!(await checkQuerySecret(url))) return json({ error: 'unauthorized' }, 401)
      const payload = (await req.json().catch(() => ({}))) as Raw
      const exitCode = Number(payload.exitCode ?? 0)
      const exitMessage = str(payload.exitMessage)
      if (exitCode !== 0 && exitMessage !== 'finished') {
        await supabase.from('ingestion_runs').insert({
          source: 'phantombuster', external_run_id: str(payload.containerId), agent_id: str(payload.agentId),
          status: 'failed', errors: [`phantom exit ${exitCode}: ${exitMessage}`], finished_at: new Date().toISOString(),
        })
        return json({ ok: true, ignored: true, exitCode, exitMessage }, 200)
      }
      const work = (async () => {
        try {
          const { rows, via } = await resolveRows(payload)
          const stats = await ingestRows(supabase, rows, { containerId: str(payload.containerId), agentId: str(payload.agentId) })
          console.log(`[phantombuster] webhook via=${via}`, JSON.stringify({ ...stats, errors: stats.errors.length }))
        } catch (e) {
          console.error('[phantombuster] webhook ingest failed:', e)
          await supabase.from('ingestion_runs').upsert(
            { source: 'phantombuster', external_run_id: str(payload.containerId) ?? `manual_${Date.now()}`, agent_id: str(payload.agentId), status: 'failed', errors: [(e as Error).message], finished_at: new Date().toISOString() },
            { onConflict: 'source,external_run_id' },
          )
        }
      })()
      if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(work)
      else await work
      return json({ ok: true, accepted: true }, 202)
    }

    // ---- POST /ingest : admin, synchronous. { containerId } | { agentId } | { rows: [...] }
    if (route === 'ingest') {
      if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      if (!(await checkAdminSecret(req))) return json({ error: 'unauthorized' }, 401)
      const body = (await req.json().catch(() => ({}))) as Raw
      const rows = Array.isArray(body.rows) ? body.rows : (await resolveRows(body)).rows
      if (!rows.length) return json({ error: 'no_rows', hint: 'send { rows: [...] } or { containerId } / { agentId }' }, 400)
      const stats = await ingestRows(supabase, rows, { containerId: str(body.containerId), agentId: str(body.agentId) })
      return json(stats)
    }

    // ---- POST /launch : admin, start the Phantom now
    if (route === 'launch') {
      if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      if (!(await checkAdminSecret(req))) return json({ error: 'unauthorized' }, 401)
      const agentId = Deno.env.get('PHANTOMBUSTER_AGENT_ID')
      if (!agentId) return json({ error: 'PHANTOMBUSTER_AGENT_ID not set' }, 500)
      const body = (await req.json().catch(() => ({}))) as Raw
      // Optional argument override — the Phantom keeps its saved config
      // (spreadsheet URL, cookie, limits) unless you pass one here.
      const argument = body.argument && typeof body.argument === 'object' ? (body.argument as Record<string, unknown>) : undefined
      const containerId = await launchAgent(agentId, argument)
      await supabase.from('ingestion_runs').insert({ source: 'phantombuster', external_run_id: containerId || null, agent_id: agentId, status: 'running' })
      return json({ ok: true, containerId })
    }

    return json({ error: 'not_found', routes: ['GET search-urls', 'POST webhook', 'POST ingest', 'POST launch'] }, 404)
  } catch (e) {
    console.error('[phantombuster] error:', e)
    return json({ error: (e as Error).message }, 500)
  }
})
