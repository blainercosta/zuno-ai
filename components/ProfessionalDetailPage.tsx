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
}

// Mock gallery data
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    title: 'Cyberpunk Portrait',
    price: 49.90,
    description: 'Retrato estilo cyberpunk com iluminação neon'
  },
  {
    id: 2,
    type: 'prompt',
    image_url: 'https://images.unsplash.com/photo-1686904423955-b5b023a5d4c2?w=800',
    title: 'AI Art Prompt Pack',
    price: 29.90,
    prompt: 'A detailed cyberpunk cityscape at night, neon lights reflecting on wet streets...',
    description: 'Pack com 10 prompts para arte cyberpunk'
  },
  {
    id: 3,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1707327956851-30a531b70cda?w=800',
    title: 'Fantasy Landscape',
    price: 59.90,
    description: 'Paisagem fantástica com montanhas e céu místico'
  },
  {
    id: 4,
    type: 'prompt',
    image_url: 'https://images.unsplash.com/photo-1710170842969-ccf9e41097e9?w=800',
    title: 'Character Design Prompts',
    price: 39.90,
    prompt: 'Full body character design, anime style, detailed clothing...',
    description: 'Pack com 15 prompts para design de personagens'
  },
  {
    id: 5,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1706049379414-437ec3a54e93?w=800',
    title: 'Abstract AI Art',
    price: 44.90,
    description: 'Arte abstrata gerada por IA com cores vibrantes'
  },
  {
    id: 6,
    type: 'image',
    image_url: 'https://images.unsplash.com/photo-1706885093476-b1e54f26cec4?w=800',
    title: 'Futuristic Architecture',
    price: 54.90,
    description: 'Arquitetura futurista com formas orgânicas'
  }
]

export default function ProfessionalDetailPage({ professional, onBack }: ProfessionalDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'gallery'>('about')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`size-4 ${star <= rating ? 'text-yellow-500' : 'text-zinc-700'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="w-full pb-16 md:pb-0">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[60px] md:h-[72px]">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24">
                <path d="M15 19L8 12L15 5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-sm md:text-base absolute left-1/2 -translate-x-1/2">Perfil</h2>

            {/* Contact Button */}
            <button className="px-4 py-2 bg-white text-slate-950 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors">
              Contatar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Profile Header */}
          <div className="bg-black rounded-2xl p-6 md:p-8 border border-zinc-800 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="size-32 md:size-40 rounded-2xl overflow-hidden bg-zinc-900 shrink-0">
                  <img
                    src={professional.image_url}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge - On top of image */}
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    professional.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
                  }`}>
                    {professional.status === 'online' ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-semibold text-white">{professional.name}</h1>
                      {professional.badge && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                          {professional.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-zinc-400 mb-3">{professional.role}</p>
                    {professional.location && (
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {professional.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(professional.rating)}
                  <span className="text-sm text-zinc-400">({professional.rating}.0)</span>
                </div>

                {/* Skills */}
                {professional.skills && professional.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {professional.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-800 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 px-1 border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sobre
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`pb-4 px-1 border-b-2 transition-colors ${
                  activeTab === 'gallery'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Galeria & Produtos
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'about' ? (
            <div className="space-y-6">
              {/* About Section */}
              <div className="bg-black rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Sobre mim</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  Sou um profissional apaixonado por Inteligência Artificial e suas aplicações criativas.
                  Com mais de 5 anos de experiência em Machine Learning e Deep Learning, especializo-me
                  em criar soluções inovadoras que combinam tecnologia e arte.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  Atualmente trabalho com modelos generativos, computer vision e NLP,
                  desenvolvendo projetos que vão desde aplicações comerciais até
                  experiências artísticas experimentais.
                </p>
              </div>

              {/* Experience Section */}
              <div className="bg-black rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Experiência</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">Senior ML Engineer</h4>
                        <p className="text-sm text-zinc-400">Tech Company Inc.</p>
                      </div>
                      <span className="text-sm text-zinc-500">2021 - Presente</span>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Desenvolvimento de modelos de ML para aplicações de computer vision e NLP.
                    </p>
                  </div>
                  <div className="border-t border-zinc-800 pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">ML Engineer</h4>
                        <p className="text-sm text-zinc-400">AI Startup</p>
                      </div>
                      <span className="text-sm text-zinc-500">2019 - 2021</span>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Implementação de pipelines de ML e deployment de modelos em produção.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black rounded-2xl p-6 border border-zinc-800 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">150+</div>
                  <div className="text-sm text-zinc-500">Projetos</div>
                </div>
                <div className="bg-black rounded-2xl p-6 border border-zinc-800 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">89</div>
                  <div className="text-sm text-zinc-500">Clientes</div>
                </div>
                <div className="bg-black rounded-2xl p-6 border border-zinc-800 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">5.0</div>
                  <div className="text-sm text-zinc-500">Avaliação</div>
                </div>
                <div className="bg-black rounded-2xl p-6 border border-zinc-800 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">5+</div>
                  <div className="text-sm text-zinc-500">Anos</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {GALLERY_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-black rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
                      {/* Image */}
                      <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Type Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            item.type === 'prompt'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {item.type === 'prompt' ? 'Prompt' : 'Imagem'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-1 truncate">{item.title}</h3>
                        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{item.description}</p>
                        {item.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-white">
                              R$ {item.price.toFixed(2)}
                            </span>
                            <button className="px-4 py-2 bg-white text-slate-950 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors">
                              Comprar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setSelectedItem(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
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
                {/* Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-6">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
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
                    {/* Price Card */}
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

                      {/* Features */}
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
