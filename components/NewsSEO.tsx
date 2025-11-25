import { useEffect } from 'react';
import type { News } from '@/types/news';

interface NewsSEOProps {
  news: News;
  url: string;
}

export default function NewsSEO({ news, url }: NewsSEOProps) {
  useEffect(() => {
    // Update document title
    document.title = `${news.title} | Zuno AI`;

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

    // Basic SEO
    updateMetaTag('description', news.excerpt || news.title);
    updateMetaTag('keywords', `${news.category}, IA, Inteligência Artificial, Tecnologia, ${news.title}`);
    updateMetaTag('author', news.author);

    // Open Graph
    updateMetaTag('og:title', news.title, true);
    updateMetaTag('og:description', news.excerpt || news.title, true);
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:site_name', 'Zuno AI', true);

    if (news.image_url) {
      updateMetaTag('og:image', news.image_url, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
      updateMetaTag('og:image:alt', news.title, true);
    }

    // Article specific
    updateMetaTag('article:published_time', news.published_at, true);
    updateMetaTag('article:author', news.author, true);
    updateMetaTag('article:section', news.category, true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', news.title);
    updateMetaTag('twitter:description', news.excerpt || news.title);
    if (news.image_url) {
      updateMetaTag('twitter:image', news.image_url);
    }

    // Create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Add JSON-LD structured data
    const scriptId = 'news-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: news.title,
      description: news.excerpt || news.title,
      image: news.image_url ? [news.image_url] : [],
      datePublished: news.published_at,
      dateModified: news.updated_at || news.published_at,
      author: {
        '@type': 'Person',
        name: news.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Zuno AI',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/zuno-mini.svg`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      articleSection: news.category,
      keywords: `${news.category}, IA, Inteligência Artificial, Tecnologia`,
    };

    script.textContent = JSON.stringify(structuredData);

    // Cleanup function
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [news, url]);

  return null;
}
