import { getJobApplicationUrl } from "@/utils/tracking";
import { formatRelativeDate, getDateColor } from "@/utils/date";
import type { News } from "@/types/news";
import type { Job } from "@/types/job";

// Extracted from HomePage.tsx so NichePage.tsx can reuse the same card look
// without duplicating markup. Behavior is unchanged from the original
// HomePage-local components.

const dateColorClasses = {
  pink: 'text-[#FF7BCA]',
  blue: 'text-[#62D4DD]',
  purple: 'text-[#7349D4]',
  default: 'text-zinc-500',
};

export function formatNewsDate(date: string | Date): string {
  const now = new Date();
  const published = new Date(date);
  const diffMs = now.getTime() - published.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 7) return `há ${diffDays} dias`;

  return published.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Small presentational card mirroring the look of components/NewsPage.tsx's
// news grid item.
export function NewsPreviewCard({ item, onClick }: { item: News; onClick: () => void }) {
  return (
    <article onClick={onClick} className="group cursor-pointer">
      <div className="relative mb-3 overflow-hidden rounded-xl aspect-[4/3] bg-zinc-900">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <svg className="size-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <span className="text-sm text-zinc-500">
          {formatNewsDate(item.published_at)}
          {' · '}
          {item.read_time} min de leitura
        </span>
        <h3 className="text-sm text-white line-clamp-2">{item.title}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2">{item.excerpt}</p>
      </div>
    </article>
  );
}

// Small presentational card mirroring the look of components/JobsPage.tsx's
// job list item.
export function JobPreviewCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="border border-zinc-800 rounded-2xl p-4 md:p-6 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-start md:items-center gap-3 md:gap-4">
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
              onError={(e) => {
                e.currentTarget.src = '/zuno-mini.svg';
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] md:text-[18px] leading-tight text-white mb-2 md:mb-3 line-clamp-2 md:truncate">
            {job.job_title}
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] min-w-0">
            <span className="text-zinc-300 truncate">{job.company_name}</span>
            <span className="text-zinc-500 truncate">
              {job.location}
              {job.seniority_level && ` · ${job.seniority_level}`}
              {job.employment_type && ` · ${job.employment_type}`}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <span className={`text-[12px] leading-[16px] ${dateColorClasses[getDateColor(job.posted_at)]}`}>
            {formatRelativeDate(job.posted_at)}
          </span>
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
  );
}
