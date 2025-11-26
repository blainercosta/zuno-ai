export interface Professional {
  id: number
  name: string
  role: string
  image_url: string
  status: 'online' | 'offline'
  badge?: string | null
  rating: number
  location?: string | null
  skills?: string[] | null
  bio?: string | null
  portfolio_url?: string | null
  github_url?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  email?: string | null
  phone?: string | null
  hourly_rate?: number | null
  availability?: string | null
  years_experience?: number | null
  total_projects?: number
  total_reviews?: number
  slug?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProfessionalDisplay extends Professional {
  // Additional fields for display purposes
  formatted_rating?: string // "4.9 ★"
  formatted_hourly_rate?: string // "R$ 150/h"
}
