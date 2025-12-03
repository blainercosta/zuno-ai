import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { News } from '@/types/news'

export function useTopNews(limit = 4) {
  const [topNews, setTopNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopNews = async () => {
      setIsLoading(true)

      // Get date 7 days ago
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoISO = weekAgo.toISOString()

      try {
        // Try fetching with view_count order first
        const newsQuery = supabase
          .from('news')
          .select('*')
          .or('status.eq.published,status.is.null')
          .gte('published_at', weekAgoISO)
          .order('view_count', { ascending: false, nullsFirst: false })
          .limit(limit)

        const postsQuery = supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .gte('published_at', weekAgoISO)
          .order('view_count', { ascending: false, nullsFirst: false })
          .limit(limit)

        const [newsResult, postsResult] = await Promise.all([newsQuery, postsQuery])

        // Check if view_count column exists (no error means it exists)
        const hasViewCount = !newsResult.error && !postsResult.error

        let mappedNews: News[] = []
        let postsData: News[] = []

        if (hasViewCount) {
          mappedNews = (newsResult.data || []).map(item => ({
            ...item,
            image_url: item.cover_image || item.image_url,
            excerpt: item.subtitle || item.excerpt,
            read_time: item.read_time || '5 min'
          }))
          postsData = postsResult.data || []
        } else {
          // Fallback: fetch without view_count order (most recent)
          const [newsFallback, postsFallback] = await Promise.all([
            supabase
              .from('news')
              .select('*')
              .or('status.eq.published,status.is.null')
              .gte('published_at', weekAgoISO)
              .order('published_at', { ascending: false })
              .limit(limit),
            supabase
              .from('posts')
              .select('*')
              .eq('status', 'published')
              .gte('published_at', weekAgoISO)
              .order('published_at', { ascending: false })
              .limit(limit)
          ])

          mappedNews = (newsFallback.data || []).map(item => ({
            ...item,
            image_url: item.cover_image || item.image_url,
            excerpt: item.subtitle || item.excerpt,
            read_time: item.read_time || '5 min'
          }))
          postsData = postsFallback.data || []
        }

        // Merge and sort by view_count (or published_at if no view_count)
        const allNews = [...mappedNews, ...postsData]
          .sort((a, b) => {
            // Sort by view_count if available, otherwise by date
            if (a.view_count !== undefined && b.view_count !== undefined) {
              return (b.view_count || 0) - (a.view_count || 0)
            }
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          })
          .slice(0, limit)

        setTopNews(allNews)
      } catch {
        // If all else fails, just set empty array
        setTopNews([])
      }

      setIsLoading(false)
    }

    fetchTopNews()
  }, [limit])

  return { topNews, isLoading }
}

// Function to increment view count
export async function incrementViewCount(newsId: number | string, table: 'news' | 'posts' = 'posts') {
  try {
    // First try RPC (if available)
    const { error: rpcError } = await supabase.rpc(
      table === 'posts' ? 'increment_post_view' : 'increment_news_view',
      table === 'posts' ? { post_id: newsId } : { news_id: newsId }
    )

    if (rpcError) {
      // Fallback: get current count and increment
      const { data } = await supabase
        .from(table)
        .select('view_count')
        .eq('id', newsId)
        .single()

      const currentCount = data?.view_count || 0

      await supabase
        .from(table)
        .update({ view_count: currentCount + 1 })
        .eq('id', newsId)
    }
  } catch {
    // Silently fail - view tracking is not critical
  }
}
