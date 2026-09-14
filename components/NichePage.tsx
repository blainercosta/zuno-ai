import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNiches, useNicheFeed } from "@/hooks/useNicheFeed";
import { shareOnWhatsApp, shareOnLinkedIn, shareOnTwitter, copyToClipboard } from "@/utils/shareUtils";
import { NewsPreviewCard, JobPreviewCard } from "./PreviewCards";
import BreadcrumbSchema from "./BreadcrumbSchema";
import Footer from "./Footer";

function NichePageSEO({ name, description, slug }: { name: string; description: string; slug: string }) {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://usezuno.app";
    const canonicalUrl = `${baseUrl}/ia-para/${slug}`;
    const title = `IA para ${name} — notícias e vagas | Zuno AI`;

    document.title = title;

    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateMetaTag("description", description);
    updateMetaTag("robots", "index, follow");
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const scriptId = "niche-page-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalUrl,
    };

    script.textContent = JSON.stringify(structuredData);
  }, [name, description, slug]);

  return null;
}

export default function NichePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { niches, isLoading: isLoadingNiches } = useNiches();
  const niche = niches.find((n) => n.slug === slug);
  const { news, jobs, isLoading: isLoadingFeed } = useNicheFeed(slug);

  // Only redirect once niches have loaded and the slug genuinely doesn't
  // exist — otherwise every page load would bounce to /ia-para during the
  // brief window before niches_public resolves.
  useEffect(() => {
    if (!isLoadingNiches && slug && !niche) {
      navigate("/ia-para", { replace: true });
    }
  }, [isLoadingNiches, slug, niche, navigate]);

  if (!slug) {
    return null;
  }

  if (isLoadingNiches || !niche) {
    return (
      <div className="w-full pb-16 md:pb-0">
        <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
          <div className="h-10 w-2/3 mx-auto bg-zinc-900/30 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-1/2 mx-auto bg-zinc-900/30 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://usezuno.app/ia-para/${niche.slug}`;
  const breadcrumbs = [
    { name: "Início", url: "https://usezuno.app" },
    { name: "IA para a sua área", url: "https://usezuno.app/ia-para" },
    { name: niche.name, url: `https://usezuno.app/ia-para/${niche.slug}` },
  ];

  return (
    <div className="w-full pb-16 md:pb-0">
      <NichePageSEO name={niche.name} description={niche.description} slug={niche.slug} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Hero */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
        <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-4 md:mb-6">
          {niche.headline}
        </h1>
        <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 max-w-[560px] mx-auto">
          {niche.description}
        </p>
      </div>

      {/* Notícias */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-lg md:text-xl mb-5">Notícias de IA para {niche.name}</h2>

          {isLoadingFeed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-zinc-900/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {news.map((item) => (
                <NewsPreviewCard
                  key={item.id}
                  item={item}
                  onClick={() => navigate(`/noticias-ia/${item.slug || item.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-sm">Ainda não temos notícias suficientes para {niche.name}.</p>
            </div>
          )}
        </div>
      </section>

      {/* Vagas */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto">
          <h2 className="text-lg md:text-xl mb-5">Vagas relacionadas</h2>

          {isLoadingFeed ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-zinc-900/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobPreviewCard key={job.id} job={job} onClick={() => navigate(`/job/${job.job_id}`)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-sm">Ainda não temos vagas suficientes para {niche.name}.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA + share */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto border border-zinc-800 rounded-2xl p-6 md:p-10 text-center">
          <h2 className="text-lg md:text-xl mb-2">Receba notícias de IA para {niche.name} no WhatsApp</h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-[420px] mx-auto">
            Sem precisar abrir o site todo dia — direto no seu WhatsApp.
          </p>
          <button
            onClick={() => navigate(`/beta?niche=${encodeURIComponent(niche.name)}`)}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] mb-6"
          >
            Entrar na lista
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => shareOnWhatsApp(niche.headline, pageUrl)}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no WhatsApp"
            >
              WhatsApp
            </button>
            <button
              onClick={() => shareOnLinkedIn(pageUrl)}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no LinkedIn"
            >
              LinkedIn
            </button>
            <button
              onClick={() => shareOnTwitter(niche.headline, pageUrl)}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no X"
            >
              X
            </button>
            <button
              onClick={() => copyToClipboard(pageUrl)}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Copiar link"
            >
              Copiar link
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
