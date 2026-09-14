import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNiches } from "@/hooks/useNicheFeed";
import Footer from "./Footer";

const PAGE_TITLE = "IA para a sua área | Zuno AI";
const PAGE_DESCRIPTION =
  "Notícias e vagas de inteligência artificial organizadas por área: marketing, saúde, educação, finanças, e-commerce e mais.";

function NichesIndexSEO() {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://usezuno.app";
    const canonicalUrl = `${baseUrl}/ia-para`;

    document.title = PAGE_TITLE;

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

    updateMetaTag("description", PAGE_DESCRIPTION);
    updateMetaTag("robots", "index, follow");
    updateMetaTag("og:title", PAGE_TITLE, true);
    updateMetaTag("og:description", PAGE_DESCRIPTION, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", PAGE_TITLE);
    updateMetaTag("twitter:description", PAGE_DESCRIPTION);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    // Meta tags are shared across the app and overwritten by the next
    // page's SEO component (same pattern as NewsListSEO/HomeSEO) — no
    // teardown needed here.
  }, []);

  return null;
}

export default function NichesIndexPage() {
  const navigate = useNavigate();
  const { niches, isLoading } = useNiches();

  return (
    <div className="w-full pb-16 md:pb-0">
      <NichesIndexSEO />

      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
        <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-4 md:mb-6">
          IA para a sua área
        </h1>
        <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 max-w-[560px] mx-auto">
          Notícias e vagas de inteligência artificial, filtradas para o que importa em cada área.
        </p>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="max-w-[1200px] mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-zinc-800 rounded-2xl p-5 h-[104px] animate-pulse bg-zinc-900/30" />
              ))}
            </div>
          ) : niches.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-sm">Nenhuma área disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {niches.map((niche) => (
                <button
                  key={niche.slug}
                  onClick={() => navigate(`/ia-para/${niche.slug}`)}
                  className="text-left border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900/30 transition-colors"
                >
                  <h2 className="text-sm text-white mb-1">{niche.name}</h2>
                  <p className="text-sm text-zinc-400 line-clamp-2">{niche.headline}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
