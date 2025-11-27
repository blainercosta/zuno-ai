// Cores da logo do Zuno AI para indicar frescor da vaga
export type DateColor = 'pink' | 'purple' | 'blue' | 'default'

export function getDateColor(dateString: string | null): DateColor {
  if (!dateString) return 'default'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'default'

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)

  if (diffInHours < 6) return 'pink'      // < 6 horas
  if (diffInHours < 12) return 'purple'   // < 12 horas
  if (diffInHours < 24) return 'blue'     // < 24 horas
  return 'default'
}

export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) {
    return 'Data não disponível'
  }

  const date = new Date(dateString)

  // Verifica se a data é válida
  if (isNaN(date.getTime())) {
    return 'Data inválida'
  }

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  // Menos de 1 hora - mostrar minutos
  if (diffInMinutes < 60) {
    if (diffInMinutes === 0) {
      return 'agora'
    } else if (diffInMinutes === 1) {
      return 'há 1 minuto'
    } else {
      return `há ${diffInMinutes} minutos`
    }
  }

  // Menos de 1 dia - mostrar horas
  if (diffInHours < 24) {
    if (diffInHours === 1) {
      return 'há 1 hora'
    } else {
      return `há ${diffInHours} horas`
    }
  }

  // Mais de 1 dia
  if (diffInDays === 1) {
    return 'há 1 dia'
  } else if (diffInDays < 7) {
    return `há ${diffInDays} dias`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? 'há 1 mês' : `há ${months} meses`
  } else {
    const years = Math.floor(diffInDays / 365)
    return years === 1 ? 'há 1 ano' : `há ${years} anos`
  }
}
