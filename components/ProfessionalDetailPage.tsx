import { useState } from 'react'

interface ProfessionalDetailPageProps {
  professional: {
    id: number
    name: string
    role: string
    image_url: string
    status: 'online' | 'offline'
    badge?: string
    rating: number
    location?: string
    skills?: string[]
  }
  onBack: () => void
}

interface GalleryItem {
  id: number
  type: 'image' | 'prompt'
  image_url: string
  title: string
  price?: number
  prompt?: string
  description?: string
  uses?: number
  upvotes?: number
  isPopular?: boolean
}

// Mock gallery data
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: 'prompt',
    image_url: 'https://images.unsplash.com/photo-1686904423955-b5b023a5d4c2?w=800',
    title: 'AI Art Prompt Pack',
    price: 29.90,
    prompt: 'A detailed cyberpunk cityscape at night, neon lights reflecting on wet streets...',
    description: 'Pack com 10 prompts para arte cyberpunk',
    uses: 532,
    upvotes: 28,
    isPopular: true
  },
  {
    id: 2,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    title: 'Cyberpunk Portrait',
    price: 49.90,
    description: 'Retrato estilo cyberpunk com iluminação neon',
    uses: 245,
    upvotes: 12
  },
  {
    id: 3,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1707327956851-30a531b70cda?w=800',
    title: 'Fantasy Landscape',
    price: 59.90,
    description: 'Paisagem fantástica com montanhas e céu místico',
    uses: 189,
    upvotes: 8
  },
  {
    id: 4,
    type: 'prompt',
    image_url: 'https://images.unsplash.com/photo-1710170842969-ccf9e41097e9?w=800',
    title: 'Character Design',
    price: 39.90,
    prompt: 'Full body character design, anime style, detailed clothing...',
    description: 'Pack com 15 prompts para design de personagens',
    uses: 421,
    upvotes: 19
  },
  {
    id: 5,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1706049379414-437ec3a54e93?w=800',
    title: 'Abstract AI Art',
    price: 44.90,
    description: 'Arte abstrata gerada por IA',
    uses: 298,
    upvotes: 15
  },
  {
    id: 6,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1706885093476-b1e54f26cec4?w=800',
    title: 'Futuristic Architecture',
    price: 54.90,
    description: 'Arquitetura futurista com formas orgânicas',
    uses: 367,
    upvotes: 22
  }
]

export default function ProfessionalDetailPage({ professional, onBack }: ProfessionalDetailPageProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [visibleItems, setVisibleItems] = useState(8) // Inicialmente mostra 8 itens

  const hasMoreItems = visibleItems < GALLERY_ITEMS.length

  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + 8, GALLERY_ITEMS.length))
  }

  return (
    <>
      <div className="w-full pb-16 md:pb-0">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[60px] md:h-[72px]">
            <button
              onClick={onBack}
              className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24">
                <path d="M15 19L8 12L15 5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            <h2 className="text-sm md:text-base absolute left-1/2 -translate-x-1/2 font-medium">@{professional.name.toLowerCase().replace(' ', '')}</h2>

            <button className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors">
              <svg className="size-6" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="1.5" fill="white"/>
                <circle cx="12" cy="12" r="1.5" fill="white"/>
                <circle cx="12" cy="18" r="1.5" fill="white"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Dribbble-Style Profile Section */}
          <div className="flex flex-col items-center text-center mb-12">
            {/* Avatar sem status */}
            <div className="relative mb-6">
              <div className="size-28 md:size-32 rounded-full overflow-hidden bg-zinc-900 border-4 border-zinc-800">
                <img
                  src={professional.image_url}
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Nome e tagline */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{professional.name}</h1>
            <p className="text-base md:text-lg text-zinc-400 mb-6 max-w-2xl">
              Criando prompts e arte de IA que transformam ideias em realidade visual
            </p>

            {/* Inline Stats - Dribbble Style */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
              <span className="text-zinc-400">3,9k seguidores</span>
              <span>•</span>
              <span className="text-zinc-400">147 seguindo</span>
              <span>•</span>
              <span className="text-zinc-400">{GALLERY_ITEMS.length} itens</span>
            </div>

            {/* Redes Sociais */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                aria-label="Twitter"
              >
                <svg className="size-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="size-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                aria-label="Instagram"
              >
                <svg className="size-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                aria-label="GitHub"
              >
                <svg className="size-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
                Seguir
              </button>
              {professional.status === 'online' && (
                <button className="px-6 py-2.5 border border-emerald-500 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/10 transition-colors flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Contato
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Tabs - Dribbble Style */}
          <div className="flex items-center justify-center gap-8 mb-10 border-b border-zinc-800">
            <button className="pb-4 px-2 text-sm font-medium text-white border-b-2 border-white -mb-[2px]">
              Trabalhos
            </button>
            <button className="pb-4 px-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Coleções
            </button>
            <button className="pb-4 px-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Curtidas
            </button>
            <button className="pb-4 px-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Sobre
            </button>
          </div>

          {/* Grid de Thumbnails - Dribbble Style */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {GALLERY_ITEMS.slice(0, visibleItems).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer"
              >
                <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-black/20">
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay com info ao hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                              </svg>
                              {item.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/>
                              </svg>
                              {item.uses}
                            </span>
                          </div>
                          {item.price && (
                            <span className="font-semibold">R$ {item.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge tipo */}
                    <div className="absolute top-2 right-2">
                      {item.type === 'prompt' ? (
                        <div className="size-7 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                          <svg className="size-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="size-7 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                          <svg className="size-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Popular badge */}
                    {item.isPopular && (
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md">
                          <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Título */}
                  <div className="p-3">
                    <h3 className="font-medium text-white text-sm truncate">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreItems && (
            <div className="flex items-center justify-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 border border-zinc-700 text-white rounded-xl text-sm font-medium hover:bg-zinc-900 transition-colors"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setSelectedItem(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <svg className="size-6" fill="none" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-6">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Descrição</h4>
                    <p className="text-zinc-300 mb-4">{selectedItem.description}</p>

                    {selectedItem.prompt && (
                      <>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Prompt Incluído</h4>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                          <code className="text-sm text-zinc-400">{selectedItem.prompt}</code>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Por {professional.name}
                    </div>
                  </div>

                  <div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
                      <div className="mb-6">
                        <div className="text-3xl font-semibold text-white mb-2">
                          R$ {selectedItem.price?.toFixed(2)}
                        </div>
                        <div className="text-sm text-zinc-500">Licença de uso comercial incluída</div>
                      </div>

                      <button className="w-full py-3 bg-white text-slate-950 rounded-xl font-medium hover:bg-zinc-100 transition-colors mb-3">
                        Comprar agora
                      </button>

                      <button className="w-full py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-colors">
                        Adicionar ao carrinho
                      </button>

                      <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="size-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-zinc-400">Download em alta resolução</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="size-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-zinc-400">Licença comercial vitalícia</span>
                        </div>
                        {selectedItem.type === 'prompt' && (
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="size-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-zinc-400">Prompts editáveis incluídos</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="size-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-zinc-400">Suporte do criador</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
