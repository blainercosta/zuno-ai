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
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'hoje'
  } else if (diffInDays === 1) {
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
