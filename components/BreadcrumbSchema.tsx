import { useEffect } from 'react'

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

/**
 * BreadcrumbList Schema
 * Melhora a aparência nos resultados de busca (Rich Snippets)
 */
export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }

    let script = document.getElementById('breadcrumb-schema') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'breadcrumb-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.getElementById('breadcrumb-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [items])

  return null
}
