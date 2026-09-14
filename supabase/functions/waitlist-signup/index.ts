import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WaitlistData {
  name: string
  email: string
  phone: string
  ref?: string
}

// Validação de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Código de referral: 4-16 caracteres [a-z0-9], igual ao formato gerado pelo trigger set_referral_code
function isValidRefFormat(ref: string): boolean {
  return /^[a-z0-9]{4,16}$/.test(ref)
}

// Validação de telefone brasileiro
function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

// Sanitiza nome removendo caracteres especiais
function sanitizeName(name: string): string {
  return name
    .replace(/[<>'"&]/g, '')
    .trim()
    .substring(0, 100) // Limite de caracteres
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
    const body: WaitlistData = await req.json()

    // Validações
    if (!body.name || body.name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Nome deve ter pelo menos 2 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar que nome contém apenas letras
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(body.name)) {
      return new Response(
        JSON.stringify({ error: 'Nome deve conter apenas letras' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.email || !isValidEmail(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.phone || !isValidPhone(body.phone)) {
      return new Response(
        JSON.stringify({ error: 'Telefone inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting por IP
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('beta_waitlist')
      .select('id')
      .eq('email', body.email.trim().toLowerCase())
      .single()

    if (existingEmail) {
      // Never leak the existing referral_code on duplicates (account enumeration + link takeover)
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar referral code (opcional): se não existir na base, ignora em silêncio
    // em vez de falhar o cadastro por causa de um link de indicação inválido/expirado.
    let referredBy: string | null = null
    if (body.ref && isValidRefFormat(body.ref)) {
      const { data: referrer } = await supabase
        .from('beta_waitlist')
        .select('referral_code')
        .eq('referral_code', body.ref)
        .single()

      if (referrer) {
        referredBy = referrer.referral_code
      }
    }

    // Rate limiting: máximo 3 cadastros por hora do mesmo IP
    // (Em produção, implemente com Redis para melhor performance)

    // Limpar telefone
    const cleanPhone = body.phone.replace(/\D/g, '')

    // Inserir na waitlist (referral_code é atribuído pelo trigger set_referral_code)
    const { data, error } = await supabase
      .from('beta_waitlist')
      .insert([{
        name: sanitizeName(body.name),
        email: body.email.trim().toLowerCase(),
        phone: cleanPhone,
        referred_by: referredBy,
        created_at: new Date().toISOString(),
      }])
      .select('id, referral_code')
      .single()

    if (error) {
      console.error('Supabase error:', error)

      // Tratar erro de duplicata
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Este email já está cadastrado' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      throw new Error('Erro ao cadastrar')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        referral_code: data.referral_code,
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
