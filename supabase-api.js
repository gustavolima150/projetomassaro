/* ============================================================
   FLESK - supabase-api.js
   Substitui completamente: backend/login.php, backend/cadastro.php
   Usa APENAS a chave pública (publishable key)
   
   Como usar: <script src="js/supabase-api.js"></script>
   ============================================================ */

// ============================================================
// CONFIGURAÇÃO — apenas chave pública no frontend
// ============================================================
const FLESK_CONFIG = {
  BACKEND_URL: 'http://localhost:3001',  // Troque pela URL do seu backend em produção
  // A chave abaixo é pública (publishable) — segura no frontend
  SUPABASE_ANON_KEY: 'sb_publishable_ez0pJACLC53mOGkzmV1yrA_FCv67HRz'
};

// ============================================================
// GERENCIADOR DE SESSÃO (substitui localStorage direto do PHP)
// ============================================================
const Session = {
  // Salvar sessão após login
  save(userData, token, refreshToken) {
    localStorage.setItem('flesk_token',         token);
    localStorage.setItem('flesk_refresh_token', refreshToken);
    localStorage.setItem('flesk_user_id',       userData.id);
    localStorage.setItem('flesk_user_name',     userData.name);
    localStorage.setItem('flesk_user_email',    userData.email);
  },

  // Limpar sessão (logout)
  clear() {
    ['flesk_token','flesk_refresh_token','flesk_user_id',
     'flesk_user_name','flesk_user_email'].forEach(k => localStorage.removeItem(k));
  },

  // Verificar se está logado
  isLoggedIn() {
    return !!localStorage.getItem('flesk_token');
  },

  // Obter token para requisições
  getToken() {
    return localStorage.getItem('flesk_token');
  },

  // Obter dados do usuário atual
  getUser() {
    return {
      id:    localStorage.getItem('flesk_user_id'),
      name:  localStorage.getItem('flesk_user_name'),
      email: localStorage.getItem('flesk_user_email'),
      full_name: localStorage.getItem('flesk_user_name')  // Alias para compatibilidade
    };
  }
};

// ============================================================
// HELPER: Fazer requisições ao backend com autenticação
// ============================================================
async function apiRequest(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  if (Session.isLoggedIn()) {
    headers['Authorization'] = `Bearer ${Session.getToken()}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${FLESK_CONFIG.BACKEND_URL}${endpoint}`, config);
    const data = await response.json();

    // Token expirado → redirecionar para login
    if (response.status === 401) {
      Session.clear();
      window.location.href = 'login.html';
      return null;
    }

    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    console.error(`Erro na requisição ${method} ${endpoint}:`, err);
    return { ok: false, success: false, message: 'Erro de conexão com o servidor' };
  }
}

// ============================================================
// AUTH — Cadastro e Login
// Substitui: backend/cadastro.php e backend/login.php
// ============================================================
const FleskAuth = {

  // POST /signup — Cadastrar novo usuário
  async signup(full_name, email, password) {
    const result = await apiRequest('POST', '/signup', { full_name, email, password });
    return result;
  },

  // POST /login — Autenticar usuário
  async login(email, password) {
    const result = await apiRequest('POST', '/login', { email, password });

    if (result && result.success) {
      // Salvar dados retornados do servidor
      Session.save(result.user, result.session.access_token, result.session.refresh_token);
    }

    return result;
  },

  // POST /logout — Encerrar sessão
  async logout() {
    await apiRequest('POST', '/logout');
    Session.clear();
    window.location.href = 'landing.html';
  },

  // Verificar autenticação (equivalente ao checkAuthentication do auth.js)
  checkAuth() {
    if (!Session.isLoggedIn()) {
      const publicPages = ['landing.html', 'login.html', 'cadastro.html', 'setup.html', ''];
      const currentPage = window.location.pathname.split('/').pop();

      if (!publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return false;
      }
    }
    return true;
  }
};

// ============================================================
// PROJETOS — CRUD completo
// Substitui todas as chamadas PHP de projetos
// ============================================================
const FleskProjects = {

  // GET /projects — Listar todos os projetos do usuário
  async list() {
    const result = await apiRequest('GET', '/projects');
    return result?.projects || [];
  },

  // GET /projects/:id — Detalhes de um projeto
  async get(id) {
    const result = await apiRequest('GET', `/projects/${id}`);
    return result?.project || null;
  },

  // POST /projects — Criar projeto
  async create({ name, description = '', status = 'planejamento', deadline = null, icon = '📁' }) {
    return await apiRequest('POST', '/projects', { name, description, status, deadline, icon });
  },

  // PUT /projects/:id — Atualizar projeto
  async update(id, fields) {
    return await apiRequest('PUT', `/projects/${id}`, fields);
  },

  // DELETE /projects/:id — Deletar projeto
  async delete(id) {
    return await apiRequest('DELETE', `/projects/${id}`);
  }
};

// ============================================================
// TAREFAS — CRUD completo
// ============================================================
const FleskTasks = {

  // GET /projects/:id/tasks
  async listByProject(projectId) {
    const result = await apiRequest('GET', `/projects/${projectId}/tasks`);
    return result?.tasks || [];
  },

  // POST /projects/:id/tasks
  async create(projectId, { title, description = '', status = 'todo', priority = 'media', due_date = null }) {
    return await apiRequest('POST', `/projects/${projectId}/tasks`, {
      title, description, status, priority, due_date
    });
  },

  // PUT /tasks/:id
  async update(taskId, fields) {
    return await apiRequest('PUT', `/tasks/${taskId}`, fields);
  },

  // DELETE /tasks/:id
  async delete(taskId) {
    return await apiRequest('DELETE', `/tasks/${taskId}`);
  }
};

// ============================================================
// INICIALIZAÇÃO AUTOMÁTICA
// Substitui o document.addEventListener do auth.js original
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  FleskAuth.checkAuth();

  // Preencher nome do usuário em elementos com data-user-name
  if (Session.isLoggedIn()) {
    const user = Session.getUser();
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.name;
    });
    document.querySelectorAll('[data-user-email]').forEach(el => {
      el.textContent = user.email;
    });
    document.querySelectorAll('[data-user-initials]').forEach(el => {
      const parts = user.name.split(' ');
      el.textContent = parts.length > 1
        ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
    });
  }

  // Botões de logout com data-action="logout"
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      FleskAuth.logout();
    });
  });
});


/* ============================================================
   EXEMPLOS DE USO NAS SUAS PÁGINAS HTML
   ============================================================

   --- LOGIN (login.html) ---
   
   document.getElementById('form-login').addEventListener('submit', async (e) => {
     e.preventDefault();
     const email    = document.getElementById('email').value;
     const password = document.getElementById('senha').value;
     
     const result = await FleskAuth.login(email, password);
     
     if (result.success) {
       App.toast('Login realizado!', 'success');
       window.location.href = 'projetos.html';
     } else {
       App.toast(result.message, 'error');
     }
   });

   --- CADASTRO (cadastro.html) ---
   
   document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
     e.preventDefault();
     const name     = document.getElementById('nome').value;
     const email    = document.getElementById('email').value;
     const password = document.getElementById('senha').value;
     
     const result = await FleskAuth.signup(name, email, password);
     
     if (result.success) {
       App.toast('Cadastro realizado! Faça login.', 'success');
       window.location.href = 'login.html';
     } else {
       App.toast(result.message, 'error');
     }
   });

   --- LISTAR PROJETOS (projetos.html) ---
   
   async function carregarProjetos() {
     const projetos = await FleskProjects.list();
     
     const container = document.getElementById('lista-projetos');
     container.innerHTML = '';
     
     projetos.forEach(p => {
       container.innerHTML += `
         <div class="project-card" data-id="${p.id}">
           <span>${p.icon}</span>
           <h3>${p.name}</h3>
           <p>${p.description}</p>
           <span class="status ${p.status}">${p.status}</span>
         </div>
       `;
     });
   }
   
   document.addEventListener('DOMContentLoaded', carregarProjetos);

   --- CRIAR PROJETO ---
   
   const result = await FleskProjects.create({
     name: 'Meu Novo Projeto',
     description: 'Descrição aqui',
     status: 'planejamento',
     deadline: '2025-12-31',
     icon: '🚀'
   });
   
   if (result.success) {
     App.toast('Projeto criado!', 'success');
   }

   --- EXIBIR USUÁRIO NO HTML ---
   
   Adicione atributos especiais nos seus elementos HTML:
   
   <span data-user-name></span>         → mostra o nome
   <span data-user-email></span>        → mostra o email
   <span data-user-initials></span>     → mostra iniciais (ex: "JS")
   <button data-action="logout">Sair</button>  → logout automático

============================================================ */
