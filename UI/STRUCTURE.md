# Estrutura da Pasta UI

## Visão Geral

Esta pasta contém a interface completa do job board, incluindo todos os componentes React, estilos e configurações necessárias para executar o projeto.

## Arquivos Raiz

### Configuração
- **`package.json`** - Dependências e scripts do projeto
- **`vite.config.ts`** - Configuração do bundler Vite
- **`tsconfig.json`** - Configuração do TypeScript
- **`tailwind.config.js`** - Configuração do Tailwind CSS
- **`postcss.config.js`** - Configuração do PostCSS

### Código
- **`App.tsx`** - Componente raiz com roteamento entre páginas
- **`index.html`** - Template HTML base

## Pastas

### `/components/`
Componentes React da aplicação:

#### Páginas Principais
1. **`JobsPage.tsx`** (7.2 KB)
   - Página inicial/home do site
   - Hero section com título e CTA
   - Lista de 4 vagas com cards
   - Social proof com logos
   - Responsivo (mobile, tablet, desktop)

2. **`JobDetailPage.tsx`** (14.8 KB)
   - Detalhes completos de uma vaga
   - Layout com article + sidebar
   - Seções: Sobre empresa, Responsabilidades, Requisitos, Diferenciais, Benefícios, Remuneração, Processo
   - Sidebar: Logo empresa, botão candidatar, compartilhar, vagas similares
   - Header com botão voltar

3. **`PostJobPage.tsx`** (11.9 KB)
   - Formulário para publicar vagas
   - 3 seções: Informações da empresa, Informações da vaga, Contato
   - Upload de logo
   - Campos: nome, website, título, localização, tipo, nível, salário, descrições
   - Botões: Cancelar e Publicar

#### Subpastas
- **`/figma/`** - Componentes exportados do Figma
- **`/ui/`** - Componentes shadcn/ui (50 arquivos)

### `/styles/`
- **`globals.css`** - Estilos globais com Tailwind, variáveis CSS (oklch), tema dark/light

### `/imports/`
11 arquivos SVG importados do Figma

### `/src/`
- **`main.tsx`** - Entry point que renderiza o App

## Características

### Design System
- **Tema**: Dark mode (bg-zinc-950)
- **Cores**: Sistema oklch para consistência
- **Typography**: Variáveis CSS customizadas
- **Spacing**: Tailwind utilities
- **Bordas**: rounded-xl (0.75rem) padrão para avatares

### Localização
- Interface 100% em português brasileiro
- Datas formatadas (ex: "18 set", "há 2 meses")
- Títulos de trabalho traduzidos
- Seções em português

### Responsividade
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid adaptativo para lista de vagas
- Sidebar condicional em telas grandes

### Navegação
```
JobsPage (home)
  ├─> JobDetailPage (clicar em vaga)
  │     └─> Voltar para JobsPage
  └─> PostJobPage (clicar "Publicar vaga")
        └─> Voltar para JobsPage
```

## Estado Atual

✅ Todas as 3 páginas implementadas
✅ Textos traduzidos para português
✅ Avatares padronizados (48px, rounded-xl)
✅ Menu lateral oculto
✅ JobsPage configurada como home
✅ Roteamento funcionando
✅ Server rodando (localhost:3000)

## Próximos Passos Sugeridos

- [ ] Conectar com backend/API
- [ ] Implementar autenticação
- [ ] Adicionar validação de formulários
- [ ] Implementar filtros funcionais
- [ ] Adicionar paginação
- [ ] Implementar busca
- [ ] Adicionar analytics
