import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SalaryStat {
  seniority_level: string | null
  n: number
  p25: number
  median: number
  p75: number
}

export interface TopSkill {
  skill: string
  category: string | null
  n: number
  share: number
}

interface UseSalaryStatsOptions {
  seniority?: string
  remoteOnly?: boolean
}

export function useSalaryStats(options: UseSalaryStatsOptions = {}) {
  const { seniority, remoteOnly = false } = options
  const [stats, setStats] = useState<SalaryStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('salary_stats', {
      seniority: seniority ?? null,
      remote_only: remoteOnly,
    })

    if (rpcError) {
      console.error('Error fetching salary_stats:', rpcError)
      setError(rpcError.message)
      setStats([])
      setIsLoading(false)
      return
    }

    setStats((data as SalaryStat[]) || [])
    setIsLoading(false)
  }, [seniority, remoteOnly])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}

export function useTopSkills(days: number = 90, limitN: number = 30) {
  const [skills, setSkills] = useState<TopSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSkills = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('top_skills', {
      days,
      limit_n: limitN,
    })

    if (rpcError) {
      console.error('Error fetching top_skills:', rpcError)
      setError(rpcError.message)
      setSkills([])
      setIsLoading(false)
      return
    }

    setSkills((data as TopSkill[]) || [])
    setIsLoading(false)
  }, [days, limitN])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  return { skills, isLoading, error, refetch: fetchSkills }
}
