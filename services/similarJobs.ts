import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/job'

/**
 * Gera um texto descritivo da vaga para criar embeddings
 */
function generateJobDescription(job: Job): string {
  const parts = [
    job.job_title,
    job.company_name,
    job.location || '',
    job.seniority_level || '',
    job.employment_type || '',
    job.workplace_type || '',
    job.description_full || '',
    job.requirements || '',
  ]

  return parts.filter(Boolean).join(' ')
}

/**
 * Cria embedding usando OpenAI para uma vaga
 */
async function createEmbedding(text: string): Promise<number[] | null> {
  if (!openai) {
    console.warn('OpenAI não configurada')
    return null
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Modelo mais leve e econômico
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Erro ao criar embedding:', error)
    return null
  }
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Busca vagas similares usando embeddings
 * Fallback: se OpenAI não estiver configurada, retorna vagas aleatórias
 */
export async function findSimilarJobs(currentJob: Job, limit = 3): Promise<Job[]> {
  try {
    // Busca todas as vagas ativas exceto a atual
    const { data: allJobs, error } = await supabase
      .from('vagas_ia')
      .select('*')
      .eq('status', 'active')
      .neq('id', currentJob.id)
      .limit(50) // Limita para otimizar performance

    if (error || !allJobs || allJobs.length === 0) {
      console.error('Erro ao buscar vagas:', error)
      return []
    }

    // Se OpenAI não estiver configurada, retorna vagas aleatórias
    if (!openai) {
      console.warn('OpenAI não configurada, retornando vagas aleatórias')
      return allJobs
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
    }

    // Gera embedding da vaga atual
    const currentJobText = generateJobDescription(currentJob)
    const currentEmbedding = await createEmbedding(currentJobText)

    if (!currentEmbedding) {
      // Fallback para vagas aleatórias
      return allJobs
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
    }

    // Calcula similaridade com cada vaga
    const jobsWithSimilarity = await Promise.all(
      allJobs.map(async (job) => {
        const jobText = generateJobDescription(job)
        const jobEmbedding = await createEmbedding(jobText)

        if (!jobEmbedding) {
          return { job, similarity: 0 }
        }

        const similarity = cosineSimilarity(currentEmbedding, jobEmbedding)
        return { job, similarity }
      })
    )

    // Ordena por similaridade e retorna as top N
    const sortedJobs = jobsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.job)

    return sortedJobs
  } catch (error) {
    console.error('Erro ao buscar vagas similares:', error)
    return []
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
