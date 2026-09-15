import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
}

interface ProfessionItem {
  slug: string
  reviewed_at: string | null
  updated_at: string
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toLastmod(profession: ProfessionItem): string {
  const date = profession.reviewed_at || profession.updated_at
  return new Date(date).toISOString().split('T')[0]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: professionsData, error: professionsError } = await supabase
      .from('professions_public')
      .select('slug, reviewed_at, updated_at')
      .order('sort_order', { ascending: true })

    if (professionsError) console.error('Professions error:', professionsError)

    const professions: ProfessionItem[] = professionsData || []
    const today = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.usezuno.app/profissoes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://www.usezuno.app/quiz</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
`

    for (const profession of professions) {
      xml += `  <url>
    <loc>https://www.usezuno.app/profissoes/${escapeXml(profession.slug)}</loc>
    <lastmod>${toLastmod(profession)}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
`
    }

    xml += '</urlset>'

    return new Response(xml, { headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: corsHeaders }
    )
  }
})
