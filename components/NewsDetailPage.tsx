interface NewsDetailPageProps {
  newsId: number;
  onBack: () => void;
}

// Mock data - same as NewsPage
const NEWS_DATA = [
  {
    id: 1,
    title: "Como a IA está transformando o mercado de trabalho brasileiro",
    excerpt: "Entenda como a inteligência artificial está criando novas oportunidades e mudando a forma como trabalhamos.",
    author: "João Silva",
    date: "há 2 dias",
    readTime: "5 min",
    category: "IA",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+1",
    content: `
      <p>A inteligência artificial está revolucionando o mercado de trabalho brasileiro de formas que nunca imaginamos. Desde a automação de tarefas repetitivas até a criação de novas profissões, a IA está transformando completamente a forma como trabalhamos.</p>

      <h2>Novas Oportunidades</h2>
      <p>Com a ascensão da IA, novas oportunidades estão surgindo em áreas como engenharia de machine learning, ciência de dados, e desenvolvimento de sistemas inteligentes. Empresas brasileiras estão cada vez mais buscando profissionais qualificados nessas áreas.</p>

      <h2>Desafios e Adaptação</h2>
      <p>Apesar das oportunidades, também enfrentamos desafios. Profissionais precisam se adaptar rapidamente, aprendendo novas habilidades e se mantendo atualizados com as últimas tecnologias. A educação continuada nunca foi tão importante.</p>

      <h2>O Futuro do Trabalho</h2>
      <p>Especialistas preveem que a IA não substituirá completamente os trabalhadores, mas sim mudará a natureza do trabalho. Tarefas criativas, estratégicas e que requerem empatia continuarão sendo domínio humano, enquanto tarefas repetitivas serão cada vez mais automatizadas.</p>
    `
  },
  {
    id: 2,
    title: "Startups brasileiras que estão revolucionando o mercado de IA",
    excerpt: "Conheça as principais empresas nacionais que estão inovando com inteligência artificial.",
    author: "Maria Santos",
    date: "há 3 dias",
    readTime: "8 min",
    category: "Startups",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+2",
    content: `
      <p>O Brasil está emergindo como um hub importante para startups de IA na América Latina. Diversas empresas brasileiras estão desenvolvendo soluções inovadoras que competem globalmente.</p>

      <h2>Principais Players</h2>
      <p>Entre as startups mais promissoras, destacam-se empresas focadas em processamento de linguagem natural, visão computacional e automação de processos. Essas empresas estão atraindo investimentos significativos de fundos nacionais e internacionais.</p>

      <h2>Impacto no Mercado</h2>
      <p>Essas startups não apenas estão criando produtos inovadores, mas também gerando empregos qualificados e contribuindo para o ecossistema de tecnologia brasileiro. Muitas estão focadas em resolver problemas específicos do mercado brasileiro.</p>
    `
  },
  {
    id: 3,
    title: "O futuro do trabalho remoto em tecnologia",
    excerpt: "Como as empresas de tech estão se adaptando ao novo modelo de trabalho distribuído.",
    author: "Pedro Costa",
    date: "há 5 dias",
    readTime: "6 min",
    category: "Tecnologia",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+3",
    content: `
      <p>O trabalho remoto veio para ficar. Empresas de tecnologia em todo o mundo, incluindo o Brasil, estão adotando modelos híbridos e totalmente remotos de trabalho.</p>

      <h2>Benefícios e Desafios</h2>
      <p>Enquanto o trabalho remoto oferece flexibilidade e acesso a talentos globais, também apresenta desafios em termos de colaboração, cultura empresarial e produtividade. Empresas estão experimentando diferentes modelos para encontrar o equilíbrio ideal.</p>

      <h2>Ferramentas e Tecnologia</h2>
      <p>O sucesso do trabalho remoto depende fortemente de ferramentas de colaboração, comunicação e gestão de projetos. Empresas estão investindo em tecnologias que facilitam a colaboração assíncrona e mantêm equipes conectadas.</p>
    `
  },
  {
    id: 4,
    title: "Habilidades mais procuradas em IA para 2024",
    excerpt: "Descubra quais competências técnicas as empresas estão buscando em profissionais de IA.",
    author: "Ana Oliveira",
    date: "há 1 semana",
    readTime: "7 min",
    category: "IA",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+1",
    content: `
      <p>O mercado de IA está em constante evolução, e as habilidades demandadas também mudam rapidamente. Em 2024, algumas competências se destacam como essenciais para profissionais da área.</p>

      <h2>Habilidades Técnicas</h2>
      <p>Python continua sendo a linguagem mais importante, junto com frameworks como TensorFlow e PyTorch. Conhecimento em cloud computing (AWS, GCP, Azure) também é fundamental.</p>

      <h2>Habilidades Complementares</h2>
      <p>Além das habilidades técnicas, soft skills como comunicação, trabalho em equipe e pensamento crítico são cada vez mais valorizadas. A capacidade de explicar conceitos técnicos para não-técnicos é especialmente importante.</p>
    `
  },
  {
    id: 5,
    title: "Como preparar seu portfólio para vagas em tech",
    excerpt: "Dicas práticas para destacar seu trabalho e impressionar recrutadores.",
    author: "Carlos Mendes",
    date: "há 1 semana",
    readTime: "4 min",
    category: "Design",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+2",
    content: `
      <p>Um portfólio bem elaborado pode ser o diferencial para conseguir a vaga dos seus sonhos em tecnologia. Aqui estão algumas dicas práticas para criar um portfólio que impressiona.</p>

      <h2>Mostre o Processo</h2>
      <p>Não mostre apenas o resultado final. Recrutadores querem ver seu processo de pensamento, decisões de design e como você resolve problemas.</p>

      <h2>Qualidade > Quantidade</h2>
      <p>É melhor ter poucos projetos bem documentados do que muitos projetos superficiais. Escolha seus melhores trabalhos e conte a história por trás de cada um.</p>
    `
  },
  {
    id: 6,
    title: "Tendências em desenvolvimento de produtos com IA",
    excerpt: "As principais inovações que estão moldando o futuro do product design.",
    author: "Juliana Lima",
    date: "há 2 semanas",
    readTime: "9 min",
    category: "Produto",
    image: "https://placehold.co/800x600/1a1a1a/808080?text=News+3",
    content: `
      <p>O desenvolvimento de produtos está sendo transformado pela inteligência artificial. Desde prototipagem até testes de usuário, a IA está sendo integrada em todas as fases do processo de design.</p>

      <h2>Personalização em Escala</h2>
      <p>IA permite personalização em massa, adaptando experiências de produto para cada usuário individual. Isso está mudando fundamentalmente como pensamos sobre design de produto.</p>

      <h2>Automação de Tarefas</h2>
      <p>Ferramentas de IA estão automatizando tarefas repetitivas no processo de design, permitindo que designers se concentrem em aspectos mais criativos e estratégicos do trabalho.</p>
    `
  }
];

export default function NewsDetailPage({ newsId, onBack }: NewsDetailPageProps) {
  const news = NEWS_DATA.find(n => n.id === newsId);

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Notícia não encontrada</p>
          <button
            onClick={onBack}
            className="text-white hover:text-zinc-300"
          >
            ← Voltar para notícias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center w-full">
          {/* Back Button Container */}
          <div className="flex-[0_0_auto] min-w-0">
            <div className="p-3">
              <button
                onClick={onBack}
                className="bg-zinc-900 size-9 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24">
                  <path d="M14 7L9 12L14 17" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title Container - Centered */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="p-3">
              <h2 className="text-base">News</h2>
            </div>
          </div>

          {/* Spacer to balance layout */}
          <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-8 py-12">
        {/* Featured Image */}
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img
            src={news.image}
            alt={news.title}
            className="w-full aspect-[16/9] object-cover"
          />
        </div>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300">
            {news.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[32px] sm:text-[40px] leading-[1.2] mb-4">
          {news.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-8">
          <span>{news.author}</span>
          <span>•</span>
          <span>{news.date}</span>
          <span>•</span>
          <span>{news.readTime} de leitura</span>
        </div>

        {/* Article Content */}
        <article className="prose prose-invert prose-zinc max-w-none">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </article>

        {/* Share / Actions */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">Compartilhar:</span>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .article-content h2 {
          font-size: 24px;
          font-weight: 500;
          margin-top: 32px;
          margin-bottom: 16px;
          color: white;
        }

        .article-content p {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
          color: #a1a1aa;
        }

        .article-content p:first-of-type {
          font-size: 18px;
          color: #d4d4d8;
        }
      `}</style>
    </div>
  );
}
