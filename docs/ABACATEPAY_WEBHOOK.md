# AbacatePay Webhook

Edge functions: `supabase/functions/create-checkout` e `supabase/functions/abacatepay-webhook`

Recebe a confirmação de pagamento da AbacatePay e marca `subscribers.payment_confirmed_at`.
Resolve o P03 do PRD ("Webhook AbacatePay ausente") e o F2 de `docs/PRODUCT_OPPORTUNITIES.md`
("Já paguei" navegava para sucesso sem qualquer verificação).

## Fluxo (checkout por cliente)

Até esta mudança, `CheckoutPage` abria um link PIX reutilizável fixo (`bill_...`) da
AbacatePay. Um link reutilizável não carrega `externalId`/metadata por cliente, então o
webhook recebia `data.customer.email = null`, `data.checkout.externalId = null` e
`data.checkout.metadata = null` — não havia como casar o pagamento com um subscriber.

Fluxo atual:

```
CheckoutPage (form: nome, email, whatsapp)
        │  POST /functions/v1/create-checkout
        ▼
create-checkout
        │  upsert subscribers (por email)
        │  POST https://api.abacatepay.com/v2/checkouts/create
        │    externalId = subscriber.id
        │    metadata.subscriber_id = subscriber.id
        ▼
AbacatePay (checkout PIX individual, retorna { url, billingId })
        │  window.open(url) — usuário paga
        ▼
AbacatePay envia webhook (event: checkout.completed)
        ▼
abacatepay-webhook
        │  match por data.checkout.externalId / metadata.subscriber_id (id do subscriber)
        │  fallback: match por email (extractEmail)
        └─ update subscribers.payment_confirmed_at
```

Um link reutilizável nunca poderá ser casado de volta a um subscriber específico — ele não
carrega `externalId` nem metadata por cliente. Este fluxo substitui o link fixo por um
checkout individual por cliente exatamente para resolver isso.

## Payload real observado (v2, evento `checkout.completed`)

Capturado em produção antes desta mudança (checkout criado pelo link reutilizável antigo —
por isso os campos de identificação do cliente vêm todos `null`):

```json
{
  "event": "checkout.completed",
  "data": {
    "checkout": {
      "id": "bill_...",
      "status": "ACTIVE",
      "externalId": null,
      "metadata": null,
      "receiptUrl": "https://..."
    },
    "customer": {
      "email": null
    }
  }
}
```

Pontos importantes confirmados por esse payload real:

- `data.checkout.status` vem `"ACTIVE"` mesmo em um evento de pagamento confirmado — **não
  filtrar por status**, o nome do evento (`checkout.completed`) já é o sinal.
- Um checkout criado a partir de um link reutilizável nunca preenche `externalId`/`metadata`
  — por isso a mudança para checkout individual por cliente via `create-checkout`.
- Com `create-checkout`, o mesmo payload chega com `data.checkout.externalId` e
  `data.checkout.metadata.subscriber_id` preenchidos com o id do subscriber
  (`subscribers.id`, que é `BIGSERIAL`/inteiro — não UUID).

## Setup

1. Gerar um segredo forte (ex.: `openssl rand -hex 32`) e salvar como secret da função:

   ```bash
   npx supabase secrets set ABACATEPAY_WEBHOOK_SECRET=<segredo> --project-ref $SUPABASE_PROJECT_REF
   ```

2. Configurar os secrets de `create-checkout`:

   ```bash
   npx supabase secrets set ABACATEPAY_API_KEY=<chave-abacatepay> --project-ref $SUPABASE_PROJECT_REF
   # Opcionais (já têm default no código):
   npx supabase secrets set ABACATEPAY_PRODUCT_ID=prod_SUnKE04rDRpXQADSaUajkYEm --project-ref $SUPABASE_PROJECT_REF
   npx supabase secrets set ABACATEPAY_METHODS=PIX --project-ref $SUPABASE_PROJECT_REF
   ```

3. Deploy das funções (já incluído em `deploy-functions.sh`):

   ```bash
   npx supabase functions deploy abacatepay-webhook --project-ref "$SUPABASE_PROJECT_REF"
   npx supabase functions deploy create-checkout --project-ref "$SUPABASE_PROJECT_REF"
   ```

4. No painel da AbacatePay, registrar a URL do webhook com o segredo na query string:

   ```
   https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=<segredo>
   ```

   A verificação de autenticidade é feita comparando esse `webhookSecret` (query param) com
   `ABACATEPAY_WEBHOOK_SECRET` via comparação em tempo constante. Requisições sem o parâmetro
   ou com valor incorreto recebem `401`.

## Suposições sobre o payload

A AbacatePay não documenta publicamente (no momento) um schema fixo de webhook, então a função
é defensiva ao extrair campos.

- Evento de confirmação: `checkout.completed` (v2, o que a integração atual usa) e, por
  tolerância, os nomes v1/variantes: `billing.paid`, `payment.confirmed`, `billing.completed`,
  `transparent.completed`, `subscription.completed`, `subscription.renewed`.
- **Não filtramos por `data.checkout.status`** — o payload real mostrou `status: "ACTIVE"`
  em um evento `checkout.completed` já pago; o nome do evento é o sinal de confirmação.
- Subscriber id (caminho preferencial), em ordem de tentativa:
  `data.checkout.externalId` → `data.checkout.metadata.subscriber_id` →
  `data.billing.externalId`. Só é aceito se for numérico (`subscribers.id` é `BIGSERIAL`).
- Email do cliente (fallback quando não há subscriber id), em ordem de tentativa:
  `data.billing.customer.metadata.email` → `data.customer.email` →
  `data.billing.customer.email` → `data.customer.metadata.email` → busca profunda por
  qualquer chave `email` no payload.
- Id do pagamento: `data.billing.id` → `data.payment.id` → `data.id`.
- Data de pagamento: `data.billing.paidAt` → `data.payment.paidAt` → `data.paidAt` →
  (fallback) horário de recebimento do webhook.
- Qualquer evento fora da lista de confirmação retorna `200 { received: true }` (para a
  AbacatePay parar de reenviar), mas não altera dados.
- Um evento de confirmação sem subscriber id numérico **e** sem email (link reutilizável,
  ou payload nunca visto antes) retorna `200 { received: true, matched: false }` — a
  AbacatePay para de reentregar, mas fica um `console.error` com `receiptUrl` para
  reconciliação manual.

## Limitação conhecida: sem coluna `payment_provider_id`

`docs/supabase-subscribers-setup.sql` não define uma coluna para o id do pagamento do provider.
A função **não adiciona migração** (fora do escopo deste agente) — o id do pagamento é apenas
logado (`console.log`/`console.error`) para observabilidade. Quando essa coluna existir, atualizar
a função para persistir `payment_provider_id`.

## Idempotência

- Se o subscriber já existir (por id ou por email) e já tiver `payment_confirmed_at`, o
  webhook é um no-op (retries do provider não sobrescrevem a data original).
- Se existir mas ainda não tiver confirmação, atualiza `payment_confirmed_at`.
- Se houver subscriber id no payload mas nenhum subscriber com esse id (não deveria
  acontecer no fluxo normal — `create-checkout` sempre cria o subscriber antes de criar o
  checkout), cai para o caminho por email antes de desistir.
- Se não existir nenhum subscriber com aquele email (sem subscriber id no payload), cria um
  registro mínimo (`source: 'checkout'`, `payment_confirmed_at` preenchido,
  `instagram`/`whatsapp` com placeholders) para que o pagamento nunca fique órfão — precisa
  de complemento manual depois.

## Simular com curl

Match por subscriber id (caminho esperado com `create-checkout`):

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=<segredo>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "checkout.completed",
    "data": {
      "checkout": {
        "id": "bill_aJYE06HEdYEUx2fHd3L0mTNa",
        "status": "ACTIVE",
        "externalId": "42",
        "metadata": { "subscriber_id": "42", "email": "cliente@example.com" }
      }
    }
  }'
```

Resposta esperada: `200 { "received": true, "matched": true }`.

Match por email (fallback, ex.: payload sem externalId):

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=<segredo>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "checkout.completed",
    "data": {
      "customer": { "email": "cliente@example.com" }
    }
  }'
```

Sem `webhookSecret` correto: `401`. Sem subscriber id numérico e sem email: `200 { "received": true, "matched": false }`.

## Fora de escopo / follow-up

`CheckoutSuccessPage` ainda não confere se o pagamento foi de fato confirmado no backend —
ela é alcançada tanto pelo clique manual em "Já paguei, continuar" quanto pelo
`completionUrl` do checkout AbacatePay (ver `components/CheckoutPage.tsx`). O próximo passo é
criar uma RPC de leitura (`get_subscriber_payment_status` ou similar) que a tela de sucesso
possa consultar via polling, e mostrar um estado de "aguardando confirmação" enquanto
`payment_confirmed_at` ainda é `null`. Isso não foi implementado aqui.
