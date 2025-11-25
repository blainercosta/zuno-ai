import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import svgPaths from "./imports/svg-shvcwjgnc";
import svgPathsModal from "./imports/svg-rto7qlii0f";
import JobsPage from "./components/JobsPage";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/job";
import { getIdFromSlug, generateSlug } from "@/utils/shareUtils";

// Lazy load componentes secundários para reduzir bundle inicial
const JobDetailPage = lazy(() => import("./components/JobDetailPage"));
const PostJobPage = lazy(() => import("./components/PostJobPage"));
const NewsPage = lazy(() => import("./components/NewsPage"));
const NewsDetailPage = lazy(() => import("./components/NewsDetailPage"));

// Placeholder images
const imgFrame2 = "https://placehold.co/800x600/1a1a1a/808080?text=Project+Preview";
const imgPictureWhereDesigningIsBuilding = "https://placehold.co/400x300/1a1a1a/808080?text=Framer+Ad";
const imgMetaJpg = "https://placehold.co/1200x800/1a1a1a/808080?text=Project+Details";

const FILTERS = [
  "All", "UI", "Figma", "UI Design", "Product Design", "Web Design", 
  "Design", "UX And UI", "Minimal", "Website", "UX", "Landing Page", 
  "App", "Mobile App", "Dashboard", "Branding", "Saas", "Animation", 
  "Logo", "Components", "Icons", "Website Design", "Ios", "Mobile UI", 
  "Uiux", "Dark Mode", "3D", "Clean", "User Interface", "Logo Design", "AI"
];

const JOBS = [
  { title: "Designer", company: "Yuzu", date: "18 set" },
  { title: "Product Designer Sênior", company: "Phantom", date: "20 ago" },
  { title: "Product Designer", company: "Carberry & Hanrahan", date: "18 ago", initials: "CH", color: "emerald" },
  { title: "Designer de Marca", company: "Titan", date: "31 jul" }
];

const USERS = [
  { name: "Marjorie T Eunike", username: "@margedesign", initials: "ME", color: "indigo" },
  { name: "Chronicles Embod…", username: "@chroniclesuix", initials: "CE", color: "emerald" },
  { name: "Ethereal Nexus O…", username: "@etherealux", initials: "EN", color: "purple" }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "jobs" | "job-detail" | "post-job" | "news" | "news-detail">("jobs");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Função para buscar vaga por job_id
  const fetchJobById = useCallback(async (jobId: string) => {
    setIsLoadingJob(true);
    try {
      const { data, error } = await supabase
        .from('vagas_ia')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedJob(data as Job);
        setCurrentPage('job-detail');
        // Scroll para o topo quando carrega vaga via URL
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      setCurrentPage('jobs');
    } finally {
      setIsLoadingJob(false);
    }
  }, []);

  // Detecta job_id ou news na URL ao carregar a página
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job');
    const newsSlug = params.get('news');

    if (jobId) {
      fetchJobById(jobId);
    } else if (newsSlug) {
      const newsId = getIdFromSlug(newsSlug);
      if (newsId) {
        setSelectedNewsId(newsId);
        setCurrentPage('news-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [fetchJobById]);

  // Atualiza URL quando navegar para uma vaga
  const updateURL = useCallback((jobId: string | null) => {
    const url = new URL(window.location.href);

    if (jobId) {
      url.searchParams.set('job', jobId);
    } else {
      url.searchParams.delete('job');
    }

    window.history.pushState({}, '', url.toString());
  }, []);

  // Atualiza URL quando navegar para uma notícia
  const updateNewsURL = useCallback((newsId: number | null, newsTitle?: string) => {
    const url = new URL(window.location.href);

    if (newsId && newsTitle) {
      const slug = generateSlug(newsTitle, newsId);
      url.searchParams.set('news', slug);
    } else {
      url.searchParams.delete('news');
    }

    window.history.pushState({}, '', url.toString());
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollLeftFilters = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRightFilters = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  const handleJobClick = useCallback((job: Job) => {
    setSelectedJob(job);
    setCurrentPage("job-detail");
    updateURL(job.job_id);
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateURL]);

  const handlePostJobClick = useCallback(() => {
    setCurrentPage("post-job");
    updateURL(null);
  }, [updateURL]);

  const handleNewsClick = useCallback(() => {
    setCurrentPage("news");
    updateURL(null);
    updateNewsURL(null);
  }, [updateURL, updateNewsURL]);

  const handleBackToJobs = useCallback(() => {
    setCurrentPage("jobs");
    updateURL(null);
  }, [updateURL]);

  const handleBackToHome = useCallback(() => {
    setCurrentPage("home");
    updateURL(null);
  }, [updateURL]);

  const handleNewsDetailClick = useCallback(async (newsId: number) => {
    setSelectedNewsId(newsId);
    setCurrentPage("news-detail");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch news title to update URL with slug
    try {
      const { data: newsData } = await supabase
        .from('news')
        .select('title')
        .eq('id', newsId)
        .single();

      if (newsData) {
        updateNewsURL(newsId, newsData.title);
      } else {
        // Try posts table if not found in news
        const { data: postData } = await supabase
          .from('posts')
          .select('title')
          .eq('id', newsId)
          .single();

        if (postData) {
          updateNewsURL(newsId, postData.title);
        }
      }
    } catch (error) {
      console.error('Error fetching news title for URL:', error);
    }
  }, [updateNewsURL]);

  const handleBackToNews = useCallback(() => {
    setCurrentPage("news");
    updateNewsURL(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateNewsURL]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Loading state quando busca vaga via URL
  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin size-8 text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-zinc-500">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white dark">
      {/* Mobile Header - Hidden for now */}
      <div className="hidden lg:hidden sticky top-0 z-50 bg-[#09090b] border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 hover:bg-zinc-800 rounded-lg"
            aria-label="Toggle mobile sidebar"
            aria-expanded={showMobileSidebar}
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-xl hover:bg-zinc-800"
              aria-label="Filter by trending"
              aria-expanded={dropdownOpen}
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d={svgPaths.p18510a80} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d={svgPaths.p1fb7d080} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
              <span className="text-sm">Hot</span>
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.5 9.5L11.5 14.5L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-[72px] border-r border-zinc-800 shrink-0">
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Logo */}
            <div className="h-[68.88px] flex items-center justify-center relative">
              <img
                src="/zuno-mini.svg"
                alt="Zuno AI"
                className="w-8 h-8"
                width="32"
                height="32"
              />
            </div>

            {/* Nav Icons */}
            <div className="flex flex-col gap-[14px] items-center px-2">
              {/* Search - Hidden */}
              {/* <button className="size-14 flex items-center justify-center rounded-xl hover:bg-zinc-800" aria-label="Search">
                <svg className="size-6" fill="none" stroke="#CBD5E1" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={svgPaths.pa2c4300} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M20 20L16 16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button> */}

              {/* Home - Hidden in production */}
              {import.meta.env.DEV && (
                <button
                  onClick={handleBackToHome}
                  className={`size-14 flex items-center justify-center rounded-xl ${currentPage === "home" ? "bg-zinc-800" : "hover:bg-zinc-800"}`}
                  aria-label="Home"
                  aria-current={currentPage === "home" ? "page" : undefined}
                >
                  <svg className="size-6" fill="none" stroke={currentPage === "home" ? "white" : "#CBD5E1"} viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.842 8.29901L13.842 3.63201C12.759 2.78901 11.242 2.78901 10.158 3.63201L4.158 8.29901C3.427 8.86701 3 9.74101 3 10.667V18C3 19.657 4.343 21 6 21H18C19.657 21 21 19.657 21 18V10.667C21 9.74101 20.573 8.86701 19.842 8.29901Z" strokeWidth="2"/>
                  </svg>
                </button>
              )}

              {/* Jobs/Suit */}
              <button
                onClick={handleBackToJobs}
                className={`size-14 flex items-center justify-center rounded-xl ${currentPage === "jobs" || currentPage === "job-detail" || currentPage === "post-job" ? "bg-zinc-800" : "hover:bg-zinc-800"}`}
                aria-label="Jobs"
                aria-current={currentPage === "jobs" || currentPage === "job-detail" || currentPage === "post-job" ? "page" : undefined}
              >
                <svg className="size-6" fill="none" stroke={currentPage === "jobs" || currentPage === "job-detail" || currentPage === "post-job" ? "white" : "#CBD5E1"} viewBox="0 0 24 23" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0024 20.1288H6.99825C4.78819 20.1288 2.99658 18.4118 2.99658 16.2939V8.62401C2.99658 7.56502 3.89239 6.70654 4.99742 6.70654H19.0032C20.1083 6.70654 21.0041 7.56502 21.0041 8.62401V16.2939C21.0041 18.4118 19.2125 20.1288 17.0024 20.1288Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.99854 6.70651V4.78905C7.99854 3.73006 8.89434 2.87158 9.99937 2.87158H14.001C15.1061 2.87158 16.0019 3.73006 16.0019 4.78905V6.70651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.0007 11.9793H17.5021C19.4359 11.9793 21.0036 10.477 21.0036 8.62378M14.9995 11.9791L6.49755 11.9793C4.56375 11.9793 2.99609 10.477 2.99609 8.62378" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* News/Fire */}
              <button
                onClick={handleNewsClick}
                className={`size-14 flex items-center justify-center rounded-xl ${currentPage === "news" ? "bg-zinc-800" : "hover:bg-zinc-800"}`}
                aria-label="News"
                aria-current={currentPage === "news" ? "page" : undefined}
              >
                <svg className="size-7" fill="none" stroke={currentPage === "news" ? "white" : "#CBD5E1"} viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.19807 7.55982L9.68086 3.49658L13.4357 7.87725L15.8653 5.04268L17.802 7.30217C19.0465 8.75406 19.7305 10.6032 19.7305 12.5155V12.7731C19.7305 14.8234 18.9161 16.7897 17.4663 18.2394C16.0166 19.6892 14.0503 20.5037 12 20.5037C7.73059 20.5037 4.26953 17.0426 4.26953 12.7732C4.26953 10.8609 4.95359 9.01173 6.19807 7.55982Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Bottom Icon */}
            <div className="mt-auto mb-8 px-2">
              <button className="w-full h-12 flex items-center justify-center rounded-xl hover:bg-zinc-800">
                <svg className="size-6" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path d={svgPaths.p2667d080} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d={svgPaths.p3a387c80} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile - Hidden */}
        {false && showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <svg className="animate-spin size-8 text-zinc-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          }>
            {currentPage === "news-detail" ? (
              <NewsDetailPage newsId={selectedNewsId || 1} onBack={handleBackToNews} />
            ) : currentPage === "news" ? (
              <NewsPage onNewsClick={handleNewsDetailClick} />
            ) : currentPage === "post-job" ? (
              <PostJobPage onBack={handleBackToJobs} />
            ) : currentPage === "job-detail" ? (
              <JobDetailPage onBack={handleBackToJobs} onJobClick={handleJobClick} job={selectedJob} />
            ) : currentPage === "jobs" ? (
              <JobsPage
                onJobClick={handleJobClick}
                onPostJobClick={handlePostJobClick}
                onNewsClick={handleNewsClick}
              />
            ) : (
            <div className="py-4 md:py-5 lg:py-5">
          {/* Filters - Desktop */}
          <div className="hidden lg:flex items-center gap-3 mb-5 px-8">
            <div className="relative">
              <button className="flex items-center gap-3 px-4 py-2 border border-zinc-800 rounded-xl hover:bg-zinc-800">
                <div className="flex items-center gap-2">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                    <path d={svgPaths.p18510a80} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1fb7d080} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </svg>
                  <span className="text-sm">Hot</span>
                </div>
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6.5 9.5L11.5 14.5L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Left Navigation Button */}
            {showLeftArrow && (
              <button
                onClick={scrollLeftFilters}
                className="size-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 shrink-0"
                aria-label="Scroll filters left"
              >
                <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 19L8 12L15 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}

            {/* Filter Tags */}
            <div ref={scrollContainerRef} className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                      px-3 py-2 rounded-xl text-sm whitespace-nowrap border border-zinc-800 capitalize
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
                onClick={scrollRightFilters}
                className="size-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 shrink-0"
                aria-label="Scroll filters right"
              >
                <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5L16 12L9 19" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters - Mobile/Tablet */}
          <div className="lg:hidden mb-4">
            <div className="overflow-x-auto scrollbar-hide -mx-8 px-8">
              <div className="flex gap-2 pb-1">
                {FILTERS.slice(0, 12).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                      px-3 py-2 rounded-xl text-sm whitespace-nowrap border border-zinc-800 capitalize
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
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-8">
            {[...Array(6).keys()].map((i) => (
              <div key={i} className="group cursor-pointer" onClick={() => setShowProjectModal(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setShowProjectModal(true)}>
                <div className="relative mb-3 overflow-hidden rounded-xl aspect-[4/3]">
                  <img
                    src={imgFrame2}
                    alt="Tiimi - Employee List View in a SaaS HR Management System"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(0,0,0,0.05)]" />
                  
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 right-0 w-16 h-8 bg-gradient-to-r from-transparent to-[#09090b]" />
                </div>
                
                <div className="flex items-start gap-2.5">
                  {/* Author avatar */}
                  <div className="size-7 rounded-full bg-[#202023] flex items-center justify-center shrink-0">
                    <svg className="size-full" fill="none" viewBox="0 0 28 28">
                      <mask height="28" id={`mask-${i}`} maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="28" x="0" y="0">
                        <path d={svgPaths.p59bf7f0} fill="white" />
                      </mask>
                      <g mask={`url(#mask-${i})`}>
                        <path d="M28 0H0V28H28V0Z" fill="#202023" />
                      </g>
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-zinc-400 truncate">
                      Tiimi - Employee List View in a SaaS HR Management System
                    </h3>
                  </div>
                  
                  <span className="text-sm capitalize whitespace-nowrap">Fikri</span>
                </div>
              </div>
            ))}
          </div>
            </div>
          )}
        </Suspense>
        </main>

        {/* Right Sidebar - Hidden for now */}
        {false && currentPage === "home" && (
        <aside className="hidden lg:block w-[359px] border-l border-zinc-800 h-screen sticky top-0 overflow-y-auto">
          {/* Framer Ad */}
          <div className="p-8 border-b border-zinc-800">
            <div className="relative mb-6 overflow-hidden rounded-xl">
              <img 
                src={imgPictureWhereDesigningIsBuilding} 
                alt="Framer" 
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(255,255,255,0.03)] rounded-xl" />
            </div>
            
            <h3 className="mb-2">Onde Design é Construção</h3>

            <p className="text-sm text-zinc-500 mb-1">
              Saia do design para o site com Framer, o construtor web para designers
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Anúncio</span>
              <button className="p-2 hover:bg-zinc-800 rounded-lg">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M7 12V12.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M12 12V12.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M17 12V12.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="p-8 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3>Vagas recentes</h3>
              <button className="px-3 py-2 text-sm border border-zinc-800 rounded-lg hover:bg-zinc-800">
                Ver todas
              </button>
            </div>

            <div className="space-y-0">
              {JOBS.map((job, i) => {
                const colorMap: Record<string, string> = {
                  emerald: 'bg-emerald-500',
                  indigo: 'bg-indigo-500',
                  purple: 'bg-purple-500',
                  red: 'bg-red-500',
                };
                const bgColor = job.color ? colorMap[job.color] || 'bg-zinc-500' : 'bg-[#202023]';

                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-4 -mx-4 hover:bg-zinc-900 rounded-xl">
                    {job.initials ? (
                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
                        <span className="text-sm">{job.initials}</span>
                      </div>
                    ) : (
                      <div className="size-12 rounded-xl bg-[#202023] shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm mb-0.5 text-zinc-100 truncate">{job.title}</h4>
                      <p className="text-sm text-zinc-500 truncate">{job.company}</p>
                    </div>

                    <span className="text-xs text-zinc-600 whitespace-nowrap">{job.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="p-8">
            <h3 className="mb-6">Novos membros</h3>

            <div className="space-y-0">
              {USERS.map((user, i) => {
                const colorMap: Record<string, string> = {
                  emerald: 'bg-emerald-500',
                  indigo: 'bg-indigo-500',
                  purple: 'bg-purple-500',
                  red: 'bg-red-500',
                };
                const bgColor = colorMap[user.color] || 'bg-zinc-500';

                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-4 -mx-4 rounded-xl">
                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                      <span className="text-sm">{user.initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm mb-0.5 text-zinc-100 truncate">{user.name}</h4>
                      <p className="text-sm text-zinc-500 truncate">{user.username}</p>
                    </div>

                    <button className="px-4 py-2 bg-white text-slate-950 text-sm rounded-xl border border-slate-950 hover:bg-zinc-100 whitespace-nowrap">
                      Seguir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search Input at bottom */}
          <div className="p-8 border-t border-zinc-800">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 20 24">
                <path d={svgPaths.pf39700} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                <path d={svgPaths.p2514880} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              </svg>
              <input
                type="text"
                placeholder="Buscar no Layers..."
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-zinc-800 rounded-xl text-sm text-zinc-500 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                aria-label="Search"
              />
            </div>
          </div>
        </aside>
        )}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black"
            onClick={() => setShowProjectModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full h-full max-w-none bg-black overflow-hidden" style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 9, 11) 0%, rgb(9, 9, 11) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
            {/* Header */}
            <div className="bg-zinc-950 h-px max-w-full shrink-0 sticky top-0 w-full z-[2]">
              <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
            </div>

            {/* Main Content Container */}
            <div className="absolute bottom-[68px] content-stretch flex items-start left-0 overflow-clip right-0 top-[60px]">
              <div className="content-stretch flex h-full items-start justify-center relative shrink-0 w-full">
                <div className="basis-0 content-stretch flex grow h-full items-center justify-center min-h-px min-w-px relative shrink-0">
                  <div className="content-stretch flex flex-col h-[740px] items-start justify-center relative shrink-0 max-w-[986.66px] w-full px-4">
                    <div className="basis-0 content-stretch flex flex-col grow items-start max-h-[1200px] max-w-full min-h-px min-w-px relative shrink-0 w-full">
                      {/* Project Image */}
                      <div className="h-[517.98px] max-w-[986.66px] relative rounded-[12px] shrink-0 w-full">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
                          <img alt="" className="absolute left-0 max-w-none size-full top-0 object-cover" src={imgMetaJpg} />
                        </div>
                      </div>
                      {/* Overlay Shadow */}
                      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px]">
                        <div className="absolute inset-0 pointer-events-none shadow-[0px_0px_0px_1px_inset_rgba(255,255,255,0.03)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="absolute box-border content-stretch flex items-center justify-center left-0 p-[16px] right-0 top-[832px]">
              <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
                {/* Like Button */}
                <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px] hover:bg-[rgba(255,255,255,0.15)]">
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsModal.p227d200} stroke="white" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </button>

                {/* Comment Button */}
                <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px] hover:bg-[rgba(255,255,255,0.15)]">
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsModal.p11f30c00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M9 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M12 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      <path d="M15 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </button>

                {/* Share Button */}
                <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px] hover:bg-[rgba(255,255,255,0.15)]">
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsModal.p24cbefc0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </button>

                {/* Info Button */}
                <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px] hover:bg-[rgba(255,255,255,0.15)]">
                  <div className="relative shrink-0 size-[28px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                      <path d="M14 14V17.5M14 10.5V10.6167" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      <path d={svgPathsModal.p87df0c0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Top Header */}
            <div className="absolute box-border content-stretch flex items-center justify-between left-0 pl-[12px] pr-[12.01px] py-[12px] right-0 top-0">
              {/* Left Side - Close Button + Author */}
              <div className="basis-0 grow h-[36px] min-h-px min-w-px overflow-clip relative shrink-0">
                {/* Close Button */}
                <button 
                  onClick={() => setShowProjectModal(false)}
                  className="absolute bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center left-0 rounded-[12px] size-[36px] top-1/2 translate-y-[-50%] hover:bg-[rgba(255,255,255,0.15)]"
                >
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d="M17 7L7 17M7 7L17 17" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </button>

                {/* Author Avatar */}
                <div className="absolute content-stretch flex flex-col items-start justify-center left-[46px] size-[36px] top-1/2 translate-y-[-50%]">
                  <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
                      <g>
                        <mask height="36" id="mask0_modal" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="36" x="0" y="0">
                          <path d={svgPathsModal.pcc2ad00} fill="white" />
                        </mask>
                        <g mask="url(#mask0_modal)">
                          <path d="M36 0H0V36H36V0Z" fill="#202023" />
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Author Name */}
                <div className="absolute content-stretch flex items-start left-[92px] top-[calc(50%-0.75px)] translate-y-[-50%]">
                  <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
                    <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
                      <p className="leading-[22.5px] whitespace-pre">Dipa Inhouse</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center - Project Title */}
              <div className="basis-0 grow h-[22.5px] min-h-px min-w-px overflow-clip relative shrink-0">
                <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] left-[50%] not-italic text-[15px] text-center text-white top-[10.5px] translate-x-[-50%] translate-y-[-50%] max-w-[360px] w-full px-4">
                  <p className="leading-[22.5px] truncate">Gastroscan - AI-Based Food Recognition Branding</p>
                </div>
              </div>

              {/* Right Side - Menu */}
              <div className="basis-0 content-stretch flex grow items-start justify-end min-h-px min-w-px relative shrink-0">
                <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
                  <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px] hover:bg-[rgba(255,255,255,0.15)]">
                    <div className="relative shrink-0 size-[24px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                        <path d="M7 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M12 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M17 12V12.1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <SpeedInsights />
    </div>
  );
}
