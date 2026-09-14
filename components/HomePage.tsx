import { useNews } from "@/hooks/useNews";
import { useJobs } from "@/hooks/useJobs";
import { getJobApplicationUrl } from "@/utils/tracking";
import { formatRelativeDate, getDateColor } from "@/utils/date";
import type { News } from "@/types/news";
import type { Job } from "@/types/job";
import { NewsGridSkeleton, JobsListSkeleton } from "./Skeleton";
import Footer from "./Footer";
import HomeSEO from "./HomeSEO";

const dateColorClasses = {
  pink: 'text-[#FF7BCA]',
  blue: 'text-[#62D4DD]',
  purple: 'text-[#7349D4]',
  default: 'text-zinc-500',
};

const NEWS_PREVIEW_COUNT = 6;
const JOBS_PREVIEW_COUNT = 6;

function formatNewsDate(date: string | Date): string {
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
// news grid item. Kept local to HomePage to avoid touching NewsPage.
function NewsPreviewCard({ item, onClick }: { item: News; onClick: () => void }) {
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
// job list item. Kept local to HomePage to avoid touching JobsPage.
function JobPreviewCard({ job, onClick }: { job: Job; onClick: () => void }) {
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

interface HomePageProps {
  onNewsClick: (id: number | string) => void;
  onJobClick: (job: Job) => void;
  onViewNews: () => void;
  onViewJobs: () => void;
  onPostJobClick: () => void;
  onBetaClick: () => void;
}

export default function HomePage({
  onNewsClick,
  onJobClick,
  onViewNews,
  onViewJobs,
  onPostJobClick,
  onBetaClick,
}: HomePageProps) {
  const { news, isLoading: isLoadingNews } = useNews();
  const { jobs, isLoading: isLoadingJobs } = useJobs();

  const latestNews = news.slice(0, NEWS_PREVIEW_COUNT);
  const recentJobs = jobs.slice(0, JOBS_PREVIEW_COUNT);

  return (
    <>
      <HomeSEO />

      <div className="w-full pb-16 md:pb-0">
        {/* Hero */}
        <div className="max-w-[968px] mx-auto px-4 md:px-8 lg:px-24 pt-12 pb-8 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 text-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-[1.2] mb-4 md:mb-6">
            Notícias e vagas de Inteligência Artificial, em português
          </h1>

          <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 mb-8 max-w-[560px] mx-auto">
            Curadoria diária de notícias de IA e vagas de IA no Brasil. Compartilhe no WhatsApp, candidate-se direto na empresa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
            <button
              onClick={onViewNews}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] w-full sm:w-auto"
            >
              Ver notícias
            </button>
            <button
              onClick={onViewJobs}
              className="bg-[#18181b] text-white border border-zinc-800 px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-[15px] leading-[15px] w-full sm:w-auto"
            >
              Ver vagas
            </button>
          </div>

          <button
            onClick={onPostJobClick}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-[14px] underline underline-offset-4"
          >
            Publicar vaga grátis
          </button>
        </div>

        {/* Últimas notícias */}
        <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl">Últimas notícias</h2>
              <button
                onClick={onViewNews}
                className="px-3 py-2 text-sm border border-zinc-800 rounded-lg hover:bg-zinc-800"
              >
                Ver todas
              </button>
            </div>

            {isLoadingNews && latestNews.length === 0 ? (
              <NewsGridSkeleton count={NEWS_PREVIEW_COUNT} />
            ) : latestNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {latestNews.map((item) => (
                  <NewsPreviewCard key={item.id} item={item} onClick={() => onNewsClick(item.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-sm">Nenhuma notícia disponível no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* Vagas recentes */}
        <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="max-w-[896px] mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl">Vagas recentes</h2>
              <button
                onClick={onViewJobs}
                className="px-3 py-2 text-sm border border-zinc-800 rounded-lg hover:bg-zinc-800"
              >
                Ver todas
              </button>
            </div>

            {isLoadingJobs && recentJobs.length === 0 ? (
              <JobsListSkeleton count={JOBS_PREVIEW_COUNT} />
            ) : recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <JobPreviewCard key={job.id} job={job} onClick={() => onJobClick(job)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-sm">Nenhuma vaga disponível no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* Receba no WhatsApp */}
        <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="max-w-[896px] mx-auto border border-zinc-800 rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-lg md:text-xl mb-2">Receba no WhatsApp</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-[420px] mx-auto">
              Notícias e vagas de IA direto no seu WhatsApp, sem precisar abrir o site todo dia.
            </p>
            <button
              onClick={onBetaClick}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px]"
            >
              Entrar na lista
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
