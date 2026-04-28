# 🚀 GUIA DE MIGRAÇÃO — PHP/MySQL → Node.js + Supabase
## Projeto: Flesk

---

## ⚠️ PASSO 0 — SEGURANÇA URGENTE (faça AGORA)

Suas chaves secretas foram expostas. Regenere-as imediatamente:

1. Acesse: https://supabase.com/dashboard/project/lrnhtjfneoracdpxbujp/settings/api
2. Clique em **"Reset"** na `service_role key`
3. Clique em **"Reset"** no JWT Secret
4. Copie as novas chaves para o arquivo `.env` do backend
5. **Nunca mais coloque essas chaves em chats, emails ou repositórios Git**

---

## PASSO 1 — Configurar o Banco de Dados no Supabase

1. Acesse o SQL Editor:
   👉 https://supabase.com/dashboard/project/lrnhtjfneoracdpxbujp/sql/new

2. Copie e cole todo o conteúdo do arquivo **`1_supabase_schema.sql`**

3. Clique em **"Run"**

4. Você verá uma tabela de confirmação mostrando as 4 tabelas com `rls_ativo = true`

**O que foi criado:**
- `profiles` — substitui `usuarios` do MySQL
- `projects` — substitui `projetos` (com campos extras como `icon`, `data JSONB`)
- `tasks` — substitui `tarefas` (com campo `position` para ordenação Kanban)
- `project_members` — controle de acesso por projeto
- Trigger automático: cria perfil ao registrar usuário
- RLS completo: cada usuário só vê seus dados

---

## PASSO 2 — Configurar o Backend Node.js

### Instalar dependências

```bash
# Entre na pasta do backend
cd backend

# Instalar pacotes
npm install
```

### Criar o arquivo .env

```bash
# Copie o exemplo
cp .env.example .env
```

Edite o `.env` com suas novas chaves (após resetá-las no Passo 0):

```
SUPABASE_URL=https://lrnhtjfneoracdpxbujp.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_nova_aqui
SUPABASE_SECRET_KEY=sua_service_role_key_nova_aqui
PORT=3001
FRONTEND_URL=http://localhost:5500
```

> **Onde achar as chaves?**
> https://supabase.com/dashboard/project/lrnhtjfneoracdpxbujp/settings/api
> - `anon key` = SUPABASE_ANON_KEY
> - `service_role` = SUPABASE_SECRET_KEY

### Rodar o servidor

```bash
# Desenvolvimento (auto-restart)
npm run dev

# Produção
npm start
```

Você verá: `✅ Servidor Flesk rodando em http://localhost:3001`

### Adicionar ao .gitignore

```
.env
node_modules/
```

---

## PASSO 3 — Atualizar o Frontend HTML

### Substituir os scripts antigos

Em **todos os seus arquivos HTML**, localize o bloco de scripts e faça a troca:

**ANTES (remover):**
```html
<script src="js/auth.js"></script>
```

**DEPOIS (adicionar):**
```html
<script src="js/supabase-api.js"></script>
```

> O `supabase-api.js` já inclui toda a funcionalidade do `auth.js` original.
> O `app.js` (utilitários) pode ser mantido — ele não usa PHP.

---

## PASSO 4 — Atualizar login.html

**ANTES (PHP):**
```javascript
fetch('backend/login.php', {
  method: 'POST',
  body: JSON.stringify({ email, senha: password })
})
```

**DEPOIS (Node.js):**
```javascript
const result = await FleskAuth.login(email, password);
if (result.success) {
  window.location.href = 'projetos.html';
} else {
  App.toast(result.message, 'error');
}
```

> **Nota:** O campo `senha` virou `password` na nova API.

---

## PASSO 5 — Atualizar cadastro.html

**ANTES (PHP):**
```javascript
fetch('backend/cadastro.php', {
  method: 'POST',
  body: JSON.stringify({ nome, email, senha })
})
```

**DEPOIS (Node.js):**
```javascript
const result = await FleskAuth.signup(nome, email, senha);
if (result.success) {
  window.location.href = 'login.html';
}
```

---

## PASSO 6 — Atualizar projetos.html

**ANTES (armazenamento local/PHP):**
```javascript
// Código antigo usando localStorage direto
const projetos = JSON.parse(localStorage.getItem('projects') || '[]');
```

**DEPOIS (Supabase via backend):**
```javascript
// Ao carregar a página
async function init() {
  const projetos = await FleskProjects.list();
  renderizarProjetos(projetos);
}
document.addEventListener('DOMContentLoaded', init);

// Criar projeto
async function criarProjeto(dados) {
  const result = await FleskProjects.create(dados);
  if (result.success) {
    App.toast('Projeto criado!', 'success');
    await init(); // Recarregar lista
  }
}

// Deletar projeto
async function deletarProjeto(id) {
  if (!confirm('Deletar projeto?')) return;
  const result = await FleskProjects.delete(id);
  if (result.success) await init();
}
```

---

## PASSO 7 — Atualizar elementos HTML para exibir usuário

Adicione atributos especiais nos seus layouts — o script preenche automaticamente:

```html
<!-- Nome do usuário logado -->
<span data-user-name>Carregando...</span>

<!-- Email do usuário -->
<small data-user-email></small>

<!-- Iniciais para avatar -->
<div class="avatar" data-user-initials></div>

<!-- Botão de logout (sem precisar de JavaScript extra) -->
<button data-action="logout">
  <i class="icon-logout"></i> Sair
</button>
```

---

## PASSO 8 — Testar o sistema

### Teste rápido via terminal:

```bash
# Testar se o backend está funcionando
curl http://localhost:3001/health

# Testar cadastro
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'

# Testar login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

### Fluxo esperado:

1. ✅ Cadastro → cria usuário no Supabase Auth + perfil na tabela `profiles`
2. ✅ Login → retorna JWT token
3. ✅ Token salvo no localStorage
4. ✅ Todas as requisições posteriores usam o token
5. ✅ RLS garante que cada usuário só vê seus dados

---

## PASSO 9 — Deploy em Produção

### Backend (opções gratuitas):

| Plataforma | Como fazer deploy |
|---|---|
| **Railway** | `railway up` (mais fácil, recomendado) |
| **Render** | Conectar repositório Git |
| **Fly.io** | `flyctl deploy` |
| **Heroku** | `git push heroku main` |

### Configurar variáveis de ambiente na plataforma:
- Adicione todas as variáveis do `.env` no painel da plataforma
- **Nunca suba o arquivo `.env` para o Git**

### Atualizar a URL no frontend:
```javascript
// Em supabase-api.js, linha 12:
BACKEND_URL: 'https://sua-api.railway.app'  // URL de produção
```

---

## Comparativo: PHP vs Node.js

| O que era (PHP/MySQL) | O que virou (Node.js/Supabase) |
|---|---|
| `backend/config.php` | `.env` + `server.js` (inicialização) |
| `backend/login.php` | `POST /login` em `server.js` |
| `backend/cadastro.php` | `POST /signup` em `server.js` |
| `js/auth.js` | `supabase-api.js` (FleskAuth) |
| `localStorage.getItem('user_id')` | `Session.getUser().id` |
| Tabela `usuarios` MySQL | `auth.users` + `profiles` Supabase |
| Tabela `projetos` MySQL | `projects` Supabase (com RLS) |
| Tabela `tarefas` MySQL | `tasks` Supabase (com RLS) |
| Senha com `password_hash()` | Gerenciada pelo Supabase Auth |
| Sessions PHP | JWT tokens |

---

## Arquivos que podem ser DELETADOS

Após a migração, estes arquivos PHP não são mais necessários:

```
backend/config.php    ← DELETAR
backend/login.php     ← DELETAR
backend/cadastro.php  ← DELETAR
backend/init.sql      ← DELETAR (substituído pelo schema Supabase)
.htaccess             ← DELETAR (se era só para o PHP)
js/auth.js            ← SUBSTITUIR por supabase-api.js
```

---

## Dúvidas Frequentes

**P: O sistema funciona sem o backend Node.js?**
R: Não para autenticação. O backend é necessário porque a chave secreta do Supabase não pode ficar no frontend.

**P: Posso hospedar o frontend em qualquer lugar?**
R: Sim! GitHub Pages, Netlify, Vercel — qualquer hosting de arquivos estáticos funciona.

**P: O que acontece com os dados que já estão no MySQL?**
R: Você precisará exportar e importar. Posso gerar um script de migração se necessário.

**P: Posso usar o Supabase Auth diretamente no frontend sem backend?**
R: Tecnicamente sim, mas apenas para operações simples. O backend garante operações administrativas seguras (criar usuários sem confirmação de email, por exemplo).
