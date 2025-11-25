import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { News } from '@/types/news'

const NEWS_PER_PAGE = 12

export function useNews(category?: string) {
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchNews = useCallback(async (pageNumber: number, filterCategory?: string) => {
    setIsLoading(true)

    const start = pageNumber * NEWS_PER_PAGE
    const end = start + NEWS_PER_PAGE - 1

    let query = supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    // Apply category filter if provided and not "Tudo"
    if (filterCategory && filterCategory !== 'Tudo') {
      query = query.eq('category', filterCategory)
    }

    const { data, error } = await query.range(start, end)

    if (error) {
      console.error('Error fetching news:', error)
      setIsLoading(false)
      return
    }

    if (data) {
      if (pageNumber === 0) {
        setNews(data)
      } else {
        setNews(prev => [...prev, ...data])
      }

      setHasMore(data.length === NEWS_PER_PAGE)
    }

    setIsLoading(false)
  }, [])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNews(nextPage, category)
    }
  }, [page, isLoading, hasMore, fetchNews, category])

  // Reset and fetch when category changes
  useEffect(() => {
    setPage(0)
    setNews([])
    setHasMore(true)
    fetchNews(0, category)
  }, [category, fetchNews])

  return {
    news,
    isLoading,
    hasMore,
    loadMore
  }
}
