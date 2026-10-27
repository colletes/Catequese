/**
 * ============================================================================
 * KANBAN ENGINE & GESTÃO DE LISTAS DE TAREFAS • PASTORAL DA CATEQUESE (SICM)
 * ============================================================================
 * 
 * Funcionalidades:
 * - Criação, edição e exclusão de quadros (Kanbans / Listas de Tarefas)
 * - Restrição de criação: Master Admin, Coordenação Geral e Vice-Coordenação
 * - Colunas customizáveis (padrão: A fazer, Em progresso, Bloqueado, Concluído)
 * - Matriz de permissão dupla por quadro (por Papel e por Usuário Individual: Visualizar vs Editar)
 * - Tickets com Título, Descrição Rich Text (Quill.js), Status, Prioridade, Deadline, Criador e Responsável
 * - Suporte a anexos de arquivos (PDFs, imagens, DOCX, XLSX) salvos no Firebase Storage
 * - Cores personalizadas para os tickets com cálculo dinâmico de contraste (WCAG/YIQ)
 * - Arrastar e soltar (Drag & Drop) e seletor rápido para mobile
 * - Exclusão restrita ao Criador do ticket e ao Master Admin
 * - Acompanhamento de tickets (seguidores) com notificações na Central de Notificações e e-mail
 * - Prevenção ativa de sobrescrita e integridade no Firestore (merge: true, dirty-check)
 */

(function (window) {
  'use strict';

  // Cores de paleta rápida predefinidas (tons elegantes, pastorais e modernos)
  const PRESET_COLORS = [
    { name: 'Branco Clássico', hex: '#ffffff', border: '#e2e8f0' },
    { name: 'Azul Céu Pastoral', hex: '#eff6ff', border: '#bfdbfe' },
    { name: 'Verde Esperança', hex: '#f0fdf4', border: '#bbf7d0' },
    { name: 'Âmbar Litúrgico', hex: '#fefce8', border: '#fef08a' },
    { name: 'Laranja Suave', hex: '#fff7ed', border: '#fed7aa' },
    { name: 'Rosa Delicado', hex: '#fdf2f8', border: '#fbcfe8' },
    { name: 'Roxo Quaresmal', hex: '#faf5ff', border: '#e9d5ff' },
    { name: 'Azul Meia-Noite', hex: '#1e293b', border: '#334155' },
    { name: 'Grafite Escuro', hex: '#0f172a', border: '#1e293b' },
    { name: 'Vinho Mariano', hex: '#4c0519', border: '#881337' }
  ];

  const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'A fazer', color: '#64748b' },
    { id: 'in_progress', title: 'Em progresso', color: '#0284c7' },
    { id: 'blocked', title: 'Bloqueado', color: '#e11d48' },
    { id: 'done', title: 'Concluído', color: '#16a34a' }
  ];

  const PRIORITIES = [
    { id: 'baixa', label: 'Baixa', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', border: 'border-slate-300' },
    { id: 'media', label: 'Média', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', border: 'border-blue-300' },
    { id: 'alta', label: 'Alta', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', border: 'border-amber-300' },
    { id: 'urgente', label: 'Urgente', badgeBg: 'bg-rose-100', badgeText: 'text-rose-800', border: 'border-rose-400' }
  ];

  // Cálculo de contraste dinâmico de texto (WCAG / YIQ)
  function getContrastColor(hexColor) {
    if (!hexColor) return '#0f172a';
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return '#0f172a';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#0f172a' : '#ffffff';
  }

  // Formatação de data/hora relativa para comentários e histórico
  function formatRelativeTime(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return 'agora mesmo';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `há ${diffMin} min`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `há ${diffHour} h`;
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays < 7) return `há ${diffDays} d`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  // Sanitização e detecção inteligente de URLs clicáveis em comentários
  function formatCommentText(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 underline font-medium break-all">${url}</a>`);
    return safe.replace(/\n/g, '<br>');
  }

  const KanbanEngine = {
    boards: [],
    currentBoardId: null,
    tickets: [],
    notifications: [],
    ticketActivities: [],
    quillInstance: null,
    unsubscribeBoards: null,
    unsubscribeTickets: null,
    unsubscribeNotifications: null,
    unsubscribeActivities: null,
    currentActivityTab: 'all', // 'all' | 'comments' | 'history'
    activeTicketEditorId: null,
    isTicketFormDirty: false,
    currentTicketAttachments: [],
    initialized: false,

    // Inicialização do módulo
    init: function () {
      if (this.initialized) return;
      this.initialized = true;
      this.setupQuillEditor();
      this.subscribeBoards();
      this.subscribeNotifications();
      this.setupEventListeners();
    },

    // Retorna a instância do Firestore
    getDb: function () {
      if (window.firebaseDb) return window.firebaseDb;
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        window.firebaseDb = firebase.firestore();
        return window.firebaseDb;
      }
      return null;
    },

    // Retorna a instância do Firebase Storage
    getStorage: function () {
      if (typeof firebase !== 'undefined' && firebase.storage) {
        return firebase.storage();
      }
      return null;
    },

    // Retorna os dados do usuário autenticado no sistema
    getCurrentUser: function () {
      let email = null;
      let displayName = null;
      let role = null;

      if (window.ICM_CONFIG && window.ICM_CONFIG.getCurrentUser) {
        const u = window.ICM_CONFIG.getCurrentUser();
        if (u) {
          email = u.email;
          displayName = u.displayName || u.nome;
          role = u.role;
        }
      }

      if (!email && typeof firebase !== 'undefined' && firebase.auth) {
        const faUser = firebase.auth().currentUser;
        if (faUser) {
          email = faUser.email;
          displayName = displayName || faUser.displayName;
        }
      }

      if (email && !role && window.ICM_CONFIG && window.ICM_CONFIG.determineUserRole) {
        role = window.ICM_CONFIG.determineUserRole(email);
      }

      return {
        email: email ? email.trim().toLowerCase() : '',
        displayName: displayName || (email ? email.split('@')[0] : 'Usuário'),
        role: role || (window.ICM_CONFIG && window.ICM_CONFIG.ROLES ? window.ICM_CONFIG.ROLES.PENDENTE : 'pendente')
      };
    },

    // Verifica se o usuário logado é Master Admin, Coordenadora Geral ou Vice
    isCoordOrAdmin: function () {
      const user = this.getCurrentUser();
      if (!user.email) return false;
      if (window.ICM_CONFIG && window.ICM_CONFIG.isCoordOrAdmin) {
        return window.ICM_CONFIG.isCoordOrAdmin(user.email);
      }
      const roles = (window.ICM_CONFIG && window.ICM_CONFIG.ROLES) || {};
      return user.role === roles.MASTER_ADMIN ||
             user.role === roles.COORD_GERAL ||
             user.role === roles.VICE_COORD_GERAL;
    },

    // Verifica se o usuário é Master Admin
    isMasterAdmin: function () {
      const user = this.getCurrentUser();
      if (!user.email) return false;
      const adminEmail = (window.ICM_CONFIG && window.ICM_CONFIG.MASTER_ADMIN_EMAIL) || 'colletes@gmail.com';
      return user.email.toLowerCase() === adminEmail.toLowerCase() ||
             user.role === (window.ICM_CONFIG && window.ICM_CONFIG.ROLES && window.ICM_CONFIG.ROLES.MASTER_ADMIN);
    },

    // Verifica permissão de VISUALIZAÇÃO em um quadro
    canViewBoard: function (board) {
      if (!board) return false;
      if (this.isCoordOrAdmin()) return true;
      const user = this.getCurrentUser();
      if (!user.email) return false;

      // Permissão por perfil/papel
      const viewRoles = board.allowedViewRoles || [];
      const editRoles = board.allowedEditRoles || [];
      if (viewRoles.includes(user.role) || editRoles.includes(user.role)) return true;

      // Permissão por e-mail de usuário individual
      const viewUsers = (board.allowedViewUsers || []).map(e => (e || '').toLowerCase().trim());
      const editUsers = (board.allowedEditUsers || []).map(e => (e || '').toLowerCase().trim());
      if (viewUsers.includes(user.email) || editUsers.includes(user.email)) return true;

      return false;
    },

    // Verifica permissão de EDIÇÃO em um quadro
    canEditBoard: function (board) {
      if (!board) return false;
      if (this.isCoordOrAdmin()) return true;
      const user = this.getCurrentUser();
      if (!user.email) return false;

      const editRoles = board.allowedEditRoles || [];
      if (editRoles.includes(user.role)) return true;

      const editUsers = (board.allowedEditUsers || []).map(e => (e || '').toLowerCase().trim());
      if (editUsers.includes(user.email)) return true;

      return false;
    },

    // Verifica se o usuário pode apagar um ticket (apenas Criador e Master Admin)
    canDeleteTicket: function (ticket) {
      if (!ticket) return false;
      if (this.isMasterAdmin()) return true;
      const user = this.getCurrentUser();
      if (!user.email || !ticket.creatorEmail) return false;
      return user.email.toLowerCase() === ticket.creatorEmail.toLowerCase();
    },

    // ========================================================================
    // SINCRONIZAÇÃO EM TEMPO REAL COM FIRESTORE
    // ========================================================================

    subscribeBoards: function () {
      const db = this.getDb();
      if (!db) {
        console.warn('KanbanEngine: Firestore não disponível para escuta de quadros.');
        return;
      }

      if (this.unsubscribeBoards) this.unsubscribeBoards();

      this.unsubscribeBoards = db.collection('kanban_boards').onSnapshot(snap => {
        const loaded = [];
        snap.forEach(doc => {
          loaded.push({ id: doc.id, ...doc.data() });
        });

        // Ordena por data de criação / nome
        loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        this.boards = loaded;

        // Atualiza visibilidade do menu e renderização
        this.updateSidebarVisibility();
        this.renderBoardSelector();

        // Se nenhum quadro estiver selecionado, seleciona o primeiro acessível
        const userAccessibleBoards = this.boards.filter(b => this.canViewBoard(b));
        if (!this.currentBoardId && userAccessibleBoards.length > 0) {
          this.switchBoard(userAccessibleBoards[0].id);
        } else if (this.currentBoardId && !this.boards.some(b => b.id === this.currentBoardId)) {
          this.switchBoard(userAccessibleBoards[0] ? userAccessibleBoards[0].id : null);
        } else if (this.currentBoardId) {
          this.renderActiveBoardHeader();
        }
      }, err => {
        console.warn('KanbanEngine: Erro ao sincronizar quadros:', err);
      });
    },

    subscribeTickets: function (boardId) {
      if (this.unsubscribeTickets) {
        this.unsubscribeTickets();
        this.unsubscribeTickets = null;
      }

      if (!boardId) {
        this.tickets = [];
        this.renderKanbanColumns();
        return;
      }

      const db = this.getDb();
      if (!db) return;

      this.unsubscribeTickets = db.collection('kanban_tickets')
        .where('boardId', '==', boardId)
        .onSnapshot(snap => {
          const loaded = [];
          snap.forEach(doc => {
            loaded.push({ id: doc.id, ...doc.data() });
          });

          // Se o usuário estiver com o modal de edição de um ticket aberto e com alterações pendentes,
          // não sobrescreve o formulário ativo para evitar perda de dados digitados
          this.tickets = loaded;
          this.renderKanbanColumns();
        }, err => {
          console.warn('KanbanEngine: Erro ao sincronizar tickets do quadro:', err);
        });
    },

    subscribeNotifications: function () {
      const db = this.getDb();
      const user = this.getCurrentUser();
      if (!db || !user.email) return;

      if (this.unsubscribeNotifications) this.unsubscribeNotifications();

      this.unsubscribeNotifications = db.collection('kanban_notifications')
        .where('recipientEmail', '==', user.email.toLowerCase())
        .onSnapshot(snap => {
          const loaded = [];
          snap.forEach(doc => {
            loaded.push({ id: doc.id, ...doc.data() });
          });
          loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          this.notifications = loaded;
          this.updateNotificationsUI();
        }, err => {
          console.warn('KanbanEngine: Erro ao sincronizar notificações de tarefas:', err);
        });
    },

    // ========================================================================
    // CONTROLE DE INTERFACE & MENU LATERAL
    // ========================================================================

    updateSidebarVisibility: function () {
      const btnTarefas = document.getElementById('sidebar-tab-tarefas');
      if (!btnTarefas) return;

      const user = this.getCurrentUser();
      const isManager = this.isCoordOrAdmin();
      const hasAccessibleBoard = this.boards.some(b => this.canViewBoard(b));

      if (isManager || hasAccessibleBoard) {
        btnTarefas.classList.remove('hidden');
      } else {
        btnTarefas.classList.add('hidden');
      }
    },

    onTabActivated: function () {
      this.init();
      this.updateSidebarVisibility();
      this.renderBoardSelector();
      if (this.currentBoardId) {
        this.renderActiveBoardHeader();
        this.renderKanbanColumns();
      }
    },

    switchBoard: function (boardId) {
      this.currentBoardId = boardId;
      const sel = document.getElementById('sel-kanban-board');
      if (sel && sel.value !== boardId) {
        sel.value = boardId || '';
      }
      this.renderActiveBoardHeader();
      this.subscribeTickets(boardId);
    },

    renderBoardSelector: function () {
      const sel = document.getElementById('sel-kanban-board');
      const btnNewBoard = document.getElementById('btn-new-kanban-board');
      const isManager = this.isCoordOrAdmin();

      if (btnNewBoard) {
        if (isManager) {
          btnNewBoard.classList.remove('hidden');
        } else {
          btnNewBoard.classList.add('hidden');
        }
      }

      if (!sel) return;

      const userAccessibleBoards = this.boards.filter(b => this.canViewBoard(b));

      if (userAccessibleBoards.length === 0) {
        sel.innerHTML = '<option value="">Nenhuma lista de tarefas disponível</option>';
        sel.disabled = true;
        this.renderEmptyBoardState();
        return;
      }

      sel.disabled = false;
      let html = '';
      userAccessibleBoards.forEach(b => {
        const isSelected = b.id === this.currentBoardId ? 'selected' : '';
        html += `<option value="${b.id}" ${isSelected}>📋 ${b.name || 'Lista sem nome'}</option>`;
      });
      sel.innerHTML = html;
    },

    renderActiveBoardHeader: function () {
      const board = this.boards.find(b => b.id === this.currentBoardId);
      const titleEl = document.getElementById('kanban-board-title');
      const descEl = document.getElementById('kanban-board-description');
      const btnEditBoard = document.getElementById('btn-edit-kanban-board');
      const btnDeleteBoard = document.getElementById('btn-delete-kanban-board');
      const btnNewTicket = document.getElementById('btn-new-kanban-ticket');
      const emptyContainer = document.getElementById('kanban-empty-state');
      const boardContainer = document.getElementById('kanban-board-container');

      if (!board) {
        this.renderEmptyBoardState();
        return;
      }

      if (emptyContainer) emptyContainer.classList.add('hidden');
      if (boardContainer) boardContainer.classList.remove('hidden');

      if (titleEl) titleEl.textContent = board.name || 'Lista de Tarefas';
      if (descEl) descEl.textContent = board.description || 'Quadro de acompanhamento pastoral de atividades e metas.';

      const isManager = this.isCoordOrAdmin();
      const canEdit = this.canEditBoard(board);

      if (btnEditBoard) {
        if (isManager) btnEditBoard.classList.remove('hidden');
        else btnEditBoard.classList.add('hidden');
      }

      if (btnDeleteBoard) {
        if (isManager) btnDeleteBoard.classList.remove('hidden');
        else btnDeleteBoard.classList.add('hidden');
      }

      if (btnNewTicket) {
        if (canEdit) btnNewTicket.classList.remove('hidden');
        else btnNewTicket.classList.add('hidden');
      }
    },

    renderEmptyBoardState: function () {
      const emptyContainer = document.getElementById('kanban-empty-state');
      const boardContainer = document.getElementById('kanban-board-container');
      const titleEl = document.getElementById('kanban-board-title');
      const descEl = document.getElementById('kanban-board-description');
      const isManager = this.isCoordOrAdmin();

      if (titleEl) titleEl.textContent = 'Listas de Tarefas';
      if (descEl) descEl.textContent = isManager
        ? 'Crie sua primeira lista de tarefas pastoral para organizar projetos e equipes.'
        : 'Você ainda não possui acesso a nenhuma lista de tarefas.';

      if (boardContainer) boardContainer.classList.add('hidden');
      if (emptyContainer) emptyContainer.classList.remove('hidden');
    },

    // ========================================================================
    // RENDERIZAÇÃO DO KANBAN (COLUNAS & TICKETS)
    // ========================================================================

    renderKanbanColumns: function () {
      const container = document.getElementById('kanban-columns-track');
      if (!container) return;

      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board) {
        container.innerHTML = '';
        return;
      }

      const columns = (board.columns && board.columns.length) ? board.columns : DEFAULT_COLUMNS;
      const canEdit = this.canEditBoard(board);
      const searchInput = document.getElementById('input-kanban-search');
      const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

      let html = '';

      columns.forEach(col => {
        // Filtra tickets pertencentes a esta coluna
        let colTickets = this.tickets.filter(t => (t.status || 'todo') === col.id);

        if (searchQuery) {
          colTickets = colTickets.filter(t => {
            const titleMatch = (t.title || '').toLowerCase().includes(searchQuery);
            const assigneeMatch = (t.assigneeName || '').toLowerCase().includes(searchQuery);
            const creatorMatch = (t.creatorName || '').toLowerCase().includes(searchQuery);
            return titleMatch || assigneeMatch || creatorMatch;
          });
        }

        html += `
          <div 
            class="flex-shrink-0 w-80 sm:w-88 flex flex-col bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-sm max-h-[calc(100vh-280px)]"
            data-column-id="${col.id}"
            ondragover="window.KanbanEngine.onColumnDragOver(event)"
            ondragleave="window.KanbanEngine.onColumnDragLeave(event)"
            ondrop="window.KanbanEngine.onColumnDrop(event, '${col.id}')"
          >
            <!-- Cabeçalho da Coluna -->
            <div class="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" style="background-color: ${col.color || '#64748b'};"></span>
                <h4 class="font-bold text-xs sm:text-sm text-slate-800 font-heading">${col.title}</h4>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-600 border border-slate-200">${colTickets.length}</span>
              </div>
              ${canEdit ? `
                <button 
                  onclick="window.KanbanEngine.openCreateTicketModal('${col.id}')" 
                  title="Novo ticket nesta coluna"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition text-sm font-bold"
                >
                  ＋
                </button>
              ` : ''}
            </div>

            <!-- Lista de Cards da Coluna com rolagem vertical suave -->
            <div class="p-3 space-y-3 overflow-y-auto flex-1 min-h-[140px]" id="column-tickets-${col.id}">
              ${colTickets.length === 0 ? `
                <div class="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium">
                  Nenhum ticket aqui
                </div>
              ` : colTickets.map(t => this.renderTicketCard(t, columns, canEdit)).join('')}
            </div>

            <!-- Botão Rápido de Adição no Rodapé da Coluna -->
            ${canEdit ? `
              <div class="p-2.5 border-t border-slate-200 bg-white/70 rounded-b-2xl">
                <button 
                  onclick="window.KanbanEngine.openCreateTicketModal('${col.id}')"
                  class="w-full py-1.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span class="text-sm">＋</span> Adicionar ticket
                </button>
              </div>
            ` : ''}
          </div>
        `;
      });

      container.innerHTML = html;
    },

    // Renderiza um Card de Ticket com contraste dinâmico e botões de ação
    renderTicketCard: function (ticket, columns, canEdit) {
      const bgColor = ticket.color || '#ffffff';
      const contrastColor = getContrastColor(bgColor);
      const isDark = contrastColor === '#ffffff';

      const textClass = isDark ? 'text-white' : 'text-slate-900';
      const subtextClass = isDark ? 'text-white/75' : 'text-slate-600';
      const borderClass = isDark ? 'border-white/20' : 'border-slate-200/90';
      const badgeBgClass = isDark ? 'bg-white/15 text-white border-white/20' : 'bg-slate-100 text-slate-700 border-slate-200';

      const priorityObj = PRIORITIES.find(p => p.id === ticket.priority) || PRIORITIES[1];
      const hasAttachments = ticket.attachments && ticket.attachments.length > 0;
      const currentUser = this.getCurrentUser();
      const isFollowing = (ticket.followers || []).map(f => (f || '').toLowerCase()).includes(currentUser.email.toLowerCase());

      // Verificação de deadline vencido
      let deadlineBadge = '';
      if (ticket.deadline) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isOverdue = ticket.deadline < todayStr && ticket.status !== 'done';
        const deadlineDate = new Date(ticket.deadline + 'T12:00:00');
        const formattedDate = deadlineDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        if (isOverdue) {
          deadlineBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1 shadow-xs animate-pulse">⏰ ${formattedDate} (Atrasado)</span>`;
        } else {
          deadlineBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-medium ${badgeBgClass} border flex items-center gap-1">📅 ${formattedDate}</span>`;
        }
      }

      const canDelete = this.canDeleteTicket(ticket);

      return `
        <div 
          class="rounded-xl p-3.5 shadow-sm border transition-all duration-150 select-none group cursor-grab active:cursor-grabbing hover:shadow-md relative overflow-hidden"
          style="background-color: ${bgColor}; color: ${contrastColor}; border-color: ${borderClass};"
          draggable="${canEdit}"
          ondragstart="window.KanbanEngine.onTicketDragStart(event, '${ticket.id}')"
          onclick="window.KanbanEngine.openTicketDetails('${ticket.id}')"
          id="ticket-card-${ticket.id}"
        >
          <!-- Cabeçalho do Card: Prioridade & Ações -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityObj.badgeBg} ${priorityObj.badgeText} border ${priorityObj.border}">
                ${priorityObj.label}
              </span>
              ${deadlineBadge}
            </div>

            <!-- Ícone de Seguidor -->
            <button 
              onclick="event.stopPropagation(); window.KanbanEngine.toggleFollowTicket('${ticket.id}')" 
              title="${isFollowing ? 'Você está acompanhando este ticket (clique para parar)' : 'Acompanhar este ticket'}"
              class="p-1 rounded-lg transition text-xs ${isFollowing ? 'text-amber-400 bg-amber-500/20' : subtextClass + ' hover:text-amber-400'}"
            >
              ${isFollowing ? '🔔' : '🔕'}
            </button>
          </div>

          <!-- Título do Ticket -->
          <h5 class="font-bold text-xs sm:text-sm line-clamp-2 leading-snug mb-2 font-heading ${textClass}">
            ${ticket.title || 'Sem título'}
          </h5>

          <!-- Metadados: Responsável, Anexos, Criador -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t ${borderClass} text-[11px] ${subtextClass}">
            <!-- Responsável -->
            <div class="flex items-center gap-1.5 min-w-0" title="Responsável: ${ticket.assigneeName || 'Não atribuído'}">
              <span class="w-5 h-5 rounded-full bg-[#d4a94f]/30 border border-[#d4a94f]/60 flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-[#d4a94f]">
                ${(ticket.assigneeName || 'U').charAt(0).toUpperCase()}
              </span>
              <span class="truncate font-medium">${ticket.assigneeName || 'Não atribuído'}</span>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Contador de Anexos -->
              ${hasAttachments ? `
                <span class="flex items-center gap-0.5 font-bold ${isDark ? 'text-white' : 'text-slate-700'}" title="${ticket.attachments.length} anexo(s)">
                  📎 ${ticket.attachments.length}
                </span>
              ` : ''}

              <!-- Seletor Rápido de Mudança de Coluna (Mobile-friendly) -->
              ${canEdit ? `
                <select 
                  onclick="event.stopPropagation()" 
                  onchange="window.KanbanEngine.moveTicketToColumn('${ticket.id}', this.value)"
                  title="Mover para outra coluna"
                  class="text-[10px] rounded px-1.5 py-0.5 border ${isDark ? 'bg-slate-900/80 text-white border-white/30' : 'bg-white text-slate-800 border-slate-300'}"
                >
                  ${columns.map(c => `
                    <option value="${c.id}" ${c.id === ticket.status ? 'selected' : ''}>→ ${c.title}</option>
                  `).join('')}
                </select>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    },

    // ========================================================================
    // DRAG AND DROP (ARRASTAR E SOLTAR)
    // ========================================================================

    onTicketDragStart: function (e, ticketId) {
      e.dataTransfer.setData('text/plain', ticketId);
      e.dataTransfer.effectAllowed = 'move';
      const el = document.getElementById('ticket-card-' + ticketId);
      if (el) el.classList.add('opacity-40');
    },

    onColumnDragOver: function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const colEl = e.currentTarget;
      colEl.classList.add('ring-2', 'ring-[#d4a94f]', 'bg-amber-50/40');
    },

    onColumnDragLeave: function (e) {
      const colEl = e.currentTarget;
      colEl.classList.remove('ring-2', 'ring-[#d4a94f]', 'bg-amber-50/40');
    },

    onColumnDrop: function (e, targetColumnId) {
      e.preventDefault();
      const colEl = e.currentTarget;
      colEl.classList.remove('ring-2', 'ring-[#d4a94f]', 'bg-amber-50/40');

      const ticketId = e.dataTransfer.getData('text/plain');
      if (!ticketId) return;

      const ticket = this.tickets.find(t => t.id === ticketId);
      if (ticket && ticket.status !== targetColumnId) {
        this.moveTicketToColumn(ticketId, targetColumnId);
      }
    },

    moveTicketToColumn: async function (ticketId, targetColumnId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board || !this.canEditBoard(board)) {
        alert('Você não tem permissão para editar tickets nesta lista.');
        return;
      }

      const columns = board.columns || DEFAULT_COLUMNS;
      const oldCol = columns.find(c => c.id === ticket.status) || { title: ticket.status };
      const newCol = columns.find(c => c.id === targetColumnId) || { title: targetColumnId };

      // Atualização otimista
      const previousStatus = ticket.status;
      ticket.status = targetColumnId;
      this.renderKanbanColumns();

      try {
        const db = this.getDb();
        const user = this.getCurrentUser();
        await db.collection('kanban_tickets').doc(ticketId).set({
          status: targetColumnId,
          updatedAt: new Date().toISOString(),
          updatedBy: user.email
        }, { merge: true });

        // Registra evento no histórico do ticket
        await this.logTicketActivity(ticketId, 'history', `moveu o status de "${oldCol.title}" para "${newCol.title}".`, {
          field: 'status',
          from: oldCol.title,
          to: newCol.title
        });

        // Notifica seguidores
        await this.notifyTicketFollowers(ticket, {
          action: `O ticket "${ticket.title}" foi movido de "${oldCol.title}" para "${newCol.title}".`,
          details: `Status alterado por ${user.displayName}.`
        });
      } catch (err) {
        console.error('KanbanEngine: Erro ao mover ticket:', err);
        ticket.status = previousStatus;
        this.renderKanbanColumns();
        alert('Erro ao atualizar status do ticket no servidor: ' + err.message);
      }
    },

    // ========================================================================
    // GESTÃO DE QUADROS (MODAL CRIAR/EDITAR QUADRO)
    // ========================================================================

    openCreateBoardModal: function () {
      if (!this.isCoordOrAdmin()) {
        alert('Apenas Master Admin e Coordenação Geral podem criar novas listas de tarefas.');
        return;
      }

      document.getElementById('modal-kanban-board-editor-title').textContent = 'Nova Lista de Tarefas';
      document.getElementById('input-kanban-board-id').value = '';
      document.getElementById('input-kanban-board-name').value = '';
      document.getElementById('input-kanban-board-desc').value = '';

      // Popula colunas padrão
      this.renderBoardModalColumns(DEFAULT_COLUMNS);

      // Popula matriz de permissões
      this.renderBoardPermissionsMatrix({
        allowedViewRoles: ['catequista', 'secretaria'],
        allowedEditRoles: ['catequista'],
        allowedViewUsers: [],
        allowedEditUsers: []
      });

      const modal = document.getElementById('modal-kanban-board-editor');
      if (modal) modal.classList.remove('hidden');
    },

    openEditBoardModal: function () {
      if (!this.isCoordOrAdmin()) {
        alert('Apenas Master Admin e Coordenação Geral podem configurar esta lista de tarefas.');
        return;
      }

      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board) return;

      document.getElementById('modal-kanban-board-editor-title').textContent = 'Configurar Lista de Tarefas';
      document.getElementById('input-kanban-board-id').value = board.id;
      document.getElementById('input-kanban-board-name').value = board.name || '';
      document.getElementById('input-kanban-board-desc').value = board.description || '';

      this.renderBoardModalColumns(board.columns || DEFAULT_COLUMNS);
      this.renderBoardPermissionsMatrix(board);

      const modal = document.getElementById('modal-kanban-board-editor');
      if (modal) modal.classList.remove('hidden');
    },

    closeBoardEditorModal: function () {
      const modal = document.getElementById('modal-kanban-board-editor');
      if (modal) modal.classList.add('hidden');
    },

    renderBoardModalColumns: function (columns) {
      const container = document.getElementById('board-modal-columns-list');
      if (!container) return;

      let html = '';
      columns.forEach((col, idx) => {
        html += `
          <div class="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xs column-config-row">
            <span class="text-xs text-slate-400 font-mono font-bold">${idx + 1}.</span>
            <input 
              type="text" 
              value="${col.title || ''}" 
              data-col-id="${col.id || 'col_' + idx}"
              placeholder="Nome da coluna" 
              class="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
            />
            <input 
              type="color" 
              value="${col.color || '#64748b'}" 
              title="Cor da coluna"
              class="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5"
            />
            <button 
              type="button" 
              onclick="this.closest('.column-config-row').remove()" 
              class="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold rounded hover:bg-rose-50"
              title="Remover coluna"
            >
              ✕
            </button>
          </div>
        `;
      });
      container.innerHTML = html;
    },

    addNewColumnToConfig: function () {
      const container = document.getElementById('board-modal-columns-list');
      if (!container) return;
      const count = container.querySelectorAll('.column-config-row').length + 1;
      const newColId = 'col_' + Date.now();

      const div = document.createElement('div');
      div.className = 'flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xs column-config-row';
      div.innerHTML = `
        <span class="text-xs text-slate-400 font-mono font-bold">${count}.</span>
        <input 
          type="text" 
          value="Nova Coluna" 
          data-col-id="${newColId}"
          placeholder="Nome da coluna" 
          class="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
        />
        <input 
          type="color" 
          value="#4f46e5" 
          title="Cor da coluna"
          class="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5"
        />
        <button 
          type="button" 
          onclick="this.closest('.column-config-row').remove()" 
          class="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold rounded hover:bg-rose-50"
          title="Remover coluna"
        >
          ✕
        </button>
      `;
      container.appendChild(div);
    },

    renderBoardPermissionsMatrix: function (board) {
      const container = document.getElementById('board-permissions-matrix-container');
      if (!container) return;

      const viewRoles = board.allowedViewRoles || [];
      const editRoles = board.allowedEditRoles || [];
      const viewUsers = board.allowedViewUsers || [];
      const editUsers = board.allowedEditUsers || [];

      // Lista de perfis do sistema
      const rolesList = [
        { id: 'catequista', label: 'Catequistas da Paróquia' },
        { id: 'secretaria', label: 'Secretaria Paroquial (Sandra)' }
      ];

      let html = `
        <div class="space-y-4 text-xs">
          <!-- Governança Automática -->
          <div class="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <span class="font-bold flex items-center gap-1.5">👑 Gestores Nativos (Acesso Total Permanente):</span>
            <p>Master Admin (Thiago), Coordenadora Geral (Lorena) e Vice-Coordenação (Andres) possuem permissão irrestrita de gestão em todas as listas.</p>
          </div>

          <!-- Permissões por Papel -->
          <div class="space-y-2">
            <label class="font-bold text-slate-800 block text-xs">1. Permissão por Perfil Pastoral:</label>
            <div class="space-y-1.5 border border-slate-200 rounded-xl p-3 bg-white">
              <div class="grid grid-cols-12 font-bold text-slate-500 text-[11px] pb-1 border-b border-slate-100">
                <span class="col-span-6">Papel</span>
                <span class="col-span-3 text-center">Visualizar</span>
                <span class="col-span-3 text-center">Editar</span>
              </div>
              ${rolesList.map(r => `
                <div class="grid grid-cols-12 items-center py-1.5 text-xs text-slate-800">
                  <span class="col-span-6 font-medium">${r.label}</span>
                  <label class="col-span-3 flex justify-center cursor-pointer">
                    <input type="checkbox" data-role-view="${r.id}" ${viewRoles.includes(r.id) ? 'checked' : ''} class="w-4 h-4 text-[#d4a94f] rounded" />
                  </label>
                  <label class="col-span-3 flex justify-center cursor-pointer">
                    <input type="checkbox" data-role-edit="${r.id}" ${editRoles.includes(r.id) ? 'checked' : ''} class="w-4 h-4 text-[#d4a94f] rounded" />
                  </label>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Permissões por Usuário Individual -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800 block text-xs">2. Usuários Individuais Específicos:</label>
              <button 
                type="button" 
                onclick="window.KanbanEngine.addIndividualUserPermissionRow()" 
                class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                ＋ Adicionar Usuário
              </button>
            </div>

            <div id="board-individual-users-list" class="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
              ${(viewUsers.length === 0 && editUsers.length === 0) ? `
                <p class="text-slate-400 text-[11px] text-center py-2" id="no-individual-users-msg">
                  Nenhum usuário individual adicionado (o acesso segue apenas os papéis acima).
                </p>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Popula usuários individuais existentes
      const allIndividualEmails = Array.from(new Set([...viewUsers, ...editUsers]));
      allIndividualEmails.forEach(email => {
        this.addIndividualUserPermissionRow(email, viewUsers.includes(email), editUsers.includes(email));
      });
    },

    addIndividualUserPermissionRow: function (email = '', canView = true, canEdit = false) {
      const list = document.getElementById('board-individual-users-list');
      const noMsg = document.getElementById('no-individual-users-msg');
      if (noMsg) noMsg.remove();
      if (!list) return;

      const div = document.createElement('div');
      div.className = 'grid grid-cols-12 items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200 individual-user-perm-row text-xs';
      div.innerHTML = `
        <div class="col-span-6">
          <input 
            type="email" 
            value="${email}" 
            placeholder="email@exemplo.com" 
            class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 user-perm-email"
          />
        </div>
        <label class="col-span-2 flex items-center justify-center gap-1 cursor-pointer text-[11px]">
          <input type="checkbox" class="user-perm-view w-4 h-4 text-[#d4a94f] rounded" ${canView ? 'checked' : ''} />
          <span class="text-slate-600">Ver</span>
        </label>
        <label class="col-span-2 flex items-center justify-center gap-1 cursor-pointer text-[11px]">
          <input type="checkbox" class="user-perm-edit w-4 h-4 text-[#d4a94f] rounded" ${canEdit ? 'checked' : ''} />
          <span class="text-slate-600">Editar</span>
        </label>
        <div class="col-span-2 flex justify-end">
          <button type="button" onclick="this.closest('.individual-user-perm-row').remove()" class="text-rose-500 hover:text-rose-700 text-xs font-bold p-1">
            ✕
          </button>
        </div>
      `;
      list.appendChild(div);
    },

    saveBoardFromModal: async function () {
      if (!this.isCoordOrAdmin()) {
        alert('Permissão negada.');
        return;
      }

      const boardId = document.getElementById('input-kanban-board-id').value.trim();
      const name = document.getElementById('input-kanban-board-name').value.trim();
      const description = document.getElementById('input-kanban-board-desc').value.trim();

      if (!name) {
        alert('Por favor, informe o nome da lista de tarefas.');
        return;
      }

      // Colunas
      const colRows = document.querySelectorAll('.column-config-row');
      const columns = [];
      colRows.forEach((row, idx) => {
        const inputTitle = row.querySelector('input[type="text"]');
        const inputColor = row.querySelector('input[type="color"]');
        const colId = inputTitle ? (inputTitle.dataset.colId || 'col_' + idx) : 'col_' + idx;
        const title = inputTitle ? inputTitle.value.trim() : 'Coluna ' + (idx + 1);
        const color = inputColor ? inputColor.value : '#64748b';
        if (title) {
          columns.push({ id: colId, title: title, color: color });
        }
      });

      if (columns.length === 0) {
        alert('A lista precisa de ao menos uma coluna.');
        return;
      }

      // Permissões por Papel
      const allowedViewRoles = [];
      const allowedEditRoles = [];
      document.querySelectorAll('input[data-role-view]:checked').forEach(cb => {
        allowedViewRoles.push(cb.dataset.roleView);
      });
      document.querySelectorAll('input[data-role-edit]:checked').forEach(cb => {
        allowedEditRoles.push(cb.dataset.roleEdit);
      });

      // Permissões por Usuário Individual
      const allowedViewUsers = [];
      const allowedEditUsers = [];
      document.querySelectorAll('.individual-user-perm-row').forEach(row => {
        const emailInput = row.querySelector('.user-perm-email');
        const viewCb = row.querySelector('.user-perm-view');
        const editCb = row.querySelector('.user-perm-edit');
        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
        if (email && email.includes('@')) {
          if (viewCb && viewCb.checked) allowedViewUsers.push(email);
          if (editCb && editCb.checked) allowedEditUsers.push(email);
        }
      });

      const btnSave = document.getElementById('btn-save-kanban-board');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Salvando lista...';
      }

      try {
        const db = this.getDb();
        const user = this.getCurrentUser();
        const targetDocId = boardId || 'board_' + Date.now();

        const boardPayload = {
          name: name,
          description: description,
          columns: columns,
          allowedViewRoles: allowedViewRoles,
          allowedEditRoles: allowedEditRoles,
          allowedViewUsers: Array.from(new Set(allowedViewUsers)),
          allowedEditUsers: Array.from(new Set(allowedEditUsers)),
          updatedAt: new Date().toISOString(),
          updatedBy: user.email
        };

        if (!boardId) {
          boardPayload.id = targetDocId;
          boardPayload.createdAt = new Date().toISOString();
          boardPayload.createdBy = user.email;
        }

        await db.collection('kanban_boards').doc(targetDocId).set(boardPayload, { merge: true });

        this.closeBoardEditorModal();
        this.switchBoard(targetDocId);
      } catch (err) {
        console.error('KanbanEngine: Erro ao salvar lista:', err);
        alert('Erro ao salvar no Firestore: ' + err.message);
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = 'Salvar Lista de Tarefas';
        }
      }
    },

    deleteCurrentBoard: async function () {
      if (!this.isCoordOrAdmin()) {
        alert('Apenas Master Admin e Coordenação Geral podem excluir listas de tarefas.');
        return;
      }

      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board) return;

      const confirmMsg = `Tem certeza de que deseja excluir a lista "${board.name}"?\nEsta ação apagará permanentemente o quadro e todos os seus tickets associados.`;
      if (!confirm(confirmMsg)) return;

      try {
        const db = this.getDb();

        // Apaga tickets vinculados
        const ticketsSnap = await db.collection('kanban_tickets').where('boardId', '==', board.id).get();
        const batch = db.batch();
        ticketsSnap.forEach(doc => {
          batch.delete(doc.ref);
        });
        batch.delete(db.collection('kanban_boards').doc(board.id));
        await batch.commit();

        this.currentBoardId = null;
      } catch (err) {
        console.error('KanbanEngine: Erro ao excluir lista:', err);
        alert('Erro ao excluir lista no Firestore: ' + err.message);
      }
    },

    // ========================================================================
    // GESTÃO DE TICKETS (MODAL CRIAR/EDITAR TICKET)
    // ========================================================================

    setupQuillEditor: function () {
      if (this.quillInstance) return;
      const editorEl = document.getElementById('ticket-quill-editor');
      if (!editorEl) return;

      if (typeof Quill !== 'undefined') {
        this.quillInstance = new Quill('#ticket-quill-editor', {
          theme: 'snow',
          placeholder: 'Escreva detalhes, diretrizes, observações ou ata desta tarefa...',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['blockquote', 'code-block', 'link'],
              ['clean']
            ]
          }
        });

        this.quillInstance.on('text-change', () => {
          this.isTicketFormDirty = true;
        });
      }
    },

    openCreateTicketModal: function (columnId = 'todo') {
      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board || !this.canEditBoard(board)) {
        alert('Você não tem permissão para criar tickets nesta lista.');
        return;
      }

      this.activeTicketEditorId = null;
      this.isTicketFormDirty = false;
      this.currentTicketAttachments = [];

      document.getElementById('modal-kanban-ticket-title').textContent = 'Novo Ticket';
      document.getElementById('input-ticket-id').value = '';
      document.getElementById('input-ticket-title').value = '';
      document.getElementById('input-ticket-deadline').value = '';
      document.getElementById('select-ticket-priority').value = 'media';
      document.getElementById('check-ticket-follow').checked = true;

      // Colunas
      const selCol = document.getElementById('select-ticket-status');
      const cols = board.columns || DEFAULT_COLUMNS;
      selCol.innerHTML = cols.map(c => `<option value="${c.id}" ${c.id === columnId ? 'selected' : ''}>${c.title}</option>`).join('');

      // Responsáveis (lista com catequistas e coordenação)
      this.populateTicketAssigneesSelect();

      // Cor do Cartão
      this.setTicketColor('#ffffff');

      // Quill Editor
      if (this.quillInstance) {
        this.quillInstance.root.innerHTML = '';
      }

      // Anexos
      this.renderTicketModalAttachments();

      // Oculta botão de exclusão
      const btnDelete = document.getElementById('btn-delete-kanban-ticket');
      if (btnDelete) btnDelete.classList.add('hidden');

      // Oculta seção de atividades (pois o ticket ainda não foi criado)
      const actSec = document.getElementById('ticket-activities-section');
      if (actSec) actSec.classList.add('hidden');

      const modal = document.getElementById('modal-kanban-ticket-editor');
      if (modal) modal.classList.remove('hidden');
    },

    openTicketDetails: function (ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board) return;

      const canEdit = this.canEditBoard(board);
      this.activeTicketEditorId = ticketId;
      this.isTicketFormDirty = false;
      this.currentTicketAttachments = Array.isArray(ticket.attachments) ? [...ticket.attachments] : [];

      document.getElementById('modal-kanban-ticket-title').textContent = canEdit ? 'Editar Ticket' : 'Visualizar Ticket';
      document.getElementById('input-ticket-id').value = ticket.id;
      document.getElementById('input-ticket-title').value = ticket.title || '';
      document.getElementById('input-ticket-deadline').value = ticket.deadline || '';
      document.getElementById('select-ticket-priority').value = ticket.priority || 'media';

      // Status
      const selCol = document.getElementById('select-ticket-status');
      const cols = board.columns || DEFAULT_COLUMNS;
      selCol.innerHTML = cols.map(c => `<option value="${c.id}" ${c.id === ticket.status ? 'selected' : ''}>${c.title}</option>`).join('');

      // Responsável
      this.populateTicketAssigneesSelect(ticket.assigneeEmail);

      // Cor
      this.setTicketColor(ticket.color || '#ffffff');

      // Quill Rich Text
      if (this.quillInstance) {
        this.quillInstance.root.innerHTML = ticket.descriptionHtml || '';
      }

      // Anexos
      this.renderTicketModalAttachments();

      // Atividades & Comentários (Estilo Jira)
      const actSec = document.getElementById('ticket-activities-section');
      if (actSec) actSec.classList.remove('hidden');
      const txtComment = document.getElementById('txt-new-ticket-comment');
      if (txtComment) txtComment.value = '';
      this.switchActivityTab('all');
      this.subscribeTicketActivities(ticket.id);

      // Seguidor
      const currentUser = this.getCurrentUser();
      const isFollowing = (ticket.followers || []).map(f => (f || '').toLowerCase()).includes(currentUser.email.toLowerCase());
      document.getElementById('check-ticket-follow').checked = isFollowing;

      // Exclusão (Apenas criador e Master Admin)
      const btnDelete = document.getElementById('btn-delete-kanban-ticket');
      if (btnDelete) {
        if (this.canDeleteTicket(ticket)) {
          btnDelete.classList.remove('hidden');
        } else {
          btnDelete.classList.add('hidden');
        }
      }

      // Se for apenas visualizador, desativa campos (mas permite comentar!)
      const inputs = document.querySelectorAll('#modal-kanban-ticket-editor input:not(#check-ticket-follow), #modal-kanban-ticket-editor select');
      inputs.forEach(i => {
        i.disabled = !canEdit;
      });
      if (this.quillInstance) {
        this.quillInstance.enable(canEdit);
      }
      const btnSave = document.getElementById('btn-save-kanban-ticket');
      if (btnSave) btnSave.style.display = canEdit ? 'block' : 'none';

      const modal = document.getElementById('modal-kanban-ticket-editor');
      if (modal) modal.classList.remove('hidden');
    },

    closeTicketEditorModal: function () {
      this.activeTicketEditorId = null;
      this.isTicketFormDirty = false;
      if (this.unsubscribeActivities) {
        this.unsubscribeActivities();
        this.unsubscribeActivities = null;
      }
      this.ticketActivities = [];
      const modal = document.getElementById('modal-kanban-ticket-editor');
      if (modal) modal.classList.add('hidden');
    },

    populateTicketAssigneesSelect: function (selectedEmail = '') {
      const sel = document.getElementById('select-ticket-assignee');
      if (!sel) return;

      let html = '<option value="">(Não atribuído)</option>';

      // Lista consolidada de catequistas e coordenação do sistema
      const usersList = [];

      // 1. Coordenação
      usersList.push({ name: 'Thiago Carvalho (Master Admin)', email: 'colletes@gmail.com' });
      usersList.push({ name: 'Lorena Moraes (Coordenação Geral)', email: 'lorenammoraes@gmail.com' });
      usersList.push({ name: 'Andres Reyes (Vice-Coordenação)', email: 'andresprojetos@gmail.com' });
      usersList.push({ name: 'Sandra (Secretaria Paroquial)', email: 'secretaria@imaculadocoracaodf.com.br' });

      // 2. Base de catequistas cadastrados
      if (window.CATEQUISTAS_OFICIAL && Array.isArray(window.CATEQUISTAS_OFICIAL)) {
        window.CATEQUISTAS_OFICIAL.forEach(c => {
          if (c.email && !usersList.some(u => u.email.toLowerCase() === c.email.toLowerCase())) {
            usersList.push({ name: `${c.nome} (${c.turma || 'Catequista'})`, email: c.email });
          }
        });
      }

      usersList.sort((a, b) => a.name.localeCompare(b.name));

      usersList.forEach(u => {
        const isSelected = (selectedEmail && u.email.toLowerCase() === selectedEmail.toLowerCase()) ? 'selected' : '';
        html += `<option value="${u.email}" data-name="${u.name}" ${isSelected}>${u.name}</option>`;
      });

      sel.innerHTML = html;
    },

    // ========================================================================
    // COR DO TICKET & CONTRASTE DINÂMICO
    // ========================================================================

    initColorPickerUI: function () {
      const paletteContainer = document.getElementById('ticket-color-palette');
      if (!paletteContainer) return;

      let html = '';
      PRESET_COLORS.forEach(c => {
        html += `
          <button 
            type="button" 
            onclick="window.KanbanEngine.setTicketColor('${c.hex}')" 
            title="${c.name}"
            class="w-7 h-7 rounded-full border-2 transition transform hover:scale-110 active:scale-95 shadow-xs flex-shrink-0"
            style="background-color: ${c.hex}; border-color: ${c.border};"
          ></button>
        `;
      });
      paletteContainer.innerHTML = html;
    },

    setTicketColor: function (hex) {
      if (!hex) hex = '#ffffff';
      const inputColor = document.getElementById('input-ticket-color-picker');
      const inputHex = document.getElementById('input-ticket-color');
      const previewCard = document.getElementById('ticket-color-preview-box');

      if (inputColor) inputColor.value = hex;
      if (inputHex) inputHex.value = hex;

      if (previewCard) {
        previewCard.style.backgroundColor = hex;
        const contrast = getContrastColor(hex);
        previewCard.style.color = contrast;

        const label = previewCard.querySelector('.preview-contrast-label');
        if (label) {
          label.textContent = contrast === '#ffffff' ? 'Contraste Automático: Texto Branco' : 'Contraste Automático: Texto Escuro';
          label.style.color = contrast;
        }
      }
    },

    // ========================================================================
    // ANEXOS COM FIREBASE STORAGE
    // ========================================================================

    handleAttachmentUpload: async function (fileInput) {
      const file = fileInput.files[0];
      if (!file) return;

      // Limite de 10MB
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert('O arquivo selecionado excede o limite máximo permitido de 10MB.');
        fileInput.value = '';
        return;
      }

      const storage = this.getStorage();
      if (!storage) {
        alert('Serviço do Firebase Storage não está disponível no momento.');
        return;
      }

      const statusEl = document.getElementById('ticket-attachment-upload-status');
      if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.textContent = `Enviando arquivo: ${file.name}...`;
      }

      try {
        const boardId = this.currentBoardId || 'geral';
        const ticketId = document.getElementById('input-ticket-id').value || 'temp_' + Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `kanban_attachments/${boardId}/${ticketId}/${Date.now()}_${safeName}`;
        const fileRef = storage.ref(storagePath);

        const snap = await fileRef.put(file);
        const downloadUrl = await snap.ref.getDownloadURL();

        this.currentTicketAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadUrl,
          path: storagePath,
          uploadedAt: new Date().toISOString()
        });

        this.renderTicketModalAttachments();
        this.isTicketFormDirty = true;
      } catch (err) {
        console.error('KanbanEngine: Erro no upload de anexo:', err);
        alert('Erro ao enviar anexo: ' + err.message);
      } finally {
        fileInput.value = '';
        if (statusEl) statusEl.classList.add('hidden');
      }
    },

    removeAttachment: function (index) {
      this.currentTicketAttachments.splice(index, 1);
      this.renderTicketModalAttachments();
      this.isTicketFormDirty = true;
    },

    renderTicketModalAttachments: function () {
      const container = document.getElementById('ticket-modal-attachments-list');
      if (!container) return;

      if (this.currentTicketAttachments.length === 0) {
        container.innerHTML = '<span class="text-[11px] text-slate-400">Nenhum anexo adicionado a este ticket.</span>';
        return;
      }

      let html = '';
      this.currentTicketAttachments.forEach((att, idx) => {
        const sizeFormatted = (att.size / 1024).toFixed(1) + ' KB';
        let icon = '📄';
        if (att.type && att.type.includes('image')) icon = '🖼️';
        else if (att.type && att.type.includes('pdf')) icon = '📕';
        else if (att.name && (att.name.endsWith('.xlsx') || att.name.endsWith('.xls'))) icon = '📊';

        html += `
          <div class="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-base">${icon}</span>
              <div class="min-w-0">
                <a href="${att.url}" target="_blank" rel="noopener noreferrer" class="font-bold text-slate-800 hover:text-indigo-600 truncate block underline">
                  ${att.name}
                </a>
                <span class="text-[10px] text-slate-500">${sizeFormatted}</span>
              </div>
            </div>
            <button 
              type="button" 
              onclick="window.KanbanEngine.removeAttachment(${idx})" 
              class="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold"
              title="Remover anexo"
            >
              ✕
            </button>
          </div>
        `;
      });

      container.innerHTML = html;
    },

    // ========================================================================
    // SALVAMENTO DE TICKET NO FIRESTORE (COM MERGE & INTEGRIDADE)
    // ========================================================================

    saveTicketFromModal: async function () {
      const board = this.boards.find(b => b.id === this.currentBoardId);
      if (!board || !this.canEditBoard(board)) {
        alert('Permissão negada para editar tickets nesta lista.');
        return;
      }

      const ticketId = document.getElementById('input-ticket-id').value.trim();
      const title = document.getElementById('input-ticket-title').value.trim();
      const status = document.getElementById('select-ticket-status').value;
      const priority = document.getElementById('select-ticket-priority').value;
      const deadline = document.getElementById('input-ticket-deadline').value;
      const color = document.getElementById('input-ticket-color').value || '#ffffff';
      const selAssignee = document.getElementById('select-ticket-assignee');
      const assigneeEmail = selAssignee ? selAssignee.value.trim().toLowerCase() : '';
      const selectedOption = selAssignee ? selAssignee.options[selAssignee.selectedIndex] : null;
      const assigneeName = selectedOption && selectedOption.dataset ? selectedOption.dataset.name : (assigneeEmail.split('@')[0] || '');
      const wantFollow = document.getElementById('check-ticket-follow').checked;

      if (!title) {
        alert('Por favor, informe o título do ticket.');
        return;
      }

      const descriptionHtml = this.quillInstance ? this.quillInstance.root.innerHTML : '';
      const currentUser = this.getCurrentUser();
      const targetDocId = ticketId || 'ticket_' + Date.now();

      const btnSave = document.getElementById('btn-save-kanban-ticket');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Gravando...';
      }

      try {
        const db = this.getDb();
        const existingTicket = ticketId ? this.tickets.find(t => t.id === ticketId) : null;

        // Gerencia lista de seguidores
        let followers = existingTicket && Array.isArray(existingTicket.followers)
          ? [...existingTicket.followers]
          : [];

        // Adiciona criador por padrão
        const creatorEmail = existingTicket ? existingTicket.creatorEmail : currentUser.email;
        const creatorName = existingTicket ? existingTicket.creatorName : currentUser.displayName;
        if (creatorEmail && !followers.includes(creatorEmail.toLowerCase())) {
          followers.push(creatorEmail.toLowerCase());
        }

        // Adiciona responsável
        if (assigneeEmail && !followers.includes(assigneeEmail)) {
          followers.push(assigneeEmail);
        }

        // Respeita checkbox do usuário atual
        if (wantFollow && !followers.includes(currentUser.email)) {
          followers.push(currentUser.email);
        } else if (!wantFollow && followers.includes(currentUser.email)) {
          followers = followers.filter(f => f !== currentUser.email);
        }

        const ticketPayload = {
          boardId: this.currentBoardId,
          title: title,
          descriptionHtml: descriptionHtml,
          status: status,
          priority: priority,
          deadline: deadline || null,
          color: color,
          assigneeEmail: assigneeEmail || null,
          assigneeName: assigneeName || null,
          attachments: this.currentTicketAttachments,
          followers: Array.from(new Set(followers)),
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.email
        };

        if (!ticketId) {
          ticketPayload.id = targetDocId;
          ticketPayload.creatorEmail = currentUser.email;
          ticketPayload.creatorName = currentUser.displayName;
          ticketPayload.createdAt = new Date().toISOString();
        }

        // Gravação atômica com merge no Firestore
        await db.collection('kanban_tickets').doc(targetDocId).set(ticketPayload, { merge: true });

        // Registra histórico de criação ou atualização
        if (!ticketId) {
          await this.logTicketActivity(targetDocId, 'history', 'criou este ticket.');
        } else {
          await this.logTicketActivity(targetDocId, 'history', 'atualizou os dados do ticket.');
        }

        // Dispara notificações para seguidores
        const actionDesc = ticketId
          ? `O ticket "${title}" foi atualizado por ${currentUser.displayName}.`
          : `Novo ticket criado: "${title}" por ${currentUser.displayName}.`;

        await this.notifyTicketFollowers(ticketPayload, {
          action: actionDesc,
          details: `Prioridade: ${priority} | Prazo: ${deadline || 'Sem prazo'} | Responsável: ${assigneeName || 'Não atribuído'}`
        });

        this.closeTicketEditorModal();
      } catch (err) {
        console.error('KanbanEngine: Erro ao salvar ticket:', err);
        alert('Erro ao salvar ticket no Firestore: ' + err.message);
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = 'Salvar Ticket';
        }
      }
    },

    deleteTicketFromModal: async function () {
      const ticketId = document.getElementById('input-ticket-id').value.trim();
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      if (!this.canDeleteTicket(ticket)) {
        alert('Apenas o criador do ticket ou o Master Admin podem apagá-lo.');
        return;
      }

      if (!confirm(`Tem certeza de que deseja apagar o ticket "${ticket.title}"?`)) return;

      try {
        const db = this.getDb();
        await db.collection('kanban_tickets').doc(ticketId).delete();

        // Registra evento no histórico do ticket
        await this.logTicketActivity(ticketId, 'history', `moveu o status de "${oldCol.title}" para "${newCol.title}".`, {
          field: 'status',
          from: oldCol.title,
          to: newCol.title
        });

        // Notifica seguidores sobre a exclusão
        const user = this.getCurrentUser();
        await this.notifyTicketFollowers(ticket, {
          action: `O ticket "${ticket.title}" foi excluído por ${user.displayName}.`,
          details: 'Este ticket não está mais disponível no quadro.'
        });

        this.closeTicketEditorModal();
      } catch (err) {
        console.error('KanbanEngine: Erro ao apagar ticket:', err);
        alert('Erro ao apagar ticket: ' + err.message);
      }
    },

    // ========================================================================
    // SEGUIDORES & NOTIFICAÇÕES (CENTRAL + E-MAIL)
    // ========================================================================

    toggleFollowTicket: async function (ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const user = this.getCurrentUser();
      if (!user.email) return;

      let followers = Array.isArray(ticket.followers) ? [...ticket.followers] : [];
      const isFollowing = followers.map(f => (f || '').toLowerCase()).includes(user.email.toLowerCase());

      if (isFollowing) {
        followers = followers.filter(f => f.toLowerCase() !== user.email.toLowerCase());
      } else {
        followers.push(user.email.toLowerCase());
      }

      ticket.followers = followers;
      this.renderKanbanColumns();

      try {
        const db = this.getDb();
        await db.collection('kanban_tickets').doc(ticketId).set({
          followers: followers
        }, { merge: true });
      } catch (err) {
        console.error('KanbanEngine: Erro ao alterar status de seguidor:', err);
      }
    },

    notifyTicketFollowers: async function (ticket, { action, details }) {
      const followers = Array.isArray(ticket.followers) ? ticket.followers : [];
      const user = this.getCurrentUser();
      const db = this.getDb();
      if (!db || followers.length === 0) return;

      const board = this.boards.find(b => b.id === (ticket.boardId || this.currentBoardId)) || { name: 'Lista de Tarefas' };

      // Destinatários: todos os seguidores exceto quem causou a alteração
      const targetFollowers = followers
        .map(f => (f || '').toLowerCase().trim())
        .filter(f => f && f !== user.email.toLowerCase());

      if (targetFollowers.length === 0) return;

      const batch = db.batch();
      targetFollowers.forEach(recipientEmail => {
        const notifDoc = db.collection('kanban_notifications').doc();
        batch.set(notifDoc, {
          recipientEmail: recipientEmail,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          boardId: board.id || this.currentBoardId,
          boardName: board.name,
          action: action,
          details: details || '',
          actorName: user.displayName,
          actorEmail: user.email,
          read: false,
          createdAt: new Date().toISOString()
        });
      });

      try {
        await batch.commit();
      } catch (err) {
        console.warn('KanbanEngine: Erro ao gravar notificações no Firestore:', err);
      }

      // Disparo de E-mail via API (EmailJS / Resend / Webhook com proteção e log)
      this.dispatchNotificationEmails(targetFollowers, ticket, action, details, board.name);
    },

    dispatchNotificationEmails: async function (recipients, ticket, action, details, boardName) {
      if (!recipients || recipients.length === 0) return;

      // Monta dados do e-mail
      const subject = `[Tarefas • Pastoral] ${ticket.title} - ${action}`;
      const bodyText = `Olá,\n\nHouve uma atualização na Lista de Tarefas "${boardName}":\n\n` +
        `• Ação: ${action}\n` +
        `• Detalhes: ${details || 'Sem detalhes adicionais'}\n` +
        `• Responsável atual: ${ticket.assigneeName || 'Não atribuído'}\n` +
        `• Prazo: ${ticket.deadline || 'Sem prazo definido'}\n\n` +
        `Acesse o painel da Catequese para visualizar o ticket completo: https://catequese-icm.web.app\n\n` +
        `Santuário Imaculado Coração de Maria`;

      // Log de auditoria LGPD
      if (window.ICM_CONFIG && window.ICM_CONFIG.logAuditEvent) {
        window.ICM_CONFIG.logAuditEvent('NOTIFICATION_SENT', ticket.id || 'tarefas', {
          canal: 'E-mail Transacional de Tarefas',
          destinatarios: recipients,
          ticketTitle: ticket.title,
          action: action
        });
      }

      // Tenta envio transacional direto se serviço configurado
      try {
        if (window.EMAIL_DISPATCH_ENDPOINT) {
          await fetch(window.EMAIL_DISPATCH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipients: recipients,
              subject: subject,
              text: bodyText
            })
          });
        }
      } catch (err) {
        console.warn('KanbanEngine: Envio de e-mail de background falhou (notificação salva no app):', err);
      }
    },

    // ========================================================================
    // ATIVIDADES & COMENTÁRIOS DOS TICKETS (ESTILO JIRA)
    // ========================================================================

    subscribeTicketActivities: function (ticketId) {
      if (this.unsubscribeActivities) {
        this.unsubscribeActivities();
        this.unsubscribeActivities = null;
      }

      if (!ticketId) {
        this.ticketActivities = [];
        this.renderTicketActivities();
        return;
      }

      const db = this.getDb();
      if (!db) return;

      this.unsubscribeActivities = db.collection('kanban_activities')
        .where('ticketId', '==', ticketId)
        .onSnapshot(snap => {
          const loaded = [];
          snap.forEach(doc => {
            loaded.push({ id: doc.id, ...doc.data() });
          });
          // Ordena do mais recente para o mais antigo (estilo Jira)
          loaded.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          this.ticketActivities = loaded;
          this.renderTicketActivities();
        }, err => {
          console.warn('KanbanEngine: Erro ao sincronizar atividades do ticket:', err);
        });
    },

    logTicketActivity: async function (ticketId, type, content, details = null) {
      const db = this.getDb();
      const user = this.getCurrentUser();
      if (!db || !ticketId) return;

      try {
        await db.collection('kanban_activities').add({
          ticketId: ticketId,
          boardId: this.currentBoardId || null,
          type: type, // 'comment' | 'history'
          content: content,
          details: details,
          authorEmail: user.email,
          authorName: user.displayName,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('KanbanEngine: Erro ao registrar atividade:', err);
      }
    },

    submitCommentFromModal: async function () {
      const ticketId = document.getElementById('input-ticket-id').value.trim();
      const txtComment = document.getElementById('txt-new-ticket-comment');
      const text = txtComment ? txtComment.value.trim() : '';

      if (!ticketId) {
        alert('Salve o ticket antes de adicionar comentários.');
        return;
      }

      if (!text) {
        alert('Por favor, digite o seu comentário.');
        return;
      }

      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const user = this.getCurrentUser();
      const db = this.getDb();
      if (!db) return;

      const btnSubmit = document.getElementById('btn-submit-comment');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';
      }

      try {
        // 1. Torna o autor seguidor automático se ainda não for
        let followers = Array.isArray(ticket.followers) ? [...ticket.followers] : [];
        if (user.email && !followers.map(f => f.toLowerCase()).includes(user.email.toLowerCase())) {
          followers.push(user.email.toLowerCase());
          ticket.followers = followers;
          const chkFollow = document.getElementById('check-ticket-follow');
          if (chkFollow) chkFollow.checked = true;
          await db.collection('kanban_tickets').doc(ticketId).set({
            followers: followers
          }, { merge: true });
        }

        // 2. Grava comentário na coleção kanban_activities
        await db.collection('kanban_activities').add({
          ticketId: ticketId,
          boardId: this.currentBoardId,
          type: 'comment',
          content: text,
          authorEmail: user.email,
          authorName: user.displayName,
          createdAt: new Date().toISOString()
        });

        // 3. Notifica todos os demais seguidores
        const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
        await this.notifyTicketFollowers(ticket, {
          action: `${user.displayName} comentou no ticket "${ticket.title}": "${preview}"`,
          details: text
        });

        txtComment.value = '';
      } catch (err) {
        console.error('KanbanEngine: Erro ao publicar comentário:', err);
        alert('Erro ao enviar comentário: ' + err.message);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Publicar Comentário';
        }
      }
    },

    editCommentPrompt: async function (activityId, currentContent) {
      const user = this.getCurrentUser();
      const act = this.ticketActivities.find(a => a.id === activityId);
      if (!act) return;

      if (act.authorEmail.toLowerCase() !== user.email.toLowerCase() && !this.isMasterAdmin()) {
        alert('Apenas o autor do comentário ou o Master Admin podem editá-lo.');
        return;
      }

      const newContent = prompt('Editar comentário:', currentContent);
      if (newContent === null) return;
      const clean = newContent.trim();
      if (!clean) {
        alert('O comentário não pode ficar vazio.');
        return;
      }

      try {
        const db = this.getDb();
        await db.collection('kanban_activities').doc(activityId).set({
          content: clean,
          updatedAt: new Date().toISOString(),
          edited: true
        }, { merge: true });
      } catch (err) {
        console.error('KanbanEngine: Erro ao editar comentário:', err);
        alert('Erro ao editar comentário: ' + err.message);
      }
    },

    deleteComment: async function (activityId) {
      const user = this.getCurrentUser();
      const act = this.ticketActivities.find(a => a.id === activityId);
      if (!act) return;

      if (act.authorEmail.toLowerCase() !== user.email.toLowerCase() && !this.isMasterAdmin()) {
        alert('Apenas o autor do comentário ou o Master Admin podem excluí-lo.');
        return;
      }

      if (!confirm('Deseja realmente excluir este comentário?')) return;

      try {
        const db = this.getDb();
        await db.collection('kanban_activities').doc(activityId).delete();
      } catch (err) {
        console.error('KanbanEngine: Erro ao excluir comentário:', err);
        alert('Erro ao excluir comentário: ' + err.message);
      }
    },

    switchActivityTab: function (tabName) {
      this.currentActivityTab = tabName;

      const btnAll = document.getElementById('btn-tab-act-all');
      const btnComments = document.getElementById('btn-tab-act-comments');
      const btnHistory = document.getElementById('btn-tab-act-history');

      const activeClass = 'px-2.5 py-1 rounded-lg bg-white shadow-2xs text-slate-900 transition font-bold';
      const inactiveClass = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition font-semibold';

      if (btnAll) btnAll.className = tabName === 'all' ? activeClass : inactiveClass;
      if (btnComments) btnComments.className = tabName === 'comments' ? activeClass : inactiveClass;
      if (btnHistory) btnHistory.className = tabName === 'history' ? activeClass : inactiveClass;

      this.renderTicketActivities();
    },

    renderTicketActivities: function () {
      const container = document.getElementById('ticket-activities-feed');
      const badgeCount = document.getElementById('badge-activities-count');
      if (!container) return;

      let items = this.ticketActivities || [];

      if (badgeCount) {
        badgeCount.textContent = items.length;
      }

      if (this.currentActivityTab === 'comments') {
        items = items.filter(a => a.type === 'comment');
      } else if (this.currentActivityTab === 'history') {
        items = items.filter(a => a.type === 'history');
      }

      if (items.length === 0) {
        const emptyMsg = this.currentActivityTab === 'comments'
          ? 'Nenhum comentário publicado ainda. Seja o primeiro a comentar!'
          : (this.currentActivityTab === 'history'
            ? 'Nenhum evento registrado no histórico.'
            : 'Nenhuma atividade registrada neste ticket ainda.');

        container.innerHTML = `
          <div class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ${emptyMsg}
          </div>
        `;
        return;
      }

      const currentUser = this.getCurrentUser();
      const isMasterAdmin = this.isMasterAdmin();

      let html = '';
      items.forEach(act => {
        const timeAgo = formatRelativeTime(act.createdAt);
        const isComment = act.type === 'comment';
        const isAuthor = act.authorEmail && currentUser.email && act.authorEmail.toLowerCase() === currentUser.email.toLowerCase();
        const canManageComment = isComment && (isAuthor || isMasterAdmin);

        if (isComment) {
          const initial = (act.authorName || 'U').charAt(0).toUpperCase();
          const formattedContent = formatCommentText(act.content);
          const editedTag = act.edited ? '<span class="text-[9px] text-slate-400 font-normal italic">(editado)</span>' : '';

          html += `
            <div class="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2 text-xs">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#d4a94f]/20 border border-[#d4a94f]/50 flex items-center justify-center text-[11px] font-bold text-[#b88d36] flex-shrink-0">
                    ${initial}
                  </span>
                  <div>
                    <span class="font-bold text-slate-900">${act.authorName || act.authorEmail}</span>
                    <span class="text-[10px] text-slate-400 ml-1">🕒 ${timeAgo}</span>
                    ${editedTag}
                  </div>
                </div>

                ${canManageComment ? `
                  <div class="flex items-center gap-1.5 text-[11px]">
                    ${isAuthor ? `
                      <button 
                        type="button" 
                        onclick="window.KanbanEngine.editCommentPrompt('${act.id}', \`${(act.content || '').replace(/`/g, '\\`')}\`)" 
                        class="text-slate-400 hover:text-indigo-600 transition p-1"
                        title="Editar comentário"
                      >
                        ✏️
                      </button>
                    ` : ''}
                    <button 
                      type="button" 
                      onclick="window.KanbanEngine.deleteComment('${act.id}')" 
                      class="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Excluir comentário"
                    >
                      🗑️
                    </button>
                  </div>
                ` : ''}
              </div>

              <div class="text-slate-700 text-xs pl-8 leading-relaxed font-sans">
                ${formattedContent}
              </div>
            </div>
          `;
        } else {
          // Evento de Histórico / Changelog
          html += `
            <div class="flex items-start gap-2.5 px-3 py-2 bg-slate-50/80 border border-slate-200/60 rounded-xl text-[11px] text-slate-600">
              <span class="text-sm mt-0.5">🔄</span>
              <div class="flex-1 min-w-0">
                <span class="font-semibold text-slate-800">${act.authorName || act.authorEmail}</span>
                <span class="text-slate-600"> ${act.content}</span>
                <span class="text-[10px] text-slate-400 block pt-0.5">🕒 ${timeAgo}</span>
              </div>
            </div>
          `;
        }
      });

      container.innerHTML = html;
    },

    // ========================================================================
    // INTEGRAÇÃO COM A CENTRAL DE NOTIFICAÇÕES (MODAL & SINO)
    // ========================================================================

    updateNotificationsUI: function () {
      const unreadCount = this.notifications.filter(n => !n.read).length;

      // Badge no Sino do Topo
      const bellBadge = document.getElementById('notif-badge-indicator');
      if (bellBadge) {
        const currentOtherCount = parseInt(bellBadge.dataset.otherCount || '0', 10);
        const total = currentOtherCount + unreadCount;
        if (total > 0) {
          bellBadge.classList.remove('hidden');
          bellBadge.textContent = total;
        } else {
          bellBadge.classList.add('hidden');
        }
      }

      // Badge na Subtab de Tarefas da Central
      const taskBadge = document.getElementById('badge-notif-tarefas-count');
      if (taskBadge) {
        taskBadge.textContent = unreadCount;
        if (unreadCount > 0) taskBadge.classList.remove('hidden');
        else taskBadge.classList.add('hidden');
      }

      // Badge no Menu Lateral (Lista de Tarefas)
      const sidebarBadge = document.getElementById('badge-sidebar-tarefas-count');
      if (sidebarBadge) {
        sidebarBadge.textContent = unreadCount;
        if (unreadCount > 0) sidebarBadge.classList.remove('hidden');
        else sidebarBadge.classList.add('hidden');
      }

      // Se a aba de notificações estiver aberta, atualiza a lista
      this.renderNotificationsList();
    },

    renderNotificationsList: function () {
      const container = document.getElementById('subtab-notif-tarefas-list');
      if (!container) return;

      if (this.notifications.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-slate-400 text-xs">
            <span class="text-3xl block mb-2">🎉</span>
            Você não possui notificações de tarefas no momento.
          </div>
        `;
        return;
      }

      let html = '';
      this.notifications.forEach(n => {
        const timeAgo = n.createdAt ? new Date(n.createdAt).toLocaleString('pt-BR') : '';
        html += `
          <div class="p-3.5 rounded-xl border ${n.read ? 'bg-white border-slate-200' : 'bg-amber-50/70 border-amber-300 shadow-xs'} flex items-start justify-between gap-3 text-xs transition">
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 font-heading truncate">${n.ticketTitle || 'Ticket'}</span>
                <span class="text-[10px] text-slate-400 font-medium">(${n.boardName || 'Lista'})</span>
                ${!n.read ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase">Novo</span>' : ''}
              </div>
              <p class="text-slate-700 text-[11px]">${n.action}</p>
              ${n.details ? `<p class="text-slate-500 text-[10px]">${n.details}</p>` : ''}
              <span class="text-[10px] text-slate-400 block pt-1">🕒 ${timeAgo}</span>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onclick="window.KanbanEngine.goToTicketFromNotification('${n.boardId}', '${n.ticketId}', '${n.id}')"
                class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
              >
                Ver Ticket →
              </button>
              ${!n.read ? `
                <button 
                  onclick="window.KanbanEngine.markNotificationAsRead('${n.id}')"
                  title="Marcar como lida"
                  class="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✓
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    },

    markNotificationAsRead: async function (notifId) {
      try {
        const db = this.getDb();
        await db.collection('kanban_notifications').doc(notifId).set({
          read: true
        }, { merge: true });
      } catch (err) {
        console.warn('KanbanEngine: Erro ao marcar notificação como lida:', err);
      }
    },

    markAllNotificationsAsRead: async function () {
      const unread = this.notifications.filter(n => !n.read);
      if (unread.length === 0) return;

      try {
        const db = this.getDb();
        const batch = db.batch();
        unread.forEach(n => {
          batch.set(db.collection('kanban_notifications').doc(n.id), { read: true }, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        console.warn('KanbanEngine: Erro ao marcar todas as notificações como lidas:', err);
      }
    },

    goToTicketFromNotification: async function (boardId, ticketId, notifId) {
      if (notifId) await this.markNotificationAsRead(notifId);

      if (typeof closeCentralNotificacoesModal === 'function') {
        closeCentralNotificacoesModal();
      }

      if (typeof switchTab === 'function') {
        switchTab('tarefas');
      }

      if (boardId) {
        this.switchBoard(boardId);
      }

      setTimeout(() => {
        if (ticketId) {
          this.openTicketDetails(ticketId);
        }
      }, 300);
    },

    // ========================================================================
    // EVENT LISTENERS GERAIS
    // ========================================================================

    setupEventListeners: function () {
      this.initColorPickerUI();

      // Busca rápida de tickets
      const searchInput = document.getElementById('input-kanban-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.renderKanbanColumns();
        });
      }
    }
  };

  window.KanbanEngine = KanbanEngine;

})(window);
