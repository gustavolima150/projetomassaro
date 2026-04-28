# 🔍 Diagnóstico e Correção - Login Não Funciona

## ⚠️ PROBLEMA: "Email ou senha incorretos"

Se está recebendo esta mensagem mesmo com email/senha corretos, o **email provavelmente não está confirmado** no Supabase.

---

## 🧪 TESTE 1: Verificar Status do Email

Execute este comando no terminal para verificar se seu email está confirmado:

```bash
curl -X POST http://localhost:3001/debug/check-user \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "diagnosis": "✅ Email confirmado - Login deveria funcionar"
}
```

Ou se não está confirmado:
```json
{
  "success": true,
  "diagnosis": "❌ Email NÃO confirmado - Login vai falhar"
}
```

---

## 🛠️ SOLUÇÃO 1: Confirmar Email Manualmente (Para Testes)

Se o email **não está confirmado**, execute:

```bash
curl -X POST http://localhost:3001/debug/confirm-email \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

Depois tente fazer login novamente.

---

## 🔧 SOLUÇÃO 2: Desativar Email Confirmation no Supabase (RECOMENDADO)

Este é o **passo definitivo**. Faça uma única vez:

### Passo a Passo:

1. **Abra o Supabase Dashboard**
   - Acesse: https://app.supabase.com/
   - Selecione seu projeto

2. **Vá para Authentication**
   - No menu esquerdo, clique em **"Authentication"**

3. **Acesse Providers**
   - Clique em **"Providers"** (ou "Email")

4. **DESATIVE Email Confirmation**
   - Procure por: **"Require email confirmation before signing in"**
   - Clique no **toggle para OFF** (desativar)
   - Clique em **"Save"**

5. **Reinicie o Backend**
   ```bash
   # Feche o server.js (Ctrl+C)
   # Depois execute novamente:
   node server.js
   ```

---

## ✅ DEPOIS de Desativar Email Confirmation

### Teste o Fluxo Completo:

**1. Fazer Cadastro:**
```bash
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "João Silva",
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

**Resposta esperada:** `"autologin": true` com `session`

**2. Fazer Login com Mesmas Credenciais:**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

**Resposta esperada:** `"success": true` com `session` e `access_token`

---

## 🐛 Se Ainda Não Funcionar

### Verificar Logs do Servidor

1. Abra o terminal onde está rodando `node server.js`
2. Procure por linhas que começam com:
   - `Login error:`
   - `Erro no login:`
3. Copie a mensagem de erro completa

### Verificar Banco de Dados

Execute esta query no Supabase SQL Editor:

```sql
-- Ver todos os usuários cadastrados
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;
```

**Procure por:**
- `email_confirmed_at` **NULL** = ❌ Email não confirmado
- `email_confirmed_at` **com data** = ✅ Email confirmado

---

## 🔗 URLs de Debug Disponíveis

| Endpoint | Método | Função |
|----------|--------|--------|
| `/health` | GET | Verifica se servidor está rodando |
| `/debug/check-user` | POST | Verifica status do email |
| `/debug/confirm-email` | POST | Confirma email (bypass) |
| `/login` | POST | Faz login |
| `/signup` | POST | Cadastra usuário |

---

## 📋 Checklist de Verificação

- [ ] Servidor rodando: `http://localhost:3001/health` retorna `ok`
- [ ] Email Confirmation **DESATIVADO** no Supabase
- [ ] Usuário testado com `/debug/check-user` 
- [ ] Email do usuário **CONFIRMADO** (via `/debug/confirm-email`)
- [ ] Servidor reiniciado após mudar settings
- [ ] Teste de login funcionando
- [ ] Redirecionamento correto após login

---

## 💡 DICA: Usar Git Bash / PowerShell para Testar

Se os comandos `curl` não funcionarem, use no PowerShell:

```powershell
$body = @{email="seu@email.com"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/debug/check-user" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## ❓ Perguntas Frequentes

**P: Por que o email precisa ser confirmado?**
R: É um recurso de segurança do Supabase. Em produção, ajuda evitar contas falsas.

**P: Preciso confirmar email toda vez que cadastro?**
R: Sim, se o Email Confirmation estiver ativado. Por isso recomendamos **desativar para desenvolvimento**.

**P: Posso reativar Email Confirmation depois?**
R: Sim! Basta seguir o mesmo passo para reativar em produção.

**P: E se o servidor retornar erro diferente?**
R: Verifique a seção "Verificar Logs do Servidor" acima.

---

**Próximo passo: Desative Email Confirmation no Supabase e teste novamente! 🚀**
