# Sistema de Vagas Similares com IA

## Visão Geral

O sistema de vagas similares utiliza embeddings da OpenAI (modelo `text-embedding-3-small`) para encontrar vagas relacionadas baseadas em similaridade semântica. O sistema funciona com ou sem a API da OpenAI configurada.

## Funcionamento

### Com OpenAI Configurada

1. **Geração de Embeddings**: Para cada vaga, o sistema cria um vetor numérico (embedding) que representa semanticamente:
   - Título da vaga
   - Nome da empresa
   - Localização
   - Nível de senioridade
   - Tipo de emprego
   - Descrição completa
   - Requisitos

2. **Cálculo de Similaridade**: Usa similaridade de cosseno para comparar a vaga atual com outras vagas ativas no banco

3. **Ranking**: Retorna as 3 vagas mais similares baseadas na pontuação de similaridade

### Sem OpenAI (Fallback)

Se a chave da API não estiver configurada, o sistema automaticamente:
- Busca vagas com mesmo nível de senioridade ou tipo de emprego
- Retorna vagas aleatórias se nenhum critério corresponder

## Configuração

### 1. Instalar Dependência

```bash
npm install openai
```

### 2. Configurar Variável de Ambiente

Adicione ao arquivo `.env.local`:

```env
VITE_OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

### 3. Obter Chave da API

1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova chave de API
3. Cole a chave no arquivo `.env.local`

## Arquivos Criados

### `/lib/openai.ts`
- Configuração do cliente OpenAI
- Validação da API key
- Suporte para uso no navegador

### `/services/similarJobs.ts`
- `findSimilarJobs()`: Busca usando embeddings da OpenAI
- `findSimilarJobsByFields()`: Busca por campos similares (fallback)
- `generateJobDescription()`: Cria texto descritivo da vaga
- `createEmbedding()`: Gera embedding usando OpenAI
- `cosineSimilarity()`: Calcula similaridade entre vetores

### `/hooks/useSimilarJobs.ts`
- Hook React para gerenciar vagas similares
- Tenta usar IA primeiro, depois fallback
- Estados de loading e error

### `/components/JobDetailPage.tsx`
- Integração com o hook `useSimilarJobs`
- Exibição dinâmica das vagas similares
- Navegação entre vagas relacionadas

## Modelo Utilizado

**text-embedding-3-small**
- Modelo mais econômico da OpenAI para embeddings
- 1536 dimensões
- Excelente custo-benefício
- Ideal para comparação de textos curtos e médios

## Custos Estimados

Com `text-embedding-3-small`:
- ~$0.02 por 1 milhão de tokens
- Cada vaga: ~200-500 tokens
- Para 1000 vagas: ~$0.01 - $0.02

Extremamente econômico!

## Vantagens

1. **Similaridade Semântica**: Encontra vagas relacionadas mesmo com palavras diferentes
2. **Multilíngue**: Funciona bem em português
3. **Fallback Automático**: Sistema continua funcionando sem API key
4. **Performance**: Cálculo de similaridade é rápido (cliente-side)
5. **Baixo Custo**: Modelo leve e econômico

## Limitações Atuais

- Embeddings são gerados sob demanda (pode ser otimizado com cache)
- Limitado a 50 vagas para comparação (otimização de performance)
- Requer API key da OpenAI para melhor resultado

## Melhorias Futuras

1. **Cache de Embeddings**: Salvar embeddings no Supabase para evitar recalcular
2. **Busca Vetorial no Supabase**: Usar pgvector para busca eficiente
3. **Pré-processamento**: Gerar embeddings em background quando vaga é criada
4. **Filtros Adicionais**: Combinar similaridade com filtros de localização, salário, etc.
