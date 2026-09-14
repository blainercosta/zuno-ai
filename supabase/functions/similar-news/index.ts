import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  id: string | number
  title: string
  category: string
  raw_category?: string
  content?: string
  excerpt?: string
  subtitle?: string
  image_url?: string
  cover_image?: string
  published_at: string
  author?: string
  read_time?: string
  slug?: string
  embedding?: number[] | string | null
  embedding_updated_at?: string | null
}

// news-table row shape, straight from match_news / the `news` table (before remapping)
interface NewsRow {
  id: string
  title: string
  category: string
  raw_category?: string | null
  content?: string | null
  subtitle?: string | null
  cover_image?: string | null
  published_at: string
  author?: string | null
  read_time?: string | null
  slug?: string | null
  embedding?: number[] | string | null
  embedding_updated_at?: string | null
}

function mapNewsRow(n: NewsRow): NewsItem {
  return {
    id: n.id,
    title: n.title,
    category: n.category,
    raw_category: n.raw_category ?? undefined,
    content: n.content ?? undefined,
    published_at: n.published_at,
    author: n.author ?? undefined,
    read_time: n.read_time ?? undefined,
    slug: n.slug ?? undefined,
    image_url: n.cover_image ?? undefined,
    excerpt: n.subtitle ?? undefined,
  }
}

function generateNewsText(news: NewsItem): string {
  const parts = [
    news.title,
    news.category || '',
    news.excerpt || news.subtitle || '',
    // Use first 500 chars of content if available
    typeof news.content === 'string' ? news.content.replace(/<[^>]*>/g, '').substring(0, 500) : '',
  ]
  return parts.filter(Boolean).join(' ')
}

async function createEmbedding(openai: OpenAI, text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embedding:', error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newsId, limit: rawLimit = 4 } = await req.json()
    const limit = Math.min(Math.max(Number(rawLimit) || 4, 1), 10)

    if (!newsId) {
      return new Response(
        JSON.stringify({ error: 'newsId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Determine if it's a UUID (news table) or integer (posts table)
    const isUUID = typeof newsId === 'string' && newsId.includes('-')

    let currentNews: NewsItem | null = null

    if (isUUID) {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, category, raw_category, content, subtitle, cover_image, published_at, author, read_time, slug, embedding')
        .eq('id', newsId)
        .or('status.eq.published,status.is.null')
        .single()

      if (error) {
        console.error('Error fetching news:', error)
      } else if (data) {
        currentNews = mapNewsRow(data as NewsRow)
        currentNews.embedding = data.embedding
      }
    } else {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, category, content, excerpt, image_url, published_at, author, read_time, slug')
        .eq('id', newsId)
        .eq('status', 'published')
        .single()

      if (error) {
        console.error('Error fetching post:', error)
      } else if (data) {
        currentNews = data
      }
    }

    if (!currentNews) {
      return new Response(
        JSON.stringify({ error: 'Notícia não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Candidates from `posts` — the legacy blog table has no embedding column and is
    // out of scope for the pgvector migration, so it's only ever ranked by category
    // match, never by semantic similarity. No per-row embedding calls happen for it.
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, title, category, content, excerpt, image_url, published_at, author, read_time, slug')
      .eq('status', 'published')
      .neq('id', !isUUID ? newsId : -999999)
      .order('published_at', { ascending: false })
      .limit(30)

    const postsCandidates: NewsItem[] = postsData || []

    function categoryFallback(): NewsItem[] {
      const sameCategory = postsCandidates.filter(n => n.category === currentNews!.category)
      const rest = postsCandidates.filter(n => n.category !== currentNews!.category)
      return [...sameCategory, ...rest]
    }

    // If OpenAI is not configured, return category-based or random news (no embedding calls)
    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured, returning category-based or random news')
      return new Response(
        JSON.stringify({ data: categoryFallback().slice(0, limit) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Reuse the persisted embedding when the current item is a `news` row; compute it
    // once (and persist) if missing. `posts` has no embedding column, so for a post we
    // compute an embedding on the fly to rank `news` candidates against it, but never
    // persist it.
    let currentEmbedding: number[] | null = null

    if (isUUID && currentNews.embedding) {
      currentEmbedding = typeof currentNews.embedding === 'string'
        ? JSON.parse(currentNews.embedding)
        : currentNews.embedding
    } else {
      const currentNewsText = generateNewsText(currentNews)
      currentEmbedding = await createEmbedding(openai, currentNewsText)

      if (currentEmbedding && isUUID) {
        const { error: updateError } = await supabase
          .from('news')
          .update({
            embedding: currentEmbedding,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq('id', newsId)

        if (updateError) {
          console.error('Error persisting news embedding:', updateError)
        }
      }
    }

    if (!currentEmbedding) {
      return new Response(
        JSON.stringify({ data: categoryFallback().slice(0, limit) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Single ANN search in Postgres against `news` — no more per-candidate
    // embeddings.create calls for the (up to 60) candidates.
    const { data: newsMatches, error: matchError } = await supabase.rpc('match_news', {
      query_embedding: currentEmbedding,
      exclude_id: isUUID ? newsId : null,
      match_count: limit,
    })

    if (matchError) {
      console.error('Error calling match_news:', matchError)
      return new Response(
        JSON.stringify({ data: categoryFallback().slice(0, limit) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rankedNews = ((newsMatches || []) as NewsRow[]).map(mapNewsRow)

    // Fill any remaining slots with category-matched posts (still zero embedding calls).
    const remaining = limit - rankedNews.length
    const result = remaining > 0
      ? [...rankedNews, ...categoryFallback().slice(0, remaining)]
      : rankedNews.slice(0, limit)

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in similar-news function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
