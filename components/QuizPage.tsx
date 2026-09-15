import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizProfessions, CLUSTER_LABELS, type ProfessionCluster, type QuizProfession } from "@/hooks/useProfessions";
import Footer from "./Footer";
import { track, EVENTS } from "@/lib/analytics";

const PAGE_TITLE = "Seu emprego está em risco pela IA? Faça o teste | Zuno AI";
const PAGE_DESCRIPTION =
  "Teste rápido de 1 minuto: descubra o quanto a IA já afeta a sua profissão, com base em vagas e notícias reais do mercado brasileiro.";

type Step = 1 | 2 | 3;
type DailyProfile = "pouco" | "metade" | "maioria";

const PROFILE_OPTIONS: Array<{ value: DailyProfile; label: string }> = [
  { value: "pouco", label: "Pouco — a maior parte é análise, decisão ou contato humano" },
  { value: "metade", label: "Metade — mistura de tarefas repetitivas e trabalho mais complexo" },
  { value: "maioria", label: "Maioria — grande parte é repetitiva ou baseada em texto" },
];

function QuizPageSEO() {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://usezuno.app";
    const canonicalUrl = `${baseUrl}/quiz`;

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
  }, []);

  return null;
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex gap-2 mb-8 max-w-[320px] mx-auto">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-white" : "bg-zinc-800"}`}
        />
      ))}
    </div>
  );
}

function OptionButton({ label, sublabel, onClick }: { label: string; sublabel?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-zinc-800 rounded-2xl p-4 md:p-5 hover:bg-zinc-900/30 transition-colors"
    >
      <p className="text-[15px] text-white">{label}</p>
      {sublabel && <p className="text-[13px] text-zinc-500 mt-1">{sublabel}</p>}
    </button>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { professions, isLoading } = useQuizProfessions();
  const [step, setStep] = useState<Step>(1);
  const [cluster, setCluster] = useState<ProfessionCluster | null>(null);
  const [profession, setProfession] = useState<QuizProfession | null>(null);

  useEffect(() => {
    track(EVENTS.quiz_started);
  }, []);

  const clusters = useMemo(() => {
    const seen = new Set<ProfessionCluster>();
    const list: ProfessionCluster[] = [];
    for (const p of professions) {
      if (!seen.has(p.cluster)) {
        seen.add(p.cluster);
        list.push(p.cluster);
      }
    }
    return list;
  }, [professions]);

  const professionsInCluster = useMemo(
    () => (cluster ? professions.filter((p) => p.cluster === cluster) : []),
    [professions, cluster]
  );

  const handleSelectCluster = (selected: ProfessionCluster) => {
    setCluster(selected);
    track(EVENTS.quiz_step_completed, { step: 1 });
    setStep(2);
  };

  const handleSelectProfession = (selected: QuizProfession) => {
    setProfession(selected);
    track(EVENTS.quiz_step_completed, { step: 2 });
    setStep(3);
  };

  const handleFinish = (dailyProfile: DailyProfile) => {
    if (!profession) return;
    track(EVENTS.quiz_step_completed, { step: 3 });
    track(EVENTS.quiz_completed, { profession_slug: profession.slug, perfil: dailyProfile });
    navigate(`/profissoes/${profession.slug}?perfil=${dailyProfile}`);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setCluster(null);
      setStep(1);
    }
  };

  return (
    <div className="w-full pb-16 md:pb-0">
      <QuizPageSEO />

      <div className="max-w-[640px] mx-auto px-4 md:px-8 pt-12 pb-16 sm:pt-20 md:pt-24">
        <div className="text-center mb-8">
          <h1 className="text-[24px] sm:text-[32px] leading-[1.2] mb-3">
            Seu emprego está em risco pela IA?
          </h1>
          <p className="text-[15px] text-zinc-400">Teste de 1 minuto, sem cadastro.</p>
        </div>

        <ProgressBar step={step} />

        {step > 1 && (
          <button
            onClick={handleBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-[13px] mb-4"
          >
            ← Voltar
          </button>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-[18px] mb-5">Em que área você trabalha?</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-900/30 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {clusters.map((c) => (
                  <OptionButton key={c} label={CLUSTER_LABELS[c]} onClick={() => handleSelectCluster(c)} />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && cluster && (
          <div>
            <h2 className="text-[18px] mb-5">Qual profissão mais se parece com a sua?</h2>
            <div className="space-y-3">
              {professionsInCluster.length === 0 && (
                <p className="text-zinc-400 text-sm">Ainda não temos profissões publicadas nesta área. Volte em breve.</p>
              )}
              {professionsInCluster.map((p) => (
                <OptionButton key={p.slug} label={p.name} onClick={() => handleSelectProfession(p)} />
              ))}
              {professionsInCluster.length > 0 && (
                <OptionButton
                  label="Outra da área"
                  sublabel="Vamos usar a profissão mais próxima para estimar seu resultado"
                  onClick={() => handleSelectProfession(professionsInCluster[0])}
                />
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-[18px] mb-5">Quanto do seu dia é tarefa repetitiva ou baseada em texto?</h2>
            <div className="space-y-3">
              {PROFILE_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  onClick={() => handleFinish(option.value)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
