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
  embedding?: number[] | string | null
  embedding_updated_at?: string | null
  [key: string]: unknown
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

// Strips the heavy/private embedding fields before a row goes back to the client.
function stripEmbedding(job: Job): Job {
  const { embedding: _embedding, embedding_updated_at: _updatedAt, ...rest } = job
  return rest as Job
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId, limit: rawLimit = 3 } = await req.json()
    const limit = Math.min(Math.max(Number(rawLimit) || 3, 1), 10)

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

    // Fetch current job (including embedding, so we don't recompute it every request)
    const { data: currentJob, error: currentJobError } = await supabase
      .from('vagas_ia')
      .select('*')
      .eq('id', jobId)
      .eq('status', 'active')
      .single()

    if (currentJobError || !currentJob) {
      return new Response(
        JSON.stringify({ error: 'Vaga não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fallback: random active jobs (used whenever we can't do a semantic match)
    async function randomJobsFallback(): Promise<Job[]> {
      const { data } = await supabase
        .from('vagas_ia')
        .select('*')
        .eq('status', 'active')
        .neq('id', jobId)
        .limit(50)
      return ((data || []) as Job[])
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map(stripEmbedding)
    }

    // If OpenAI is not configured, return random jobs (no embedding calls possible)
    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured, returning random jobs')
      return new Response(
        JSON.stringify({ data: await randomJobsFallback() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Use the persisted embedding if we already have one; otherwise compute it once
    // and persist it (service-role client bypasses RLS, anon/authenticated can't write it).
    let currentEmbedding: number[] | null = null

    if (currentJob.embedding) {
      currentEmbedding = typeof currentJob.embedding === 'string'
        ? JSON.parse(currentJob.embedding)
        : currentJob.embedding
    } else {
      const currentJobText = generateJobDescription(currentJob as Job)
      currentEmbedding = await createEmbedding(openai, currentJobText)

      if (currentEmbedding) {
        const { error: updateError } = await supabase
          .from('vagas_ia')
          .update({
            embedding: currentEmbedding,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        if (updateError) {
          console.error('Error persisting job embedding:', updateError)
        }
      }
    }

    if (!currentEmbedding) {
      return new Response(
        JSON.stringify({ data: await randomJobsFallback() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Single ANN search in Postgres — no more per-candidate embeddings.create calls.
    const { data: matches, error: matchError } = await supabase.rpc('match_jobs', {
      query_embedding: currentEmbedding,
      exclude_job_id: jobId,
      match_count: limit,
    })

    if (matchError) {
      console.error('Error calling match_jobs:', matchError)
      return new Response(
        JSON.stringify({ data: await randomJobsFallback() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sortedJobs = ((matches || []) as Job[]).map(stripEmbedding)

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
