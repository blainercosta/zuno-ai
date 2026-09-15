import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSalaryStats, useTopSkills } from "@/hooks/useJobInsights";
import { shareOnWhatsApp, shareOnLinkedIn, shareOnTwitter, copyToClipboard } from "@/utils/shareUtils";
import Footer from "./Footer";
import { Skeleton } from "./Skeleton";
import { track, EVENTS } from "@/lib/analytics";

const SENIORITY_LABELS: Record<string, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
  estagio: "Estágio",
};

function formatSeniorityLabel(level: string | null): string {
  if (!level) return "Não informado";
  const key = level.trim().toLowerCase();
  return SENIORITY_LABELS[key] || level;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function SalaryBarsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function SkillsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}

export default function SalariosPage() {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useSalaryStats();
  const { skills, isLoading: skillsLoading } = useTopSkills(90, 20);

  const totalJobsWithSalary = useMemo(
    () => stats.reduce((sum, s) => sum + s.n, 0),
    [stats]
  );

  const maxMedian = useMemo(
    () => stats.reduce((max, s) => Math.max(max, s.median), 0),
    [stats]
  );

  const maxSkillShare = useMemo(
    () => skills.reduce((max, s) => Math.max(max, s.share), 0),
    [skills]
  );

  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://www.usezuno.app/salarios-ia";
  const pageTitle = "Salários e skills em vagas de IA no Brasil";

  useEffect(() => {
    track(EVENTS.salarios_viewed, {});
  }, []);

  useEffect(() => {
    document.title = `${pageTitle} | Zuno AI`;

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

    const description =
      "Quanto pagam as vagas de Inteligência Artificial no Brasil? Mediana salarial por senioridade e as skills mais pedidas, com base em vagas ativas no Zuno AI.";

    updateMetaTag("description", description);
    updateMetaTag("robots", "index, follow");
    updateMetaTag("og:title", pageTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", pageUrl, true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl.split("?")[0];

    const scriptId = "salarios-ia-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: pageTitle,
      description,
      url: pageUrl.split("?")[0],
      creator: {
        "@type": "Organization",
        name: "Zuno AI",
        url: "https://www.usezuno.app",
      },
      license: "https://www.usezuno.app/salarios-ia",
    };

    script.textContent = JSON.stringify(structuredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-12 md:pt-24">
        <div className="text-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] leading-[1.2] mb-4 md:mb-6">
            Salários e skills em vagas de IA no Brasil
          </h1>

          <p className="text-[15px] sm:text-[16px] leading-[24px] text-zinc-400 max-w-[560px] mx-auto">
            {statsLoading
              ? "Carregando estimativa a partir das vagas ativas..."
              : totalJobsWithSalary > 0
                ? `Estimativa a partir de ${totalJobsWithSalary} vagas ativas com salário informado, mediana e intervalo. Não é pesquisa salarial.`
                : "Ainda não temos vagas suficientes com salário informado para gerar uma estimativa confiável."}
          </p>
        </div>
      </div>

      {/* Salary by seniority */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pb-12 md:pb-16">
        <h2 className="text-[20px] sm:text-[24px] leading-[1.3] mb-6">
          Mediana salarial por senioridade
        </h2>

        <div className="border border-zinc-800 rounded-2xl p-4 md:p-6">
          {statsLoading ? (
            <SalaryBarsSkeleton />
          ) : stats.length === 0 ? (
            <p className="text-zinc-500 text-[14px] py-6 text-center">
              Ainda não temos vagas suficientes com salário informado.
            </p>
          ) : (
            <div className="space-y-5">
              {stats.map((stat) => {
                const widthPct = maxMedian > 0 ? Math.max((stat.median / maxMedian) * 100, 4) : 0;
                const rangeStartPct = maxMedian > 0 ? Math.max((stat.p25 / maxMedian) * 100, 0) : 0;
                const rangeEndPct = maxMedian > 0 ? Math.max((stat.p75 / maxMedian) * 100, 0) : 0;

                return (
                  <div key={stat.seniority_level || "sem-nivel"}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[14px] text-zinc-300">
                        {formatSeniorityLabel(stat.seniority_level)}{" "}
                        <span className="text-zinc-600">({stat.n} vagas)</span>
                      </span>
                      <span className="text-[14px] text-zinc-400">
                        {formatBRL(stat.p25)} – {formatBRL(stat.p75)}
                      </span>
                    </div>
                    <div className="relative h-8 bg-zinc-900 rounded-lg overflow-hidden">
                      {/* p25-p75 range */}
                      <div
                        className="absolute inset-y-0 bg-[#7349D4]/20 rounded-lg"
                        style={{ left: `${rangeStartPct}%`, width: `${Math.max(rangeEndPct - rangeStartPct, 1)}%` }}
                      />
                      {/* median marker */}
                      <div
                        className="absolute inset-y-0 w-1 bg-[#7349D4] rounded-full"
                        style={{ left: `${widthPct}%` }}
                        title={`Mediana: ${formatBRL(stat.median)}`}
                      />
                    </div>
                    <div className="mt-1 text-[13px] text-zinc-500">
                      Mediana: {formatBRL(stat.median)}/mês
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top skills */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pb-12 md:pb-16">
        <h2 className="text-[20px] sm:text-[24px] leading-[1.3] mb-6">
          Skills mais pedidas (últimos 90 dias)
        </h2>

        <div className="border border-zinc-800 rounded-2xl p-4 md:p-6">
          {skillsLoading ? (
            <SkillsListSkeleton />
          ) : skills.length === 0 ? (
            <p className="text-zinc-500 text-[14px] py-6 text-center">
              Ainda não temos dados suficientes de skills para exibir.
            </p>
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.skill} className="flex items-center gap-3">
                  <span className="text-[14px] text-zinc-300 w-40 shrink-0 truncate" title={skill.skill}>
                    {skill.skill}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#62D4DD] rounded-full"
                      style={{ width: `${maxSkillShare > 0 ? Math.max((skill.share / maxSkillShare) * 100, 3) : 0}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-zinc-500 w-12 text-right shrink-0">
                    {skill.share}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA + share */}
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pb-16 md:pb-24">
        <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-[18px] sm:text-[20px] mb-2">Quer ver as vagas por trás desses números?</h3>
          <p className="text-[14px] text-zinc-400 mb-6">
            Navegue pelas vagas de IA ativas no Zuno AI e candidate-se diretamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <button
              onClick={() => navigate("/jobs")}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px]"
            >
              Ver vagas
            </button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => shareOnWhatsApp(pageTitle, pageUrl)}
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
              onClick={() => shareOnTwitter(pageTitle, pageUrl)}
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
      </div>

      <Footer />
    </div>
  );
}
