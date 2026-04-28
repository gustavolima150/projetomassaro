/* ==========================================
   PROMANAGE - storage.js
   Gerenciamento de dados no LocalStorage
   ========================================== */

const Storage = {
  // Chaves
  KEYS: {
    PROJECTS: 'pm_projects',
    TASKS: 'pm_tasks',
    MEMBERS: 'pm_members',
    PAIRS: 'pm_pairs',
    ACTIVITIES: 'pm_activities',
    USER: 'pm_user',
    SETTINGS: 'pm_settings'
  },

  // GET genérico
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage.get error:', e);
      return null;
    }
  },

  // SET genérico
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage.set error:', e);
      return false;
    }
  },

  // Projetos
  getProjects() {
    return this.get(this.KEYS.PROJECTS) || [];
  },
  setProjects(projects) {
    return this.set(this.KEYS.PROJECTS, projects);
  },
  getProject(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },
  addProject(project) {
    const projects = this.getProjects();
    project.id = 'proj_' + Date.now();
    project.createdAt = new Date().toISOString();
    project.progress = 0;
    projects.push(project);
    this.setProjects(projects);
    this.addActivity({
      type: 'project_created',
      text: `Novo projeto <strong>"${project.name}"</strong> foi criado`,
      icon: '➕',
      color: 'green'
    });
    return project;
  },
  updateProject(id, data) {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() };
      this.setProjects(projects);
      return projects[idx];
    }
    return null;
  },
  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.setProjects(projects);
    // Remover tarefas do projeto
    const tasks = this.getTasks().filter(t => t.projectId !== id);
    this.setTasks(tasks);
  },

  // Tarefas
  getTasks() {
    return this.get(this.KEYS.TASKS) || [];
  },
  setTasks(tasks) {
    return this.set(this.KEYS.TASKS, tasks);
  },
  getTasksByProject(projectId) {
    return this.getTasks().filter(t => t.projectId === projectId);
  },
  getKanbanTasks(projectId) {
    return this.getTasksByProject(projectId).filter(t => t.inKanban);
  },
  getBacklogTasks(projectId) {
    return this.getTasksByProject(projectId).filter(t => !t.inKanban);
  },
  addTask(task) {
    const tasks = this.getTasks();
    task.id = 'task_' + Date.now();
    task.createdAt = new Date().toISOString();
    task.comments = task.comments || [];
    tasks.push(task);
    this.setTasks(tasks);
    this.recalcProjectProgress(task.projectId);
    return task;
  },
  updateTask(id, data) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
      this.setTasks(tasks);
      this.recalcProjectProgress(tasks[idx].projectId);
      return tasks[idx];
    }
    return null;
  },
  deleteTask(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    const filtered = tasks.filter(t => t.id !== id);
    this.setTasks(filtered);
    if (task) this.recalcProjectProgress(task.projectId);
  },
  addComment(taskId, comment) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      comment.id = 'cmt_' + Date.now();
      comment.createdAt = new Date().toISOString();
      tasks[idx].comments = tasks[idx].comments || [];
      tasks[idx].comments.push(comment);
      this.setTasks(tasks);
      return comment;
    }
    return null;
  },

  // Recalcular progresso do projeto
  recalcProjectProgress(projectId) {
    if (!projectId) return;
    const tasks = this.getKanbanTasks(projectId);
    if (tasks.length === 0) return;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress = Math.round((done / tasks.length) * 100);
    this.updateProject(projectId, { progress });
  },

  // Membros da equipe
  getMembers() {
    return this.get(this.KEYS.MEMBERS) || [];
  },
  setMembers(members) {
    return this.set(this.KEYS.MEMBERS, members);
  },
  getMember(id) {
    return this.getMembers().find(m => m.id === id) || null;
  },
  addMember(member) {
    const members = this.getMembers();
    member.id = 'mbr_' + Date.now();
    member.createdAt = new Date().toISOString();
    member.status = member.status || 'online';
    members.push(member);
    this.setMembers(members);
    return member;
  },
  updateMember(id, data) {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx !== -1) {
      members[idx] = { ...members[idx], ...data };
      this.setMembers(members);
      return members[idx];
    }
    return null;
  },
  deleteMember(id) {
    const members = this.getMembers().filter(m => m.id !== id);
    this.setMembers(members);
  },

  // Duplas (Par programming)
  getPairs() {
    return this.get(this.KEYS.PAIRS) || [];
  },
  setPairs(pairs) {
    return this.set(this.KEYS.PAIRS, pairs);
  },
  addPair(pair) {
    const pairs = this.getPairs();
    pair.id = 'pair_' + Date.now();
    pair.createdAt = new Date().toISOString();
    pair.tasksCompleted = pair.tasksCompleted || 0;
    pair.avgTime = pair.avgTime || 0;
    pair.sessions = pair.sessions || [];
    pairs.push(pair);
    this.setPairs(pairs);
    return pair;
  },
  updatePair(id, data) {
    const pairs = this.getPairs();
    const idx = pairs.findIndex(p => p.id === id);
    if (idx !== -1) {
      pairs[idx] = { ...pairs[idx], ...data };
      this.setPairs(pairs);
      return pairs[idx];
    }
    return null;
  },
  deletePair(id) {
    const pairs = this.getPairs().filter(p => p.id !== id);
    this.setPairs(pairs);
  },

  // Atividades recentes
  getActivities() {
    return this.get(this.KEYS.ACTIVITIES) || [];
  },
  setActivities(activities) {
    return this.set(this.KEYS.ACTIVITIES, activities);
  },
  addActivity(activity) {
    const activities = this.getActivities();
    activity.id = 'act_' + Date.now();
    activity.createdAt = new Date().toISOString();
    activities.unshift(activity);
    // Manter apenas as 50 últimas
    if (activities.length > 50) activities.splice(50);
    this.set(this.KEYS.ACTIVITIES, activities);
    return activity;
  },

  // Usuário atual
  getUser() {
    return this.get(this.KEYS.USER) || { name: 'Você', email: 'usuario@flowtask.com', avatar: null };
  },
  setUser(user) {
    return this.set(this.KEYS.USER, user);
  },

  // Inicializar dados de demonstração
  initDemoData() {
    // Só inicializa se não houver dados
    if (this.getProjects().length > 0) return;

    const membersData = [
      { name: 'João Silva', role: 'Desenvolvedor Frontend', email: 'joao@email.com', status: 'online', initials: 'JS', color: '#6C63FF', phone: '(11) 9 1234-5678', bio: 'Especialista em React e Vue.js' },
      { name: 'Maria Santos', role: 'Desenvolvedora Backend', email: 'maria@email.com', status: 'busy', initials: 'MS', color: '#FF5252', phone: '(11) 9 2345-6789', bio: 'Especialista em Node.js e Python' },
      { name: 'Pedro Costa', role: 'UX Designer', email: 'pedro@email.com', status: 'online', initials: 'PC', color: '#4CAF50', phone: '(11) 9 3456-7890', bio: 'Design thinking e Figma' },
      { name: 'Ana Lima', role: 'Scrum Master', email: 'ana@email.com', status: 'online', initials: 'AL', color: '#FF9800', phone: '(11) 9 4567-8901', bio: 'Agile Coach certificada' },
      { name: 'Carlos Mendes', role: 'DevOps Engineer', email: 'carlos@email.com', status: 'offline', initials: 'CM', color: '#2196F3', phone: '(11) 9 5678-9012', bio: 'AWS e Kubernetes' }
    ];

    const members = [];
    membersData.forEach(m => {
      const member = this.addMember(m);
      members.push(member);
    });

    const projectsData = [
      { name: 'Projeto Alpha', description: 'Sistema de gestão integrada', status: 'andamento', scrumMaster: members[3].id, productOwner: members[0].id, team: [members[0].id, members[1].id, members[2].id, members[3].id], deadline: '2025-08-30', icon: '⚡', progress: 70 },
      { name: 'Website Beta', description: 'Site institucional completo', status: 'concluido', scrumMaster: members[2].id, productOwner: members[1].id, team: [members[1].id, members[2].id, members[4].id], deadline: '2025-05-15', icon: '🌐', progress: 100 },
      { name: 'App Gamma', description: 'Aplicativo mobile iOS/Android', status: 'atraso', scrumMaster: members[0].id, productOwner: members[3].id, team: [members[0].id, members[3].id, members[4].id], deadline: '2025-03-01', icon: '📱', progress: 45 },
      { name: 'Sistema Delta', description: 'Plataforma interna de BI', status: 'andamento', scrumMaster: members[1].id, productOwner: members[4].id, team: [members[1].id, members[2].id, members[4].id], deadline: '2025-09-15', icon: '📊', progress: 60 }
    ];

    const projects = [];
    projectsData.forEach(p => {
      const proj = this.addProject(p);
      projects.push(proj);
    });

    // Tarefas Kanban - Projeto Alpha
    const tasksAlpha = [
      { projectId: projects[0].id, name: 'Setup do ambiente Docker', description: 'Configurar containers para desenvolvimento', assigneeId: members[4].id, priority: 'alta', status: 'done', inKanban: true },
      { projectId: projects[0].id, name: 'Design do banco de dados', description: 'Modelagem ER e criação das tabelas', assigneeId: members[1].id, priority: 'alta', status: 'done', inKanban: true },
      { projectId: projects[0].id, name: 'API REST de usuários', description: 'CRUD completo com autenticação JWT', assigneeId: members[1].id, priority: 'alta', status: 'doing', inKanban: true },
      { projectId: projects[0].id, name: 'Interface de login', description: 'Tela de login e registro com validação', assigneeId: members[0].id, priority: 'media', status: 'doing', inKanban: true },
      { projectId: projects[0].id, name: 'Dashboard principal', description: 'Componentes e gráficos do dashboard', assigneeId: members[0].id, priority: 'media', status: 'todo', inKanban: true },
      { projectId: projects[0].id, name: 'Testes unitários', description: 'Cobertura mínima de 80%', assigneeId: members[4].id, priority: 'baixa', status: 'todo', inKanban: true },
      { projectId: projects[0].id, name: 'Documentação técnica', description: 'README e docs da API', assigneeId: members[2].id, priority: 'baixa', status: 'todo', inKanban: false },
      { projectId: projects[0].id, name: 'Integração de pagamento', description: 'Stripe e PagSeguro', assigneeId: members[1].id, priority: 'alta', status: 'todo', inKanban: false }
    ];

    tasksAlpha.forEach(t => this.addTask(t));

    // Tarefas - App Gamma
    const tasksGamma = [
      { projectId: projects[2].id, name: 'Wireframes das telas', description: 'UX/UI para todas as telas', assigneeId: members[2].id, priority: 'alta', status: 'done', inKanban: true },
      { projectId: projects[2].id, name: 'Configuração React Native', description: 'Setup inicial do projeto mobile', assigneeId: members[0].id, priority: 'alta', status: 'doing', inKanban: true },
      { projectId: projects[2].id, name: 'Tela de onboarding', description: 'Fluxo de introdução ao app', assigneeId: members[0].id, priority: 'media', status: 'todo', inKanban: true }
    ];

    tasksGamma.forEach(t => this.addTask(t));

    // Duplas de programação
    const pairsData = [
      { member1Id: members[0].id, member2Id: members[1].id, projectId: projects[0].id, tasksCompleted: 12, avgTime: 3.5, description: 'Frontend + Backend Integration' },
      { member1Id: members[2].id, member2Id: members[3].id, projectId: projects[2].id, tasksCompleted: 7, avgTime: 2.8, description: 'Design + Product Owner Review' },
      { member1Id: members[1].id, member2Id: members[4].id, projectId: projects[3].id, tasksCompleted: 5, avgTime: 4.2, description: 'Backend + DevOps Pipeline' }
    ];

    pairsData.forEach(p => this.addPair(p));

    // Atividades
    const activitiesData = [
      { type: 'task_moved', text: `<strong>João</strong> moveu uma tarefa para <strong>"Concluído"</strong>`, meta: 'Projeto Alpha • Há 5 minutos', icon: '✅', color: 'green' },
      { type: 'project_created', text: `Novo projeto <strong>"Website Beta"</strong> foi criado`, meta: 'Há 1 hora', icon: '➕', color: 'blue' },
      { type: 'comment', text: `<strong>Maria</strong> comentou em <strong>"App Gamma"</strong>`, meta: 'Há 2 horas', icon: '💬', color: 'purple' },
      { type: 'progress', text: `<strong>Pedro</strong> atualizou o progresso de <strong>"Sistema Delta"</strong>`, meta: 'Há 3 horas', icon: '📊', color: 'orange' }
    ];

    // Limpar atividades automáticas e adicionar as de demo
    this.set(this.KEYS.ACTIVITIES, []);
    activitiesData.forEach(a => this.addActivity(a));
  }
};
