# NewsPage - Página de Notícias

## Visão Geral

A NewsPage é uma página de listagem de notícias e insights sobre IA, tecnologia e mercado de trabalho. Segue a estrutura da home page mas sem a sidebar direita, focando todo o espaço no conteúdo.

## Características

### Layout
- **Estrutura**: Full-width sem sidebar direita
- **Grid**: 3 colunas em desktop (lg:), 2 em tablet (sm:), 1 em mobile
- **Responsivo**: Mobile-first approach
- **Max-width**: 1200px para o container

### Seções

#### 1. Header
```
- Título principal: "Notícias e insights"
- Subtítulo explicativo
- Max-width: 640px
- Padding top: pt-20 (mobile), pt-24 (desktop)
```

#### 2. Filtros
```
- 12 categorias: Tudo, IA, Startups, Tecnologia, Design, etc.
- Scroll horizontal em mobile
- Border-bottom como separador
- Categoria ativa: bg-white com text-slate-950
- Categorias inativas: hover:bg-zinc-800
```

#### 3. Grid de Notícias
```
- 6 cards de notícias (pode ser expandido)
- Aspect ratio 4:3 para imagens
- Hover effect: scale-105 na imagem
- Badge de categoria sobre a imagem
- Truncate text em 2 linhas no excerpt
```

#### 4. Load More
```
- Botão centralizado no final
- Border style (não preenchido)
- Texto: "Carregar mais notícias"
```

### Card de Notícia

Cada card contém:
- **Imagem** (aspect-[4/3])
  - Overlay com shadow
  - Badge de categoria (top-4 left-4)
  - Hover: scale-105 transition

- **Título** (18-20px)
  - Line-height: 1.3
  - Hover: text-zinc-300
  - Transição suave

- **Excerpt** (text-sm)
  - 2 linhas truncadas (line-clamp-2)
  - Cor: text-zinc-400
  - Line-height: 1.6

- **Meta informações**
  - Avatar do autor (size-6, rounded-full)
  - Nome do autor
  - Data relativa ("há 2 dias")
  - Tempo de leitura ("5 min de leitura")
  - Separador: "·"
  - Tamanho: text-xs
  - Cor: text-zinc-500

## Dados

### NEWS_DATA Array
```typescript
{
  id: number;           // ID único
  title: string;        // Título da notícia
  excerpt: string;      // Resumo/preview
  author: string;       // Nome do autor
  date: string;         // Data relativa
  readTime: string;     // Tempo de leitura
  category: string;     // Categoria
  image: string;        // URL da imagem
}
```

### FILTERS Array
```typescript
["Tudo", "IA", "Startups", "Tecnologia", "Design", "Produto",
 "Engenharia", "Dados", "Web3", "DevOps", "Mobile", "Backend"]
```

## Props

```typescript
interface NewsPageProps {
  onNewsClick: (id: number) => void;
}
```

## Cores e Estilo

- **Background**: bg-[#09090b] (zinc-950)
- **Text primário**: text-white
- **Text secundário**: text-zinc-400
- **Text terciário**: text-zinc-500
- **Borders**: border-zinc-800
- **Hover background**: hover:bg-zinc-800 / hover:bg-zinc-900
- **Badge background**: bg-white/10 com backdrop-blur-sm

## Interatividade

1. **Filtros**: Click para filtrar notícias por categoria (funcionalidade a implementar)
2. **Cards**: Click para abrir notícia completa
3. **Load More**: Carregar mais notícias (funcionalidade a implementar)
4. **Hover states**:
   - Imagem: scale-105
   - Título: text-zinc-300
   - Botões: bg-zinc-800/900

## Responsividade

### Mobile (< 640px)
- 1 coluna
- Filtros com scroll horizontal
- Padding reduzido
- Espaçamento: gap-6

### Tablet (640px - 1024px)
- 2 colunas
- Filtros com scroll horizontal
- Espaçamento: gap-8

### Desktop (>= 1024px)
- 3 colunas
- Todos filtros visíveis
- Espaçamento: gap-8
- Max-width: 1200px

## Acessibilidade

- Semantic HTML: `<article>` para cards
- Alt text para imagens
- Cursor pointer nos elementos clicáveis
- Contrast ratio adequado
- Keyboard navigation (a implementar)

## Próximos Passos

- [ ] Implementar filtro funcional
- [ ] Adicionar paginação real
- [ ] Conectar com API/CMS
- [ ] Implementar busca
- [ ] Adicionar página individual de notícia
- [ ] Implementar loading states
- [ ] Adicionar skeleton loaders
- [ ] SEO optimization (meta tags, og:image)

## Navegação

```
JobsPage (home)
  └─> NewsPage (botão "Ver notícias")
        └─> NewsDetailPage (click em card) [a implementar]
```

## Integração

A NewsPage está integrada no App.tsx com roteamento:

```typescript
currentPage === "news" ? (
  <NewsPage onNewsClick={(id) => console.log("News clicked:", id)} />
)
```

Acesso via JobsPage através do botão "Ver notícias".
