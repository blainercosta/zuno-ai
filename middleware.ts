import { next } from '@vercel/edge';

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
];

export const config = {
  matcher: '/noticias-ia/:path*',
};

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if it's a crawler
  const isCrawler = CRAWLER_USER_AGENTS.some(agent =>
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );

  // If it's a crawler and it's a news detail page (has slug after /noticias-ia/)
  if (isCrawler && pathname.startsWith('/noticias-ia/') && pathname !== '/noticias-ia/') {
    const slug = pathname.replace('/noticias-ia/', '');
    // Rewrite internally to the API endpoint (not redirect)
    const apiUrl = new URL(`/api/og-news?slug=${encodeURIComponent(slug)}`, request.url);
    return fetch(apiUrl);
  }

  return next();
}
