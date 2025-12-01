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
  content?: string
  excerpt?: string
  subtitle?: string
  image_url?: string
  cover_image?: string
  published_at: string
  author?: string
  read_time?: string
  slug?: string
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

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newsId, limit = 4 } = await req.json()

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
        .select('id, title, category, content, subtitle, cover_image, published_at, author, read_time, slug')
        .eq('id', newsId)
        .or('status.eq.published,status.is.null')
        .single()

      if (error) {
        console.error('Error fetching news:', error)
      } else if (data) {
        currentNews = {
          ...data,
          image_url: data.cover_image,
          excerpt: data.subtitle,
        }
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

    // Fetch all published news from both tables
    const [newsResult, postsResult] = await Promise.all([
      supabase
        .from('news')
        .select('id, title, category, content, subtitle, cover_image, published_at, author, read_time, slug')
        .or('status.eq.published,status.is.null')
        .neq('id', isUUID ? newsId : 'impossible-id')
        .order('published_at', { ascending: false })
        .limit(30),
      supabase
        .from('posts')
        .select('id, title, category, content, excerpt, image_url, published_at, author, read_time, slug')
        .eq('status', 'published')
        .neq('id', !isUUID ? newsId : -999999)
        .order('published_at', { ascending: false })
        .limit(30),
    ])

    const allNews: NewsItem[] = [
      ...(newsResult.data || []).map(n => ({
        ...n,
        image_url: n.cover_image,
        excerpt: n.subtitle,
      })),
      ...(postsResult.data || []).map(p => ({
        ...p,
      })),
    ]

    if (allNews.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If OpenAI is not configured, return news from same category or random
    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured, returning category-based or random news')
      const sameCategory = allNews.filter(n => n.category === currentNews!.category)
      const result = sameCategory.length >= limit
        ? sameCategory.slice(0, limit)
        : [...sameCategory, ...allNews.filter(n => n.category !== currentNews!.category)]
            .slice(0, limit)

      return new Response(
        JSON.stringify({ data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Generate embedding for current news
    const currentNewsText = generateNewsText(currentNews)
    const currentEmbedding = await createEmbedding(openai, currentNewsText)

    if (!currentEmbedding) {
      // Fallback to category-based
      const sameCategory = allNews.filter(n => n.category === currentNews!.category)
      const result = sameCategory.length >= limit
        ? sameCategory.slice(0, limit)
        : [...sameCategory, ...allNews.filter(n => n.category !== currentNews!.category)]
            .slice(0, limit)

      return new Response(
        JSON.stringify({ data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate similarity with each news item
    const newsWithSimilarity = await Promise.all(
      allNews.map(async (news) => {
        const newsText = generateNewsText(news)
        const newsEmbedding = await createEmbedding(openai, newsText)

        if (!newsEmbedding) {
          return { news, similarity: 0 }
        }

        const similarity = cosineSimilarity(currentEmbedding, newsEmbedding)
        return { news, similarity }
      })
    )

    // Sort by similarity and return top N
    const sortedNews = newsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.news)

    return new Response(
      JSON.stringify({ data: sortedNews }),
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
