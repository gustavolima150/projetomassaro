/* ==========================================
   AUTH.JS - Verificação de Autenticação Global
   ========================================== */

// Verificar autenticação e redirecionar se necessário
function checkAuthentication() {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('flesk_token');
  const userId = localStorage.getItem('user_id') || localStorage.getItem('flesk_user_id');

  // Se não está autenticado e não está em página pública
  if (!token || !userId) {
    const publicPages = ['landing.html', 'login.html', 'cadastro.html', 'setup.html', 'guia.html', 'saiba-mais.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!publicPages.includes(currentPage) && currentPage !== '') {
      window.location.href = 'login.html';
    }
  }
}

// Fazer logout
function logout() {
  // Limpar localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('flesk_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('flesk_user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('flesk_user_name');
  localStorage.removeItem('user_email');
  localStorage.removeItem('flesk_user_email');
  
  // Se estiver usando supabase-api.js
  if (typeof Session !== 'undefined') {
    Session.clear();
  }
  
  window.location.href = 'landing.html';
}

// Obter dados do usuário autenticado
function getCurrentUser() {
  return {
    id: localStorage.getItem('user_id') || localStorage.getItem('flesk_user_id'),
    name: localStorage.getItem('user_name') || localStorage.getItem('flesk_user_name'),
    email: localStorage.getItem('user_email') || localStorage.getItem('flesk_user_email'),
    token: localStorage.getItem('auth_token') || localStorage.getItem('flesk_token')
  };
}

// Executar verificação ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAuthentication);
} else {
  checkAuthentication();
}
