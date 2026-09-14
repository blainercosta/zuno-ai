import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { News } from '@/types/news'
import type { Job } from '@/types/job'

export interface Niche {
  slug: string
  name: string
  headline: string
  description: string
  keywords: string[] | null
  sort_order: number
  is_active: boolean
  updated_at: string
}

// Raw shapes returned by the niche_news / niche_jobs RPCs
// (supabase/migrations/010_niches.sql) — narrower than the full News/Job
// types since the RPCs only select what the preview cards need.
interface NicheNewsRow {
  id: string
  slug: string | null
  title: string
  subtitle: string | null
  cover_image: string | null
  category: string | null
  published_at: string
  author: string | null
  read_time: string | null
}

interface NicheJobRow {
  id: string
  job_id: string
  job_title: string
  company_name: string
  job_url: string
  logo_url: string | null
  location: string | null
  is_remote: boolean | null
  seniority_level: string | null
  posted_at: string | null
}

// Maps a niche_news row onto the shape PreviewCards.tsx's NewsPreviewCard
// expects (mirrors the news-table mapping in hooks/useNews.ts).
function toNews(row: NicheNewsRow): News {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.subtitle || '',
    author: row.author || '',
    published_at: row.published_at,
    read_time: row.read_time || '5 min',
    category: row.category || '',
    image_url: row.cover_image || undefined,
    slug: row.slug || undefined,
  }
}

// Maps a niche_jobs row onto the fields PreviewCards.tsx's JobPreviewCard
// reads. Fields the RPC doesn't select (employment_type, workplace_type,
// etc.) are left undefined — the card already renders them conditionally.
function toJob(row: NicheJobRow): Job {
  return {
    id: row.id,
    job_url: row.job_url,
    job_id: row.job_id,
    job_title: row.job_title,
    company_name: row.company_name,
    company_url: null,
    company_id: null,
    logo_url: row.logo_url,
    location: row.location,
    posted_at: row.posted_at,
    seniority_level: row.seniority_level,
    employment_type: null,
    workplace_type: null,
    is_remote: row.is_remote,
    is_easy_apply: null,
    description_full: null,
    about_company: null,
    responsibilities: null,
    requirements: null,
    differentials: null,
    benefits: null,
    salary: null,
    process: null,
    status: 'active',
    created_at: row.posted_at || '',
    updated_at: row.posted_at || '',
  }
}

export function useNiches() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchNiches = async () => {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('niches_public')
        .select('*')
        .order('sort_order', { ascending: true })

      if (cancelled) return

      if (fetchError) {
        console.error('Error fetching niches_public:', fetchError)
        setError(fetchError.message)
        setNiches([])
      } else {
        setNiches((data as Niche[]) || [])
      }
      setIsLoading(false)
    }

    fetchNiches()

    return () => {
      cancelled = true
    }
  }, [])

  return { niches, isLoading, error }
}

export function useNicheFeed(slug: string | undefined) {
  const [news, setNews] = useState<News[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    if (!slug) {
      setNews([])
      setJobs([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const [newsResult, jobsResult] = await Promise.all([
      supabase.rpc('niche_news', { niche_slug: slug, match_count: 12 }),
      supabase.rpc('niche_jobs', { niche_slug: slug, match_count: 12 }),
    ])

    if (newsResult.error) {
      console.error('Error fetching niche_news:', newsResult.error)
      setError(newsResult.error.message)
    }
    if (jobsResult.error) {
      console.error('Error fetching niche_jobs:', jobsResult.error)
      setError((prev) => prev || jobsResult.error!.message)
    }

    setNews(((newsResult.data as NicheNewsRow[]) || []).map(toNews))
    setJobs(((jobsResult.data as NicheJobRow[]) || []).map(toJob))
    setIsLoading(false)
  }, [slug])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  return { news, jobs, isLoading, error, refetch: fetchFeed }
}
