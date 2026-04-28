/* ==========================================
   THEME.JS - Gerenciador de Tema Claro/Escuro Global
   Persiste preferência em localStorage
   ========================================== */

const Theme = {
  STORAGE_KEY: 'theme-preference',

  // Inicializar tema ao carregar a página
  init() {
    const savedTheme = this.getPreference();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.apply(theme);
  },

  // Obter tema salvo
  getPreference() {
    return localStorage.getItem(this.STORAGE_KEY);
  },

  // Obter tema atual
  getCurrent() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  // Aplicar tema
  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.STORAGE_KEY, 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.STORAGE_KEY, 'light');
    }
  },

  // Alternar tema
  toggle() {
    const current = this.getCurrent();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.apply(newTheme);
    return newTheme;
  },

  // Obter ícone do tema
  getIcon() {
    return this.getCurrent() === 'dark' ? '☀️' : '🌙';
  }
};

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});
