import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Vercel serverless: use non-VITE env vars or fallback to VITE_ prefixed
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// UUID regex pattern
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

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

function isCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENTS.some(agent =>
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  if (!slug || typeof slug !== 'string') {
    return res.redirect(302, '/noticias-ia');
  }

  const baseUrl = 'https://www.usezuno.app';
  const canonicalUrl = `${baseUrl}/noticias-ia/${slug}`;

  // If not a crawler (direct API call), redirect to SPA
  // Note: When called via vercel.json routes, it's always a crawler
  if (!isCrawler(userAgent)) {
    // Check if this is a direct API call or routed request
    const isDirectApiCall = req.url?.includes('/api/og-news');
    if (isDirectApiCall) {
      return res.redirect(302, canonicalUrl);
    }
  }

  // Extract ID from slug
  let newsId: string | number;
  let table: 'news' | 'posts' = 'posts';

  const uuidMatch = slug.match(UUID_REGEX);

  if (uuidMatch) {
    newsId = uuidMatch[0];
    table = 'news';
  } else {
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];

    if (/^\d+$/.test(lastPart)) {
      newsId = parseInt(lastPart, 10);
      table = 'posts';
    } else {
      newsId = slug;
      table = 'news';
    }
  }

  try {
    console.log('Crawler detected:', userAgent);
    console.log('Fetching news:', newsId, 'from table:', table);
    console.log('Supabase URL:', supabaseUrl ? 'configured' : 'MISSING');
    console.log('Supabase Key:', supabaseKey ? 'configured' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing!');
      return res.status(200).send(generateFallbackHtml(slug, canonicalUrl, baseUrl));
    }

    // news table has cover_image, posts table has image_url
    const columns = table === 'news'
      ? 'id, title, subtitle, cover_image, author, published_at, category'
      : 'id, title, excerpt, image_url, author, published_at, category';

    const { data: news, error } = await supabase
      .from(table)
      .select(columns)
      .eq('id', newsId)
      .single();

    if (error) {
      console.error('Supabase query error:', error.message, error.code);
      return res.status(200).send(generateFallbackHtml(slug, canonicalUrl, baseUrl));
    }

    if (!news) {
      console.error('News not found for ID:', newsId);
      return res.status(200).send(generateFallbackHtml(slug, canonicalUrl, baseUrl));
    }

    console.log('News found:', news.title);

    const title = escapeHtml(news.title);
    // news uses subtitle, posts uses excerpt
    const description = escapeHtml((news.subtitle || news.excerpt || '').substring(0, 155));
    // news uses cover_image, posts uses image_url
    const originalImageUrl = news.cover_image || news.image_url || '';
    // Use proxy for external images to avoid WhatsApp blocking
    const imageUrl = originalImageUrl
      ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(originalImageUrl)}`
      : `${baseUrl}/og-cover.png`;
    const author = escapeHtml(news.author || 'Zuno AI');
    const category = escapeHtml(news.category || 'Inteligência Artificial');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Notícias de IA - Zuno AI</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${author}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Zuno AI">
  <meta property="og:locale" content="pt_BR">

  <!-- Article -->
  <meta property="article:published_time" content="${news.published_at}">
  <meta property="article:author" content="${author}">
  <meta property="article:section" content="${category}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@zunoai">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${canonicalUrl}">Leia mais em Zuno AI</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Error:', err);
    return res.status(200).send(generateFallbackHtml(slug, canonicalUrl, baseUrl));
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

function generateFallbackHtml(slug: string, canonicalUrl: string, baseUrl: string): string {
  const title = slug.split('-').slice(0, -5).join(' ').replace(/^\w/, c => c.toUpperCase());
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} | Zuno AI</title>
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:image" content="${baseUrl}/og-cover.png">
  <meta property="og:site_name" content="Zuno AI">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${baseUrl}/og-cover.png">
</head>
<body>
  <p><a href="${canonicalUrl}">Leia em Zuno AI</a></p>
</body>
</html>`;
}
