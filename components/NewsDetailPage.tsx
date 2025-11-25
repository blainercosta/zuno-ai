import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { News } from '@/types/news';
import { shareOnTwitter, shareOnLinkedIn, copyToClipboard, generateSlug } from '@/utils/shareUtils';
import NewsSEO from './NewsSEO';

interface NewsDetailPageProps {
  newsId: number;
  onBack: () => void;
}

export default function NewsDetailPage({ newsId, onBack }: NewsDetailPageProps) {
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${news ? generateSlug(news.title, news.id) : newsId}`
    : '';

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);

      // Try fetching from news table first
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .eq('status', 'published')
        .single();

      if (newsData) {
        setNews(newsData);
        setIsLoading(false);
        return;
      }

      // If not found in news, try posts table
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', newsId)
        .eq('status', 'published')
        .single();

      if (postData) {
        setNews(postData);
      }

      if (newsError && postError) {
        console.error('Error fetching news detail:', newsError, postError);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin size-8 text-zinc-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

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

      {/* Hero Image */}
      {news.image_url && (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-900 overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
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
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-zinc-500 mb-8 md:mb-12 pb-6 md:pb-8 border-b border-zinc-800">
          <span>{news.author}</span>
          <span className="hidden sm:inline">•</span>
          <span>{new Date(news.published_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="hidden sm:inline">•</span>
          <span>{news.read_time} de leitura</span>
        </div>

        {/* Article Content */}
        {news.content && (
          <article className="prose prose-invert prose-zinc max-w-none">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </article>
        )}

        {/* Share / Actions */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-zinc-400">Compartilhar:</span>

              {/* Twitter */}
              <button
                onClick={handleShareTwitter}
                className="text-zinc-400 hover:text-[#1DA1F2] transition-colors"
                title="Compartilhar no Twitter"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
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
      </div>

      <style>{`
        .article-content h2 {
          font-size: 26px;
          font-weight: 600;
          margin-top: 48px;
          margin-bottom: 20px;
          color: white;
          line-height: 1.3;
        }

        .article-content h3 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 36px;
          margin-bottom: 16px;
          color: white;
          line-height: 1.3;
        }

        .article-content p {
          font-size: 17px;
          line-height: 1.8;
          margin-bottom: 24px;
          color: #a1a1aa;
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
        }

        .article-content pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
