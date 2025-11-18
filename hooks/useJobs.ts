import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/job'

const JOBS_PER_PAGE = 10

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchJobs = useCallback(async (pageNumber: number) => {
    setIsLoading(true)

    const start = pageNumber * JOBS_PER_PAGE
    const end = start + JOBS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('vagas_ia')
      .select('*')
      .eq('status', 'active')
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
      fetchJobs(nextPage)
    }
  }, [page, isLoading, hasMore, fetchJobs])

  useEffect(() => {
    fetchJobs(0)
  }, [fetchJobs])

  return {
    jobs,
    isLoading,
    hasMore,
    loadMore
  }
}
