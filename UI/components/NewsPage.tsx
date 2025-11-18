import svgPaths from "../imports/svg-shvcwjgnc";

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

export default function NewsPage({ onNewsClick }: NewsPageProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-4 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-[640px]">
          <h1 className="text-[32px] sm:text-[48px] leading-[1.2] mb-4 sm:mb-6">
            Notícias e insights
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400">
            Fique por dentro das últimas tendências em IA, tecnologia e mercado de trabalho.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-zinc-800">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 pb-4">
              {FILTERS.map((filter, index) => (
                <button
                  key={filter}
                  className={`
                    px-4 py-2 rounded-xl text-sm whitespace-nowrap border border-zinc-800
                    ${index === 0
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
      </div>

      {/* News Grid */}
      <div className="max-w-[1200px] mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {NEWS_DATA.map((news) => (
            <article
              key={news.id}
              onClick={() => onNewsClick(news.id)}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="relative mb-4 overflow-hidden rounded-xl aspect-[4/3] bg-zinc-900">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 shadow-[0px_0px_0px_1px_inset_rgba(255,255,255,0.03)]" />

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs rounded-lg">
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-[18px] sm:text-[20px] leading-[1.3] text-white group-hover:text-zinc-300 transition-colors">
                  {news.title}
                </h3>

                <p className="text-sm text-zinc-400 leading-[1.6] line-clamp-2">
                  {news.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-zinc-800 flex items-center justify-center">
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <span>{news.author}</span>
                  </div>
                  <span>·</span>
                  <span>{news.date}</span>
                  <span>·</span>
                  <span>{news.readTime} de leitura</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 sm:mt-16 text-center">
          <button className="px-6 py-3 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
            Carregar mais notícias
          </button>
        </div>
      </div>

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
