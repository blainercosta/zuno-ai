import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Vercel serverless: use non-VITE env vars or fallback to VITE_ prefixed
// (same convention as api/og-job.ts / api/og-news.ts)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.usezuno.app';

// Crawler User-Agent patterns — same list as api/og-job.ts plus
// Google-InspectionTool, which vercel.json's route condition also matches.
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
  'Google-InspectionTool',
  'bingbot',
];

// PT-BR labels for the professions_public.cluster enum
// (supabase/migrations/012_professions.sql) — mirrors hooks/useProfessions.ts
// CLUSTER_LABELS. Duplicated locally rather than imported: this handler runs
// in an isolated Vercel function bundle and must not pull in the React hook
// module (which imports '@/lib/supabase' and React state) just for a
// constant map.
const CLUSTER_LABELS: Record<string, string> = {
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
};

// Mirrors hooks/useProfessions.ts BAND_LABELS.
const BAND_LABELS: Record<string, string> = {
  baixa: 'Exposição baixa',
  media: 'Exposição média',
  alta: 'Exposição alta',
};

const ALLOWED_TYPES = new Set([
  'profession',
  'professions',
  'niche',
  'niches',
  'salarios',
  'quiz',
]);

// Slug must be URL-safe; reject anything else before it reaches a query or HTML output
const SLUG_REGEX = /^[a-z0-9-]{1,80}$/;

function isCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENTS.some(agent =>
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// JSON.stringify does not escape </script>; encode angle brackets and ampersands
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function jsonLdScripts(entries: unknown[]): string {
  return entries
    .map(entry => `  <script type="application/ld+json">${safeJsonForScript(entry)}</script>`)
    .join('\n');
}

// Mirrors utils/shareUtils.ts generateSlug so /job/<slug> links resolve the
// same way the SPA and sitemap-jobs (supabase/functions/sitemap-jobs/index.ts)
// generate them.
function generateJobSlug(title: string, id: string | number): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `${slug}-${id}`;
}

// jsonb columns can arrive as arrays or as JSON strings; always return string[]
// (mirrors hooks/useProfessions.ts toStringArray).
function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface JobRow {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  is_remote: boolean | null;
}

interface NewsRow {
  id: string;
  slug: string | null;
  title: string;
}

function renderJobList(jobs: JobRow[]): string {
  if (jobs.length === 0) return '';
  const items = jobs
    .map(job => {
      const href = `${BASE_URL}/job/${escapeHtml(generateJobSlug(job.job_title, job.job_id))}`;
      const location = job.is_remote ? 'Remoto' : job.location || '';
      return `    <li><a href="${href}">${escapeHtml(job.job_title)}</a> — ${escapeHtml(job.company_name)}${location ? ` · ${escapeHtml(location)}` : ''}</li>`;
    })
    .join('\n');
  return `  <ul>\n${items}\n  </ul>`;
}

function renderNewsList(news: NewsRow[]): string {
  if (news.length === 0) return '';
  const items = news
    .map(item => {
      const href = `${BASE_URL}/noticias-ia/${escapeHtml(String(item.slug || item.id))}`;
      return `    <li><a href="${href}">${escapeHtml(item.title)}</a></li>`;
    })
    .join('\n');
  return `  <ul>\n${items}\n  </ul>`;
}

function renderSiblingLinks(): string {
  return `  <nav>
    <a href="${BASE_URL}/profissoes">Ver todas as profissões</a>
    <a href="${BASE_URL}/ia-para">Ver IA para todas as áreas</a>
  </nav>`;
}

function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface PageParams {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'article';
  jsonLd: unknown[];
  bodyHtml: string;
}

function renderPage({ title, description, canonicalPath, ogType, jsonLd, bodyHtml }: PageParams): string {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const imageUrl = `${BASE_URL}/og-cover.png`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:site_name" content="Zuno AI">
  <meta property="og:locale" content="pt_BR">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${imageUrl}">

${jsonLdScripts(jsonLd)}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

async function renderProfessionsIndex(): Promise<string> {
  const title = 'Como a IA afeta cada profissão no Brasil | Zuno AI';
  const description =
    'Veja a exposição de cada profissão à IA no Brasil: tarefas automatizáveis, tarefas potencializadas e skills-ponte, com base em vagas e notícias reais.';
  const canonicalPath = '/profissoes';

  const { data, error } = await supabase
    .from('professions_public')
    .select('slug, name, cluster, exposure_band')
    .order('cluster', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching professions_public list:', error.message);
  }

  const professions = (data || []) as Array<{ slug: string; name: string; cluster: string; exposure_band: string | null }>;

  const items = professions
    .map(p => {
      const href = `${BASE_URL}/profissoes/${escapeHtml(p.slug)}`;
      const cluster = CLUSTER_LABELS[p.cluster] || p.cluster;
      const band = p.exposure_band ? BAND_LABELS[p.exposure_band] || p.exposure_band : '';
      return `    <li><a href="${href}">${escapeHtml(p.name)}</a> — ${escapeHtml(cluster)}${band ? ` · ${escapeHtml(band)}` : ''}</li>`;
    })
    .join('\n');

  const bodyHtml = `  <h1>Como a IA afeta cada profissão no Brasil</h1>
  <p>${escapeHtml(description)}</p>
  <ul>
${items}
  </ul>
  <p><a href="${BASE_URL}/quiz">Faça o teste: seu emprego está em risco pela IA?</a></p>
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
    },
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'website', jsonLd, bodyHtml });
}

async function renderProfession(slug: string): Promise<string | null> {
  const { data: profession, error } = await supabase
    .from('professions_public')
    .select(
      'slug, name, cluster, exposure_score, exposure_band, summary, tasks_augmented, tasks_at_risk, bridge_skills'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profession:', slug, error.message);
  }

  if (!profession) return null;

  const name = profession.name as string;
  const summary = (profession.summary as string) || '';
  const title = `${name}: como a IA afeta a profissão | Zuno AI`;
  const description = summary.slice(0, 160);
  const canonicalPath = `/profissoes/${slug}`;
  const clusterLabel = CLUSTER_LABELS[profession.cluster as string] || (profession.cluster as string);
  const bandLabel = profession.exposure_band
    ? BAND_LABELS[profession.exposure_band as string] || (profession.exposure_band as string)
    : '';

  const tasksAugmented = toStringArray(profession.tasks_augmented);
  const tasksAtRisk = toStringArray(profession.tasks_at_risk);
  const bridgeSkills = toStringArray(profession.bridge_skills);

  const [jobsResult, newsResult] = await Promise.all([
    supabase.rpc('profession_jobs', { profession_slug: slug, match_count: 12 }),
    supabase.rpc('profession_news', { profession_slug: slug, match_count: 6 }),
  ]);

  if (jobsResult.error) console.error('Error fetching profession_jobs:', jobsResult.error.message);
  if (newsResult.error) console.error('Error fetching profession_news:', newsResult.error.message);

  const jobs = (jobsResult.data || []) as JobRow[];
  const news = (newsResult.data || []) as NewsRow[];

  const tasksAugmentedHtml = tasksAugmented.length
    ? `  <h2>Tarefas que a IA potencializa</h2>\n  <ul>\n${tasksAugmented.map(t => `    <li>${escapeHtml(t)}</li>`).join('\n')}\n  </ul>`
    : '';
  const tasksAtRiskHtml = tasksAtRisk.length
    ? `  <h2>Tarefas em risco de automação</h2>\n  <ul>\n${tasksAtRisk.map(t => `    <li>${escapeHtml(t)}</li>`).join('\n')}\n  </ul>`
    : '';
  const bridgeSkillsHtml = bridgeSkills.length
    ? `  <h2>Skills-ponte para se posicionar</h2>\n  <ul>\n${bridgeSkills.map(s => `    <li>${escapeHtml(s)}</li>`).join('\n')}\n  </ul>`
    : '';
  const jobsHtml = jobs.length
    ? `  <h2>Vagas que valorizam essas skills</h2>\n${renderJobList(jobs)}`
    : '';
  const newsHtml = news.length
    ? `  <h2>Notícias relacionadas</h2>\n${renderNewsList(news)}`
    : '';

  const bodyHtml = `  <p><a href="${BASE_URL}/profissoes">Profissões</a> / ${escapeHtml(name)}</p>
  <h1>${escapeHtml(name)}</h1>
  <p>${escapeHtml(clusterLabel)}${bandLabel ? ` · ${escapeHtml(bandLabel)}` : ''}</p>
  <h2>O que muda no dia a dia</h2>
  <p>${escapeHtml(summary)}</p>
${tasksAugmentedHtml}
${tasksAtRiskHtml}
${bridgeSkillsHtml}
${jobsHtml}
${newsHtml}
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
    },
    breadcrumbJsonLd([
      { name: 'Início', url: BASE_URL },
      { name: 'Profissões', url: `${BASE_URL}/profissoes` },
      { name, url: `${BASE_URL}${canonicalPath}` },
    ]),
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'article', jsonLd, bodyHtml });
}

async function renderNichesIndex(): Promise<string> {
  const title = 'IA para a sua área | Zuno AI';
  const description =
    'Notícias e vagas de inteligência artificial organizadas por área: marketing, saúde, educação, finanças, e-commerce e mais.';
  const canonicalPath = '/ia-para';

  const { data, error } = await supabase
    .from('niches_public')
    .select('slug, name, headline')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching niches_public list:', error.message);
  }

  const niches = (data || []) as Array<{ slug: string; name: string; headline: string }>;

  const items = niches
    .map(n => `    <li><a href="${BASE_URL}/ia-para/${escapeHtml(n.slug)}">${escapeHtml(n.name)}</a></li>`)
    .join('\n');

  const bodyHtml = `  <h1>IA para a sua área</h1>
  <p>${escapeHtml(description)}</p>
  <ul>
${items}
  </ul>
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
    },
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'website', jsonLd, bodyHtml });
}

async function renderNiche(slug: string): Promise<string | null> {
  const { data: niche, error } = await supabase
    .from('niches_public')
    .select('slug, name, headline, description')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching niche:', slug, error.message);
  }

  if (!niche) return null;

  const name = niche.name as string;
  const headline = niche.headline as string;
  const description = niche.description as string;
  const title = `IA para ${name} — notícias e vagas | Zuno AI`;
  const canonicalPath = `/ia-para/${slug}`;

  const [newsResult, jobsResult] = await Promise.all([
    supabase.rpc('niche_news', { niche_slug: slug, match_count: 12 }),
    supabase.rpc('niche_jobs', { niche_slug: slug, match_count: 12 }),
  ]);

  if (newsResult.error) console.error('Error fetching niche_news:', newsResult.error.message);
  if (jobsResult.error) console.error('Error fetching niche_jobs:', jobsResult.error.message);

  const news = (newsResult.data || []) as NewsRow[];
  const jobs = (jobsResult.data || []) as JobRow[];

  const newsHtml = news.length
    ? `  <h2>Notícias de IA para ${escapeHtml(name)}</h2>\n${renderNewsList(news)}`
    : '';
  const jobsHtml = jobs.length
    ? `  <h2>Vagas relacionadas</h2>\n${renderJobList(jobs)}`
    : '';

  const bodyHtml = `  <p><a href="${BASE_URL}/ia-para">IA para a sua área</a> / ${escapeHtml(name)}</p>
  <h1>${escapeHtml(headline)}</h1>
  <p>${escapeHtml(description)}</p>
${newsHtml}
${jobsHtml}
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
    },
    breadcrumbJsonLd([
      { name: 'Início', url: BASE_URL },
      { name: 'IA para a sua área', url: `${BASE_URL}/ia-para` },
      { name, url: `${BASE_URL}${canonicalPath}` },
    ]),
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'website', jsonLd, bodyHtml });
}

async function renderSalarios(): Promise<string> {
  const pageTitle = 'Salários e skills em vagas de IA no Brasil';
  const title = `${pageTitle} | Zuno AI`;
  const description =
    'Quanto pagam as vagas de Inteligência Artificial no Brasil? Mediana salarial por senioridade e as skills mais pedidas, com base em vagas ativas no Zuno AI.';
  const canonicalPath = '/salarios-ia';

  const [statsResult, skillsResult] = await Promise.all([
    supabase.rpc('salary_stats', { seniority: null, remote_only: false }),
    supabase.rpc('top_skills', { days: 90, limit_n: 20 }),
  ]);

  if (statsResult.error) console.error('Error fetching salary_stats:', statsResult.error.message);
  if (skillsResult.error) console.error('Error fetching top_skills:', skillsResult.error.message);

  interface SalaryStat {
    seniority_level: string | null;
    n: number;
    p25: number;
    median: number;
    p75: number;
  }
  interface TopSkill {
    skill: string;
    n: number;
    share: number;
  }

  const stats = (statsResult.data || []) as SalaryStat[];
  const skills = (skillsResult.data || []) as TopSkill[];

  const formatBRL = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  const statsHtml = stats.length
    ? `  <h2>Mediana salarial por senioridade</h2>\n  <ul>\n${stats
        .map(
          s =>
            `    <li>${escapeHtml(s.seniority_level || 'Não informado')}: ${escapeHtml(formatBRL(s.p25))} – ${escapeHtml(formatBRL(s.p75))} (mediana ${escapeHtml(formatBRL(s.median))}, ${s.n} vagas)</li>`
        )
        .join('\n')}\n  </ul>`
    : '  <p>Ainda não temos vagas suficientes com salário informado.</p>';

  const skillsHtml = skills.length
    ? `  <h2>Skills mais pedidas (últimos 90 dias)</h2>\n  <ul>\n${skills
        .map(s => `    <li>${escapeHtml(s.skill)} — ${s.share}%</li>`)
        .join('\n')}\n  </ul>`
    : '  <p>Ainda não temos dados suficientes de skills para exibir.</p>';

  const bodyHtml = `  <h1>${escapeHtml(pageTitle)}</h1>
  <p>${escapeHtml(description)}</p>
${statsHtml}
${skillsHtml}
  <p><a href="${BASE_URL}/jobs">Ver vagas de IA</a></p>
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: pageTitle,
      description,
      url: `${BASE_URL}${canonicalPath}`,
      creator: {
        '@type': 'Organization',
        name: 'Zuno AI',
        url: 'https://www.usezuno.app',
      },
      license: 'https://www.usezuno.app/salarios-ia',
    },
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'website', jsonLd, bodyHtml });
}

async function renderQuiz(): Promise<string> {
  const title = 'Seu emprego está em risco pela IA? Faça o teste | Zuno AI';
  const description =
    'Teste rápido de 1 minuto: descubra o quanto a IA já afeta a sua profissão, com base em vagas e notícias reais do mercado brasileiro.';
  const canonicalPath = '/quiz';

  const { data, error } = await supabase.rpc('quiz_professions');

  if (error) console.error('Error fetching quiz_professions:', error.message);

  const professions = (data || []) as Array<{ slug: string; name: string; cluster: string }>;

  const clusters: string[] = [];
  const seen = new Set<string>();
  for (const p of professions) {
    if (!seen.has(p.cluster)) {
      seen.add(p.cluster);
      clusters.push(p.cluster);
    }
  }

  const clusterSections = clusters
    .map(cluster => {
      const label = CLUSTER_LABELS[cluster] || cluster;
      const items = professions
        .filter(p => p.cluster === cluster)
        .map(p => `      <li><a href="${BASE_URL}/profissoes/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a></li>`)
        .join('\n');
      return `    <li>${escapeHtml(label)}\n      <ul>\n${items}\n      </ul>\n    </li>`;
    })
    .join('\n');

  const bodyHtml = `  <h1>Seu emprego está em risco pela IA?</h1>
  <p>${escapeHtml(description)}</p>
  <p>Sem JavaScript? Veja diretamente a análise por profissão:</p>
  <ul>
${clusterSections}
  </ul>
${renderSiblingLinks()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
    },
  ];

  return renderPage({ title, description, canonicalPath, ogType: 'website', jsonLd, bodyHtml });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  if (typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
    return res.redirect(302, '/');
  }

  const needsSlug = type === 'profession' || type === 'niche';
  const fallbackListPath = type === 'profession' ? '/profissoes' : type === 'niche' ? '/ia-para' : '/';

  if (needsSlug) {
    if (typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
      return res.redirect(302, fallbackListPath);
    }
  }

  const canonicalPathForRedirect =
    type === 'profession'
      ? `/profissoes/${slug}`
      : type === 'professions'
        ? '/profissoes'
        : type === 'niche'
          ? `/ia-para/${slug}`
          : type === 'niches'
            ? '/ia-para'
            : type === 'salarios'
              ? '/salarios-ia'
              : '/quiz';

  // If not a crawler (direct API call), redirect to the SPA route
  // (same pattern as api/og-job.ts / api/og-news.ts)
  if (!isCrawler(userAgent)) {
    const isDirectApiCall = req.url?.includes('/api/og-page');
    if (isDirectApiCall) {
      return res.redirect(302, `${BASE_URL}${canonicalPathForRedirect}`);
    }
  }

  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing!');
      return res.redirect(302, '/');
    }

    let html: string | null = null;

    switch (type) {
      case 'professions':
        html = await renderProfessionsIndex();
        break;
      case 'profession':
        html = await renderProfession(slug as string);
        if (!html) return res.redirect(302, '/profissoes');
        break;
      case 'niches':
        html = await renderNichesIndex();
        break;
      case 'niche':
        html = await renderNiche(slug as string);
        if (!html) return res.redirect(302, '/ia-para');
        break;
      case 'salarios':
        html = await renderSalarios();
        break;
      case 'quiz':
        html = await renderQuiz();
        break;
      default:
        return res.redirect(302, '/');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Vary', 'User-Agent');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Error:', err);
    return res.redirect(302, '/');
  }
}
