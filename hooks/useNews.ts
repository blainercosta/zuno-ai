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

    // Build query for news table
    let newsQuery = supabase
      .from('news')
      .select('*')
      .eq('status', 'published')

    // Build query for posts table
    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')

    // Apply category filter if provided and not "Tudo"
    if (filterCategory && filterCategory !== 'Tudo') {
      newsQuery = newsQuery.eq('category', filterCategory)
      postsQuery = postsQuery.eq('category', filterCategory)
    }

    // Fetch from both tables
    const [newsResult, postsResult] = await Promise.all([
      newsQuery,
      postsQuery
    ])

    if (newsResult.error) {
      console.error('Error fetching news:', newsResult.error)
    }

    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error)
    }

    // Merge and sort results by published_at
    const allNews = [
      ...(newsResult.data || []),
      ...(postsResult.data || [])
    ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    // Apply pagination
    const start = pageNumber * NEWS_PER_PAGE
    const end = start + NEWS_PER_PAGE
    const paginatedNews = allNews.slice(start, end)

    if (pageNumber === 0) {
      setNews(paginatedNews)
    } else {
      setNews(prev => [...prev, ...paginatedNews])
    }

    setHasMore(paginatedNews.length === NEWS_PER_PAGE)
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
