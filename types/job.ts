export interface Job {
  id: string // UUID
  job_url: string
  job_id: string
  job_title: string
  company_name: string
  company_url: string | null
  company_id: string | null
  logo_url: string | null
  location: string | null
  posted_at: string | null // TIMESTAMPTZ
  seniority_level: string | null
  employment_type: string | null
  workplace_type: string | null
  is_remote: boolean | null
  is_easy_apply: boolean | null
  description_full: string | null
  about_company: string | null
  responsibilities: string | null
  requirements: string | null
  differentials: string | null
  benefits: string | null
  salary: string | null
  process: string | null
  status: string
  created_at: string // TIMESTAMPTZ
  updated_at: string // TIMESTAMPTZ
}

export interface JobDisplay extends Job {
  // Additional fields for display purposes
  posted?: string // formatted date like "há 1 mês"
}
