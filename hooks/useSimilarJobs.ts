import { useState, useEffect } from 'react'
import { findSimilarJobs, findSimilarJobsByFields } from '@/services/similarJobs'
import type { Job } from '@/types/job'

export function useSimilarJobs(currentJob: Job | null, limit = 3) {
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentJob) {
      setSimilarJobs([])
      return
    }

    const fetchSimilarJobs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Tenta usar embeddings da OpenAI primeiro
        let jobs = await findSimilarJobs(currentJob, limit)

        // Se falhar ou não retornar resultados, usa busca por campos
        if (jobs.length === 0) {
          jobs = await findSimilarJobsByFields(currentJob, limit)
        }

        setSimilarJobs(jobs)
      } catch (err) {
        console.error('Erro ao buscar vagas similares:', err)
        setError('Erro ao carregar vagas similares')
        setSimilarJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarJobs()
  }, [currentJob?.id, limit])

  return {
    similarJobs,
    isLoading,
    error
  }
}
