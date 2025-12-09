import { useRef, useEffect, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { formatRelativeDate, getDateColor } from "@/utils/date";
import type { Job } from "@/types/job";
import Footer from "./Footer";
import { getJobApplicationUrl } from "@/utils/tracking";
import OrganizationSchema from "./OrganizationSchema";
import BreadcrumbSchema from "./BreadcrumbSchema";
import FAQSchema from "./FAQSchema";
import BetaAccessModal from "./BetaAccessModal";
import { JobsListSkeleton } from "./Skeleton";

interface JobsPageProps {
  onJobClick: (job: Job) => void;
  onPostJobClick: () => void;
  onNewsClick?: () => void;
}

// Cores da logo Zuno AI para indicar frescor da vaga
const dateColorClasses = {
  pink: 'text-[#FF7BCA]',     // < 6 horas
  blue: 'text-[#62D4DD]',     // < 12 horas
  purple: 'text-[#7349D4]',   // < 24 horas
  default: 'text-zinc-500',   // > 24 horas
}

export default function JobsPage({ onJobClick, onPostJobClick, onNewsClick }: JobsPageProps) {
  const { jobs, isLoading, hasMore, loadMore, searchQuery, search, clearSearch } = useJobs();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-24">
        <div className="text-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-4 md:mb-6">
            Pare de caçar vaga.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Deixe a IA caçar por você.
          </h1>

          <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 mb-6 max-w-[480px] mx-auto">
            Oportunidades reais em IA,<br />
            atualizadas automaticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            {/* Post Job button - hidden in production */}
            {import.meta.env.DEV && (
              <button
                onClick={onPostJobClick}
                className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px]"
              >
                Publicar vaga grátis
              </button>
            )}
            {onNewsClick && (
              <>
                <style>{`
                  @property --beta-angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                  }

                  @keyframes rotate-beta {
                    to {
                      --beta-angle: 360deg;
                    }
                  }

                  .beta-btn-wrapper {
                    position: relative;
                    display: inline-block;
                  }

                  .beta-btn-wrapper::before,
                  .beta-btn-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: 12px;
                    background: conic-gradient(
                      from var(--beta-angle),
                      #7349D4,
                      #FF7BCA,
                      #FFF96F,
                      #62D4DD,
                      #7349D4
                    );
                    animation: rotate-beta 3s linear infinite;
                    pointer-events: none;
                  }

                  .beta-btn-wrapper::after {
                    filter: blur(15px);
                    opacity: 0.4;
                  }

                  .beta-btn-inner {
                    position: relative;
                    z-index: 1;
                  }
                `}</style>
                <div className="beta-btn-wrapper">
                  <button
                    onClick={() => setIsBetaModalOpen(true)}
                    className="beta-btn-inner bg-[#18181b] text-white px-6 py-3 rounded-xl text-[15px] leading-[15px]"
                  >
                    Quero ser Contratado
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-[896px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="size-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => search(e.target.value)}
              placeholder="Buscar por cargo, empresa ou localização..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-12 py-3.5 text-[15px] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  clearSearch();
                  searchInputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Limpar busca"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && !isLoading && (
            <p className="mt-3 text-[14px] text-zinc-500">
              {jobs.length === 0
                ? `Nenhuma vaga encontrada para "${searchQuery}"`
                : `${jobs.length} vaga${jobs.length !== 1 ? 's' : ''} encontrada${jobs.length !== 1 ? 's' : ''} para "${searchQuery}"`
              }
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Initial loading skeleton */}
          {isLoading && jobs.length === 0 && <JobsListSkeleton count={5} />}

          {jobs.map((job) => (
            <article
              key={job.id}
              onClick={() => onJobClick(job)}
              className="border border-zinc-800 rounded-2xl p-4 md:p-6 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-3 md:gap-4">
                {/* Logo */}
                <div className="shrink-0">
                  <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden">
                      <img
                        src={job.logo_url || '/zuno-mini.svg'}
                        alt={job.company_name}
                        className="w-full h-full object-cover"
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] md:text-[18px] leading-tight text-white mb-2 md:mb-3 line-clamp-2 md:truncate">{job.job_title}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] min-w-0">
                    <span className="text-zinc-300 truncate">{job.company_name}</span>
                    <span className="text-zinc-500 truncate">
                      {job.location}
                      {job.seniority_level && ` · ${job.seniority_level}`}
                      {job.employment_type && ` · ${job.employment_type}`}
                    </span>
                  </div>
                </div>

                {/* Posted & Apply */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <span className={`text-[12px] leading-[16px] ${dateColorClasses[getDateColor(job.posted_at)]}`}>{formatRelativeDate(job.posted_at)}</span>
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

      {/* Beta Access Modal */}
      <BetaAccessModal isOpen={isBetaModalOpen} onClose={() => setIsBetaModalOpen(false)} />
    </div>
  );
}
