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
    const body: JobData = await req.json()

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

    // Rate limiting simples por IP (em produção use Redis)
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    // Verificar se já houve submissão recente deste IP (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentJobs, error: rateLimitError } = await supabase
      .from('vagas_ia')
      .select('id')
      .gte('posted_at', fiveMinutesAgo)
      .limit(5)

    // Se houver mais de 3 vagas nos últimos 5 minutos, bloquear
    if (recentJobs && recentJobs.length >= 3) {
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
        job_url: body.job_url.trim(),
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
      }])
      .select()

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2))
      throw new Error(`Erro ao salvar vaga: ${error.message || error.code || 'unknown'}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vaga enviada para aprovação',
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
