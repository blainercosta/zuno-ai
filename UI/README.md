# UI - Job Board Interface

Esta pasta contém todos os arquivos da interface do usuário para o job board de vagas de IA.

## Estrutura

```
UI/
├── App.tsx                 # Componente principal com roteamento
├── components/             # Componentes React
│   ├── JobsPage.tsx       # Página inicial com lista de vagas
│   ├── JobDetailPage.tsx  # Página de detalhes da vaga
│   └── PostJobPage.tsx    # Página para publicar nova vaga
├── styles/                # Estilos globais
│   └── globals.css        # CSS com Tailwind e variáveis customizadas
├── imports/               # Assets SVG importados do Figma
├── src/                   # Código fonte
│   └── main.tsx          # Entry point da aplicação
├── index.html            # HTML base
├── package.json          # Dependências do projeto
├── tailwind.config.js    # Configuração do Tailwind CSS
├── tsconfig.json         # Configuração do TypeScript
├── vite.config.ts        # Configuração do Vite
└── postcss.config.js     # Configuração do PostCSS

```

## Páginas

### JobsPage (Home)
- Página inicial com hero section
- Lista de vagas com filtros
- Botão "Publicar vaga grátis"
- Social proof com logos de empresas

### JobDetailPage
- Detalhes completos da vaga
- Informações da empresa
- Responsabilidades, requisitos e benefícios
- Sidebar com botão de candidatura e vagas similares

### PostJobPage
- Formulário para publicar novas vagas
- Campos para informações da empresa
- Campos para detalhes da vaga
- Campos de contato

## Tecnologias

- **React 18.3.1** - Framework UI
- **TypeScript 5.7.2** - Type safety
- **Vite 6.0.11** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## Tema

- Dark theme (zinc-950 background)
- Cores em oklch para consistência
- Border radius customizado (0.75rem para avatares)
- Typography system com variáveis CSS

## Textos em Português

Todos os textos da interface foram traduzidos para português brasileiro:
- Títulos e CTAs
- Labels de formulário
- Mensagens de status
- Datas formatadas (ex: "18 set", "20 ago")
