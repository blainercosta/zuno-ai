export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'callout' | 'divider' | 'tweet' | 'embed'
  text?: string
  level?: number
  url?: string
  caption?: string
  style?: string
  // Tweet/embed specific fields
  tweetId?: string
  tweetUrl?: string
  embedType?: 'twitter' | 'youtube' | 'instagram'
}

export interface News {
  id: number | string  // posts table uses integer, news table uses UUID
  title: string
  excerpt: string
  content?: string | ContentBlock[]  // Can be HTML string or structured JSON array
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
  view_count?: number
}
