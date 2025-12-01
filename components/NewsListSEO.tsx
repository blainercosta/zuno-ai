import { useEffect } from 'react';

interface NewsListSEOProps {
  category?: string;
}

export default function NewsListSEO({ category }: NewsListSEOProps) {
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://usezuno.app';
    const isCategory = category && category !== 'Tudo';

    const title = isCategory
      ? `${category} - Notícias de Inteligência Artificial | Zuno AI`
      : 'Notícias de Inteligência Artificial | Zuno AI - Portal de IA Brasil';

    const description = isCategory
      ? `Últimas notícias sobre ${category} e inteligência artificial. Atualizações diárias sobre IA, ChatGPT, Claude, Gemini e tecnologia no Brasil.`
      : 'Portal brasileiro de notícias sobre inteligência artificial. Atualizações diárias sobre IA, ChatGPT, Claude, Gemini e tecnologia.';

    const canonicalUrl = isCategory
      ? `${baseUrl}/noticias-ia/categoria/${encodeURIComponent(category.toLowerCase())}`
      : `${baseUrl}/noticias-ia`;

    // Update document title
    document.title = title;

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

    // Basic SEO Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', 'IA, inteligência artificial, notícias IA Brasil, ChatGPT, Claude, Gemini, tecnologia, inovação, machine learning, deep learning');
    updateMetaTag('author', 'Zuno AI');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('googlebot-news', 'index, follow');

    // Open Graph Tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:site_name', 'Zuno AI - Portal de Notícias de IA', true);
    updateMetaTag('og:locale', 'pt_BR', true);
    updateMetaTag('og:image', `${baseUrl}/og-cover.png`, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);

    // Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@zunoai');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${baseUrl}/og-cover.png`);

    // Create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Add JSON-LD WebSite structured data
    const scriptId = 'website-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Zuno AI - Notícias de Inteligência Artificial',
      url: baseUrl,
      description: 'Portal brasileiro de notícias sobre inteligência artificial. Atualizações diárias sobre IA, ChatGPT, Claude, Gemini e tecnologia.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/noticias-ia?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Zuno AI',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/zuno-ai.svg`,
        },
      },
    };

    script.textContent = JSON.stringify(structuredData);

    // Add CollectionPage structured data for list page
    const collectionScriptId = 'collection-structured-data';
    let collectionScript = document.getElementById(collectionScriptId) as HTMLScriptElement;

    if (!collectionScript) {
      collectionScript = document.createElement('script');
      collectionScript.id = collectionScriptId;
      collectionScript.type = 'application/ld+json';
      document.head.appendChild(collectionScript);
    }

    const collectionData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description: description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [], // Will be populated dynamically by the page
      },
      breadcrumb: {
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
          ...(isCategory ? [{
            '@type': 'ListItem',
            position: 3,
            name: category,
            item: canonicalUrl,
          }] : []),
        ],
      },
    };

    collectionScript.textContent = JSON.stringify(collectionData);

    // Cleanup function
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (collectionScript && collectionScript.parentNode) {
        collectionScript.parentNode.removeChild(collectionScript);
      }
    };
  }, [category]);

  return null;
}
