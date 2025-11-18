import { useRef, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { formatRelativeDate } from "@/utils/date";
import type { Job } from "@/types/job";

interface JobsPageProps {
  onJobClick: (job: Job) => void;
  onPostJobClick: () => void;
  onNewsClick?: () => void;
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
  return (
    <div className="w-full">
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
            {false && onNewsClick && (
              <button
                onClick={onNewsClick}
                className="px-6 py-3 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors text-[15px] leading-[15px]"
              >
                Receber vagas no whatsapp
              </button>
            )}
          </div>

          {false && (
            <div className="flex flex-col items-center gap-6">
              <p className="text-[15px] leading-[22.5px] text-zinc-400">Contrataram aqui</p>
              <div className="flex items-center gap-6 sm:gap-8">
                {/* Whop Logo */}
                <svg className="h-[22px] w-auto" fill="none" viewBox="0 0 105 23">
                  <path d={svgPaths.p1ed0a600} fill="#71717A" />
                </svg>

                {/* Attio Logo */}
                <svg className="h-[24px] w-auto" fill="none" viewBox="0 0 96 24">
                  <path d="M3.9456 0H0V3.948H3.9456V0Z" fill="#71717A" />
                  <path clipRule="evenodd" d={svgPaths.p190cfc80} fill="#71717A" fillRule="evenodd" />
                  <path d={svgPaths.p32995a00} fill="#71717A" />
                  <path clipRule="evenodd" d={svgPaths.p3c9d3100} fill="#71717A" fillRule="evenodd" />
                  <path d={svgPaths.p2571ed00} fill="#71717A" />
                </svg>

                {/* Lindy Logo */}
                <svg className="h-[22px] w-auto" fill="none" viewBox="0 0 84 22">
                  <path d={svgPaths.p25988cb0} fill="#71717A" />
                  <path d={svgPaths.p15dfb670} fill="#71717A" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-[896px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
                      window.open(job.job_url, '_blank');
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
                      window.open(job.job_url, '_blank');
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
    </div>
  );
}
