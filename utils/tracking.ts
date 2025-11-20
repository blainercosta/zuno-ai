/**
 * Utilitários para tracking e analytics
 * Adiciona parâmetros UTM para rastrear origem do tráfego
 */

export interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign?: string
  utm_content?: string
}

/**
 * Adiciona parâmetros UTM a uma URL
 */
export function addUTMParams(url: string, params: UTMParams): string {
  try {
    const urlObj = new URL(url)

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value)
      }
    })

    return urlObj.toString()
  } catch (error) {
    // Se a URL for inválida, retorna a original
    return url
  }
}

/**
 * Cria URL de compartilhamento do LinkedIn com tracking
 */
export function getLinkedInShareUrl(jobUrl: string, jobTitle: string): string {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`

  return addUTMParams(shareUrl, {
    utm_source: 'zuno',
    utm_medium: 'share',
    utm_campaign: 'job_share',
    utm_content: jobTitle.toLowerCase().replace(/\s+/g, '_')
  })
}

/**
 * Cria URL de compartilhamento do WhatsApp com mensagem personalizada
 */
export function getWhatsAppShareUrl(jobTitle: string, companyName: string, jobUrl: string): string {
  const message = `🤖 Vaga de IA: ${jobTitle} na ${companyName}\n\nEncontrei essa vaga no Zuno AI - a plataforma de vagas de Inteligência Artificial no Brasil\n\n${jobUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=zuno`

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/**
 * Cria URL de compartilhamento do Twitter/X
 */
export function getTwitterShareUrl(jobTitle: string, companyName: string, jobUrl: string): string {
  const text = `🤖 Vaga de IA: ${jobTitle} na ${companyName}\n\nVia @ZunoAI`
  const url = addUTMParams(jobUrl, {
    utm_source: 'twitter',
    utm_medium: 'share',
    utm_campaign: 'job_share'
  })

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}

/**
 * Cria URL de compartilhamento do Facebook
 */
export function getFacebookShareUrl(jobUrl: string): string {
  const url = addUTMParams(jobUrl, {
    utm_source: 'facebook',
    utm_medium: 'share',
    utm_campaign: 'job_share'
  })

  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/**
 * Adiciona tracking ao clicar em candidatar-se
 */
export function getJobApplicationUrl(jobUrl: string, jobId: string): string {
  return addUTMParams(jobUrl, {
    utm_source: 'zuno',
    utm_medium: 'job_board',
    utm_campaign: 'apply',
    utm_content: jobId
  })
}
