import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.redirect(301, '/noticias-ia');
  }

  // Extract ID from slug (last part after last hyphen, or the whole thing if UUID)
  const isUUID = slug.includes('-') && slug.split('-').length > 4;
  let newsId: string | number;
  let table: 'news' | 'posts' = 'posts';

  if (isUUID) {
    // It's a UUID from news table
    newsId = slug;
    table = 'news';
  } else {
    // Extract ID from end of slug
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];

    if (/^\d+$/.test(lastPart)) {
      newsId = parseInt(lastPart, 10);
      table = 'posts';
    } else if (lastPart.includes('-')) {
      newsId = lastPart;
      table = 'news';
    } else {
      newsId = slug;
    }
  }

  try {
    // Fetch news data
    const { data: news, error } = await supabase
      .from(table)
      .select('id, title, excerpt, subtitle, image_url, cover_image, author, published_at, category')
      .eq('id', newsId)
      .single();

    if (error || !news) {
      return res.redirect(301, '/noticias-ia');
    }

    const baseUrl = 'https://www.usezuno.app';
    const title = news.title;
    const description = (news.excerpt || news.subtitle || '').substring(0, 155);
    const imageUrl = news.cover_image || news.image_url || `${baseUrl}/og-cover.png`;
    const canonicalUrl = `${baseUrl}/noticias-ia/${slug}`;

    // Generate HTML with proper OG meta tags
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <title>${title} | Notícias de IA - Zuno AI</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${news.author || 'Zuno AI'}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:site_name" content="Zuno AI">
  <meta property="og:locale" content="pt_BR">

  <!-- Article Meta -->
  <meta property="article:published_time" content="${news.published_at}">
  <meta property="article:author" content="${news.author || 'Zuno AI'}">
  <meta property="article:section" content="${news.category || 'Inteligência Artificial'}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@zunoai">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${title}">

  <!-- Redirect to SPA -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.href = "${canonicalUrl}";</script>
</head>
<body>
  <p>Redirecionando para <a href="${canonicalUrl}">${title}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Error fetching news:', err);
    return res.redirect(301, '/noticias-ia');
  }
}
