import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import JobsPage from "./components/JobsPage";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/job";
import type { Professional } from "@/types/professional";
import { getIdFromSlug, generateProfessionalSlug } from "@/utils/shareUtils";
import { JobDetailSkeleton } from "./components/Skeleton";
import BetaAccessModal from "./components/BetaAccessModal";

// Lazy load componentes secundários para reduzir bundle inicial
const JobDetailPage = lazy(() => import("./components/JobDetailPage"));
const PostJobPage = lazy(() => import("./components/PostJobPage"));
const NewsPage = lazy(() => import("./components/NewsPage"));
const NewsDetailPage = lazy(() => import("./components/NewsDetailPage"));
const ProfessionalsPage = lazy(() => import("./components/ProfessionalsPage"));
const ProfessionalDetailPage = lazy(() => import("./components/ProfessionalDetailPage"));
const ProfileSettingsPage = lazy(() => import("./components/ProfileSettingsPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./components/CheckoutSuccessPage"));
const BetaTesterPage = lazy(() => import("./components/BetaTesterPage"));

// Loading Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin size-8 text-zinc-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-zinc-500">Carregando...</p>
      </div>
    </div>
  );
}

// Route Wrapper Components
function JobDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return <Navigate to="/jobs" replace />;
  }

  const jobId = slug.split('-').pop() || '';

  return (
    <JobDetailWrapper
      jobId={jobId}
      onBack={() => navigate('/jobs')}
      onJobClick={(job: Job) => navigate(`/job/${job.job_id}`)}
    />
  );
}

function JobDetailWrapper({ jobId, onBack, onJobClick }: { jobId: string; onBack: () => void; onJobClick: (job: Job) => void }) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('vagas_ia')
          .select('*')
          .eq('job_id', jobId)
          .single();

        if (error) throw error;
        if (data) {
          setJob(data as Job);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Erro ao buscar vaga:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (isLoading) return <JobDetailSkeleton />;
  if (!job) return <Navigate to="/jobs" replace />;

  return <JobDetailPage job={job} onBack={onBack} onJobClick={onJobClick} />;
}

function NewsDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return <Navigate to="/noticias-ia" replace />;
  }

  const newsId = getIdFromSlug(slug);

  if (!newsId) {
    return <Navigate to="/noticias-ia" replace />;
  }

  return <NewsDetailPage newsId={newsId} onBack={() => navigate('/noticias-ia')} />;
}

// Legacy redirect for old /news/:slug URLs
function NewsLegacyRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/noticias-ia/${slug || ''}`} replace />;
}

function ProfessionalDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return <Navigate to="/professionals" replace />;
  }

  const professionalId = getIdFromSlug(slug);

  // Professionals only use integer IDs
  if (!professionalId || typeof professionalId === 'string') {
    return <Navigate to="/professionals" replace />;
  }

  return (
    <ProfessionalDetailWrapper
      professionalId={professionalId}
      onBack={() => navigate('/professionals')}
    />
  );
}

function ProfessionalDetailWrapper({ professionalId, onBack }: { professionalId: number; onBack: () => void }) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessional = async () => {
      setIsLoading(true);
      try {
        console.log('🔍 [DETAIL] Buscando profissional com ID:', professionalId);

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', professionalId)
          .single();

        if (error) throw error;
        if (data) {
          console.log('✅ [DETAIL] Profissional carregado:', {
            id: data.id,
            name: data.name,
            image_url: data.image_url,
            image_url_length: data.image_url?.length
          });
          setProfessional(data as Professional);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('❌ [DETAIL] Erro ao buscar profissional:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessional();
  }, [professionalId]);

  if (isLoading) return <LoadingSpinner />;
  if (!professional) return <Navigate to="/professionals" replace />;

  return <ProfessionalDetailPage professional={professional} onBack={onBack} />;
}

// Jobs Page Wrapper with navigation
function JobsPageWrapper() {
  const navigate = useNavigate();

  return (
    <JobsPage
      onJobClick={(job: Job) => navigate(`/job/${job.job_id}`)}
      onPostJobClick={() => navigate('/post-job')}
      onNewsClick={() => navigate('/news')}
    />
  );
}

// Post Job Page Wrapper
function PostJobPageWrapper() {
  const navigate = useNavigate();
  return <PostJobPage onBack={() => navigate('/jobs')} />;
}

// News Page Wrapper
function NewsPageWrapper() {
  const navigate = useNavigate();
  const { categoria } = useParams<{ categoria?: string }>();

  const handleNewsClick = async (newsId: number | string) => {
    const isUUID = typeof newsId === 'string' && newsId.includes('-');

    try {
      let title: string | undefined;

      if (isUUID) {
        // UUID means it's from news table
        const { data: newsData } = await supabase
          .from('news')
          .select('title')
          .eq('id', newsId)
          .single();
        title = newsData?.title;
      } else {
        // Integer ID means it's from posts table
        const { data: postData } = await supabase
          .from('posts')
          .select('title')
          .eq('id', newsId)
          .single();
        title = postData?.title;
      }

      if (title) {
        const slug = `${title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()}-${newsId}`;
        navigate(`/noticias-ia/${slug}`);
      } else {
        navigate(`/noticias-ia/${newsId}`);
      }
    } catch (error) {
      console.error('Error fetching news title:', error);
      navigate(`/noticias-ia/${newsId}`);
    }
  };

  return <NewsPage onNewsClick={handleNewsClick} onViewAllJobs={() => navigate('/jobs')} initialCategory={categoria} />;
}

// Professionals Page Wrapper
function ProfessionalsPageWrapper() {
  const navigate = useNavigate();

  const handleProfessionalClick = (professional: Professional) => {
    const slug = generateProfessionalSlug(professional.name, professional.id);
    navigate(`/professional/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <ProfessionalsPage onProfessionalClick={handleProfessionalClick} />;
}

// Profile Settings Page Wrapper
function ProfileSettingsPageWrapper() {
  const navigate = useNavigate();
  return <ProfileSettingsPage onBack={() => navigate(-1)} />;
}

// Main Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  // Check if current route is active
  const isActive = (path: string) => {
    if (path === '/jobs') {
      return location.pathname === '/jobs' || location.pathname.startsWith('/job/');
    }
    if (path === '/noticias-ia') {
      return location.pathname === '/noticias-ia' || location.pathname.startsWith('/noticias-ia/');
    }
    if (path === '/professionals') {
      return location.pathname === '/professionals' || location.pathname.startsWith('/professional/');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white dark">
      {/* Left Sidebar */}
      <aside className="hidden md:block w-[72px] border-r border-zinc-800 shrink-0 fixed left-0 top-0 h-screen z-40">
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Logo */}
          <div className="h-[68.88px] flex items-center justify-center relative">
            <img
              src="/zuno-ai.svg"
              alt="Zuno AI"
              className="w-8 h-8"
              width="32"
              height="32"
            />
          </div>

          {/* Nav Icons */}
          <div className="flex flex-col gap-[14px] items-center px-2">
            {/* Home - Hidden in production */}
            {import.meta.env.DEV && (
              <button
                onClick={() => navigate('/')}
                className={`size-14 flex items-center justify-center rounded-xl transition-colors ${
                  isActive('/') ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
                aria-label="Home"
              >
                <svg className="size-6" fill="none" stroke={isActive('/') ? 'white' : '#CBD5E1'} viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.842 8.29901L13.842 3.63201C12.759 2.78901 11.242 2.78901 10.158 3.63201L4.158 8.29901C3.427 8.86701 3 9.74101 3 10.667V18C3 19.657 4.343 21 6 21H18C19.657 21 21 19.657 21 18V10.667C21 9.74101 20.573 8.86701 19.842 8.29901Z" strokeWidth="2"/>
                </svg>
              </button>
            )}

            {/* News */}
            <button
              onClick={() => navigate('/noticias-ia')}
              className={`size-14 flex items-center justify-center rounded-xl transition-colors ${
                isActive('/noticias-ia') ? 'bg-zinc-800' : 'hover:bg-zinc-800'
              }`}
              aria-label="Notícias de IA"
            >
              <svg className="size-7" fill="none" stroke={isActive('/noticias-ia') ? 'white' : '#CBD5E1'} viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.19807 7.55982L9.68086 3.49658L13.4357 7.87725L15.8653 5.04268L17.802 7.30217C19.0465 8.75406 19.7305 10.6032 19.7305 12.5155V12.7731C19.7305 14.8234 18.9161 16.7897 17.4663 18.2394C16.0166 19.6892 14.0503 20.5037 12 20.5037C7.73059 20.5037 4.26953 17.0426 4.26953 12.7732C4.26953 10.8609 4.95359 9.01173 6.19807 7.55982Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Jobs */}
            <button
              onClick={() => navigate('/jobs')}
              className={`size-14 flex items-center justify-center rounded-xl transition-colors ${
                isActive('/jobs') ? 'bg-zinc-800' : 'hover:bg-zinc-800'
              }`}
              aria-label="Jobs"
            >
              <svg className="size-6" fill="none" stroke={isActive('/jobs') ? 'white' : '#CBD5E1'} viewBox="0 0 24 23">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.0024 20.1288H6.99825C4.78819 20.1288 2.99658 18.4118 2.99658 16.2939V8.62401C2.99658 7.56502 3.89239 6.70654 4.99742 6.70654H19.0032C20.1083 6.70654 21.0041 7.56502 21.0041 8.62401V16.2939C21.0041 18.4118 19.2125 20.1288 17.0024 20.1288Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.99854 6.70651V4.78905C7.99854 3.73006 8.89434 2.87158 9.99937 2.87158H14.001C15.1061 2.87158 16.0019 3.73006 16.0019 4.78905V6.70651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.0007 11.9793H17.5021C19.4359 11.9793 21.0036 10.477 21.0036 8.62378M14.9995 11.9791L6.49755 11.9793C4.56375 11.9793 2.99609 10.477 2.99609 8.62378" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Professionals - Hidden in production */}
            {import.meta.env.DEV && (
              <button
                onClick={() => navigate('/professionals')}
                className={`size-14 flex items-center justify-center rounded-xl transition-colors ${
                  isActive('/professionals') ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
                aria-label="Professionals"
              >
                <svg className="size-6" fill="none" stroke={isActive('/professionals') ? 'white' : '#CBD5E1'} viewBox="0 0 24 24">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Icon - User Profile (opens Beta Modal) */}
          <div className="mt-auto mb-8 px-2">
            <button
              onClick={() => setIsBetaModalOpen(true)}
              className="w-full h-12 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
              aria-label="Quero ser contratado"
            >
              <svg className="size-6" fill="none" stroke="white" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-[72px]">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          {/* News */}
          <button
            onClick={() => navigate('/noticias-ia')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isActive('/noticias-ia') ? 'text-white' : 'text-zinc-500'
            }`}
            aria-label="Notícias de IA"
          >
            <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.19807 7.55982L9.68086 3.49658L13.4357 7.87725L15.8653 5.04268L17.802 7.30217C19.0465 8.75406 19.7305 10.6032 19.7305 12.5155V12.7731C19.7305 14.8234 18.9161 16.7897 17.4663 18.2394C16.0166 19.6892 14.0503 20.5037 12 20.5037C7.73059 20.5037 4.26953 17.0426 4.26953 12.7732C4.26953 10.8609 4.95359 9.01173 6.19807 7.55982Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px]">News</span>
          </button>

          {/* Jobs */}
          <button
            onClick={() => navigate('/jobs')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              isActive('/jobs') ? 'text-white' : 'text-zinc-500'
            }`}
            aria-label="Jobs"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 23">
              <path fillRule="evenodd" clipRule="evenodd" d="M17.0024 20.1288H6.99825C4.78819 20.1288 2.99658 18.4118 2.99658 16.2939V8.62401C2.99658 7.56502 3.89239 6.70654 4.99742 6.70654H19.0032C20.1083 6.70654 21.0041 7.56502 21.0041 8.62401V16.2939C21.0041 18.4118 19.2125 20.1288 17.0024 20.1288Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.99854 6.70651V4.78905C7.99854 3.73006 8.89434 2.87158 9.99937 2.87158H14.001C15.1061 2.87158 16.0019 3.73006 16.0019 4.78905V6.70651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.0007 11.9793H17.5021C19.4359 11.9793 21.0036 10.477 21.0036 8.62378M14.9995 11.9791L6.49755 11.9793C4.56375 11.9793 2.99609 10.477 2.99609 8.62378" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px]">Vagas</span>
          </button>

          {/* User Profile - Opens Beta Modal */}
          <button
            onClick={() => setIsBetaModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors text-zinc-500"
            aria-label="Quero ser contratado"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px]">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Beta Access Modal */}
      <BetaAccessModal isOpen={isBetaModalOpen} onClose={() => setIsBetaModalOpen(false)} />

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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Settings route - Outside Layout (no sidebar) */}
          <Route path="/settings" element={<ProfileSettingsPageWrapper />} />

          {/* Checkout routes - Outside Layout (no sidebar) */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/sucesso" element={<CheckoutSuccessPage />} />

          {/* Beta Tester route - Outside Layout (no sidebar, no payment) */}
          <Route path="/beta" element={<BetaTesterPage />} />

          {/* All other routes - Inside Layout (with sidebar) */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Default route */}
                <Route path="/" element={<Navigate to="/noticias-ia" replace />} />

                {/* Jobs routes */}
                <Route path="/jobs" element={<JobsPageWrapper />} />
                <Route path="/job/:slug" element={<JobDetailRoute />} />
                {/* Post job route - hidden in production */}
                {import.meta.env.DEV && (
                  <Route path="/post-job" element={<PostJobPageWrapper />} />
                )}

                {/* Professionals routes - Hidden in production */}
                {import.meta.env.DEV && (
                  <>
                    <Route path="/professionals" element={<ProfessionalsPageWrapper />} />
                    <Route path="/professional/:slug" element={<ProfessionalDetailRoute />} />
                  </>
                )}

                {/* News routes - SEO optimized paths */}
                <Route path="/noticias-ia" element={<NewsPageWrapper />} />
                <Route path="/noticias-ia/:slug" element={<NewsDetailRoute />} />
                <Route path="/noticias-ia/categoria/:categoria" element={<NewsPageWrapper />} />

                {/* Legacy redirects for old /news URLs */}
                <Route path="/news" element={<Navigate to="/noticias-ia" replace />} />
                <Route path="/news/:slug" element={<NewsLegacyRedirect />} />

                {/* Catch all - redirect to news */}
                <Route path="*" element={<Navigate to="/noticias-ia" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
