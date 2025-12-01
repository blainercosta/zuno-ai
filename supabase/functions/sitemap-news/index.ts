import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
}

interface NewsItem {
  id: string
  title: string
  published_at: string
  category: string
  slug?: string
}

function generateSlug(title: string, id: string | number): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return `${slug}-${id}`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get news from last 2 days (Google News requirement)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Fetch from news table
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('id, title, published_at, category, slug')
      .or('status.eq.published,status.is.null')
      .gte('published_at', twoDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(1000)

    // Fetch from posts table
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, title, published_at, category, slug')
      .eq('status', 'published')
      .gte('published_at', twoDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(1000)

    if (newsError) console.error('News error:', newsError)
    if (postsError) console.error('Posts error:', postsError)

    const allNews: NewsItem[] = [
      ...(newsData || []),
      ...(postsData || []),
    ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    // Generate sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`

    for (const item of allNews) {
      const slug = item.slug || generateSlug(item.title, item.id)
      const pubDate = new Date(item.published_at).toISOString().split('T')[0]
      const keywords = [
        item.category,
        'IA',
        'inteligência artificial',
        'tecnologia',
      ].filter(Boolean).join(', ')

      xml += `  <url>
    <loc>https://usezuno.app/noticias-ia/${escapeXml(slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Zuno AI</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
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
