import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProfession, useProfessionFeed, CLUSTER_LABELS, BAND_LABELS, BAND_COLORS } from "@/hooks/useProfessions";
import { shareOnLinkedIn, shareOnTwitter, copyToClipboard } from "@/utils/shareUtils";
import { track, EVENTS } from "@/lib/analytics";
import { NewsPreviewCard, JobPreviewCard } from "./PreviewCards";
import BreadcrumbSchema from "./BreadcrumbSchema";
import Footer from "./Footer";

type QuizProfile = "pouco" | "metade" | "maioria";

const PROFILE_MESSAGES: Record<QuizProfile, string> = {
  pouco:
    "No seu perfil, a parte automatizável tende a ser menor que a média da profissão.",
  metade:
    "No seu perfil, a parte automatizável tende a ficar próxima da média da profissão.",
  maioria:
    "No seu perfil, a parte automatizável tende a ser maior que a média da profissão.",
};

function isQuizProfile(value: string | null): value is QuizProfile {
  return value === "pouco" || value === "metade" || value === "maioria";
}

function ProfessionPageSEO({ name, summary, slug }: { name: string; summary: string; slug: string }) {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://usezuno.app";
    const canonicalUrl = `${baseUrl}/profissoes/${slug}`;
    const title = `${name}: como a IA afeta a profissão | Zuno AI`;
    const description = summary.slice(0, 160);

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
    updateMetaTag("og:type", "article", true);
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

    const scriptId = "profession-page-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      url: canonicalUrl,
    };

    script.textContent = JSON.stringify(structuredData);
  }, [name, summary, slug]);

  return null;
}

export default function ProfessionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profession, isLoading: isLoadingProfession } = useProfession(slug);
  const { jobs, news, isLoading: isLoadingFeed } = useProfessionFeed(slug);

  const perfilParam = searchParams.get("perfil");
  const perfil = isQuizProfile(perfilParam) ? perfilParam : null;

  // Only redirect once the profession has loaded and is genuinely missing
  // or unpublished — mirrors NichePage.tsx's redirect guard so a brief
  // loading window doesn't bounce every visit to /profissoes.
  useEffect(() => {
    if (!isLoadingProfession && slug && !profession) {
      navigate("/profissoes", { replace: true });
    }
  }, [isLoadingProfession, slug, profession, navigate]);

  useEffect(() => {
    if (profession) {
      track(EVENTS.profession_viewed, { slug: profession.slug, band: profession.exposure_band });
    }
  }, [profession]);

  if (!slug) {
    return null;
  }

  if (isLoadingProfession || !profession) {
    return (
      <div className="w-full pb-16 md:pb-0">
        <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
          <div className="h-10 w-2/3 mx-auto bg-zinc-900/30 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-1/2 mx-auto bg-zinc-900/30 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://usezuno.app/profissoes/${profession.slug}`;
  const shareTitle = `Como a IA afeta a profissão de ${profession.name}?`;
  const shareOnWhatsAppMessage = () => {
    track(EVENTS.profession_shared, { slug: profession.slug, channel: 'whatsapp' });
    const text = encodeURIComponent(`${shareTitle} Veja a análise: ${pageUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  const bandColor = BAND_COLORS[profession.exposure_band];
  const breadcrumbs = [
    { name: "Início", url: "https://usezuno.app" },
    { name: "Profissões", url: "https://usezuno.app/profissoes" },
    { name: profession.name, url: `https://usezuno.app/profissoes/${profession.slug}` },
  ];

  return (
    <div className="w-full pb-16 md:pb-0">
      <ProfessionPageSEO name={profession.name} summary={profession.summary} slug={profession.slug} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Hero */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
        <p className="text-sm text-zinc-500 mb-3">{CLUSTER_LABELS[profession.cluster]}</p>
        <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-6">
          {profession.name}
        </h1>

        <div className="max-w-[420px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-zinc-500">faixa estimada</span>
            <span className={`text-[13px] px-2 py-0.5 rounded-full border ${bandColor.border} ${bandColor.text}`}>
              {BAND_LABELS[profession.exposure_band]}
            </span>
          </div>
          <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${bandColor.bg}`}
              style={{ width: `${Math.min(Math.max(profession.exposure_score, 2), 100)}%` }}
            />
          </div>
        </div>

        <p className="text-[13px] leading-[20px] text-zinc-600 max-w-[480px] mx-auto mt-4">
          Estimativa gerada por IA a partir de vagas e notícias reais e revisada pela equipe. Não é previsão sobre o seu emprego.
        </p>

        {perfil && (
          <p className="text-[13px] leading-[20px] text-zinc-400 max-w-[480px] mx-auto mt-3 border-t border-zinc-800 pt-3">
            {PROFILE_MESSAGES[perfil]}
          </p>
        )}
      </div>

      {/* O que muda no dia a dia */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto">
          <h2 className="text-lg md:text-xl mb-4">O que muda no dia a dia</h2>
          <p className="text-[15px] leading-[24px] text-zinc-400">{profession.summary}</p>
        </div>
      </section>

      {/* Tarefas */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg md:text-xl mb-4">Tarefas que a IA potencializa</h2>
            {profession.tasks_augmented.length > 0 ? (
              <ul className="space-y-2">
                {profession.tasks_augmented.map((task, i) => (
                  <li key={i} className="text-[14px] leading-[22px] text-zinc-400 flex gap-2">
                    <span className="text-emerald-400 shrink-0">+</span>
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-zinc-600">Sem dados suficientes ainda.</p>
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-xl mb-4">Tarefas em risco de automação</h2>
            {profession.tasks_at_risk.length > 0 ? (
              <ul className="space-y-2">
                {profession.tasks_at_risk.map((task, i) => (
                  <li key={i} className="text-[14px] leading-[22px] text-zinc-400 flex gap-2">
                    <span className="text-rose-400 shrink-0">–</span>
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-zinc-600">Sem dados suficientes ainda.</p>
            )}
          </div>
        </div>
      </section>

      {/* Skills-ponte */}
      {profession.bridge_skills.length > 0 && (
        <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="max-w-[896px] mx-auto">
            <h2 className="text-lg md:text-xl mb-4">Skills-ponte para se posicionar</h2>
            <div className="flex flex-wrap gap-2">
              {profession.bridge_skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => navigate("/jobs")}
                  className="text-[13px] text-zinc-300 border border-zinc-800 rounded-full px-3 py-1.5 hover:bg-zinc-900/30 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vagas */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto">
          <h2 className="text-lg md:text-xl mb-5">Vagas que valorizam essas skills</h2>

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
              <p className="text-sm">Ainda não temos vagas suficientes para {profession.name}.</p>
            </div>
          )}
        </div>
      </section>

      {/* Notícias */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-lg md:text-xl mb-5">Notícias relacionadas</h2>

          {isLoadingFeed ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
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
              <p className="text-sm">Ainda não temos notícias suficientes para {profession.name}.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA + share */}
      <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
        <div className="max-w-[896px] mx-auto border border-zinc-800 rounded-2xl p-6 md:p-10 text-center">
          <h2 className="text-lg md:text-xl mb-2">Receba notícias de IA para {profession.name} no WhatsApp</h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-[420px] mx-auto">
            Sem precisar abrir o site todo dia — direto no seu WhatsApp.
          </p>
          <button
            onClick={() => navigate(`/beta?profissao=${encodeURIComponent(profession.name)}`)}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] mb-6"
          >
            Entrar na lista
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={shareOnWhatsAppMessage}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no WhatsApp"
            >
              WhatsApp
            </button>
            <button
              onClick={() => {
                track(EVENTS.profession_shared, { slug: profession.slug, channel: 'linkedin' });
                shareOnLinkedIn(pageUrl);
              }}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no LinkedIn"
            >
              LinkedIn
            </button>
            <button
              onClick={() => {
                track(EVENTS.profession_shared, { slug: profession.slug, channel: 'twitter' });
                shareOnTwitter(shareTitle, pageUrl);
              }}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 text-[13px]"
              aria-label="Compartilhar no X"
            >
              X
            </button>
            <button
              onClick={() => {
                track(EVENTS.profession_shared, { slug: profession.slug, channel: 'copy' });
                copyToClipboard(pageUrl);
              }}
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
