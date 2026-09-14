# AbacatePay Webhook

Edge function: `supabase/functions/abacatepay-webhook`

Recebe a confirmação de pagamento da AbacatePay e marca `subscribers.payment_confirmed_at`.
Resolve o P03 do PRD ("Webhook AbacatePay ausente") e o F2 de `docs/PRODUCT_OPPORTUNITIES.md`
("Já paguei" navegava para sucesso sem qualquer verificação).

## Setup

1. Gerar um segredo forte (ex.: `openssl rand -hex 32`) e salvar como secret da função:

   ```bash
   npx supabase secrets set ABACATEPAY_WEBHOOK_SECRET=<segredo> --project-ref $SUPABASE_PROJECT_REF
   ```

2. Deploy da função (linha a adicionar em `deploy-functions.sh` — outro agente é dono desse
   arquivo, então **não foi editado aqui**; só o comando a incluir):

   ```bash
   npx supabase functions deploy abacatepay-webhook --project-ref "$SUPABASE_PROJECT_REF"
   ```

3. No painel da AbacatePay, registrar a URL do webhook com o segredo na query string:

   ```
   https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=<segredo>
   ```

   A verificação de autenticidade é feita comparando esse `webhookSecret` (query param) com
   `ABACATEPAY_WEBHOOK_SECRET` via comparação em tempo constante. Requisições sem o parâmetro
   ou com valor incorreto recebem `401`.

## Suposições sobre o payload

A AbacatePay não documenta publicamente (no momento) um schema fixo de webhook, então a função
é defensiva ao extrair campos. **Antes de considerar isso definitivo, dispare um evento de teste
pelo dashboard da AbacatePay e confira o payload real contra as suposições abaixo.**

- Evento de confirmação: `billing.paid` (nome oficial). Também aceitos por tolerância:
  `payment.confirmed`, `billing.completed`.
- Email do cliente, em ordem de tentativa:
  `data.billing.customer.metadata.email` → `data.customer.email` →
  `data.billing.customer.email` → `data.customer.metadata.email`.
- Id do pagamento: `data.billing.id` → `data.payment.id` → `data.id`.
- Data de pagamento: `data.billing.paidAt` → `data.payment.paidAt` → `data.paidAt` →
  (fallback) horário de recebimento do webhook.
- Qualquer evento fora da lista de confirmação retorna `200 { received: true }` (para a
  AbacatePay parar de reenviar), mas não altera dados.

## Limitação conhecida: sem coluna `payment_provider_id`

`docs/supabase-subscribers-setup.sql` não define uma coluna para o id do pagamento do provider.
A função **não adiciona migração** (fora do escopo deste agente) — o id do pagamento é apenas
logado (`console.log`/`console.error`) para observabilidade. Quando essa coluna existir, atualizar
a função para persistir `payment_provider_id`.

## Idempotência

- Se o subscriber já existir e já tiver `payment_confirmed_at`, o webhook é um no-op (retries
  do provider não sobrescrevem a data original).
- Se existir mas ainda não tiver confirmação, atualiza `payment_confirmed_at`.
- Se não existir nenhum subscriber com aquele email, cria um registro mínimo
  (`source: 'checkout'`, `payment_confirmed_at` preenchido, `instagram`/`whatsapp` com
  placeholders) para que o pagamento nunca fique órfão — precisa de complemento manual depois.

## Simular com curl

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=<segredo>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "billing.paid",
    "data": {
      "billing": {
        "id": "bill_aJYE06HEdYEUx2fHd3L0mTNa",
        "amount": 4990,
        "paidAt": "2026-09-14T12:00:00Z",
        "customer": {
          "email": "cliente@example.com",
          "metadata": { "email": "cliente@example.com", "name": "Cliente Teste" }
        }
      }
    }
  }'
```

Resposta esperada: `200 { "received": true }`. Sem `webhookSecret` correto: `401`.

## Fora de escopo / follow-up

`CheckoutSuccessPage` ainda não confere se o pagamento foi de fato confirmado — ela só é
alcançada pelo clique manual em "Já paguei, continuar" (ver `components/CheckoutPage.tsx`).
O próximo passo é criar uma RPC de leitura (`get_subscriber_payment_status` ou similar) que a
tela de sucesso possa consultar via polling, e mostrar um estado de "aguardando confirmação"
enquanto `payment_confirmed_at` ainda é `null`. Isso não foi implementado aqui.
