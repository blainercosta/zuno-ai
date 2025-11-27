import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Job {
  id: string
  job_title: string
  company_name: string
  location?: string
  seniority_level?: string
  employment_type?: string
  workplace_type?: string
  description_full?: string
  requirements?: string
}

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

async function createEmbedding(openai: OpenAI, text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embedding:', error)
    return null
  }
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId, limit = 3 } = await req.json()

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch current job
    const { data: currentJob, error: currentJobError } = await supabase
      .from('vagas_ia')
      .select('*')
      .eq('id', jobId)
      .single()

    if (currentJobError || !currentJob) {
      return new Response(
        JSON.stringify({ error: 'Vaga não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all active jobs except current
    const { data: allJobs, error: allJobsError } = await supabase
      .from('vagas_ia')
      .select('*')
      .eq('status', 'active')
      .neq('id', jobId)
      .limit(50)

    if (allJobsError || !allJobs || allJobs.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If OpenAI is not configured, return random jobs
    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured, returning random jobs')
      const randomJobs = allJobs
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
      return new Response(
        JSON.stringify({ data: randomJobs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Generate embedding for current job
    const currentJobText = generateJobDescription(currentJob)
    const currentEmbedding = await createEmbedding(openai, currentJobText)

    if (!currentEmbedding) {
      // Fallback to random jobs
      const randomJobs = allJobs
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
      return new Response(
        JSON.stringify({ data: randomJobs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate similarity with each job
    const jobsWithSimilarity = await Promise.all(
      allJobs.map(async (job) => {
        const jobText = generateJobDescription(job)
        const jobEmbedding = await createEmbedding(openai, jobText)

        if (!jobEmbedding) {
          return { job, similarity: 0 }
        }

        const similarity = cosineSimilarity(currentEmbedding, jobEmbedding)
        return { job, similarity }
      })
    )

    // Sort by similarity and return top N
    const sortedJobs = jobsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.job)

    return new Response(
      JSON.stringify({ data: sortedJobs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in similar-jobs function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
