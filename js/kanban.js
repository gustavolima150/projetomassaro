/* ==========================================
   PROMANAGE - kanban.js
   Drag and Drop Kanban Board
   ========================================== */

const Kanban = {
  projectId: null,
  draggedTask: null,
  draggedEl: null,

  // Inicializar board
  init(projectId) {
    this.projectId = projectId;
    this.render();
    this.bindAddTask();
  },

  // Renderizar board completo
  render() {
    const board = document.getElementById('kanban-board');
    if (!board) return;

    const columns = [
      { id: 'todo', label: 'A Fazer', dot: 'todo', icon: '📋' },
      { id: 'doing', label: 'Em Andamento', dot: 'doing', icon: '🔄' },
      { id: 'done', label: 'Concluído', dot: 'done', icon: '✅' }
    ];

    const tasks = Storage.getKanbanTasks(this.projectId);

    board.innerHTML = columns.map(col => {
      const colTasks = tasks.filter(t => t.status === col.id);
      return `
        <div class="kanban-col" data-col="${col.id}" id="col-${col.id}">
          <div class="kanban-col-header">
            <div class="kanban-col-title">
              <span class="col-dot ${col.dot}"></span>
              <span>${col.icon} ${col.label}</span>
            </div>
            <span class="col-count" id="count-${col.id}">${colTasks.length}</span>
          </div>
          <div class="kanban-tasks" id="tasks-${col.id}" data-col="${col.id}">
            ${colTasks.map(t => this.taskCardHTML(t)).join('')}
            <div class="kanban-drop-placeholder" style="display:none;height:80px;border:2px dashed #6C63FF;border-radius:12px;background:#EEF0FF;"></div>
          </div>
          <button class="btn btn-ghost btn-sm w-full mt-4" onclick="Kanban.openAddTask('${col.id}')" style="border:1.5px dashed var(--border);border-radius:10px;color:var(--text-secondary);justify-content:center;">
            + Adicionar tarefa
          </button>
        </div>`;
    }).join('');

    this.bindDragDrop();
  },

  // HTML de um card de tarefa
  taskCardHTML(task) {
    const members = Storage.getMembers();
    const assignee = members.find(m => m.id === task.assigneeId);
    const initials = assignee ? App.getInitials(assignee.name) : '?';
    const color = assignee ? App.getAvatarColor(assignee.name) : '#6C63FF';

    return `
      <div class="kanban-task fade-in" draggable="true" data-id="${task.id}" data-status="${task.status}">
        <div class="task-priority ${task.priority || 'media'}"></div>
        <div class="task-name">${task.name}</div>
        ${task.description ? `<div class="task-desc">${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}</div>` : ''}
        <div class="task-footer">
          <div class="flex items-center gap-2">
            <span class="priority-tag ${task.priority || 'media'}">${task.priority || 'média'}</span>
            ${task.comments && task.comments.length ? `<span style="font-size:10px;color:var(--text-muted)">💬 ${task.comments.length}</span>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <div class="task-assignee" style="background:linear-gradient(135deg,${color},${color}cc)" title="${assignee ? assignee.name : 'Não atribuído'}">${initials}</div>
            <div class="task-actions">
              <button class="task-action-btn" onclick="Kanban.openTaskDetail('${task.id}')" title="Detalhes">👁</button>
              <button class="task-action-btn" onclick="Kanban.deleteTask('${task.id}')" title="Excluir">🗑</button>
            </div>
          </div>
        </div>
      </div>`;
  },

  // Bind drag and drop
  bindDragDrop() {
    const tasks = document.querySelectorAll('.kanban-task');
    const cols = document.querySelectorAll('.kanban-tasks');

    tasks.forEach(task => {
      task.addEventListener('dragstart', (e) => {
        this.draggedEl = task;
        this.draggedTask = task.dataset.id;
        task.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.dataset.id);
      });

      task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
        document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));
        document.querySelectorAll('.kanban-drop-placeholder').forEach(p => p.style.display = 'none');
        this.draggedEl = null;
        this.draggedTask = null;
      });
    });

    cols.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const colEl = col.closest('.kanban-col');
        document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
        if (colEl) colEl.classList.add('drag-over');

        // Mostrar placeholder
        const placeholder = col.querySelector('.kanban-drop-placeholder');
        if (placeholder) placeholder.style.display = 'block';
      });

      col.addEventListener('dragleave', (e) => {
        const colEl = col.closest('.kanban-col');
        if (colEl && !colEl.contains(e.relatedTarget)) {
          colEl.classList.remove('drag-over');
          const placeholder = col.querySelector('.kanban-drop-placeholder');
          if (placeholder) placeholder.style.display = 'none';
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTask;
        const newStatus = col.dataset.col;

        if (taskId && newStatus) {
          const task = Storage.getTasks().find(t => t.id === taskId);
          if (task && task.status !== newStatus) {
            Storage.updateTask(taskId, { status: newStatus });

            const statusLabels = { todo: 'A Fazer', doing: 'Em Andamento', done: 'Concluído' };
            Storage.addActivity({
              type: 'task_moved',
              text: `Tarefa <strong>"${task.name}"</strong> movida para <strong>"${statusLabels[newStatus]}"</strong>`,
              icon: '🔄',
              color: 'blue'
            });

            App.toast(`Tarefa movida para "${statusLabels[newStatus]}"`, 'success');
          }
        }

        document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
        this.render();
        this.updateProgress();
      });
    });
  },

  // Bind botão adicionar task
  bindAddTask() {
    App.initModal('modal-task');
    App.initModal('modal-task-detail');

    const form = document.getElementById('form-task');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTask(form);
      });
    }

    const commentForm = document.getElementById('form-comment');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveComment(commentForm);
      });
    }
  },

  // Abrir modal de adicionar tarefa
  openAddTask(status = 'todo') {
    const form = document.getElementById('form-task');
    if (form) {
      form.reset();
      form.dataset.taskId = '';
      form.dataset.status = status;
    }

    document.getElementById('modal-task-title').textContent = 'Nova Tarefa';

    // Popular select de responsável
    const select = document.getElementById('task-assignee');
    if (select) {
      const members = Storage.getMembers();
      select.innerHTML = '<option value="">Selecionar responsável...</option>' +
        members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    // Status select
    const statusSel = document.getElementById('task-status');
    if (statusSel) statusSel.value = status;

    App.openModal('modal-task');
  },

  // Salvar tarefa
  saveTask(form) {
    const taskId = form.dataset.taskId;
    const data = {
      name: document.getElementById('task-name').value.trim(),
      description: document.getElementById('task-desc').value.trim(),
      assigneeId: document.getElementById('task-assignee').value,
      priority: document.getElementById('task-priority').value,
      status: document.getElementById('task-status').value,
      projectId: this.projectId,
      inKanban: true
    };

    if (!data.name) { App.toast('Nome da tarefa é obrigatório', 'error'); return; }

    if (taskId) {
      Storage.updateTask(taskId, data);
      App.toast('Tarefa atualizada!', 'success');
    } else {
      Storage.addTask(data);
      App.toast('Tarefa criada!', 'success');
    }

    App.closeModal('modal-task');
    this.render();
    this.updateProgress();
  },

  // Abrir detalhes da tarefa
  openTaskDetail(taskId) {
    const task = Storage.getTasks().find(t => t.id === taskId);
    if (!task) return;

    const members = Storage.getMembers();
    const assignee = members.find(m => m.id === task.assigneeId);

    const statusLabels = { todo: '📋 A Fazer', doing: '🔄 Em Andamento', done: '✅ Concluído' };
    const priorityClass = task.priority || 'media';

    const detailContent = document.getElementById('task-detail-content');
    if (detailContent) {
      detailContent.innerHTML = `
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="priority-tag ${priorityClass}">${task.priority || 'média'}</span>
            <span class="status-badge ${task.status === 'done' ? 'concluido' : task.status === 'doing' ? 'andamento' : 'planejamento'}" style="font-size:11px;padding:3px 10px;">
              ${statusLabels[task.status] || task.status}
            </span>
          </div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">${task.name}</h3>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${task.description || 'Sem descrição.'}</p>
        </div>
        ${assignee ? `
        <div class="flex items-center gap-2 mb-4 p-3" style="background:var(--bg);border-radius:10px;">
          <div class="team-avatar" style="width:32px;height:32px;background:linear-gradient(135deg,${App.getAvatarColor(assignee.name)},${App.getAvatarColor(assignee.name)}cc);font-size:12px;">
            ${App.getInitials(assignee.name)}
          </div>
          <div>
            <div style="font-size:12px;font-weight:600;">${assignee.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">${assignee.role || 'Responsável'}</div>
          </div>
        </div>` : ''}
        
        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <div style="font-size:13px;font-weight:700;">💬 Comentários (${(task.comments || []).length})</div>
          </div>
          <div id="comments-list">
            ${(task.comments || []).map(c => `
              <div class="activity-item" style="padding:10px;background:var(--bg);border-radius:10px;margin-bottom:8px;border:none;">
                <div class="activity-avatar" style="width:28px;height:28px;font-size:10px;">${App.getInitials(c.author)}</div>
                <div class="activity-info">
                  <div style="font-size:12px;font-weight:600;">${c.author}</div>
                  <div style="font-size:12px;color:var(--text-secondary);">${c.text}</div>
                  <div style="font-size:10px;color:var(--text-muted);">${App.timeAgo(c.createdAt)}</div>
                </div>
              </div>`).join('') || '<p style="font-size:12px;color:var(--text-muted);">Nenhum comentário ainda.</p>'}
          </div>
          <form id="form-comment" data-task-id="${task.id}" style="margin-top:12px;">
            <div class="flex gap-2">
              <input class="form-input" id="comment-text" placeholder="Adicionar comentário..." style="flex:1;padding:8px 12px;font-size:12px;" required/>
              <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
            </div>
          </form>
        </div>

        <div class="flex gap-2 justify-between">
          <button class="btn btn-outline btn-sm" onclick="Kanban.editTask('${task.id}')">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="Kanban.deleteTask('${task.id}');App.closeModal('modal-task-detail')">🗑 Excluir</button>
        </div>`;
    }

    // Re-bind comment form
    setTimeout(() => {
      const cf = document.getElementById('form-comment');
      if (cf) {
        cf.onsubmit = (e) => {
          e.preventDefault();
          this.saveComment(cf);
        };
      }
    }, 100);

    App.openModal('modal-task-detail');
  },

  // Salvar comentário
  saveComment(form) {
    const taskId = form.dataset.taskId;
    const textEl = document.getElementById('comment-text');
    const user = Storage.getUser();

    if (!textEl.value.trim()) return;

    Storage.addComment(taskId, { author: user.name, text: textEl.value.trim() });
    textEl.value = '';
    this.openTaskDetail(taskId);
    App.toast('Comentário adicionado!', 'success');
  },

  // Editar tarefa
  editTask(taskId) {
    App.closeModal('modal-task-detail');
    const task = Storage.getTasks().find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('modal-task-title').textContent = 'Editar Tarefa';
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-desc').value = task.description || '';
    document.getElementById('task-priority').value = task.priority || 'media';
    document.getElementById('task-status').value = task.status;

    const select = document.getElementById('task-assignee');
    const members = Storage.getMembers();
    select.innerHTML = '<option value="">Selecionar responsável...</option>' +
      members.map(m => `<option value="${m.id}" ${m.id === task.assigneeId ? 'selected' : ''}>${m.name}</option>`).join('');

    const form = document.getElementById('form-task');
    form.dataset.taskId = taskId;

    App.openModal('modal-task');
  },

  // Deletar tarefa
  deleteTask(taskId) {
    App.confirm('Excluir esta tarefa?', () => {
      Storage.deleteTask(taskId);
      App.toast('Tarefa excluída', 'warning');
      this.render();
      this.updateProgress();
    });
  },

  // Atualizar barra de progresso do projeto
  updateProgress() {
    const tasks = Storage.getKanbanTasks(this.projectId);
    // Recalcular o progresso no storage
    Storage.recalcProjectProgress(this.projectId);
    
    if (tasks.length === 0) {
      // Se não há tarefas no Kanban, setar progresso para 0
      Storage.updateProject(this.projectId, { progress: 0 });
      return;
    }
    
    const done = tasks.filter(t => t.status === 'done').length;
    const pct = Math.round((done / tasks.length) * 100);

    // Garantir que quando todas estão feitas, o progresso seja 100%
    const finalProgress = done === tasks.length ? 100 : pct;
    
    // Atualizar no storage
    Storage.updateProject(this.projectId, { progress: finalProgress });

    // Tentar atualizar elementos na página se existirem
    const fill = document.getElementById('project-progress-fill');
    const pctEl = document.getElementById('project-progress-pct');
    if (fill) fill.style.width = finalProgress + '%';
    if (pctEl) pctEl.textContent = finalProgress + '%';
  }
};
