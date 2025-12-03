import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/job";
import { NewsGridSkeleton, NewsSidebarSkeleton, JobsSidebarSkeleton } from "./Skeleton";
import NewsListSEO from "./NewsListSEO";

// Função para verificar se notícia é nova (< 1 hora)
function isNewArticle(date: string | Date): boolean {
  const now = new Date();
  const published = new Date(date);
  const diffMs = now.getTime() - published.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 1;
}

// Função para formatar data (relativo se < 7 dias, data completa se >= 7 dias)
function formatPublishedDate(date: string | Date): string {
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

  // Para >= 7 dias, mostrar data completa
  return published.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface NewsPageProps {
  onNewsClick: (id: number | string) => void;
  onViewAllJobs?: () => void;
  initialCategory?: string;
}

export default function NewsPage({ onNewsClick, onViewAllJobs, initialCategory }: NewsPageProps) {
  const [activeFilter, setActiveFilter] = useState(initialCategory || "Tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch categories from database
  const { categories } = useCategories();

  // Fetch news from Supabase with category filter
  const { news, isLoading, hasMore, loadMore } = useNews(activeFilter);

  // Fetch recent jobs
  useEffect(() => {
    const fetchRecentJobs = async () => {
      setLoadingJobs(true);
      const { data, error } = await supabase
        .from('vagas_ia')
        .select('*')
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .limit(4);

      if (data && !error) {
        setRecentJobs(data);
      }
      setLoadingJobs(false);
    };

    fetchRecentJobs();
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Intersection Observer for infinite scroll
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

  // Filter news based on search query - memoized for performance
  const filteredNews = useMemo(() => {
    if (!searchQuery) return news;

    return news.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [news, searchQuery]);

  // Get top 4 news for sidebar (most recent)
  const topNews = useMemo(() => news.slice(0, 4), [news]);

  return (
    <>
      {/* SEO Meta Tags for News List */}
      <NewsListSEO category={activeFilter} />

      <div className="flex w-full pb-16 md:pb-0">
        <div className="flex-1 min-w-0">
          <div className="py-4 md:py-5 lg:py-5">
          {/* Page Title - H1 for SEO */}
          <h1 className="sr-only">Notícias de Inteligência Artificial</h1>

          {/* Filters */}
        <div className="mb-5 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
          {/* Left Navigation Button */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="size-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 shrink-0"
              aria-label="Scroll filters left"
            >
              <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19L8 12L15 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          )}

          <div ref={scrollContainerRef} className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1 items-center">
              {/* Tudo */}
              <button
                onClick={() => setActiveFilter("Tudo")}
                className={`
                  px-3 py-2 rounded-xl text-sm whitespace-nowrap border border-zinc-800
                  ${activeFilter === "Tudo"
                    ? 'bg-white text-slate-950 border-slate-950'
                    : 'hover:bg-zinc-800'
                  }
                `}
              >
                Tudo
              </button>

              {/* Separator */}
              {categories.length > 0 && (
                <div className="w-px h-6 bg-zinc-700 mx-1 shrink-0" />
              )}

              {/* Dynamic categories from database */}
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    px-3 py-2 rounded-xl text-sm whitespace-nowrap border border-zinc-800
                    ${activeFilter === filter
                      ? 'bg-white text-slate-950 border-slate-950'
                      : 'hover:bg-zinc-800'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Right Navigation Button */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="size-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 shrink-0"
              aria-label="Scroll filters right"
            >
              <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5L16 12L9 19" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          )}
          </div>
        </div>

        {/* News Grid */}
        <div className="px-4 md:px-6 lg:px-8">
          {/* Initial loading skeleton */}
          {isLoading && news.length === 0 && <NewsGridSkeleton count={6} />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              onClick={() => onNewsClick(item.id)}
              className="group cursor-pointer"
            >
              {/* Image */}
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
                <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(0,0,0,0.05)]" />
              </div>

              {/* Content - vertical layout */}
              <div className="space-y-2">
                {/* Date and Read time */}
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>
                    {formatPublishedDate(item.published_at)}
                    {' · '}
                    {item.read_time} min de leitura
                  </span>
                  {isNewArticle(item.published_at) && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                      Novo
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm text-white line-clamp-2">
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

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


        {/* Empty State */}
        {!isLoading && filteredNews.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">Nenhuma notícia encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou busca</p>
          </div>
        )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[359px] border-l border-zinc-800 h-screen sticky top-0 overflow-y-auto sidebar-scroll">
        {/* Search Bar */}
        <div className="p-8 border-b border-zinc-800">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 20 24">
              <circle cx="9.16667" cy="9.16667" r="5.83333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M17.5 17.5L13.875 13.875" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
              aria-label="Search news"
            />
          </div>
        </div>

        {/* Mais lidas da semana */}
        <div className="p-8 border-b border-zinc-800">
          <h3 className="mb-6">Mais lidas da semana</h3>

          <div className="space-y-4">
            {isLoading && news.length === 0 ? (
              <NewsSidebarSkeleton />
            ) : (
              topNews.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => onNewsClick(item.id)}
                  className="cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <span className="text-2xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-zinc-100 group-hover:text-white transition-colors mb-1 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>
                          {formatPublishedDate(item.published_at)}
                          {' · '}
                          {item.read_time} min de leitura
                        </span>
                        {isNewArticle(item.published_at) && (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                            Novo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3>Vagas recentes</h3>
            <button
              onClick={onViewAllJobs}
              className="px-3 py-2 text-sm border border-zinc-800 rounded-lg hover:bg-zinc-800"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-0">
            {loadingJobs ? (
              <JobsSidebarSkeleton count={4} />
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => {
                const firstLetter = job.company_name?.charAt(0).toUpperCase() || 'J';
                const formattedDate = job.posted_at
                  ? new Date(job.posted_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short'
                    })
                  : '';

                return (
                  <div key={job.id} className="flex items-center gap-3 px-4 py-4 -mx-4 hover:bg-zinc-900 rounded-xl cursor-pointer">
                    {job.logo_url ? (
                      <img
                        src={job.logo_url}
                        alt={job.company_name}
                        className="size-12 rounded-xl object-cover shrink-0"
                        onError={(e) => {
                          // Fallback to first letter if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="size-12 rounded-xl bg-[#202023] flex items-center justify-center shrink-0"
                      style={{ display: job.logo_url ? 'none' : 'flex' }}
                    >
                      <span className="text-sm font-medium">{firstLetter}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm mb-0.5 text-zinc-100 truncate">{job.job_title}</h4>
                      <p className="text-sm text-zinc-500 truncate">{job.company_name}</p>
                    </div>

                    <span className="text-xs text-zinc-600 whitespace-nowrap">{formattedDate}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Nenhuma vaga disponível
              </div>
            )}
          </div>
        </div>
      </aside>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  );
}
