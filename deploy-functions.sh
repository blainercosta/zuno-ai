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
echo "=== Deploy concluído! ==="
echo ""
echo "Próximo passo (opcional - para similar-jobs com IA):"
echo "npx supabase secrets set OPENAI_API_KEY=sua_chave_openai --project-ref $SUPABASE_PROJECT_REF"
