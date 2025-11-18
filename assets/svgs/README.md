# SVG Assets

Esta pasta contém todos os SVGs organizados como componentes React reutilizáveis.

## Estrutura

```
assets/svgs/
├── index.tsx       # Ponto de entrada central
├── icons.tsx       # Ícones gerais (UI)
├── logos.tsx       # Logos de empresas e marcas
└── README.md       # Este arquivo
```

## Como usar

### Importação básica

```tsx
import { SpinnerIcon, ZunoLogo } from '@/assets/svgs'

function MyComponent() {
  return (
    <div>
      <SpinnerIcon className="animate-spin" />
      <ZunoLogo />
    </div>
  )
}
```

### Ícones disponíveis

#### icons.tsx
- `SpinnerIcon` - Ícone de carregamento animado
- `ChevronLeftIcon` - Seta para esquerda
- `ChevronRightIcon` - Seta para direita
- `ChevronDownIcon` - Seta para baixo
- `SearchIcon` - Ícone de busca
- `MenuIcon` - Menu hamburguer
- `LayersIcon` - Ícone de camadas
- `BriefcaseIcon` - Maleta (Jobs)
- `NewspaperIcon` - Jornal (News)
- `FlameIcon` - Fogo (Hot/Trending)
- `CloseIcon` - Fechar (X)

#### logos.tsx
- `ZunoLogo` - Logo do projeto Zuno AI
- `CompanyLogoPlaceholder` - Placeholder para logo de empresa (mostra inicial)
- `ColoredInitialLogo` - Logo com iniciais coloridas personalizáveis

## Exemplos

### Usando ícones com classes personalizadas

```tsx
import { SpinnerIcon, BriefcaseIcon } from '@/assets/svgs'

// Tamanho personalizado
<SpinnerIcon className="size-8 text-blue-500" />

// Com animação
<SpinnerIcon className="animate-spin size-6 text-zinc-600" />

// Ícone com stroke customizado
<BriefcaseIcon stroke="white" className="size-6" />
```

### Usando logos de empresa

```tsx
import { CompanyLogoPlaceholder, ColoredInitialLogo } from '@/assets/svgs'

// Placeholder simples
<CompanyLogoPlaceholder companyName="Google" />

// Logo com iniciais coloridas
<ColoredInitialLogo
  initials="AB"
  color="purple"
  size="lg"
/>
```

## Adicionar novos SVGs

Para adicionar um novo SVG:

1. Adicione o componente no arquivo apropriado (`icons.tsx` ou `logos.tsx`)
2. Certifique-se de exportar no arquivo `index.tsx`
3. Documente aqui no README

### Template de componente SVG

```tsx
export const MyNewIcon: React.FC<{ className?: string }> = ({
  className = 'size-6'
}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    {/* SVG paths aqui */}
  </svg>
)
```

## Boas práticas

1. **Sempre use `currentColor`** para stroke/fill quando possível - permite controlar a cor via CSS
2. **ViewBox padrão** - Use `viewBox="0 0 24 24"` para ícones quando possível
3. **ClassName flexível** - Sempre aceite `className` como prop para permitir customização
4. **Tamanho padrão** - Use `size-6` (24px) como padrão para ícones
5. **TypeScript** - Sempre defina os tipos das props corretamente
6. **Acessibilidade** - Considere adicionar `aria-label` quando o ícone for interativo

## Migração de SVGs inline

Se você encontrar SVGs inline no código, considere movê-los para cá:

```tsx
// ❌ Antes (inline)
<svg className="size-6" fill="none" viewBox="0 0 24 24">
  <path d="..." stroke="currentColor" />
</svg>

// ✅ Depois (componente)
import { MyIcon } from '@/assets/svgs'
<MyIcon className="size-6" />
```

## Performance

- Todos os SVGs são componentes React leves
- Sem dependências externas
- Tree-shaking automático (apenas importa o que usa)
- Otimizado para produção
