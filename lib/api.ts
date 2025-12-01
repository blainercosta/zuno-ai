/**
 * API Client para Edge Functions do Supabase
 * Usar estas funções ao invés de chamar o Supabase diretamente para operações de escrita
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL not configured')
}

interface ApiResponse<T = unknown> {
  success?: boolean
  error?: string
  data?: T
  message?: string
}

interface JobData {
  company_name: string
  company_url?: string
  logo_url?: string
  job_title: string
  job_url: string
  location?: string
  seniority_level?: string
  employment_type?: string
  workplace_type?: string
  is_remote?: boolean
  description_full?: string
  about_company?: string
  responsibilities?: string
  requirements?: string
  differentials?: string
  benefits?: string
  salary?: string
  process?: string
}

interface WaitlistData {
  name: string
  email: string
  phone: string
}

interface SimilarJobsData {
  jobId: string
  limit?: number
}

/**
 * Envia uma nova vaga para aprovação via Edge Function
 */
export async function submitJob(data: JobData): Promise<ApiResponse<{ job_id: string }>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/post-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Erro ao enviar vaga' }
    }

    return result
  } catch (error) {
    console.error('Error submitting job:', error)
    return { error: 'Erro de conexão. Tente novamente.' }
  }
}

/**
 * Cadastra na waitlist via Edge Function
 */
export async function submitWaitlist(data: WaitlistData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/waitlist-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Erro ao cadastrar' }
    }

    return result
  } catch (error) {
    console.error('Error submitting waitlist:', error)
    return { error: 'Erro de conexão. Tente novamente.' }
  }
}

/**
 * Busca vagas similares via Edge Function (OpenAI fica no backend)
 */
export async function fetchSimilarJobs(data: SimilarJobsData): Promise<ApiResponse<unknown[]>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/similar-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Erro ao buscar vagas similares' }
    }

    return result
  } catch (error) {
    console.error('Error fetching similar jobs:', error)
    return { error: 'Erro de conexão. Tente novamente.' }
  }
}

interface SimilarNewsData {
  newsId: string | number
  limit?: number
}

/**
 * Busca notícias similares via Edge Function (OpenAI fica no backend)
 */
export async function fetchSimilarNews(data: SimilarNewsData): Promise<ApiResponse<unknown[]>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/similar-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Erro ao buscar notícias similares' }
    }

    return result
  } catch (error) {
    console.error('Error fetching similar news:', error)
    return { error: 'Erro de conexão. Tente novamente.' }
  }
}
