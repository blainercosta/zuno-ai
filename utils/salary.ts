export interface ParsedSalary {
  min?: number
  max?: number
  value?: number
}

/**
 * Parses a free-text salary string into numeric bounds for structured data.
 * Supports formats like "R$ 5.000", "R$ 5.000 - R$ 8.000" and "5k-8k".
 * Returns null when no numeric value can be extracted.
 */
export function parseSalary(salary: string): ParsedSalary | null {
  if (!salary) return null

  const normalized = salary.toLowerCase().trim()

  const toNumber = (raw: string): number | null => {
    const hasK = /k$/.test(raw.trim())
    const digits = raw.replace(/[^\d.,]/g, '')
    if (!digits) return null

    // Brazilian format uses "." as thousand separator and "," as decimal separator
    const cleaned = digits.includes(',')
      ? digits.replace(/\./g, '').replace(',', '.')
      : digits.replace(/\.(?=\d{3}(\D|$))/g, '')

    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) return null

    return hasK ? parsed * 1000 : parsed
  }

  const parts = normalized.split(/-|–/).map(part => part.trim()).filter(Boolean)

  if (parts.length >= 2) {
    const min = toNumber(parts[0])
    const max = toNumber(parts[1])
    if (min !== null && max !== null) {
      return { min, max }
    }
  }

  const value = toNumber(normalized)
  if (value !== null) {
    return { value }
  }

  return null
}
