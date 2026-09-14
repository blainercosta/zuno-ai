import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Eventos que a AbacatePay pode disparar para confirmação de pagamento.
// 'billing.paid' é o nome documentado; os demais são tolerados defensivamente
// caso a nomenclatura mude entre ambientes/versões da API.
const PAYMENT_CONFIRMED_EVENTS = new Set([
  // Webhook v1
  'billing.paid',
  'payment.confirmed',
  'billing.completed',
  // Webhook v2 (docs.abacatepay.com/pages/webhooks)
  'checkout.completed',
  'transparent.completed',
  'subscription.completed',
  'subscription.renewed',
]);

interface WebhookPayload {
  event?: string;
  data?: {
    billing?: {
      id?: string;
      amount?: number;
      paidAt?: string;
      externalId?: string;
      customer?: {
        email?: string;
        metadata?: { email?: string; name?: string };
      };
    };
    checkout?: {
      id?: string;
      status?: string;
      externalId?: string;
      receiptUrl?: string;
      metadata?: { email?: string; subscriber_id?: string; name?: string };
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

// Fallback: depth-first search for the first string value under a key named "email".
// Payload shape differs between v1 (billing.customer.metadata.email) and v2 events.
function findEmailDeep(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== 'object' || depth > 6) return null;
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (key.toLowerCase() === 'email' && typeof v === 'string' && v.includes('@')) return v;
  }
  for (const v of Object.values(value as Record<string, unknown>)) {
    const found = findEmailDeep(v, depth + 1);
    if (found) return found;
  }
  return null;
}

function extractEmail(data: WebhookPayload['data']): string | null {
  const candidate =
    data?.billing?.customer?.metadata?.email ??
    data?.customer?.email ??
    data?.billing?.customer?.email ??
    data?.customer?.metadata?.email ??
    findEmailDeep(data) ??
    null;

  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function extractName(data: WebhookPayload['data']): string | null {
  const candidate = data?.billing?.customer?.metadata?.name ?? data?.customer?.metadata?.name ?? null;
  return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate.trim() : null;
}

// `subscribers.id` é BIGSERIAL (inteiro), não UUID — é o valor que
// create-checkout envia como `externalId`/`metadata.subscriber_id` para a
// AbacatePay. Validamos como inteiro positivo em vez de um formato UUID.
function extractSubscriberId(data: WebhookPayload['data']): string | null {
  const candidate =
    data?.checkout?.externalId ??
    data?.checkout?.metadata?.subscriber_id ??
    data?.billing?.externalId ??
    null;

  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  return /^\d+$/.test(trimmed) ? trimmed : null;
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

  // `checkout.completed` (v2) não garante `data.checkout.status === 'PAID'` —
  // payloads reais chegaram com `status: "ACTIVE"` em eventos já pagos. O
  // nome do evento (via PAYMENT_CONFIRMED_EVENTS) já é o sinal de confirmação;
  // não fazemos nenhuma checagem adicional sobre `status` aqui de propósito.
  const subscriberId = extractSubscriberId(payload.data);
  const email = extractEmail(payload.data);
  const paymentId = extractPaymentId(payload.data);
  const paidAt = extractPaidAt(payload.data);
  const name = extractName(payload.data);

  const logUnmatchable = () => {
    // Log top-level shape (keys only, no values) so the real payload path can be mapped
    console.error('abacatepay-webhook: could not match a subscriber for this payload', {
      event,
      paymentId,
      receiptUrl: payload.data?.checkout?.receiptUrl,
      dataKeys: payload.data ? Object.keys(payload.data) : [],
      nestedKeys: Object.fromEntries(
        Object.entries(payload.data ?? {}).map(([k, v]) => [k, v && typeof v === 'object' ? Object.keys(v as object) : typeof v])
      ),
    });
  };

  if (!subscriberId && !email) {
    // Sem externalId/metadata.subscriber_id e sem email: não há como associar a
    // um subscriber. Signature válida, então 200 para o provider parar de
    // retentar um evento que nunca vai casar — mas fica logado para reconciliação manual.
    logUnmatchable();
    return new Response(JSON.stringify({ received: true, matched: false }), {
      status: 200,
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
  console.log('abacatepay-webhook: processing payment', { subscriberId, email, paymentId, event });

  // --- (a) Match por subscriber id (externalId/metadata.subscriber_id) ---
  // É o caminho esperado para todo checkout criado pela função create-checkout.
  if (subscriberId) {
    const { data: byId, error: selectByIdError } = await supabaseAdmin
      .from('subscribers')
      .select('id, payment_confirmed_at')
      .eq('id', subscriberId)
      .maybeSingle();

    if (selectByIdError) {
      console.error('abacatepay-webhook: failed to look up subscriber by id', selectByIdError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (byId) {
      // Idempotência: coalesce mantém a primeira confirmação registrada.
      if (byId.payment_confirmed_at) {
        return new Response(JSON.stringify({ received: true, matched: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: updateByIdError } = await supabaseAdmin
        .from('subscribers')
        .update({ payment_confirmed_at: paidAt })
        .eq('id', byId.id);

      if (updateByIdError) {
        console.error('abacatepay-webhook: failed to update subscriber by id', updateByIdError);
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ received: true, matched: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // subscriberId veio no payload mas não existe na tabela: cai para o
    // caminho por email (se houver) antes de desistir.
  }

  // --- (b) Match por email (fluxo pré-existente) ---
  if (!email) {
    logUnmatchable();
    return new Response(JSON.stringify({ received: true, matched: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

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
      return new Response(JSON.stringify({ received: true, matched: true }), {
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

    return new Response(JSON.stringify({ received: true, matched: true }), {
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

  return new Response(JSON.stringify({ received: true, matched: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
