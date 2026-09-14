#!/bin/bash

# Script para deploy das Edge Functions do Supabase
# Execute: ./deploy-functions.sh

echo "=== Deploy Edge Functions ==="

# Verifica se o token está configurado
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Erro: SUPABASE_ACCESS_TOKEN não está configurado"
  echo ""
  echo "Para configurar:"
  echo "1. Acesse: https://supabase.com/dashboard/account/tokens"
  echo "2. Gere um novo token"
  echo "3. Execute: export SUPABASE_ACCESS_TOKEN=seu_token"
  echo ""
  exit 1
fi

# Verifica se o project ref está configurado
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "Erro: SUPABASE_PROJECT_REF não está configurado"
  echo ""
  echo "Para configurar:"
  echo "1. Acesse seu projeto no Supabase Dashboard"
  echo "2. Copie o Project Reference (Settings > General)"
  echo "3. Execute: export SUPABASE_PROJECT_REF=seu_project_ref"
  echo ""
  exit 1
fi

echo "Project: $SUPABASE_PROJECT_REF"
echo ""

# Link ao projeto
echo "Linking ao projeto..."
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Deploy das funções
echo ""
echo "Deploying post-job..."
npx supabase functions deploy post-job --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying waitlist-signup..."
npx supabase functions deploy waitlist-signup --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying similar-jobs..."
npx supabase functions deploy similar-jobs --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying sitemap-jobs..."
npx supabase functions deploy sitemap-jobs --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying similar-news..."
npx supabase functions deploy similar-news --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying backfill-embeddings..."
npx supabase functions deploy backfill-embeddings --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying extract-job-insights..."
npx supabase functions deploy extract-job-insights --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying abacatepay-webhook..."
npx supabase functions deploy abacatepay-webhook --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "Deploying create-checkout..."
npx supabase functions deploy create-checkout --project-ref "$SUPABASE_PROJECT_REF"

echo ""
echo "=== Deploy concluído! ==="
echo ""
echo "Secret opcional (similar-jobs com IA):"
echo "  npx supabase secrets set OPENAI_API_KEY=sk-... --project-ref $SUPABASE_PROJECT_REF"
echo "Secrets obrigatorios para novas functions:"
echo "  npx supabase secrets set ABACATEPAY_WEBHOOK_SECRET=... --project-ref $SUPABASE_PROJECT_REF"
echo "  npx supabase secrets set ADMIN_SECRET=... --project-ref $SUPABASE_PROJECT_REF"
echo "  npx supabase secrets set ABACATEPAY_API_KEY=... --project-ref $SUPABASE_PROJECT_REF"
echo "Secrets opcionais para create-checkout (tem default no código):"
echo "  npx supabase secrets set ABACATEPAY_PRODUCT_ID=prod_SUnKE04rDRpXQADSaUajkYEm --project-ref $SUPABASE_PROJECT_REF"
echo "  npx supabase secrets set ABACATEPAY_METHODS=PIX --project-ref $SUPABASE_PROJECT_REF"
echo ""
echo "Nota: a ingestão de notícias agora é feita pelo Kubo (webhook em"
echo "/api/kubo-ingest, Vercel). Configure em Vercel Env Vars:"
echo "  SUPABASE_SERVICE_ROLE_KEY=..."
echo "  KUBO_WEBHOOK_SECRET=... (mesmo valor cadastrado no Kubo delivery)"
