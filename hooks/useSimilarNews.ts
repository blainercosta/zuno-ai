import { useState, useEffect } from 'react'
import { findSimilarNews, findSimilarNewsByCategory } from '@/services/similarNews'
import type { News } from '@/types/news'

export function useSimilarNews(currentNews: News | null, limit = 4) {
  const [similarNews, setSimilarNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentNews) {
      setSimilarNews([])
      return
    }

    const fetchSimilarNews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Tenta usar embeddings da OpenAI primeiro
        let news = await findSimilarNews(currentNews, limit)

        // Se falhar ou não retornar resultados, usa busca por categoria
        if (news.length === 0) {
          news = await findSimilarNewsByCategory(currentNews, limit)
        }

        setSimilarNews(news)
      } catch (err) {
        console.error('Erro ao buscar notícias similares:', err)
        setError('Erro ao carregar notícias similares')
        setSimilarNews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarNews()
  }, [currentNews?.id, limit])

  return {
    similarNews,
    isLoading,
    error
  }
}
