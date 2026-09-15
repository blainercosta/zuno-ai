import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { News } from '@/types/news'
import type { Job } from '@/types/job'

export type ProfessionCluster =
  | 'negocios'
  | 'saude'
  | 'educacao'
  | 'juridico'
  | 'financas'
  | 'marketing'
  | 'tecnologia'
  | 'criativo'
  | 'operacoes'
  | 'servicos'

export type ExposureBand = 'baixa' | 'media' | 'alta'

export interface Profession {
  slug: string
  name: string
  cluster: ProfessionCluster
  exposure_score: number
  exposure_band: ExposureBand
  summary: string
  tasks_augmented: string[]
  tasks_at_risk: string[]
  bridge_skills: string[]
  evidence_job_ids: string[]
  evidence_news_ids: string[]
  status: string
  generated_at: string
  model: string | null
  reviewed_at: string | null
  sort_order: number
  updated_at: string
}

// PT-BR labels for the professions_public.cluster enum
// (supabase/migrations/012_professions.sql).
export const CLUSTER_LABELS: Record<ProfessionCluster, string> = {
  negocios: 'Negócios',
  saude: 'Saúde',
  educacao: 'Educação',
  juridico: 'Jurídico',
  financas: 'Finanças',
  marketing: 'Marketing',
  tecnologia: 'Tecnologia',
  criativo: 'Criativo',
  operacoes: 'Operações',
  servicos: 'Serviços',
}

export const BAND_LABELS: Record<ExposureBand, string> = {
  baixa: 'Exposição baixa',
  media: 'Exposição média',
  alta: 'Exposição alta',
}

// Zinc-compatible band colors — emerald/amber/rose read clearly on the dark
// zinc background used across the rest of the app (see SalariosPage.tsx's
// bar colors for the same accent-on-zinc pattern).
export const BAND_COLORS: Record<ExposureBand, { text: string; bg: string; border: string }> = {
  baixa: { text: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-400/30' },
  media: { text: 'text-amber-400', bg: 'bg-amber-400', border: 'border-amber-400/30' },
  alta: { text: 'text-rose-400', bg: 'bg-rose-400', border: 'border-rose-400/30' },
}

// Raw shapes returned by the profession_jobs / profession_news RPCs
// (supabase/migrations/012_professions.sql) — same shape as niche_jobs /
// niche_news in hooks/useNicheFeed.ts.
interface ProfessionJobRow {
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

interface ProfessionNewsRow {
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

// Mirrors toJob in hooks/useNicheFeed.ts — maps a profession_jobs row onto
// the fields PreviewCards.tsx's JobPreviewCard reads.
function toJob(row: ProfessionJobRow): Job {
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

// Mirrors toNews in hooks/useNicheFeed.ts.
function toNews(row: ProfessionNewsRow): News {
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

// jsonb columns can arrive as arrays or as JSON strings; always return string[]
function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string')
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [] } catch { return [] }
  }
  return []
}

function normalizeProfession(row: Record<string, unknown>): Profession {
  return {
    ...(row as unknown as Profession),
    tasks_augmented: toStringArray(row.tasks_augmented),
    tasks_at_risk: toStringArray(row.tasks_at_risk),
    bridge_skills: toStringArray(row.bridge_skills),
  }
}

export function useProfessions() {
  const [professions, setProfessions] = useState<Profession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchProfessions = async () => {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('professions_public')
        .select('*')
        .order('cluster', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (cancelled) return

      if (fetchError) {
        console.error('Error fetching professions_public:', fetchError)
        setError(fetchError.message)
        setProfessions([])
      } else {
        setProfessions(((data as Record<string, unknown>[]) || []).map(normalizeProfession))
      }
      setIsLoading(false)
    }

    fetchProfessions()

    return () => {
      cancelled = true
    }
  }, [])

  return { professions, isLoading, error }
}

export function useProfession(slug: string | undefined) {
  const [profession, setProfession] = useState<Profession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchProfession = async () => {
      if (!slug) {
        setProfession(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('professions_public')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (cancelled) return

      if (fetchError) {
        console.error('Error fetching profession:', fetchError)
        setError(fetchError.message)
        setProfession(null)
      } else {
        setProfession(data ? normalizeProfession(data as Record<string, unknown>) : null)
      }
      setIsLoading(false)
    }

    fetchProfession()

    return () => {
      cancelled = true
    }
  }, [slug])

  return { profession, isLoading, error }
}

export function useProfessionFeed(slug: string | undefined) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    if (!slug) {
      setJobs([])
      setNews([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const [jobsResult, newsResult] = await Promise.all([
      supabase.rpc('profession_jobs', { profession_slug: slug, match_count: 12 }),
      supabase.rpc('profession_news', { profession_slug: slug, match_count: 6 }),
    ])

    if (jobsResult.error) {
      console.error('Error fetching profession_jobs:', jobsResult.error)
      setError(jobsResult.error.message)
    }
    if (newsResult.error) {
      console.error('Error fetching profession_news:', newsResult.error)
      setError((prev) => prev || newsResult.error!.message)
    }

    setJobs(((jobsResult.data as ProfessionJobRow[]) || []).map(toJob))
    setNews(((newsResult.data as ProfessionNewsRow[]) || []).map(toNews))
    setIsLoading(false)
  }, [slug])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  return { jobs, news, isLoading, error, refetch: fetchFeed }
}

export interface QuizProfession {
  slug: string
  name: string
  cluster: ProfessionCluster
}

export function useQuizProfessions() {
  const [professions, setProfessions] = useState<QuizProfession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchQuizProfessions = async () => {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase.rpc('quiz_professions')

      if (cancelled) return

      if (fetchError) {
        console.error('Error fetching quiz_professions:', fetchError)
        setError(fetchError.message)
        setProfessions([])
      } else {
        setProfessions((data as QuizProfession[]) || [])
      }
      setIsLoading(false)
    }

    fetchQuizProfessions()

    return () => {
      cancelled = true
    }
  }, [])

  return { professions, isLoading, error }
}
