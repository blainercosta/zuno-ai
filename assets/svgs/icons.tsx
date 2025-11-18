/**
 * Biblioteca de ícones SVG do projeto
 * Todos os ícones são exportados como componentes React
 */

import React from 'react'

// Ícone de carregamento (spinner)
export const SpinnerIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

// Ícone de seta para a esquerda
export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path d="M14 7L9 12L14 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de seta para a direita
export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'size-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5L16 12L9 19" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de busca
export const SearchIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M20 20L16 16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de menu hamburguer
export const MenuIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

// Ícone de layers/camadas
export const LayersIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M3 3L12 7L21 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M3 11L12 14L21 11" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de maleta/briefcase (Jobs)
export const BriefcaseIcon: React.FC<{ className?: string; stroke?: string }> = ({
  className = 'size-6',
  stroke = 'currentColor'
}) => (
  <svg className={className} fill="none" stroke={stroke} viewBox="0 0 24 24">
    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V9C2 8.46957 2.21071 7.96086 2.58579 7.58579C2.96086 7.21071 3.46957 7 4 7H20C20.5304 7 21.0391 7.21071 21.4142 7.58579C21.7893 7.96086 22 8.46957 22 9V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de jornal/newspaper (News)
export const NewspaperIcon: React.FC<{ className?: string; stroke?: string }> = ({
  className = 'size-6',
  stroke = 'currentColor'
}) => (
  <svg className={className} fill="none" stroke={stroke} viewBox="0 0 24 24">
    <path d="M19 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V6C3 5.46957 3.21071 4.06086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M7 8H17" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M7 12H17" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M7 16H12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de fogo/flame (Hot)
export const FlameIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 16 16">
    <path d="M8 1.33333C8 1.33333 5.33333 4 5.33333 6.66667C5.33333 8.13943 6.52724 9.33333 8 9.33333C9.47276 9.33333 10.6667 8.13943 10.6667 6.66667C10.6667 4 8 1.33333 8 1.33333Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    <path d="M8 9.33333C8 9.33333 10.6667 11.3333 10.6667 13.3333C10.6667 14.4379 9.77124 15.3333 8.66667 15.3333C7.5621 15.3333 6.66667 14.4379 6.66667 13.3333C6.66667 11.3333 8 9.33333 8 9.33333Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
)

// Ícone de chevron para baixo
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'size-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M6.5 9.5L11.5 14.5L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)

// Ícone de fechar (X)
export const CloseIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 7L7 17M7 7L17 17" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
)
