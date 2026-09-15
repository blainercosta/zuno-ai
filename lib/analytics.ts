/**
 * Product analytics (PostHog) wrapper.
 *
 * Everything here is a silent no-op when VITE_POSTHOG_KEY is not set (dev,
 * preview, and prod until the key is configured in Vercel) and when the
 * browser sends Do Not Track. Never import `posthog-js` directly elsewhere —
 * always go through initAnalytics/track/trackPageview/identifyEmail so the
 * no-op guarantee holds everywhere.
 *
 * posthog-js is loaded via dynamic import so it never enters the main bundle:
 * when there's no key (the common case today), the ~100KB gzip library is
 * never fetched at all.
 */
type PostHogClient = typeof import('posthog-js')['default']

let isInitialized = false
let isEnabled = false
let posthogClient: PostHogClient | null = null

function doNotTrackEnabled(): boolean {
  const dnt = navigator.doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack
  return dnt === '1' || dnt === 'yes'
}

/**
 * Initializes PostHog once. Safe to call multiple times (idempotent).
 * No-ops when VITE_POSTHOG_KEY is missing or the visitor opted into Do Not Track —
 * in that case posthog-js is never even downloaded.
 */
export async function initAnalytics(): Promise<void> {
  if (isInitialized) return
  isInitialized = true

  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  if (!apiKey || doNotTrackEnabled()) {
    isEnabled = false
    return
  }

  const { default: posthog } = await import('posthog-js')

  posthog.init(apiKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false, // SPA: pageviews are sent manually on route change
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false, // keep events intentional, no click-noise
    // Forms collect email/WhatsApp/Instagram: never record sessions, even if enabled server-side
    disable_session_recording: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    // Anonymous visitors get no persisted person profile (LGPD data minimisation)
    person_profiles: 'identified_only',
    // posthog attaches $current_url/$referrer to EVERY event: strip query strings so
    // ?ref=<code> or any accidental ?email= never leaves the browser
    sanitize_properties: (props) => {
      const out = { ...props } as Record<string, unknown>
      for (const key of ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer']) {
        if (typeof out[key] === 'string') out[key] = stripQuery(out[key] as string)
      }
      return out
    },
  })

  posthogClient = posthog
  isEnabled = true
}

/**
 * Tracks a pageview for the given path. Call on every SPA route change.
 */
const SAFE_QUERY_PARAMS = new Set(['perfil', 'niche', 'categoria'])

// Keep only allowlisted query params on any URL sent to analytics
export function stripQuery(url: string): string {
  try {
    const u = new URL(url, 'https://www.usezuno.app')
    const kept = new URLSearchParams()
    u.searchParams.forEach((v, k) => { if (SAFE_QUERY_PARAMS.has(k)) kept.set(k, v) })
    const qs = kept.toString()
    return `${u.origin}${u.pathname}${qs ? `?${qs}` : ''}`
  } catch {
    return url.split('?')[0]
  }
}

export function trackPageview(path: string): void {
  if (!isEnabled || !posthogClient) return
  posthogClient.capture('$pageview', { $current_url: path })
}

/**
 * Tracks a product event. Props must never contain PII (no names, emails, phones).
 */
export function track<E extends EventName>(event: E, props?: EventProps[E]): void {
  if (!isEnabled || !posthogClient) return
  posthogClient.capture(event, props as Record<string, unknown> | undefined)
}

/**
 * Identifies the current user by a SHA-256 hash of their email — never the raw
 * email — to keep identify calls LGPD-safe. Optionally sets non-PII person
 * properties (e.g. niche) alongside the identify call.
 */
export async function identifyEmail(email: string, personProps?: { niche?: string }): Promise<void> {
  if (!isEnabled || !posthogClient) return

  const normalizedEmail = email.trim().toLowerCase()
  const encoded = new TextEncoder().encode(normalizedEmail)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  const hashedEmail = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  posthogClient.identify(hashedEmail)

  if (personProps?.niche) {
    posthogClient.people.set({ niche: personProps.niche })
  }
}

export type ShareChannel = 'whatsapp' | 'twitter' | 'linkedin' | 'facebook' | 'copy'

/**
 * Typed event catalog. Keep props free of PII — no names, emails, or phones.
 */
export const EVENTS = {
  job_viewed: 'job_viewed',
  job_apply_clicked: 'job_apply_clicked',
  job_shared: 'job_shared',
  news_viewed: 'news_viewed',
  news_shared: 'news_shared',
  checkout_started: 'checkout_started',
  checkout_pix_opened: 'checkout_pix_opened',
  checkout_already_paid: 'checkout_already_paid',
  beta_step_completed: 'beta_step_completed',
  beta_signup_completed: 'beta_signup_completed',
  referral_link_copied: 'referral_link_copied',
  referral_shared: 'referral_shared',
  quiz_started: 'quiz_started',
  quiz_step_completed: 'quiz_step_completed',
  quiz_completed: 'quiz_completed',
  profession_viewed: 'profession_viewed',
  profession_shared: 'profession_shared',
  post_job_submitted: 'post_job_submitted',
  salarios_viewed: 'salarios_viewed',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

export interface EventProps {
  job_viewed: { job_id: string; company: string; is_remote: boolean; seniority: string | null }
  job_apply_clicked: { job_id: string; company: string; source_page: string }
  job_shared: { job_id: string; channel: ShareChannel }
  news_viewed: { news_id: string | number; category: string | null }
  news_shared: { news_id: string | number; channel: ShareChannel }
  checkout_started: Record<string, never>
  checkout_pix_opened: { billing_id: string }
  checkout_already_paid: Record<string, never>
  beta_step_completed: { step: number }
  beta_signup_completed: { niche: string; has_ref: boolean }
  referral_link_copied: Record<string, never>
  referral_shared: { channel: ShareChannel }
  quiz_started: Record<string, never>
  quiz_step_completed: { step: number }
  quiz_completed: { profession_slug: string; perfil: string }
  profession_viewed: { slug: string; band: string }
  profession_shared: { slug: string; channel: ShareChannel }
  post_job_submitted: Record<string, never>
  salarios_viewed: Record<string, never>
}
