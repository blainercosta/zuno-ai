import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Professional } from "@/types/professional";

const FILTERS = [
  "Tudo", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
  "Data Science", "MLOps", "Research", "Engineering", "Product"
];

// Mock data - usado apenas como fallback
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 1,
    name: "Blainer Costa",
    role: "AI Explorer",
    image_url: "https://avatar.vercel.sh/blainer",
    status: "online",
    badge: "Novo",
    rating: 4.9,
    location: "São Paulo, BR",
    skills: ["Machine Learning", "Deep Learning", "Python"]
  },
  {
    id: 2,
    name: "Ana Silva",
    role: "ML Engineer",
    image_url: "https://avatar.vercel.sh/ana",
    status: "online",
    badge: "Destaque",
    rating: 5.0,
    location: "Rio de Janeiro, BR",
    skills: ["NLP", "TensorFlow", "PyTorch"]
  },
  {
    id: 3,
    name: "Carlos Santos",
    role: "Data Scientist",
    image_url: "https://avatar.vercel.sh/carlos",
    status: "offline",
    badge: "Novo",
    rating: 4.8,
    location: "Belo Horizonte, BR",
    skills: ["Data Science", "Statistics", "R"]
  },
  {
    id: 4,
    name: "Marina Lima",
    role: "AI Researcher",
    image_url: "https://avatar.vercel.sh/marina",
    status: "online",
    badge: "Novo",
    rating: 5.0,
    location: "Brasília, BR",
    skills: ["Research", "Computer Vision", "Papers"]
  },
  {
    id: 5,
    name: "Pedro Oliveira",
    role: "MLOps Engineer",
    image_url: "https://avatar.vercel.sh/pedro",
    status: "online",
    badge: "Destaque",
    rating: 4.7,
    location: "Curitiba, BR",
    skills: ["MLOps", "Kubernetes", "CI/CD"]
  },
  {
    id: 6,
    name: "Julia Ferreira",
    role: "Computer Vision Engineer",
    image_url: "https://avatar.vercel.sh/julia",
    status: "offline",
    badge: "Novo",
    rating: 5.0,
    location: "Porto Alegre, BR",
    skills: ["Computer Vision", "OpenCV", "YOLO"]
  }
];

interface ProfessionalsPageProps {
  onProfessionalClick?: (professional: Professional) => void;
}

export default function ProfessionalsPage({ onProfessionalClick }: ProfessionalsPageProps) {
  const [activeFilter, setActiveFilter] = useState("Tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch professionals from Supabase
  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log('✅ Profissionais carregados do Supabase:', data.length);
          console.log('📸 Primeira imagem:', data[0]?.image_url);
          console.log('🔍 Todos os profissionais:', data.map(p => ({
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            image_url_type: typeof p.image_url,
            image_url_length: p.image_url?.length
          })));
          setProfessionals(data as Professional[]);
        } else {
          console.warn('⚠️ Nenhum dado no Supabase, usando mock data');
          setProfessionals(MOCK_PROFESSIONALS);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar profissionais:', error);
        console.warn('🔄 Usando mock data como fallback');
        setProfessionals(MOCK_PROFESSIONALS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionals();
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

  // Filter professionals based on search query
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;

    if (searchQuery) {
      filtered = filtered.filter((professional) => {
        const matchesSearch =
          professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          professional.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          professional.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      });
    }

    if (activeFilter !== "Tudo") {
      filtered = filtered.filter(professional =>
        professional.skills?.includes(activeFilter)
      );
    }

    return filtered;
  }, [searchQuery, activeFilter, professionals]);

  // Get top professionals for sidebar
  const topProfessionals = useMemo(() => professionals.slice(0, 4), [professionals]);

  // Loading state - DEVE VIR DEPOIS DE TODOS OS HOOKS
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin size-8 text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-zinc-500">Carregando profissionais...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex w-full pb-16 md:pb-0">
      <div className="flex-1 min-w-0">
        <div className="py-4 md:py-5 lg:py-5">
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
            <div className="flex gap-2 pb-1">
              {FILTERS.map((filter) => (
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

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8">
          {filteredProfessionals.map((professional) => (
            <article
              key={professional.id}
              onClick={() => onProfessionalClick?.(professional)}
              className="group cursor-pointer"
            >
              {/* Card with black background */}
              <div className="bg-black rounded-2xl p-4 md:p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
                {/* Image */}
                <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-zinc-900">
                  <img
                    src={professional.image_url}
                    alt={professional.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      console.log(`✅ Imagem carregada com sucesso:`, {
                        name: professional.name,
                        url: professional.image_url,
                        naturalWidth: e.currentTarget.naturalWidth,
                        naturalHeight: e.currentTarget.naturalHeight
                      });
                    }}
                    onError={(e) => {
                      console.warn(`⚠️ Erro ao carregar imagem:`, {
                        name: professional.name,
                        attempted_url: professional.image_url,
                        fallback_1: `https://avatar.vercel.sh/${professional.name.toLowerCase().replace(/\s+/g, '-')}`,
                        fallback_2: `https://avatar.vercel.sh/${professional.id}`
                      });
                      // Primeiro fallback: nome do profissional
                      const fallback1 = `https://avatar.vercel.sh/${professional.name.toLowerCase().replace(/\s+/g, '-')}`;
                      if (e.currentTarget.src !== fallback1) {
                        e.currentTarget.src = fallback1;
                      } else {
                        // Segundo fallback: ID
                        e.currentTarget.src = `https://avatar.vercel.sh/${professional.id}`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(0,0,0,0.05)]" />

                  {/* Neon light effect at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {/* Badge Only */}
                  <div className="flex items-center gap-2">
                    {professional.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30">
                        {professional.badge}
                      </span>
                    )}
                    {professional.status === 'online' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Disponível agora
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold text-white">
                    {professional.name}
                  </h3>

                  {/* Role */}
                  <p className="text-sm text-zinc-400">
                    {professional.role}
                  </p>

                  {/* Skills Preview */}
                  {professional.skills && professional.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {professional.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">Nenhum profissional encontrado</p>
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
              placeholder="Buscar profissionais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
              aria-label="Search professionals"
            />
          </div>
        </div>

        {/* Featured Professionals */}
        <div className="p-8 border-b border-zinc-800">
          <h3 className="text-lg font-semibold mb-6">Novos Destaques</h3>

          <div className="space-y-4">
            {topProfessionals.map((professional) => (
              <div
                key={professional.id}
                onClick={() => onProfessionalClick?.(professional)}
                className="cursor-pointer group"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors">
                  <div className="relative">
                    <img
                      src={professional.image_url}
                      alt={professional.name}
                      className="size-12 rounded-xl object-cover"
                      onError={(e) => {
                        console.warn(`⚠️ Erro na sidebar:`, { name: professional.name, url: professional.image_url });
                        const fallback1 = `https://avatar.vercel.sh/${professional.name.toLowerCase().replace(/\s+/g, '-')}`;
                        if (e.currentTarget.src !== fallback1) {
                          e.currentTarget.src = fallback1;
                        } else {
                          e.currentTarget.src = `https://avatar.vercel.sh/${professional.id}`;
                        }
                      }}
                    />
                    {professional.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                        {professional.name}
                      </h4>
                      {professional.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {professional.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{professional.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-2">Seja um Destaque</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Cadastre-se e mostre seu trabalho para milhares de empresas
            </p>
            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              Criar Perfil
            </button>
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
  );
}
