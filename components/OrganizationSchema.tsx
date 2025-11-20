import { useEffect } from 'react'

/**
 * Organization Schema (E-E-A-T)
 * Define a organização para o Google entender autoridade e confiança
 */
export default function OrganizationSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Zuno AI',
      url: 'https://zuno.ai',
      logo: 'https://zuno.ai/zuno-ai.svg',
      description: 'Plataforma de vagas de Inteligência Artificial no Brasil. Conectamos profissionais de IA com empresas inovadoras.',
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BR'
      },
      sameAs: [
        'https://twitter.com/ZunoAI',
        'https://linkedin.com/company/zuno-ai'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['Portuguese']
      }
    }

    let script = document.getElementById('organization-schema') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'organization-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.getElementById('organization-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}
