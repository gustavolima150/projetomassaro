# 📝 Changelog - Flowtask v2.0

## ✨ Novo - Adições Principais

### 🎯 Telas de Autenticação
- **login.html** - Página de login com validação de credenciais
- **cadastro.html** - Página de cadastro com validação de senhas
- **setup.html** - Guia de instalação e configuração

### 🎨 Tema Global
- **js/theme.js** - Sistema de tema claro/escuro sincronizado
- Persistência em localStorage
- Integração automática em todas as páginas

### 🔐 Sistema de Autenticação
- **js/auth.js** - Proteção de rotas e verificação de autenticação
- Redirecionamento automático para login
- Logout global

### 💾 Backend PHP + MySQL
- **backend/config.php** - Configuração de banco de dados e criação automática de tabelas
- **backend/login.php** - API de autenticação com hash BCRYPT
- **backend/cadastro.php** - API de registro de usuários
- **backend/init.sql** - Script SQL para inicialização do banco

### 📊 Banco de Dados
- Tabela `usuarios` - Usuários registrados com email único
- Tabela `projetos` - Projetos dos usuários
- Tabela `tarefas` - Tarefas dos projetos
- Integridade referencial com chaves estrangeiras

### 📖 Documentação
- **README.md** - Guia completo do sistema
- **CHANGELOG.md** - Este arquivo
- **setup.html** - Guia interativo de instalação
- Comentários em código PHP e JavaScript

### 🛡️ Segurança
- Hash BCRYPT para senhas
- Prepared statements contra SQL injection
- Validação de email
- Prevenção de duplicação de email
- .htaccess para proteção de diretórios

---

## 🔄 Modificações em Arquivos Existentes

### landing.html
- Adicionado header com tema toggle e botão "Entrar"
- Integrado script theme.js
- Adicionado footer com link para setup
- Estilos responsivos melhorados

### index.html
- Adicionado script theme.js para tema global
- Adicionado script auth.js para proteção de autenticação

### css/style.css
- Adicionados estilos para páginas de autenticação
- Suporte para dark mode em formulários
- Estilos responsivos para auth-page
- Estilos para theme toggle

### js/app.js
- Atualizada função toggleTheme() para usar Theme.js
- Integração com sistema de tema global

### Todas as páginas protegidas
- Adicionados scripts theme.js e auth.js
- Projetos.html, projeto.html, equipe.html, meu-trabalho.html, etc.

---

## 📁 Novos Arquivos

```
Criados:
├── backend/
│   ├── config.php
│   ├── login.php
│   ├── cadastro.php
│   └── init.sql
├── js/
│   ├── theme.js
│   └── auth.js
├── login.html
├── cadastro.html
├── setup.html
├── README.md
├── CHANGELOG.md (este arquivo)
└── .htaccess
```

---

## 🚀 Como Começar

1. **Criar banco de dados:**
   ```bash
   mysql -u root -p < backend/init.sql
   ```

2. **Configurar credenciais:**
   Edite `backend/config.php` com suas credenciais MySQL

3. **Iniciar servidor:**
   ```bash
   php -S localhost:8000
   ```

4. **Acessar sistema:**
   Abra `http://localhost:8000/landing.html`

---

## 🔒 Segurança Implementada

- ✓ Senhas com hash BCRYPT
- ✓ Prepared statements (previne SQL injection)
- ✓ Validação de email
- ✓ Prevenção de duplicação de email
- ✓ Verificação de autenticação em rotas
- ✓ Headers de segurança (X-Frame-Options, X-Content-Type-Options)
- ✓ Proteção de diretórios com .htaccess

---

## 📋 Testes Realizados

- ✓ Cadastro de novo usuário
- ✓ Login com credenciais válidas/inválidas
- ✓ Tema claro/escuro em todas as páginas
- ✓ Persistência de tema entre abas
- ✓ Proteção de rotas (redirecionamento para login)
- ✓ Validação de senhas (devem ser iguais)
- ✓ Validação de email

---

## 🎯 Funcionalidades Não Alteradas

- Dashboard principal (index.html)
- Sistema Kanban (projeto.html)
- Gerenciamento de projetos
- Sistema de notificações
- Guia de uso
- Todas as funcionalidades originais do sistema

---

## 📌 Versão

- **Versão:** 2.0
- **Data:** Abril 2026
- **Status:** ✅ Pronto para produção

---

## 🔮 Próximas Melhorias (Roadmap)

- [ ] Recuperação de senha por email
- [ ] Social login (Google, GitHub)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Integração de projetos/tarefas com banco de dados
- [ ] API REST completa
- [ ] Dashboard com dados do banco
- [ ] Relatórios avançados
- [ ] Sincronização em tempo real com WebSocket

---

**Sistema desenvolvido com ❤️ - Flowtask v2.0**
