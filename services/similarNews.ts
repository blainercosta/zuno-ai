import { fetchSimilarNews } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { News } from '@/types/news'

/**
 * Busca notícias similares via Edge Function (OpenAI fica no backend, seguro)
 * Fallback local: se a Edge Function falhar, usa busca por categoria
 */
export async function findSimilarNews(currentNews: News, limit = 4): Promise<News[]> {
  try {
    const result = await fetchSimilarNews({ newsId: currentNews.id, limit })

    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data as News[]
    }

    console.warn('Edge Function não retornou resultados, usando fallback local')
    return findSimilarNewsByCategory(currentNews, limit)
  } catch (error) {
    console.error('Erro ao buscar notícias similares:', error)
    return findSimilarNewsByCategory(currentNews, limit)
  }
}

/**
 * Versão que usa busca por categoria sem IA
 * Útil para quando a API key não está disponível ou para fallback rápido
 */
export async function findSimilarNewsByCategory(currentNews: News, limit = 4): Promise<News[]> {
  try {
    const isUUID = typeof currentNews.id === 'string' && currentNews.id.includes('-')

    // Fetch from both tables
    const [newsResult, postsResult] = await Promise.all([
      supabase
        .from('news')
        .select('id, title, category, subtitle, cover_image, published_at, author, read_time, slug')
        .or('status.eq.published,status.is.null')
        .neq('id', isUUID ? currentNews.id : 'impossible-id')
        .order('published_at', { ascending: false })
        .limit(20),
      supabase
        .from('posts')
        .select('id, title, category, excerpt, image_url, published_at, author, read_time, slug')
        .eq('status', 'published')
        .neq('id', !isUUID ? currentNews.id : -999999)
        .order('published_at', { ascending: false })
        .limit(20),
    ])

    const allNews: News[] = [
      ...(newsResult.data || []).map(n => ({
        ...n,
        image_url: n.cover_image,
        excerpt: n.subtitle,
      })),
      ...(postsResult.data || []),
    ]

    // Prioritize same category
    const sameCategory = allNews.filter(n => n.category === currentNews.category)
    const differentCategory = allNews.filter(n => n.category !== currentNews.category)

    return [...sameCategory, ...differentCategory].slice(0, limit)
  } catch (error) {
    console.error('Erro ao buscar notícias similares:', error)
    return []
  }
}
