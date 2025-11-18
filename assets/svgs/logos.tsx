/**
 * Logos de empresas e marcas
 * Componentes SVG para logos usados no projeto
 */

import React from 'react'

// Logo placeholder - usado quando não há logo disponível
export const CompanyLogoPlaceholder: React.FC<{
  companyName: string
  className?: string
}> = ({ companyName, className = 'size-12' }) => {
  const initial = companyName.charAt(0).toUpperCase()

  return (
    <div className={`${className} rounded-xl flex items-center justify-center bg-zinc-800 text-white`}>
      <span className="text-base">{initial}</span>
    </div>
  )
}

// Logo Zuno AI (seu projeto)
export const ZunoLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => (
  <div className={`${className} flex items-center gap-2`}>
    <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
      <span className="text-white font-bold text-lg">Z</span>
    </div>
    <span className="text-xl font-semibold text-white">Zuno AI</span>
  </div>
)

// Logo genérico com iniciais coloridas
export const ColoredInitialLogo: React.FC<{
  initials: string
  color?: 'emerald' | 'indigo' | 'purple' | 'red' | 'blue' | 'green'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({
  initials,
  color = 'indigo',
  className = '',
  size = 'md'
}) => {
  const colorMap = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  }

  const sizeMap = {
    sm: 'size-8 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-16 text-base',
  }

  const bgColor = colorMap[color]
  const sizeClass = sizeMap[size]

  return (
    <div className={`${sizeClass} rounded-xl flex items-center justify-center ${bgColor} text-white font-medium ${className}`}>
      {initials}
    </div>
  )
}
