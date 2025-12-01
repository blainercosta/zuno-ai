import { useEffect } from 'react';
import type { News, ContentBlock } from '@/types/news';

interface NewsSEOProps {
  news: News;
  url: string;
}

// Helper to count words in content
function countWords(content: string | ContentBlock[] | undefined): number {
  if (!content) return 0;

  let text = '';
  if (typeof content === 'string') {
    // Remove HTML tags and count words
    text = content.replace(/<[^>]*>/g, '');
  } else if (Array.isArray(content)) {
    // Extract text from content blocks
    text = content
      .filter(block => block.text)
      .map(block => block.text)
      .join(' ');
  }

  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Helper to strip HTML and get plain text
function stripHtml(content: string | ContentBlock[] | undefined): string {
  if (!content) return '';

  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '').trim();
  }

  if (Array.isArray(content)) {
    return content
      .filter(block => block.text)
      .map(block => block.text)
      .join(' ')
      .trim();
  }

  return '';
}

export default function NewsSEO({ news, url }: NewsSEOProps) {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}/noticias-ia/${news.slug || news.id}`;

    // SEO optimized title format
    document.title = `${news.title} | Notícias de IA Brasil - Zuno AI`;

    // Create or update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Description - max 155 characters
    const description = news.excerpt
      ? news.excerpt.substring(0, 155).trim() + (news.excerpt.length > 155 ? '...' : '')
      : news.title;

    // Keywords for SEO
    const keywords = [
      'IA',
      'inteligência artificial',
      news.category,
      'notícias IA Brasil',
      'tecnologia',
      'inovação',
      news.title.split(' ').slice(0, 3).join(' ')
    ].filter(Boolean).join(', ');

    // Basic SEO Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', news.author || 'Zuno AI');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('googlebot-news', 'index, follow');

    // Open Graph Tags
    updateMetaTag('og:title', news.title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:site_name', 'Zuno AI - Portal de Notícias de IA', true);
    updateMetaTag('og:locale', 'pt_BR', true);

    const imageUrl = news.image_url || `${baseUrl}/og-cover.png`;
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:image:secure_url', imageUrl, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:type', 'image/png', true);
    updateMetaTag('og:image:alt', news.title, true);

    // Article specific Open Graph
    updateMetaTag('article:published_time', news.published_at, true);
    updateMetaTag('article:modified_time', news.updated_at || news.published_at, true);
    updateMetaTag('article:author', news.author || 'Zuno AI', true);
    updateMetaTag('article:section', 'Inteligência Artificial', true);
    updateMetaTag('article:tag', news.category, true);
    updateMetaTag('article:tag', 'IA', true);
    updateMetaTag('article:tag', 'Tecnologia', true);

    // Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@zunoai');
    updateMetaTag('twitter:creator', '@zunoai');
    updateMetaTag('twitter:title', news.title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);
    updateMetaTag('twitter:image:alt', news.title);

    // Create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Add JSON-LD NewsArticle structured data (Google News optimized)
    const scriptId = 'news-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const wordCount = countWords(news.content);
    const articleBody = stripHtml(news.content);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      headline: news.title.substring(0, 110), // Google recommends max 110 chars
      description: description,
      image: news.image_url ? [news.image_url] : [`${baseUrl}/og-cover.png`],
      datePublished: news.published_at,
      dateModified: news.updated_at || news.published_at,
      author: {
        '@type': 'Organization',
        name: 'Zuno AI',
        url: baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Zuno AI - Portal de Notícias de Inteligência Artificial',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/zuno-ai.svg`,
          width: 200,
          height: 200,
        },
      },
      about: [
        {
          '@type': 'Thing',
          name: 'Inteligência Artificial',
        },
        {
          '@type': 'Thing',
          name: news.category,
        },
      ],
      articleSection: 'Inteligência Artificial',
      keywords: keywords,
      wordCount: wordCount,
      articleBody: articleBody.substring(0, 5000), // Limit for structured data
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      copyrightHolder: {
        '@type': 'Organization',
        name: 'Zuno AI',
      },
    };

    script.textContent = JSON.stringify(structuredData);

    // Add BreadcrumbList structured data
    const breadcrumbScriptId = 'breadcrumb-structured-data';
    let breadcrumbScript = document.getElementById(breadcrumbScriptId) as HTMLScriptElement;

    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = breadcrumbScriptId;
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Zuno AI',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Notícias de IA',
          item: `${baseUrl}/noticias-ia`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: news.title,
          item: canonicalUrl,
        },
      ],
    };

    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);

    // Cleanup function
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (breadcrumbScript && breadcrumbScript.parentNode) {
        breadcrumbScript.parentNode.removeChild(breadcrumbScript);
      }
    };
  }, [news, url]);

  return null;
}
