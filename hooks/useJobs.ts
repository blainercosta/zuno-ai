import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/job'

const JOBS_PER_PAGE = 10

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchJobs = useCallback(async (pageNumber: number, query: string = '') => {
    setIsLoading(true)

    const start = pageNumber * JOBS_PER_PAGE
    const end = start + JOBS_PER_PAGE - 1

    let queryBuilder = supabase
      .from('vagas_ia')
      .select('*')
      .eq('status', 'active')

    // Add search filter if query exists
    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`
      queryBuilder = queryBuilder.or(
        `job_title.ilike.${searchTerm},company_name.ilike.${searchTerm},location.ilike.${searchTerm},seniority_level.ilike.${searchTerm}`
      )
    }

    const { data, error } = await queryBuilder
      .order('posted_at', { ascending: false })
      .range(start, end)

    if (error) {
      console.error('Error fetching jobs:', error)
      setIsLoading(false)
      return
    }

    if (data) {
      if (pageNumber === 0) {
        setJobs(data)
      } else {
        setJobs(prev => [...prev, ...data])
      }

      setHasMore(data.length === JOBS_PER_PAGE)
    }

    setIsLoading(false)
  }, [])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchJobs(nextPage, searchQuery)
    }
  }, [page, isLoading, hasMore, fetchJobs, searchQuery])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(0)
    setHasMore(true)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchJobs(0, query)
    }, 300)
  }, [fetchJobs])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setPage(0)
    setHasMore(true)
    fetchJobs(0, '')
  }, [fetchJobs])

  useEffect(() => {
    fetchJobs(0, '')
  }, [fetchJobs])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return {
    jobs,
    isLoading,
    hasMore,
    loadMore,
    searchQuery,
    search,
    clearSearch
  }
}
