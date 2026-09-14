import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface JobData {
  company_name: string
  company_url?: string
  logo_url?: string
  job_title: string
  job_url: string
  location?: string
  seniority_level?: string
  employment_type?: string
  workplace_type?: string
  is_remote?: boolean
  description_full?: string
  about_company?: string
  responsibilities?: string
  requirements?: string
  differentials?: string
  benefits?: string
  salary?: string
  process?: string
  submitted_by_email?: string
  // Honeypot: campo invisível no formulário. Bots preenchem, humanos não.
  website?: string
}

// Encurtadores bloqueados: mascaram o destino real e são amplamente
// usados em spam. Exigimos o link direto da vaga.
const SHORTENER_DENYLIST = ['bit.ly', 't.co', 'tinyurl.com']

const MIN_DESCRIPTION_LENGTH = 80

function isShortenerUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  return SHORTENER_DENYLIST.some((denied) => host === denied || host.endsWith(`.${denied}`))
}

// Validação de URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Sanitiza texto removendo caracteres perigosos
function sanitizeText(text: string | undefined): string | null {
  if (!text) return null
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Criar cliente Supabase com service role (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse body
    const rawBody = await req.text()
    if (rawBody.length > 60_000) {
      return new Response(
        JSON.stringify({ error: 'Conteúdo muito grande. Reduza o texto da vaga.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const body: JobData = JSON.parse(rawBody)

    // Per-field caps: keep DB and downstream LLM prompts bounded
    const FIELD_CAPS: Record<string, number> = {
      job_title: 200, company_name: 200, location: 200, salary: 200, process: 5_000,
      description_full: 20_000, about_company: 5_000, responsibilities: 10_000,
      requirements: 10_000, differentials: 5_000, submitted_by_email: 254, job_url: 2_000,
    }
    for (const [field, cap] of Object.entries(FIELD_CAPS)) {
      const v = (body as Record<string, unknown>)[field]
      if (typeof v === 'string' && v.length > cap) {
        return new Response(
          JSON.stringify({ error: `Campo ${field} excede ${cap} caracteres.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Honeypot anti-spam: campo "website" é invisível no form real.
    // Se vier preenchido, é bot. Respondemos como sucesso (sem gravar nada)
    // para não sinalizar ao bot que foi bloqueado.
    if (body.website && body.website.trim().length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'pending',
          message: 'Vaga recebida. Publicamos após revisão, geralmente em até 24h.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validações obrigatórias
    if (!body.company_name || body.company_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Nome da empresa deve ter pelo menos 2 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.job_title || body.job_title.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Título da vaga deve ter pelo menos 3 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.job_url || !isValidUrl(body.job_url)) {
      return new Response(
        JSON.stringify({ error: 'URL de candidatura inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jobUrl = new URL(body.job_url.trim())

    if (jobUrl.protocol !== 'https:') {
      return new Response(
        JSON.stringify({ error: 'Link para candidatura deve usar https://' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (isShortenerUrl(jobUrl)) {
      return new Response(
        JSON.stringify({ error: 'Não aceitamos links encurtados (bit.ly, t.co, tinyurl). Use o link direto da vaga.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.about_company || body.about_company.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Descrição da empresa deve ter pelo menos 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.responsibilities || body.responsibilities.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Responsabilidades devem ter pelo menos 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.requirements || body.requirements.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Requisitos devem ter pelo menos 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Anti-spam: conteúdo total precisa ter substância mínima
    const combinedDescriptionLength = [
      body.description_full,
      body.about_company,
      body.responsibilities,
      body.requirements,
    ]
      .filter(Boolean)
      .join(' ')
      .trim().length

    if (combinedDescriptionLength < MIN_DESCRIPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `A descrição da vaga precisa ter pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres no total` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // E-mail de contato é opcional, mas se informado deve ser válido
    if (body.submitted_by_email && !isValidEmail(body.submitted_by_email.trim())) {
      return new Response(
        JSON.stringify({ error: 'E-mail de contato inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar URLs opcionais
    if (body.company_url && !isValidUrl(body.company_url)) {
      return new Response(
        JSON.stringify({ error: 'URL da empresa inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.logo_url && !isValidUrl(body.logo_url)) {
      return new Response(
        JSON.stringify({ error: 'URL do logo inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit per IP: hash the IP (never store raw), count submissions in the last hour
    const clientIp = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown').split(',')[0].trim()
    const ipDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientIp))
    const submitterIpHash = Array.from(new Uint8Array(ipDigest)).map((b) => b.toString(16).padStart(2, '0')).join('')

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('vagas_ia')
      .select('id', { count: 'exact', head: true })
      .eq('submitter_ip_hash', submitterIpHash)
      .gte('submitted_at', oneHourAgo)

    // Max 3 submissions per IP per hour
    if ((recentCount ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: 'Muitas submissões recentes. Aguarde alguns minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar ID único
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    // Inserir vaga com status 'pending' para moderação
    const { data, error } = await supabase
      .from('vagas_ia')
      .insert([{
        job_id: jobId,
        job_url: jobUrl.toString(),
        job_title: sanitizeText(body.job_title),
        company_name: sanitizeText(body.company_name),
        company_url: body.company_url?.trim() || null,
        company_id: null,
        logo_url: body.logo_url?.trim() || null,
        location: sanitizeText(body.location),
        posted_at: new Date().toISOString(),
        seniority_level: sanitizeText(body.seniority_level),
        employment_type: sanitizeText(body.employment_type),
        workplace_type: sanitizeText(body.workplace_type),
        is_remote: body.is_remote || false,
        is_easy_apply: false,
        description_full: sanitizeText(body.description_full),
        about_company: sanitizeText(body.about_company),
        responsibilities: sanitizeText(body.responsibilities),
        requirements: sanitizeText(body.requirements),
        differentials: sanitizeText(body.differentials),
        benefits: sanitizeText(body.benefits),
        salary: sanitizeText(body.salary),
        process: sanitizeText(body.process),
        status: 'pending', // Requer aprovação manual
        submitted_by_email: body.submitted_by_email?.trim() || null,
        submitter_ip_hash: submitterIpHash,
      }])
      .select()

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2))
      throw new Error('Erro ao salvar vaga. Tente novamente em alguns minutos.')
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'pending',
        message: 'Vaga recebida. Publicamos após revisão, geralmente em até 24h.',
        job_id: jobId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
