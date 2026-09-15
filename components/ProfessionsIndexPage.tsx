import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProfessions, CLUSTER_LABELS, BAND_LABELS, BAND_COLORS, type Profession, type ProfessionCluster } from "@/hooks/useProfessions";
import Footer from "./Footer";

const PAGE_TITLE = "Como a IA afeta cada profissão no Brasil | Zuno AI";
const PAGE_DESCRIPTION =
  "Veja a exposição de cada profissão à IA no Brasil: tarefas automatizáveis, tarefas potencializadas e skills-ponte, com base em vagas e notícias reais.";

function ProfessionsIndexSEO() {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://usezuno.app";
    const canonicalUrl = `${baseUrl}/profissoes`;

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

    const scriptId = "professions-index-structured-data";
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
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: canonicalUrl,
    };

    script.textContent = JSON.stringify(structuredData);
  }, []);

  return null;
}

function ProfessionCard({ profession, onClick }: { profession: Profession; onClick: () => void }) {
  const bandColor = BAND_COLORS[profession.exposure_band];

  return (
    <button
      onClick={onClick}
      className="text-left border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm text-white">{profession.name}</h3>
        <span className={`shrink-0 text-[11px] px-2 py-1 rounded-full border ${bandColor.border} ${bandColor.text}`}>
          {BAND_LABELS[profession.exposure_band]}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bandColor.bg}`}
          style={{ width: `${Math.min(Math.max(profession.exposure_score, 2), 100)}%` }}
        />
      </div>
    </button>
  );
}

export default function ProfessionsIndexPage() {
  const navigate = useNavigate();
  const { professions, isLoading } = useProfessions();

  const grouped = useMemo(() => {
    const map = new Map<ProfessionCluster, Profession[]>();
    for (const profession of professions) {
      const list = map.get(profession.cluster) || [];
      list.push(profession);
      map.set(profession.cluster, list);
    }
    return Array.from(map.entries());
  }, [professions]);

  return (
    <div className="w-full pb-16 md:pb-0">
      <ProfessionsIndexSEO />

      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
        <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-4 md:mb-6">
          Como a IA afeta cada profissão no Brasil
        </h1>
        <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 max-w-[560px] mx-auto mb-2">
          Exposição estimada por profissão, com tarefas automatizáveis e skills-ponte para se posicionar.
        </p>
        <p className="text-[13px] leading-[20px] text-zinc-600 max-w-[560px] mx-auto mb-8">
          Estimativa baseada em vagas e notícias reais; faixas, não previsões.
        </p>
        <button
          onClick={() => navigate("/quiz")}
          className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px]"
        >
          Fazer o teste de 1 minuto
        </button>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="max-w-[1200px] mx-auto space-y-12 md:space-y-16">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-zinc-800 rounded-2xl p-5 h-[88px] animate-pulse bg-zinc-900/30" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-sm">Estamos revisando os primeiros laudos. Volte em breve.</p>
            </div>
          ) : (
            grouped.map(([cluster, items]) => (
              <div key={cluster}>
                <h2 className="text-lg md:text-xl mb-5">{CLUSTER_LABELS[cluster]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {items.map((profession) => (
                    <ProfessionCard
                      key={profession.slug}
                      profession={profession}
                      onClick={() => navigate(`/profissoes/${profession.slug}`)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
