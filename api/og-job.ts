import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Vercel serverless: use non-VITE env vars or fallback to VITE_ prefixed
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Crawler User-Agent patterns
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'WhatsApp',
  'Twitterbot',
  'LinkedInBot',
  'Pinterest',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Googlebot',
  'bingbot',
];

// Maps the PT-BR values used by PostJobPage.tsx to schema.org JobPosting employmentType enum
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'tempo integral': 'FULL_TIME',
  'meio período': 'PART_TIME',
  'meio periodo': 'PART_TIME',
  'contrato': 'CONTRACTOR',
  'freelance': 'CONTRACTOR',
  'estágio': 'INTERN',
  'estagio': 'INTERN',
};

function isCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENTS.some(agent =>
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
}

function mapEmploymentType(employmentType: string | null): string {
  if (!employmentType) return 'FULL_TIME';
  return EMPLOYMENT_TYPE_MAP[employmentType.trim().toLowerCase()] || 'FULL_TIME';
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// JSON.stringify does not escape </script>; encode angle brackets and ampersands
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  if (!slug || typeof slug !== 'string') {
    return res.redirect(302, '/jobs');
  }

  const baseUrl = 'https://www.usezuno.app';
  // Slug must be URL-safe; reject anything else before it reaches HTML output
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return res.redirect(302, '/jobs');
  }
  const canonicalUrl = `${baseUrl}/job/${encodeURIComponent(slug)}`;

  // If not a crawler (direct API call), redirect to SPA
  // Note: When called via vercel.json routes, it's always a crawler
  if (!isCrawler(userAgent)) {
    const isDirectApiCall = req.url?.includes('/api/og-job');
    if (isDirectApiCall) {
      return res.redirect(302, canonicalUrl);
    }
  }

  // Extract job_id from slug: title-slugified-{job_id} (see App.tsx JobDetailRoute)
  const parts = slug.split('-');
  const jobId = parts[parts.length - 1];

  if (!jobId) {
    return res.redirect(302, '/jobs');
  }

  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing!');
      return res.redirect(302, '/jobs');
    }

    const { data: job, error } = await supabase
      .from('vagas_ia')
      .select(
        'job_id, job_title, company_name, company_url, logo_url, location, seniority_level, employment_type, is_remote, description_full, salary, job_url, posted_at, status'
      )
      .eq('job_id', jobId)
      .eq('status', 'active')
      .single();

    if (error || !job) {
      console.error('Job not found for job_id:', jobId, error?.message);
      return res.redirect(302, '/jobs');
    }

    const title = escapeHtml(job.job_title ?? '');
    const companyName = escapeHtml(job.company_name ?? '');
    const applyUrl = isSafeHttpUrl(job.job_url) ? job.job_url : canonicalUrl;
    const location = escapeHtml(job.location || '');
    const descriptionSource = job.description_full
      ? stripHtml(job.description_full)
      : `Vaga de ${job.job_title ?? ''} na ${job.company_name ?? ''}`;
    const description = escapeHtml(descriptionSource.substring(0, 160));

    const originalImageUrl = job.logo_url || '';
    const imageUrl = originalImageUrl
      ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(originalImageUrl)}`
      : `${baseUrl}/og-cover.png`;

    const postedAt = job.posted_at || new Date().toISOString();
    // Active job: at least 14 days from now, never in the past
    const validThrough = new Date(Math.max(new Date(postedAt).getTime() + 30 * 24 * 60 * 60 * 1000, Date.now() + 14 * 24 * 60 * 60 * 1000)).toISOString();
    const employmentType = mapEmploymentType(job.employment_type);

    const jobLocationJsonLd = job.is_remote
      ? {
          applicantLocationRequirements: {
            '@type': 'Country',
            name: 'BR',
          },
          jobLocationType: 'TELECOMMUTE',
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location || undefined,
              addressCountry: 'BR',
            },
          },
        };

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.job_title,
      description: descriptionSource,
      identifier: {
        '@type': 'PropertyValue',
        name: job.company_name,
        value: job.job_id,
      },
      datePosted: postedAt,
      validThrough,
      employmentType,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company_name,
        sameAs: job.company_url || undefined,
        logo: job.logo_url || undefined,
      },
      ...jobLocationJsonLd,
      directApply: false,
    };

    const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${companyName} | Vagas de IA - Zuno AI</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title} - ${companyName}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Zuno AI">
  <meta property="og:locale" content="pt_BR">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@zunoai">
  <meta name="twitter:title" content="${title} - ${companyName}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- JobPosting structured data -->
  <script type="application/ld+json">${safeJsonForScript(cleanedJsonLd)}</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${companyName}${location ? ` · ${location}` : ''}</p>
  <p>${description}</p>
  <p><a href="${escapeHtml(applyUrl)}" rel="nofollow noopener">Candidatar-se</a></p>
  <p><a href="${canonicalUrl}">Ver vaga completa em Zuno AI</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Error:', err);
    return res.redirect(302, '/jobs');
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
