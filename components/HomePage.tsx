import { useNavigate } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import { useJobs } from "@/hooks/useJobs";
import { useNiches } from "@/hooks/useNicheFeed";
import type { Job } from "@/types/job";
import { NewsGridSkeleton, JobsListSkeleton } from "./Skeleton";
import { NewsPreviewCard, JobPreviewCard } from "./PreviewCards";
import Footer from "./Footer";
import HomeSEO from "./HomeSEO";

const NEWS_PREVIEW_COUNT = 6;
const JOBS_PREVIEW_COUNT = 6;

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
  const navigate = useNavigate();
  const { news, isLoading: isLoadingNews } = useNews();
  const { jobs, isLoading: isLoadingJobs } = useJobs();
  const { niches } = useNiches();

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

        {/* IA para a sua área */}
        {niches.length > 0 && (
          <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-lg md:text-xl mb-5">IA para a sua área</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {niches.map((niche) => (
                  <button
                    key={niche.slug}
                    onClick={() => navigate(`/ia-para/${niche.slug}`)}
                    className="text-left border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900/30 transition-colors"
                  >
                    <h3 className="text-sm text-white mb-1">{niche.name}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{niche.headline}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Seu emprego está em risco pela IA? */}
        <section className="px-4 md:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="max-w-[896px] mx-auto border border-zinc-800 rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-lg md:text-xl mb-2">Seu emprego está em risco pela IA?</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-[420px] mx-auto">
              Descubra em 1 minuto o quanto a IA já afeta a sua profissão, com base em vagas e notícias reais.
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] mb-4"
            >
              Fazer o teste de 1 minuto
            </button>
            <div>
              <button
                onClick={() => navigate("/profissoes")}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-[14px] underline underline-offset-4"
              >
                Ver todas as profissões
              </button>
            </div>
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
