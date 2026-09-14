import { useEffect } from 'react';

// SEO tags for the home page ("/"). Follows the same document.title / meta tag
// update pattern as NewsSEO.tsx and NewsListSEO.tsx.
export default function HomeSEO() {
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://usezuno.app';

    const title = 'Zuno AI - Notícias e Vagas de Inteligência Artificial no Brasil';
    const description = 'Curadoria diária de notícias de IA e vagas de IA no Brasil. Compartilhe no WhatsApp, candidate-se direto na empresa.';

    document.title = title;

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

    updateMetaTag('description', description);
    updateMetaTag('keywords', 'IA, inteligência artificial, notícias IA Brasil, vagas de IA, empregos IA, ChatGPT, Claude, Gemini, tecnologia');
    updateMetaTag('author', 'Zuno AI');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');

    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', baseUrl, true);
    updateMetaTag('og:site_name', 'Zuno AI', true);
    updateMetaTag('og:locale', 'pt_BR', true);
    updateMetaTag('og:image', `${baseUrl}/og-cover.png`, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@zunoai');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${baseUrl}/og-cover.png`);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = baseUrl;

    // JSON-LD WebSite. No SearchAction: JobsPage's search is client-side state
    // (hooks/useJobs.ts `search()`), not a URL query param, so there is no
    // urlTemplate to point a SearchAction at yet.
    const scriptId = 'home-website-structured-data';
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
      name: 'Zuno AI',
      url: baseUrl,
      description,
      inLanguage: 'pt-BR',
    };

    script.textContent = JSON.stringify(structuredData);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
