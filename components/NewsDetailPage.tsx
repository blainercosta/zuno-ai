import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { supabase } from '@/lib/supabase';
import type { News } from '@/types/news';
import { shareOnTwitter, shareOnLinkedIn, copyToClipboard, generateSlug } from '@/utils/shareUtils';
import { useSimilarNews } from '@/hooks/useSimilarNews';
import NewsSEO from './NewsSEO';
import { NewsDetailSkeleton } from './Skeleton';
import StructuredContent from './StructuredContent';

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

// Configuração segura do DOMPurify
const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'img', 'blockquote', 'code', 'pre', 'br', 'span', 'div'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

interface NewsDetailPageProps {
  newsId: number | string;
  onBack: () => void;
}

// Componente ZunoChatBot focado em timing de posts
function ZunoChatBot({ newsTitle }: { newsTitle?: string; newsImage?: string }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Mostrar conteúdo após abrir
  useEffect(() => {
    if (!isOpen) {
      setShowContent(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowContent(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCTA = () => {
    navigate('/checkout');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Dialog */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 mb-2 animate-slideUp">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/zuno-ai.svg" alt="Zuno AI" className="h-5" />
                <span className="text-sm font-medium">Zuno AI</span>
              </div>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Initial message */}
              <div className="animate-fadeIn">
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed inline-block">
                  Você leu essa notícia aqui primeiro 👆
                </div>
              </div>

              {/* News preview + timing message */}
              {showContent && (
                <>
                  <div className="animate-fadeIn">
                    <div className="bg-zinc-800 rounded-xl p-3">
                      <p className="text-xs text-zinc-400 mb-1">Esta notícia:</p>
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {newsTitle || 'Notícia de IA'}
                      </p>
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed inline-block">
                      Quer receber as próximas <span className="text-emerald-400 font-medium">antes de todo mundo</span>?
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed inline-block">
                      Direto no seu WhatsApp. Poste na hora certa.
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="animate-fadeIn pt-2">
                    <button
                      onClick={handleCTA}
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Quero receber primeiro
                    </button>
                    <p className="text-center text-xs text-zinc-500 mt-2">
                      Notícias de IA no WhatsApp
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button with typing indicator inside */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-transform duration-300 ${isOpen ? 'scale-90' : 'animate-float'}`}
        title="Zuno AI"
      >
        {/* Typing indicator bubble - appears before opening, moves with button */}
        {!isOpen && (
          <div className="absolute -top-6 -left-16 animate-pulse-bubble">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
              <div className="flex gap-1">
                <span className="size-2 bg-zinc-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                <span className="size-2 bg-zinc-400 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }} />
                <span className="size-2 bg-zinc-400 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <img src="/zuno-ai.svg" alt="Zuno AI" className="h-10" />
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        .animate-bounce-dot {
          animation: bounce-dot 1s ease-in-out infinite;
        }
        @keyframes pulse-bubble {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-bubble {
          animation: pulse-bubble 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}


export default function NewsDetailPage({ newsId, onBack }: NewsDetailPageProps) {
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Hook para buscar notícias relacionadas via embeddings
  const { similarNews, isLoading: isLoadingSimilar } = useSimilarNews(news, 4);

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/noticias-ia/${news ? generateSlug(news.title, news.id) : newsId}`
    : '';

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);

      const isUUID = typeof newsId === 'string' && newsId.includes('-');

      if (isUUID) {
        // UUID means it's from news table (status can be 'published' or null)
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .eq('id', newsId)
          .or('status.eq.published,status.is.null')
          .single();

        if (newsData) {
          // Map news table fields to match News type
          setNews({
            ...newsData,
            image_url: newsData.cover_image || newsData.image_url,
            excerpt: newsData.subtitle || newsData.excerpt,
            read_time: newsData.read_time || '5 min'
          });
        } else if (newsError) {
          console.error('Error fetching news detail:', newsError);
        }
      } else {
        // Integer ID means it's from posts table
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', newsId)
          .eq('status', 'published')
          .single();

        if (postData) {
          setNews(postData);
        } else if (postError) {
          console.error('Error fetching post detail:', postError);
        }
      }

      setIsLoading(false);
    };

    fetchNewsDetail();
  }, [newsId]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(currentUrl);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (news) {
      shareOnTwitter(news.title, currentUrl);
    }
  };

  const handleShareLinkedIn = () => {
    shareOnLinkedIn(currentUrl);
  };

  // Check if content is structured JSON or HTML
  const isStructuredContent = useMemo(() => {
    if (!news?.content) return false;
    // Already an array (parsed by Supabase JSONB column)
    if (Array.isArray(news.content)) return true;
    // Try to parse as JSON string
    if (typeof news.content === 'string') {
      try {
        const parsed = JSON.parse(news.content);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    }
    return false;
  }, [news?.content]);

  if (isLoading) {
    return <NewsDetailSkeleton />;
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
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
    <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* SEO Meta Tags */}
      {news && <NewsSEO news={news} url={currentUrl} />}

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
      <div className="max-w-[720px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Image */}
        {news.image_url && (
          <div className="w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -mx-4 md:-mx-8 mb-8 aspect-[16/9] bg-zinc-900 overflow-hidden rounded-xl">
            <img
              src={news.image_url}
              alt={news.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1.5 text-xs rounded-full bg-zinc-800 text-zinc-300 font-medium">
            {news.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[28px] md:text-[40px] leading-[1.15] mb-6 font-semibold">
          {news.title}
        </h1>

        {/* Excerpt */}
        {news.excerpt && (
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-zinc-400 mb-8">
            {news.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 text-xs md:text-sm text-zinc-500 mb-8 md:mb-12 pb-6 md:pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <img src="/zuno-avatar.svg" alt="Zuno AI" className="size-6 rounded-md" />
              <span>{news.author}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {formatPublishedDate(news.published_at)}
              {' · '}
              {news.read_time} min de leitura
            </span>
            {isNewArticle(news.published_at) && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                Novo
              </span>
            )}
          </div>
        </div>

        {/* Article Content */}
        {news.content && (
          <article className="prose prose-invert prose-zinc max-w-none">
            {isStructuredContent ? (
              <StructuredContent content={news.content} />
            ) : typeof news.content === 'string' ? (
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content, sanitizeConfig) }}
              />
            ) : null}
          </article>
        )}

        {/* Share / Actions */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-zinc-400">Compartilhar:</span>

              {/* X (Twitter) */}
              <button
                onClick={handleShareTwitter}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Compartilhar no X"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="text-zinc-400 hover:text-[#0A66C2] transition-colors"
                title="Compartilhar no LinkedIn"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm"
                title="Copiar link"
              >
                {copySuccess ? (
                  <>
                    <svg className="size-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copiar link</span>
                  </>
                )}
              </button>
            </div>

            {/* URL Display */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <code className="text-xs text-zinc-400 break-all">{currentUrl}</code>
            </div>
          </div>
        </div>

        {/* Related News Section */}
        {(similarNews.length > 0 || isLoadingSimilar) && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-xl font-semibold mb-6">Notícias Relacionadas</h2>

            {isLoadingSimilar ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl p-4 animate-pulse">
                    <div className="aspect-[16/9] bg-zinc-800 rounded-lg mb-3" />
                    <div className="h-4 bg-zinc-800 rounded w-1/4 mb-2" />
                    <div className="h-5 bg-zinc-800 rounded w-full mb-1" />
                    <div className="h-5 bg-zinc-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarNews.map((item) => (
                  <a
                    key={item.id}
                    href={`/noticias-ia/${item.slug || generateSlug(item.title, item.id)}`}
                    className="group bg-zinc-900 hover:bg-zinc-800/70 rounded-xl overflow-hidden transition-colors"
                  >
                    {item.image_url && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2">
                        {new Date(item.published_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Zuno AI Chat Bot */}
      <ZunoChatBot newsTitle={news.title} newsImage={news.image_url} />

      <style>{`
        /* Fix mobile text overflow */
        .article-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
        }

        .article-content h2 {
          font-size: 26px;
          font-weight: 600;
          margin-top: 48px;
          margin-bottom: 20px;
          color: white;
          line-height: 1.3;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .article-content h3 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 36px;
          margin-bottom: 16px;
          color: white;
          line-height: 1.3;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .article-content p {
          font-size: 17px;
          line-height: 1.8;
          margin-bottom: 24px;
          color: #a1a1aa;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .article-content p:first-of-type {
          font-size: 17px;
          color: #a1a1aa;
        }

        .article-content ul,
        .article-content ol {
          margin-bottom: 24px;
          padding-left: 24px;
          color: #a1a1aa;
        }

        .article-content li {
          font-size: 17px;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .article-content a {
          color: #7dd3fc;
          text-decoration: underline;
          text-decoration-color: rgba(125, 211, 252, 0.3);
          transition: text-decoration-color 0.2s;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-all;
        }

        .article-content a:hover {
          text-decoration-color: rgba(125, 211, 252, 0.8);
        }

        .article-content blockquote {
          border-left: 3px solid #3f3f46;
          padding-left: 20px;
          margin: 32px 0;
          font-style: italic;
          color: #d4d4d8;
        }

        .article-content img {
          width: 100%;
          border-radius: 12px;
          margin: 32px 0;
        }

        .article-content code {
          background: #27272a;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 15px;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .article-content pre {
          background: #18181b;
          border: 1px solid #27272a;
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 32px 0;
          max-width: 100%;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .article-content pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
