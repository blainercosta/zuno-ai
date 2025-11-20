import { useRef, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { formatRelativeDate } from "@/utils/date";
import type { Job } from "@/types/job";
import Footer from "./Footer";
import { getJobApplicationUrl } from "@/utils/tracking";
import OrganizationSchema from "./OrganizationSchema";
import BreadcrumbSchema from "./BreadcrumbSchema";
import FAQSchema from "./FAQSchema";

interface JobsPageProps {
  onJobClick: (job: Job) => void;
  onPostJobClick: () => void;
}

export default function JobsPage({ onJobClick, onPostJobClick }: JobsPageProps) {
  const { jobs, isLoading, hasMore, loadMore } = useJobs();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // FAQs para Rich Snippets (aparecem no Google)
  const faqs = [
    {
      question: 'O que é o Zuno AI?',
      answer: 'Zuno AI é o maior hub de Inteligência Artificial do Brasil. Conectamos profissionais de IA com vagas, cursos, comunidade e recursos para desenvolvimento de carreira.'
    },
    {
      question: 'Como encontrar vagas de IA no Brasil?',
      answer: 'No Zuno AI você encontra vagas de Inteligência Artificial generalista de empresas verificadas, com salários transparentes e oportunidades reais em todas as áreas de IA.'
    },
    {
      question: 'O Zuno AI é gratuito?',
      answer: 'Sim! O hub Zuno AI é 100% gratuito para profissionais. Acesse vagas, participe da comunidade e explore recursos sem custos.'
    }
  ]

  // Breadcrumb para melhorar SEO
  const breadcrumbs = [
    { name: 'Início', url: 'https://zuno.ai' },
    { name: 'Vagas de IA', url: 'https://zuno.ai/vagas' }
  ]

  return (
    <div className="w-full">
      {/* SEO Schemas */}
      <OrganizationSchema />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      {/* Hero Section */}
      <div className="max-w-[968px] mx-auto px-24 pt-20 pb-16 sm:pt-24 sm:pb-24">
        <div className="text-center">
          <h1 className="text-[32px] sm:text-[48px] leading-[1.2] mb-6">
            Vagas de IA para profissionais<br />
            no Brasil
          </h1>

          <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 mb-6 max-w-[480px] mx-auto">
            Empresas verificadas. Salários transparentes.<br />
            Oportunidades reais em IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <button
              onClick={onPostJobClick}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px]"
            >
              Publicar vaga grátis
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-[896px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* H2 semântico para SEO e estrutura */}
        <h2 className="text-[24px] leading-[32px] mb-8 text-center">
          Últimas Vagas de IA Publicadas
        </h2>

        <div className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              onClick={() => onJobClick(job)}
              className="border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="shrink-0">
                  {job.logo_url ? (
                    <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden">
                      <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-12 rounded-xl flex items-center justify-center bg-zinc-800 text-white">
                      <span className="text-base">{job.company_name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] leading-[18px] text-white mb-3 truncate">{job.job_title}</h3>
                  <div className="flex items-center gap-2 text-[14px] leading-[20px] min-w-0">
                    <span className="text-zinc-300 truncate shrink-0">{job.company_name}</span>
                    <span className="text-zinc-500 truncate">
                      · {job.location}
                      {job.seniority_level && ` · ${job.seniority_level}`}
                      {job.employment_type && ` · ${job.employment_type}`}
                    </span>
                  </div>
                </div>

                {/* Posted & Apply */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <span className="text-[12px] leading-[16px] text-zinc-500">{formatRelativeDate(job.posted_at)}</span>
                  <button
                    className="bg-white text-slate-950 px-4 py-2.5 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[14px] leading-[14px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getJobApplicationUrl(job.job_url, job.job_id), '_blank');
                    }}
                  >
                    Candidatar
                  </button>
                </div>

                {/* Mobile Apply Button */}
                <div className="sm:hidden shrink-0">
                  <button
                    className="bg-white text-slate-950 px-4 py-2.5 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[14px] leading-[14px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getJobApplicationUrl(job.job_url, job.job_id), '_blank');
                    }}
                  >
                    Candidatar
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin size-6 text-zinc-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}

          {/* Intersection Observer Target */}
          {hasMore && <div ref={observerTarget} className="h-4" />}

          {/* End Message */}
          {!hasMore && !isLoading && (
            <div className="text-center py-12 text-zinc-500 text-[14px] leading-[20px]">
              Isto é tudo pessoal.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
