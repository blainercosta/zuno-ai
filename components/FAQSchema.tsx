import { useEffect } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
}

/**
 * FAQ Schema (Rich Snippets)
 * Aparece como accordion nos resultados do Google
 * Aumenta CTR e autoridade
 */
export default function FAQSchema({ faqs }: FAQSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }

    let script = document.getElementById('faq-schema') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'faq-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.getElementById('faq-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [faqs])

  return null
}
