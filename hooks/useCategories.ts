import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)

      // Fetch distinct categories from both tables
      const [newsResult, postsResult] = await Promise.all([
        supabase
          .from('news')
          .select('category')
          .or('status.eq.published,status.is.null'),
        supabase
          .from('posts')
          .select('category')
          .eq('status', 'published')
      ])

      // Combine and deduplicate categories
      const allCategories = new Set<string>()

      newsResult.data?.forEach(item => {
        if (item.category) allCategories.add(item.category)
      })

      postsResult.data?.forEach(item => {
        if (item.category) allCategories.add(item.category)
      })

      // Sort alphabetically and convert to array
      const sortedCategories = Array.from(allCategories).sort()

      setCategories(sortedCategories)
      setIsLoading(false)
    }

    fetchCategories()
  }, [])

  return { categories, isLoading }
}
