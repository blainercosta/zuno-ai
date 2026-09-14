import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validadores (mesmas regras de supabase/functions/subscribe/index.ts, sem instagram/niche obrigatórios)
const validators = {
  name: (value: string) => {
    const trimmed = (value || '').trim();
    if (trimmed.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (trimmed.length > 100) return 'Nome muito longo';
    return null;
  },
  email: (value: string) => {
    const trimmed = (value || '').trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(trimmed)) return 'Email inválido';
    return null;
  },
  whatsapp: (value: string) => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length < 10) return 'WhatsApp deve ter pelo menos 10 dígitos';
    if (digits.length > 13) return 'WhatsApp muito longo';
    return null;
  },
};

// Rate limit em memória por IP (best-effort: zera a cada cold start / não é
// compartilhado entre instâncias da edge function, mas cobre abuso simples).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

const ABACATEPAY_PRODUCT_ID_DEFAULT = 'prod_SUnKE04rDRpXQADSaUajkYEm';

interface AbacatePayCreateCheckoutResponse {
  data?: { id?: string; url?: string };
  success?: boolean;
  error?: string | null;
}

async function createAbacatePayCheckout(params: {
  apiKey: string;
  productId: string;
  methods: string[];
  externalId: string;
  email: string;
}): Promise<{ url: string; billingId: string } | null> {
  const response = await fetch('https://api.abacatepay.com/v2/checkouts/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      items: [{ id: params.productId, quantity: 1 }],
      externalId: params.externalId,
      methods: params.methods,
      returnUrl: 'https://www.usezuno.app/checkout',
      completionUrl: 'https://www.usezuno.app/checkout/sucesso',
      metadata: {
        email: params.email,
        subscriber_id: params.externalId,
        source: 'zuno-checkout',
      },
    }),
  });

  const result: AbacatePayCreateCheckoutResponse = await response.json().catch(() => ({}));

  if (!response.ok || !result.data?.url || !result.data?.id) {
    // Nunca logar a API key; o corpo de erro da AbacatePay não deve conter o header.
    console.error('create-checkout: AbacatePay request failed', {
      status: response.status,
      error: result.error,
    });
    return null;
  }

  return { url: result.data.url, billingId: result.data.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Muitas tentativas. Tente novamente em instantes.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const abacatepayApiKey = Deno.env.get('ABACATEPAY_API_KEY');
  if (!abacatepayApiKey) {
    console.error('create-checkout: ABACATEPAY_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'payment_provider_not_configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const productId = Deno.env.get('ABACATEPAY_PRODUCT_ID') || ABACATEPAY_PRODUCT_ID_DEFAULT;
  const methods = (Deno.env.get('ABACATEPAY_METHODS') || 'PIX')
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (err) {
    console.error('create-checkout: invalid JSON body', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { name, email, whatsapp, niche, utm_source, utm_medium, utm_campaign } = body as {
    name?: string;
    email?: string;
    whatsapp?: string;
    niche?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };

  const errors: Record<string, string> = {};
  const nameError = validators.name(name ?? '');
  if (nameError) errors.name = nameError;
  const emailError = validators.email(email ?? '');
  if (emailError) errors.email = emailError;
  const whatsappError = validators.whatsapp(whatsapp ?? '');
  if (whatsappError) errors.whatsapp = whatsappError;

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ success: false, errors }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const normalizedName = (name as string).trim();
  const normalizedWhatsapp = (whatsapp as string).trim();
  const normalizedNiche = niche ? niche.trim() : undefined;

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Upsert por email (case-insensitive): mantém payment_confirmed_at se já existir.
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('subscribers')
    .select('id, payment_confirmed_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (selectError) {
    console.error('create-checkout: failed to look up subscriber', selectError);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let subscriberId: string;

  if (existing) {
    if (existing.payment_confirmed_at) {
      return new Response(JSON.stringify({ alreadyPaid: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, unknown> = { name: normalizedName, whatsapp: normalizedWhatsapp };
    if (normalizedNiche) updates.niche = normalizedNiche;

    const { error: updateError } = await supabaseAdmin
      .from('subscribers')
      .update(updates)
      .eq('id', existing.id);

    if (updateError) {
      console.error('create-checkout: failed to update subscriber', updateError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    subscriberId = String(existing.id);
  } else {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('subscribers')
      .insert({
        name: normalizedName,
        email: normalizedEmail,
        // `instagram` é NOT NULL na tabela e este fluxo não coleta esse dado;
        // placeholder consistente com o usado hoje para pagamentos órfãos no webhook.
        instagram: 'pendente',
        whatsapp: normalizedWhatsapp,
        niche: normalizedNiche || 'Outro',
        source: 'checkout',
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: false, error: 'Estes dados já estão cadastrados', code: 'DUPLICATE' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('create-checkout: failed to insert subscriber', insertError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    subscriberId = String(inserted.id);
  }

  const checkout = await createAbacatePayCheckout({
    apiKey: abacatepayApiKey,
    productId,
    methods,
    externalId: subscriberId,
    email: normalizedEmail,
  });

  if (!checkout) {
    return new Response(JSON.stringify({ error: 'payment_provider_error' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // NOTA: `subscribers` (docs/supabase-subscribers-setup.sql) não tem coluna para o
  // billingId da AbacatePay hoje. Não persistimos esse valor (fora do escopo: exigiria
  // migração); ele só trafega na resposta para o front-end e no log abaixo.
  console.log('create-checkout: checkout created', { subscriberId, billingId: checkout.billingId });

  return new Response(JSON.stringify({ url: checkout.url, billingId: checkout.billingId }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
