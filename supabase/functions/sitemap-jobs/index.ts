import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
}

interface JobItem {
  job_id: string
  job_title: string
  posted_at: string | null
}

// Mirrors utils/shareUtils.ts generateSlug so URLs match what the SPA generates
function generateSlug(title: string, id: string | number): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return `${slug}-${id}`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: jobsData, error: jobsError } = await supabase
      .from('vagas_ia')
      .select('job_id, job_title, posted_at')
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .limit(1000)

    if (jobsError) console.error('Jobs error:', jobsError)

    const allJobs: JobItem[] = jobsData || []

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    for (const job of allJobs) {
      const slug = generateSlug(job.job_title, job.job_id)
      const lastmod = job.posted_at
        ? new Date(job.posted_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      xml += `  <url>
    <loc>https://www.usezuno.app/job/${escapeXml(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
  </url>
`
    }

    xml += '</urlset>'

    return new Response(xml, { headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: corsHeaders }
    )
  }
})
