# 🚀 Setup do Supabase - Tabela de Profissionais

## O Problema

A aplicação está usando dados mock porque a tabela `professionals` ainda não existe no Supabase.

**Evidência no console do browser:**
- `⚠️ Nenhum dado no Supabase, usando mock data`
- OU `❌ Erro ao buscar profissionais: [erro Supabase]`

## A Solução

Execute o SQL no Supabase SQL Editor para criar a tabela e popular com dados.

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
```
https://supabase.com/dashboard/project/xmklmkorbeubifamizln
```

### 2. Vá para o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Ou acesse diretamente: `https://supabase.com/dashboard/project/xmklmkorbeubifamizln/sql`

### 3. Crie uma Nova Query
- Clique em **"+ New Query"**

### 4. Copie e Cole o SQL
- Abra o arquivo `supabase-professionals-setup.sql`
- Copie TODO o conteúdo
- Cole no editor SQL

### 5. Execute o SQL
- Clique no botão **"Run"** ou pressione `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
- Aguarde a execução (pode levar alguns segundos)

### 6. Verifique o Resultado
Você deve ver uma mensagem de sucesso e uma tabela com os profissionais inseridos:

```
id | name              | role                    | status  | badge    | rating | slug
---+-------------------+-------------------------+---------+----------+--------+------------------------
1  | Blainer Costa     | AI Explorer             | online  | Novo     | 4.9    | blainer-costa-1
2  | Ana Silva         | ML Engineer             | online  | Destaque | 5.0    | ana-silva-2
...
```

## ✅ Verificação

### Verifique no Browser (Console)

Depois de executar o SQL, recarregue a página do localhost:

```
http://localhost:3000/professionals
```

Abra o DevTools Console (F12) e procure por:

```
✅ Profissionais carregados do Supabase: 12
📸 Primeira imagem: https://avatars.githubusercontent.com/u/1234567?v=4
```

Se você ver essas mensagens, **tudo funcionou!** 🎉

### Verifique as Imagens

As imagens devem carregar de duas fontes:

1. **Imagens do banco** - URLs reais do campo `image_url`
2. **Fallback automático** - Se a imagem falhar, usa avatar gerado

No console você verá:
```
✅ Imagem carregada: Blainer Costa - https://avatars.githubusercontent.com/...
```

## 🔧 O que o SQL faz?

1. **Cria a tabela** `professionals` com 26 campos
2. **Cria índices** para busca rápida (status, rating, skills, slug)
3. **Cria triggers** para gerar slugs automaticamente
4. **Configura RLS** (Row Level Security) para acesso público de leitura
5. **Insere 12 profissionais** brasileiros de IA/ML com dados reais

## 📊 Estrutura da Tabela

```sql
professionals
├── id (auto-increment)
├── name (obrigatório)
├── role (obrigatório)
├── image_url (obrigatório)
├── status ('online' | 'offline')
├── badge (opcional: 'Novo', 'Destaque')
├── rating (0.0 a 5.0)
├── location
├── skills (array de strings)
├── bio
├── portfolio_url
├── github_url
├── linkedin_url
├── twitter_url
├── instagram_url
├── email
├── phone
├── hourly_rate
├── availability
├── years_experience
├── total_projects
├── total_reviews
├── slug (gerado automaticamente)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## 🎯 Próximos Passos

Depois que os dados estiverem no Supabase:

1. **Adicionar novos profissionais** via SQL INSERT ou API
2. **Atualizar imagens** - Substitua URLs de exemplo por URLs reais
3. **Criar página de cadastro** - Formulário para profissionais se cadastrarem
4. **Adicionar autenticação** - Permitir que profissionais editem seus perfis

## 🆘 Problemas Comuns

### Erro: "relation already exists"
- A tabela já existe. Use `DROP TABLE professionals;` antes do SQL
- Ou remova o `IF NOT EXISTS` e execute apenas os INSERTs

### Erro: "function unaccent does not exist"
- Execute: `CREATE EXTENSION IF NOT EXISTS unaccent;`
- Ou remova a função `unaccent()` da função de slug

### Imagens não carregam
- Verifique se as URLs são válidas
- Teste as URLs diretamente no browser
- O sistema tem fallback automático para avatares gerados

### Console mostra "usando mock data"
- Verifique se o SQL foi executado com sucesso
- Verifique se as credenciais do Supabase estão corretas no `.env.local`
- Recarregue a página (Ctrl+Shift+R para hard reload)

## 📝 Logs de Debug

O código já está preparado com logs para debug. No console você verá:

```javascript
// Sucesso ao carregar do Supabase
✅ Profissionais carregados do Supabase: 12
📸 Primeira imagem: https://avatars.githubusercontent.com/...

// Fallback para mock data
⚠️ Nenhum dado no Supabase, usando mock data
🔄 Usando mock data como fallback

// Carregamento de imagens
✅ Imagem carregada: Ana Silva - https://i.pravatar.cc/400?img=5
⚠️ Erro ao carregar imagem de Carlos Santos, URL: https://i.pravatar.cc/...
```

## 🎨 Personalização

### Mudar as Imagens

Edite as URLs no SQL ou atualize via SQL:

```sql
UPDATE professionals
SET image_url = 'https://sua-imagem.com/foto.jpg'
WHERE id = 1;
```

### Adicionar Mais Profissionais

```sql
INSERT INTO professionals (name, role, image_url, status, badge, rating, location, skills)
VALUES (
  'Seu Nome',
  'Sua Função',
  'https://sua-foto.com/imagem.jpg',
  'online',
  'Novo',
  4.9,
  'Sua Cidade, BR',
  ARRAY['Skill1', 'Skill2', 'Skill3']
);
```

O slug será gerado automaticamente!

---

**Criado por:** Claude Code
**Última atualização:** 2025-11-26
