import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Eventos que a AbacatePay pode disparar para confirmação de pagamento.
// 'billing.paid' é o nome documentado; os demais são tolerados defensivamente
// caso a nomenclatura mude entre ambientes/versões da API.
const PAYMENT_CONFIRMED_EVENTS = new Set([
  'billing.paid',
  'payment.confirmed',
  'billing.completed',
]);

interface WebhookPayload {
  event?: string;
  data?: {
    billing?: {
      id?: string;
      amount?: number;
      paidAt?: string;
      customer?: {
        email?: string;
        metadata?: { email?: string; name?: string };
      };
    };
    customer?: { email?: string; metadata?: { name?: string } };
    payment?: { id?: string; amount?: number; paidAt?: string };
    id?: string;
    amount?: number;
    paidAt?: string;
  };
}

// Constant-time comparison over fixed-length SHA-256 digests (no length leak)
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const ua = new Uint8Array(da), ub = new Uint8Array(db);
  let result = 0;
  for (let i = 0; i < ua.length; i++) result |= ua[i] ^ ub[i];
  return result === 0;
}

function extractEmail(data: WebhookPayload['data']): string | null {
  const candidate =
    data?.billing?.customer?.metadata?.email ??
    data?.customer?.email ??
    data?.billing?.customer?.email ??
    data?.customer?.metadata?.email ??
    null;

  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function extractName(data: WebhookPayload['data']): string | null {
  const candidate = data?.billing?.customer?.metadata?.name ?? data?.customer?.metadata?.name ?? null;
  return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate.trim() : null;
}

function extractPaymentId(data: WebhookPayload['data']): string | null {
  return data?.billing?.id ?? data?.payment?.id ?? data?.id ?? null;
}

function extractPaidAt(data: WebhookPayload['data']): string {
  return data?.billing?.paidAt ?? data?.payment?.paidAt ?? data?.paidAt ?? new Date().toISOString();
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

  // --- Verificação de autenticidade ---
  // AbacatePay envia o webhook para a URL configurada com o parâmetro de
  // query `webhookSecret`. Comparação em tempo constante evita timing attacks.
  const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET') ?? '';
  const url = new URL(req.url);
  // Prefer header (kept out of access logs); query param is AbacatePay's documented default
  const providedSecret = req.headers.get('x-webhook-secret') ?? url.searchParams.get('webhookSecret') ?? '';

  // TODO: Se a AbacatePay passar a enviar uma assinatura por header (ex.:
  // `x-abacatepay-signature`), validar aqui conforme a doc oficial:
  // https://docs.abacatepay.com/pages/webhooks — nenhum esquema de assinatura
  // por header é documentado hoje, então não inventamos verificação para ele.
  const headerSignature = req.headers.get('x-abacatepay-signature');
  if (headerSignature) {
    console.error('abacatepay-webhook: header signature present but not yet validated (see TODO)');
  }

  if (!expectedSecret || !providedSecret || !(await timingSafeEqual(providedSecret, expectedSecret))) {
    console.error('abacatepay-webhook: invalid or missing webhookSecret');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // --- Parse do corpo ---
  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error('abacatepay-webhook: invalid JSON body', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const event = payload.event ?? '';

  // Evento desconhecido: signature válida, então respondemos 200 para o
  // provider parar de retentar, mas não processamos nada.
  if (!PAYMENT_CONFIRMED_EVENTS.has(event)) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const email = extractEmail(payload.data);
  const paymentId = extractPaymentId(payload.data);
  const paidAt = extractPaidAt(payload.data);
  const name = extractName(payload.data);

  if (!email) {
    console.error('abacatepay-webhook: could not extract customer email from payload', {
      event,
      paymentId,
    });
    return new Response(JSON.stringify({ error: 'Missing customer email in payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // NOTA: a tabela `subscribers` (docs/supabase-subscribers-setup.sql) não
  // possui coluna `payment_provider_id` hoje. Guardamos o id do pagamento
  // apenas em log/observabilidade até que a coluna seja adicionada via
  // migração (fora do escopo deste agente).
  console.log('abacatepay-webhook: processing payment', { email, paymentId, event });

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('subscribers')
    .select('id, payment_confirmed_at')
    .eq('email', email)
    .maybeSingle();

  if (selectError) {
    console.error('abacatepay-webhook: failed to look up subscriber', selectError);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (existing) {
    // Idempotência: coalesce mantém a primeira confirmação registrada.
    if (existing.payment_confirmed_at) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from('subscribers')
      .update({ payment_confirmed_at: paidAt })
      .eq('id', existing.id);

    if (updateError) {
      console.error('abacatepay-webhook: failed to update subscriber', updateError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Nenhum subscriber encontrado: o pagamento nunca deve se perder, então
  // criamos um registro mínimo. Colunas NOT NULL sem valor conhecido recebem
  // placeholder — este subscriber deve ser revisado/completado manualmente.
  // `whatsapp` precisa de >=10 dígitos (CHECK constraint) e é único por
  // dígitos normalizados, então usamos timestamp+random para não colidir
  // entre múltiplos pagamentos órfãos.
  const placeholderWhatsapp = `${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

  const { error: insertError } = await supabaseAdmin.from('subscribers').insert({
    name: name ?? 'Pendente de completar cadastro',
    email,
    instagram: 'pendente',
    whatsapp: placeholderWhatsapp,
    niche: 'Outro',
    source: 'checkout',
    payment_confirmed_at: paidAt,
  });

  if (insertError) {
    console.error('abacatepay-webhook: failed to insert subscriber for orphan payment', insertError, {
      email,
      paymentId,
    });
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
