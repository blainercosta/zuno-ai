/**
 * UTM Helper - Utility functions for generating URLs with UTM tracking parameters
 */

export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

/**
 * Builds a URL with UTM tracking parameters
 * @param baseUrl - The base URL to add UTM parameters to
 * @param params - The UTM parameters to add
 * @returns The URL with UTM parameters
 */
export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);

    if (params.content) {
      url.searchParams.set('utm_content', params.content);
    }

    if (params.term) {
      url.searchParams.set('utm_term', params.term);
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return with query string appended
    const separator = baseUrl.includes('?') ? '&' : '?';
    let utm = `utm_source=${encodeURIComponent(params.source)}&utm_medium=${encodeURIComponent(params.medium)}&utm_campaign=${encodeURIComponent(params.campaign)}`;

    if (params.content) {
      utm += `&utm_content=${encodeURIComponent(params.content)}`;
    }

    if (params.term) {
      utm += `&utm_term=${encodeURIComponent(params.term)}`;
    }

    return `${baseUrl}${separator}${utm}`;
  }
}

/**
 * Pre-defined UTM configurations for common sharing scenarios
 */
export const UTM_CONFIGS = {
  // Social media sharing
  twitter: (campaign: string, content?: string): UTMParams => ({
    source: 'twitter',
    medium: 'social',
    campaign,
    content,
  }),

  linkedin: (campaign: string, content?: string): UTMParams => ({
    source: 'linkedin',
    medium: 'social',
    campaign,
    content,
  }),

  facebook: (campaign: string, content?: string): UTMParams => ({
    source: 'facebook',
    medium: 'social',
    campaign,
    content,
  }),

  whatsapp: (campaign: string, content?: string): UTMParams => ({
    source: 'whatsapp',
    medium: 'social',
    campaign,
    content,
  }),

  // Direct/copy link sharing
  direct: (campaign: string, content?: string): UTMParams => ({
    source: 'direct',
    medium: 'share',
    campaign,
    content,
  }),

  // Email sharing
  email: (campaign: string, content?: string): UTMParams => ({
    source: 'email',
    medium: 'email',
    campaign,
    content,
  }),

  // Newsletter
  newsletter: (campaign: string, content?: string): UTMParams => ({
    source: 'newsletter',
    medium: 'email',
    campaign,
    content,
  }),

  // Internal navigation
  internal: (campaign: string, content?: string): UTMParams => ({
    source: 'internal',
    medium: 'referral',
    campaign,
    content,
  }),
};

/**
 * Generate a shareable URL for news articles with UTM parameters
 */
export function getNewsShareUrl(
  newsSlug: string,
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'direct' | 'email'
): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/noticias-ia/${newsSlug}`
    : `https://usezuno.app/noticias-ia/${newsSlug}`;

  const utmConfig = UTM_CONFIGS[platform]('zuno_news', newsSlug);
  return buildUTMUrl(baseUrl, utmConfig);
}

/**
 * Generate a shareable URL for job listings with UTM parameters
 */
export function getJobShareUrl(
  jobId: string,
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'direct' | 'email'
): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/job/${jobId}`
    : `https://usezuno.app/job/${jobId}`;

  const utmConfig = UTM_CONFIGS[platform]('zuno_jobs', jobId);
  return buildUTMUrl(baseUrl, utmConfig);
}
