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

  const totalRevenue = GALLERY_ITEMS.reduce((sum, item) => sum + ((item.price || 0) * (item.uses || 0)), 0)
  const popularItem = GALLERY_ITEMS.find(item => item.isPopular) || GALLERY_ITEMS[0]
  const otherItems = GALLERY_ITEMS.filter(item => !item.isPopular)

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Profile Section - Zona 1 */}
          <div className="flex flex-col md:flex-row items-start md:items-start gap-6 mb-8">
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <div className="relative">
                <div className="size-20 md:size-24 rounded-full overflow-hidden bg-zinc-900 shrink-0">
                  <img
                    src={professional.image_url}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute bottom-1 right-1 size-4 md:size-5 rounded-full border-2 border-zinc-950 ${
                    professional.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`} />
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-semibold text-white mb-1">{professional.name}</h1>
                <p className="text-sm text-zinc-400 mb-2">{professional.role}</p>
                {/* Proposta de valor */}
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Criando prompts e arte de IA que transformam ideias em realidade visual
                </p>
              </div>
            </div>

            {/* Ghost Follow Button */}
            <button className="px-5 py-2 border border-zinc-700 text-white rounded-xl text-sm font-medium hover:bg-zinc-900 transition-colors">
              Seguir
            </button>
          </div>

          {/* Prova Social - Zona 2 */}
          <div className="mb-8">
            {/* Métrica Dominante */}
            <div className="mb-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                R$ {(totalRevenue / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-zinc-500">em vendas totais</div>
            </div>

            {/* Métricas Inline */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <svg className="size-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-zinc-400">{professional.rating}/5</span>
              </div>
              <div className="text-zinc-400">
                1.2k seguidores
              </div>
              <div className="text-zinc-400">
                {GALLERY_ITEMS.length} itens
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-zinc-800">
            <button className="pb-3 px-1 text-sm font-medium text-white border-b-2 border-white">
              Portfólio
            </button>
            <button className="pb-3 px-1 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
              Sobre
            </button>
          </div>

          {/* Catálogo Hierarquizado - Zona 3 */}
          <div className="space-y-6">
            {/* Hero Card */}
            <div
              onClick={() => setSelectedItem(popularItem)}
              className="group cursor-pointer"
            >
              <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-black/30">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Image */}
                  <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <img
                      src={popularItem.image_url}
                      alt={popularItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge "Popular" */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                        <svg className="size-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-medium text-white">Popular</span>
                      </div>
                    </div>

                    {/* Type Icon */}
                    <div className="absolute top-3 right-3">
                      {popularItem.type === 'prompt' ? (
                        <div className="size-8 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                          <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="size-8 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                          <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-3">{popularItem.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4">{popularItem.description}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/>
                          </svg>
                          {popularItem.uses}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                          </svg>
                          {popularItem.upvotes}
                        </div>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div>
                      <div className="text-4xl font-bold text-white mb-4">
                        R$ {popularItem.price?.toFixed(2)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Add to cart logic
                        }}
                        className="w-full py-3 bg-white text-slate-950 rounded-xl font-medium hover:bg-zinc-100 transition-colors"
                      >
                        Comprar agora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Secundário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group cursor-pointer"
                >
                  <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all">
                    {/* Image */}
                    <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Type Icon Only */}
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
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-white text-sm mb-2 truncate">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-white">
                          R$ {item.price?.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/>
                            </svg>
                            {item.uses}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
