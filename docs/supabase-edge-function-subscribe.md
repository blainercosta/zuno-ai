# Edge Function: subscribe

## Deploy Manual via Dashboard

1. Acesse: **Supabase Dashboard → Edge Functions**
2. Clique em **Create a new function**
3. Nome: `subscribe`
4. Cole o código abaixo:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validadores
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
  instagram: (value: string) => {
    const cleaned = (value || '').trim().replace('@', '').toLowerCase();
    if (cleaned.length < 2) return 'Instagram deve ter pelo menos 2 caracteres';
    if (cleaned.length > 30) return 'Instagram muito longo';
    if (!/^[a-z0-9._]+$/.test(cleaned)) return 'Instagram contém caracteres inválidos';
    return null;
  },
  whatsapp: (value: string) => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length < 10) return 'WhatsApp deve ter pelo menos 10 dígitos';
    if (digits.length > 13) return 'WhatsApp muito longo';
    return null;
  },
  niche: (value: string) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Nicho é obrigatório';
    if (trimmed.length < 2) return 'Nicho deve ter pelo menos 2 caracteres';
    if (trimmed.length > 50) return 'Nicho muito longo';
    return null;
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, instagram, whatsapp, niche, utm_source, utm_medium, utm_campaign } = body;

    // Validar todos os campos
    const errors: Record<string, string> = {};

    const nameError = validators.name(name);
    if (nameError) errors.name = nameError;

    const emailError = validators.email(email);
    if (emailError) errors.email = emailError;

    const instagramError = validators.instagram(instagram);
    if (instagramError) errors.instagram = instagramError;

    const whatsappError = validators.whatsapp(whatsapp);
    if (whatsappError) errors.whatsapp = whatsappError;

    const nicheError = validators.niche(niche);
    if (nicheError) errors.niche = nicheError;

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente com service_role (acesso admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Normalizar dados
    const subscriberData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      instagram: instagram.trim().replace('@', '').toLowerCase(),
      whatsapp: whatsapp.trim(),
      niche: niche.trim(),
      source: 'checkout',
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    };

    // Inserir no banco
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert(subscriberData)
      .select('id, name, email')
      .single();

    if (error) {
      // Tratar erros de duplicata
      if (error.code === '23505') {
        let message = 'Dados já cadastrados';
        if (error.message.includes('email')) {
          message = 'Este email já está cadastrado';
        } else if (error.message.includes('whatsapp')) {
          message = 'Este WhatsApp já está cadastrado';
        }
        return new Response(
          JSON.stringify({ success: false, error: message, code: 'DUPLICATE' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao salvar dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: { id: data.id, name: data.name } }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

5. Clique em **Deploy**

## Testar a função

```bash
curl -X POST 'https://xmklmkorbeubifamizln.supabase.co/functions/v1/subscribe' \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "instagram": "testeuser",
    "whatsapp": "11999887766",
    "niche": "Tech & Startups"
  }'
```

## Variáveis de ambiente

As seguintes variáveis já estão disponíveis automaticamente:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Não precisa configurar nada adicional.
