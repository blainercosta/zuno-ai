import { fetchSimilarJobs } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/job'

/**
 * Busca vagas similares via Edge Function (OpenAI fica no backend, seguro)
 * Fallback local: se a Edge Function falhar, usa busca por campos
 */
export async function findSimilarJobs(currentJob: Job, limit = 3): Promise<Job[]> {
  try {
    // Tenta usar a Edge Function (OpenAI no backend)
    const result = await fetchSimilarJobs({ jobId: currentJob.id, limit })

    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data as Job[]
    }

    // Fallback: busca por campos similares sem IA
    console.warn('Edge Function não retornou resultados, usando fallback local')
    return findSimilarJobsByFields(currentJob, limit)
  } catch (error) {
    console.error('Erro ao buscar vagas similares:', error)
    return findSimilarJobsByFields(currentJob, limit)
  }
}

/**
 * Versão otimizada que usa busca por campos similares sem IA
 * Útil para quando a API key não está disponível ou para fallback rápido
 */
export async function findSimilarJobsByFields(currentJob: Job, limit = 3): Promise<Job[]> {
  try {
    let query = supabase
      .from('vagas_ia')
      .select('*')
      .eq('status', 'active')
      .neq('id', currentJob.id)

    // Prioriza vagas com mesmo nível de senioridade ou tipo de emprego
    if (currentJob.seniority_level) {
      query = query.or(`seniority_level.eq.${currentJob.seniority_level},employment_type.eq.${currentJob.employment_type}`)
    }

    const { data, error } = await query.limit(limit)

    if (error || !data) {
      console.error('Erro ao buscar vagas similares:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar vagas similares:', error)
    return []
  }
}
