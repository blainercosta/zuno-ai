export interface News {
  id: number
  title: string
  excerpt: string
  content?: string
  author: string
  author_avatar?: string
  published_at: string
  read_time: string
  category: string
  image_url?: string
  slug?: string
  status?: 'draft' | 'published' | 'archived'
  created_at?: string
  updated_at?: string
}
