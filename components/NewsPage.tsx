import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// Placeholder images
const imgNews1 = "https://placehold.co/800x600/1a1a1a/808080?text=News+1";
const imgNews2 = "https://placehold.co/800x600/1a1a1a/808080?text=News+2";
const imgNews3 = "https://placehold.co/800x600/1a1a1a/808080?text=News+3";

const FILTERS = [
  "Tudo", "IA", "Startups", "Tecnologia", "Design", "Produto",
  "Engenharia", "Dados", "Web3", "DevOps", "Mobile", "Backend"
];

const NEWS_DATA = [
  {
    id: 1,
    title: "Como a IA está transformando o mercado de trabalho brasileiro",
    excerpt: "Entenda como a inteligência artificial está criando novas oportunidades e mudando a forma como trabalhamos.",
    author: "João Silva",
    date: "há 2 dias",
    readTime: "5 min",
    category: "IA",
    image: imgNews1
  },
  {
    id: 2,
    title: "Startups brasileiras que estão revolucionando o mercado de IA",
    excerpt: "Conheça as principais empresas nacionais que estão inovando com inteligência artificial.",
    author: "Maria Santos",
    date: "há 3 dias",
    readTime: "8 min",
    category: "Startups",
    image: imgNews2
  },
  {
    id: 3,
    title: "O futuro do trabalho remoto em tecnologia",
    excerpt: "Como as empresas de tech estão se adaptando ao novo modelo de trabalho distribuído.",
    author: "Pedro Costa",
    date: "há 5 dias",
    readTime: "6 min",
    category: "Tecnologia",
    image: imgNews3
  },
  {
    id: 4,
    title: "Habilidades mais procuradas em IA para 2024",
    excerpt: "Descubra quais competências técnicas as empresas estão buscando em profissionais de IA.",
    author: "Ana Oliveira",
    date: "há 1 semana",
    readTime: "7 min",
    category: "IA",
    image: imgNews1
  },
  {
    id: 5,
    title: "Como preparar seu portfólio para vagas em tech",
    excerpt: "Dicas práticas para destacar seu trabalho e impressionar recrutadores.",
    author: "Carlos Mendes",
    date: "há 1 semana",
    readTime: "4 min",
    category: "Design",
    image: imgNews2
  },
  {
    id: 6,
    title: "Tendências em desenvolvimento de produtos com IA",
    excerpt: "As principais inovações que estão moldando o futuro do product design.",
    author: "Juliana Lima",
    date: "há 2 semanas",
    readTime: "9 min",
    category: "Produto",
    image: imgNews3
  }
];

interface NewsPageProps {
  onNewsClick: (id: number) => void;
}

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

const TOP_NEWS = [
  { id: 1, title: "Como a IA está transformando o mercado de trabalho brasileiro", readTime: "5 min" },
  { id: 2, title: "Startups brasileiras que estão revolucionando o mercado de IA", readTime: "8 min" },
  { id: 3, title: "O futuro do trabalho remoto em tecnologia", readTime: "6 min" },
  { id: 4, title: "Habilidades mais procuradas em IA para 2024", readTime: "7 min" },
];

export default function NewsPage({ onNewsClick }: NewsPageProps) {
  const [activeFilter, setActiveFilter] = useState("Tudo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Filter news based on active filter and search query - memoized for performance
  const filteredNews = useMemo(() => {
    return NEWS_DATA.filter((news) => {
      const matchesFilter = activeFilter === "Tudo" || news.category === activeFilter;
      const matchesSearch = searchQuery === "" ||
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="flex w-full">
      <div className="flex-1 min-w-0">
        <div className="py-4 md:py-5 lg:py-5">
        {/* Filters */}
        <div className="mb-5 px-8">
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

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-8">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              onClick={() => onNewsClick(news.id)}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="relative mb-3 overflow-hidden rounded-xl aspect-[4/3]">
                <img
                  src={news.image}
                  alt={news.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(0,0,0,0.05)]" />
              </div>

              {/* Content - vertical layout */}
              <div className="space-y-2">
                {/* Read time */}
                <p className="text-sm text-zinc-500">{news.readTime} de leitura</p>

                {/* Title */}
                <h3 className="text-sm text-white">
                  {news.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-zinc-400">
                  {news.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[359px] border-l border-zinc-800 h-screen sticky top-0 overflow-y-auto">
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
            {TOP_NEWS.map((news, i) => (
              <div
                key={news.id}
                onClick={() => onNewsClick(news.id)}
                className="cursor-pointer group"
              >
                <div className="flex gap-3">
                  <span className="text-2xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-zinc-100 group-hover:text-white transition-colors mb-1 line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-xs text-zinc-500">{news.readTime} de leitura</p>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Novos assinantes */}
        <div className="p-8">
          <h3 className="mb-6">Novos assinantes</h3>

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
                <div key={i} className="flex items-center gap-3 px-4 py-4 -mx-4 rounded-xl hover:bg-zinc-900 cursor-pointer">
                  <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                    <span className="text-sm">{user.initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-zinc-100 truncate">{user.name}</h4>
                  </div>
                </div>
              );
            })}
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
