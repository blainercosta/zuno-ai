import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  console.warn('VITE_OPENAI_API_KEY não configurada. Vagas similares não estarão disponíveis.')
}

export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Necessário para usar no navegador
}) : null
