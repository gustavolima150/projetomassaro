# 🚀 Flowtask - Sistema de Gestão de Projetos

## 📋 O que foi adicionado

### 1. **Tela Inicial (Landing Page)** - `landing.html`
- ✓ Nome do sistema e descrição
- ✓ Imagens de celular e notebook
- ✓ Botão "Entrar" no canto superior direito
- ✓ Tema claro/escuro com toggle

### 2. **Tela de Login** - `login.html`
- ✓ Campos: Email e Senha
- ✓ Botão "Entrar"
- ✓ Link para tela de cadastro
- ✓ Integração com backend PHP

### 3. **Tela de Cadastro** - `cadastro.html`
- ✓ Campos: Nome completo, Email, Senha, Confirmar senha
- ✓ Validação em tempo real (senhas iguais)
- ✓ Redirecionamento para login após cadastro
- ✓ Link para login

### 4. **Modo Claro/Escuro Global** - `js/theme.js`
- ✓ Alternância tema claro/escuro em todas as páginas
- ✓ Persistência em localStorage
- ✓ Sincronizado automaticamente em todas as páginas

### 5. **Sistema de Autenticação** - Backend PHP
- ✓ `backend/config.php` - Configuração de banco de dados
- ✓ `backend/login.php` - Script de autenticação
- ✓ `backend/cadastro.php` - Script de registro
- ✓ Proteção de autenticação em páginas
- ✓ `js/auth.js` - Verificação de autenticação global

### 6. **Banco de Dados MySQL**
- ✓ Tabela `usuarios` - Armazena usuários registrados
- ✓ Tabela `projetos` - Armazena projetos do usuário
- ✓ Tabela `tarefas` - Armazena tarefas dos projetos
- ✓ Chaves estrangeiras e integridade referencial

### 7. **Segurança**
- ✓ Senhas com hash BCRYPT
- ✓ Validação de email
- ✓ Prevenção de duplicação de email
- ✓ Validação no backend

### 8. **Estilos** - `css/style.css`
- ✓ Estilos para páginas de autenticação
- ✓ Dark mode global
- ✓ Tema toggle responsivo

### 9. **Documentação** - `setup.html`
- ✓ Guia de instalação
- ✓ Configuração do banco de dados
- ✓ Instruções de setup
- ✓ Troubleshooting

---

## 🔧 Instalação e Configuração

### Pré-requisitos
- PHP 7.4+
- MySQL 5.7+
- Servidor web (Apache/Nginx ou PHP built-in)

### Passos de Instalação

1. **Criar Banco de Dados**
```bash
mysql -u root -p
CREATE DATABASE flowtask;
EXIT;
```

2. **Configurar Backend**
Edite `backend/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
define('DB_NAME', 'flowtask');
```

3. **Iniciar Servidor**

Opção 1 - PHP Built-in:
```bash
php -S localhost:8000
```

Opção 2 - XAMPP/WAMP:
Coloque a pasta em `htdocs` ou `www`

4. **Acessar o Sistema**
```
http://localhost:8000
ou
http://localhost/flowtask
```

---

## 📊 Fluxo de Funcionamento

```
Landing Page (público)
    ↓
[Entrar] → Login (público)
    ↓
[Cadastre-se] → Cadastro (público)
    ↓
Dashboard (protegido)
```

### Fluxo de Autenticação
1. Usuário acessa landing page
2. Clica em "Entrar"
3. Faz login com email e senha
4. Credenciais validadas no banco de dados
5. Se válidas, é redirecionado para dashboard
6. Dados salvos em localStorage
7. Dashboard verifica autenticação

---

## 🎨 Tema Claro/Escuro

- **Disponível em:** Todas as páginas
- **Sincronização:** Automática em todas as abas
- **Persistência:** localStorage (`theme-preference`)
- **Ícone:** 🌙 (escuro) / ☀️ (claro)

---

## 🔐 Segurança Implementada

- ✓ Hash BCRYPT para senhas
- ✓ Validação de email
- ✓ Prevenção SQL Injection (prepared statements)
- ✓ Validação de dados no backend
- ✓ Proteção de rotas (autenticação)
- ✓ Prevenção duplicação de email

---

## 📁 Estrutura de Arquivos

```
flowtask/
├── backend/
│   ├── config.php          # Configuração do banco
│   ├── login.php           # Script de login
│   └── cadastro.php        # Script de cadastro
├── css/
│   └── style.css           # Estilos globais
├── js/
│   ├── app.js              # Utilitários gerais
│   ├── auth.js             # Verificação de autenticação
│   ├── kanban.js           # Lógica do Kanban
│   ├── storage.js          # Gerenciamento de dados
│   └── theme.js            # Gerenciador de tema
├── login.html              # Página de login
├── cadastro.html           # Página de cadastro
├── landing.html            # Página inicial
├── setup.html              # Guia de instalação
├── index.html              # Dashboard principal
├── projeto.html            # Kanban
├── projetos.html           # Lista de projetos
├── equipe.html             # Gerenciamento de equipe
├── meu-trabalho.html       # Minhas tarefas
├── notificacoes.html       # Notificações
├── produtividade.html      # Relatórios
├── saiba-mais.html         # Sobre o sistema
├── guia.html               # Guia de uso
└── README.md               # Este arquivo
```

---

## 🧪 Testando o Sistema

1. Acesse `http://localhost:8000/landing.html`
2. Clique em "Entrar"
3. Cadastre-se com novo email
4. Faça login
5. Verifique se o tema escuro/claro funciona
6. Acesse dashboard (protegido)

---

## ❓ Solução de Problemas

### Erro: "Erro na conexão com o banco de dados"
- Verifique se MySQL está rodando
- Confirme as credenciais em `backend/config.php`
- Verifique se banco `flowtask` foi criado

### Erro: "Email ou senha incorretos"
- Certifique-se de que cadastrou a conta
- Verifique email e senha
- Teste novamente

### Tema não muda
- Verifique se JavaScript está habilitado
- Limpe cache do navegador
- Verifique console para erros

---

## 📝 Notas Importantes

1. **Storage.js não foi removido** - ainda é usado para dados locais
2. **Tabelas criadas automaticamente** - ao acessar login.php pela primeira vez
3. **Senhas são hash BCRYPT** - não são reversíveis
4. **LocalStorage:** Email e ID são salvos automaticamente após login

---

## 🔄 Próximos Passos (Opcional)

- [ ] Adicionar recuperação de senha
- [ ] Implementar social login (Google, GitHub)
- [ ] Adicionar 2FA (Two-Factor Authentication)
- [ ] Dashboard com dados do banco
- [ ] Sincronização de projetos/tarefas do banco

---

## 📞 Suporte

Para mais detalhes, veja `setup.html` no navegador.

---

**Sistema criado com ❤️ em Flowtask**
