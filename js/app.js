/* ==========================================
   PROMANAGE - app.js
   Utilitários e funções compartilhadas
   ========================================== */

// === UTILITÁRIOS GERAIS ===

const App = {

  // Formatar data relativa
  timeAgo(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} horas`;
    if (diff < 604800) return `Há ${Math.floor(diff / 86400)} dias`;
    return date.toLocaleDateString('pt-BR');
  },

  // Formatar data
  formatDate(isoDate) {
    if (!isoDate) return '-';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  // Calcular dias restantes
  daysUntil(isoDate) {
    if (!isoDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(isoDate + 'T00:00:00');
    const diff = Math.ceil((target - today) / 86400000);
    return diff;
  },

  // Formatar prazo
  formatDeadline(isoDate) {
    const days = this.daysUntil(isoDate);
    if (days === null) return { text: '-', class: 'normal' };
    if (days < 0) return { text: `${Math.abs(days)}d atraso`, class: 'overdue' };
    if (days === 0) return { text: 'Hoje', class: 'today' };
    if (days === 1) return { text: 'Amanhã', class: 'tomorrow' };
    if (days <= 7) return { text: `${days} dias`, class: 'tomorrow' };
    return { text: this.formatDate(isoDate), class: 'normal' };
  },

  // Gerar iniciais
  getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  // Cores dos avatares
  avatarColors: ['#6C63FF','#FF5252','#4CAF50','#FF9800','#2196F3','#E91E63','#9C27B0','#00BCD4'],
  getAvatarColor(str) {
    let hash = 0;
    for (let c of (str || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  },

  // Status label e classe
  statusInfo(status) {
    const map = {
      andamento: { label: '🔵 Em Andamento', cls: 'andamento' },
      concluido: { label: '✅ Concluído', cls: 'concluido' },
      atraso: { label: '🔴 Em Atraso', cls: 'atraso' },
      planejamento: { label: '🟡 Planejamento', cls: 'planejamento' },
      pausado: { label: '⏸ Pausado', cls: 'pausado' }
    };
    return map[status] || { label: status, cls: 'pausado' };
  },

  // Toast notifications
  toast(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Confirmar ação
  confirm(msg, onConfirm) {
    if (window.confirm(msg)) onConfirm();
  },

  // Highlight de busca
  highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:#EEF0FF;color:#6C63FF;border-radius:3px;padding:0 2px">$1</mark>');
  },

  // ID da query string
  getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  // Obter mensagem de saudação baseada no horário
  getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else if (hour >= 18 && hour < 24) {
      return 'Boa noite';
    } else {
      return 'Boa madrugada';
    }
  },

  // Redirecionar
  redirect(url) {
    window.location.href = url;
  },

  // Gerar avatar HTML
  avatarHtml(name, size = 28, fontSize = 10) {
    const initials = this.getInitials(name);
    const color = this.getAvatarColor(name);
    return `<div class="team-avatar" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color},${color}cc);font-size:${fontSize}px;">${initials}</div>`;
  },

  // Donut Chart SVG
  donutChart(pct, size = 100, strokeWidth = 10, color = '#6C63FF') {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const dash = (pct / 100) * circumference;
    const dashArray = pct >= 100 ? `${circumference} ${circumference}` : `${dash} ${circumference}`;
    const animation = pct >= 100 ? 'animation: spin360 1.5s ease-in-out;' : '';
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#F0F0F0" stroke-width="${strokeWidth}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${dashArray}" stroke-dashoffset="0"
          stroke-linecap="round" style="transition:stroke-dasharray 0.6s ease; transform: rotate(-90deg); transform-origin: 50% 50%; ${animation}"/>
      </svg>
      <style>
        @keyframes spin360 {
          0% { transform: rotate(-90deg); }
          100% { transform: rotate(270deg); }
        }
      </style>`;
  },

  // Inicializar sidebar ativa
  initSidebar() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      if (item.dataset.page === current) {
        item.classList.add('active');
      }
    });
  },

  // Inicializar modal
  initModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal(overlayId);
    });
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal(overlayId));
  },

  openModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.classList.add('active');
  },

  closeModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.classList.remove('active');
  },

  // Inicializar tabs
  initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const content = document.getElementById(target);
        if (content) content.classList.add('active');
      });
    });
  },

  // Hint bar fechar
  initHintBar() {
    const bar = document.getElementById('hint-bar');
    const closeBtn = document.getElementById('hint-close');
    if (!bar || !closeBtn) return;
    if (localStorage.getItem('pm_hint_closed')) { bar.style.display = 'none'; return; }
    closeBtn.addEventListener('click', () => {
      bar.style.display = 'none';
      localStorage.setItem('pm_hint_closed', '1');
    });
  },

  // Mobile menu toggle
  initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  },

  // Progress bar color
  progressColor(pct) {
    if (pct >= 100) return 'green';
    if (pct >= 50) return '';
    if (pct >= 25) return 'orange';
    return 'red';
  },

  // Alternar tema (claro/escuro)
  toggleTheme() {
    const newTheme = Theme.toggle();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = Theme.getIcon();
    }
  }
};

// === COMPONENTES COMPARTILHADOS ===

// Sidebar HTML
function getSidebarHTML(activePage) {
  const user = Storage.getUser();
  const pages = [
    { page: 'index.html', icon: '🏠', label: 'Início' },
    { page: 'projetos.html', icon: '📁', label: 'Projetos' },
    { page: 'meu-trabalho.html', icon: '⭐', label: 'Meu Trabalho' },
    { page: 'equipe.html', icon: '👥', label: 'Equipe' },
    { page: 'produtividade.html', icon: '⚡', label: 'Produtividade' },
    { page: 'notificacoes.html', icon: '🔔', label: 'Notificações' }
  ];

  const navItems = pages.map(p => `
    <a href="${p.page}" class="nav-item ${activePage === p.page ? 'active' : ''}" data-page="${p.page}">
      <span class="nav-icon">${p.icon}</span>
      <span>${p.label}</span>
    </a>`).join('');

  return `
    <div class="sidebar-logo">
      <div class="logo-icon">🚀</div>
      <span class="logo-text">Flowtask</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Menu Principal</div>
      ${navItems}
    </nav>
    <div class="sidebar-promo">
      <div class="promo-emoji">🚀</div>
      <div class="promo-title">Gestão ágil, simples e eficiente</div>
      <div class="promo-desc">Organize projetos, colabore com sua equipe e entregue resultados de forma ágil.</div>
      <a href="saiba-mais.html" class="promo-btn">Saiba mais</a>
    </div>`;
}

// Top bar HTML
function getTopbarHTML(title, subtitle, showSearch = true) {
  const user = Storage.getUser();
  const isDarkMode = Theme.getCurrent() === 'dark';
  const avatarHtml = user.avatar && user.avatar.startsWith('data:') 
    ? `<img src="${user.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;cursor:pointer;" title="${user.name}" onclick="window.location.href='perfil.html'"/>`
    : `<div class="user-avatar" title="${user.name}" onclick="window.location.href='perfil.html'" style="cursor:pointer;">${user.avatar || App.getInitials(user.name)}</div>`;
  
  return `
    <div class="topbar-left">
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    ${showSearch ? `
    <div class="topbar-search">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Buscar projetos, tarefas..." id="global-search"/>
    </div>` : '<div></div>'}
    <div class="topbar-right">
      <button class="topbar-icon-btn" id="theme-toggle" title="Alternar tema" onclick="App.toggleTheme()">
        ${isDarkMode ? '☀️' : '🌙'}
      </button>
      <button class="topbar-icon-btn" title="Ajuda" onclick="location.href='guia.html'">❓</button>
      ${avatarHtml}
    </div>`;
}

// Toast container
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
});
