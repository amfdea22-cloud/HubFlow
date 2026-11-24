/**
 * HubUP Flow — Frontend Application (Alpine.js + SortableJS + Lucide Icons)
 */

function resolveApiBase() {
  if (window.HUBUP_API_BASE) return window.HUBUP_API_BASE;
  const { protocol, hostname, port } = window.location;
  if (protocol === 'file:') {
    return 'http://localhost:8000/api';
  }
  // Quando servido pelo Nginx (porta 8080/3000) ou dev server separado, aponta para backend :8000
  if (port && port !== '8000') {
    return `${protocol}//${hostname}:8000/api`;
  }
  return '/api';
}

const API_BASE = resolveApiBase();

function hubupFlow() {
  return {
    apiOnline: false,
    apiVersion: '1.0.0',
    loading: true,
    submitting: false,
    theme: localStorage.getItem('hubup_flow_theme') || 'dark',

    viewMode: 'kanban', // 'kanban' | 'table' | 'calendar' | 'dashboard' | 'timeline' | 'map' | 'metrics'
    viewsMenuOpen: false,
    leftPanel: 'boards', // 'boards' | 'inbox' | 'planner' | 'none'

    // Metadados extras por card (data de entrega, início e localização para Calendário, Painel, Cronograma e Mapa)
    cardMeta: JSON.parse(localStorage.getItem('hubup_card_meta') || '{}'),
    calendarMonthOffset: 0,
    tableSortBy: 'column',
    tableSortAsc: true,
    selectedMapPin: null,
    mapLocations: [
      { id: 'sp', name: 'São Paulo — HQ HubUP', x: 52, y: 64, color: '#0EA5E9' },
      { id: 'fln', name: 'Florianópolis — Hub Tech', x: 54, y: 82, color: '#8B5CF6' },
      { id: 'bh', name: 'Belo Horizonte — Lab IA', x: 64, y: 50, color: '#EC4899' },
      { id: 'cwb', name: 'Curitiba — Design Studio', x: 46, y: 73, color: '#10B981' },
      { id: 'rj', name: 'Rio de Janeiro — Comercial', x: 74, y: 64, color: '#F59E0B' },
      { id: 'rec', name: 'Recife — Operações NE', x: 80, y: 34, color: '#06B6D4' },
    ],
    boards: [],
    activeBoard: null,
    metrics: null,

    // Caixa de entrada pessoal (Inbox lateral)
    inboxItems: JSON.parse(localStorage.getItem('hubup_inbox_items') || JSON.stringify([
      { id: 'inb-1', title: 'Revisar escopo de lançamento Anonymize LGPD', done: false },
      { id: 'inb-2', title: 'Consolidar pauta da Demo de sexta-feira', done: false },
    ])),
    newInboxTitle: '',

    // Planejador semanal (Agenda lateral)
    plannerOffsetDays: 0,
    plannerItems: JSON.parse(localStorage.getItem('hubup_planner_items') || '{}'),
    plannerAddingDate: null,
    plannerNewTitle: '',

    // Menu da Conta (canto superior direito)
    accountMenuOpen: false,
    accountThemeOpen: false,
    showShortcutsModal: false,
    showNewBoardModal: false,
    labsEnabled: localStorage.getItem('hubup_labs') === 'true',
    currentUser: {
      name: 'HubUP Admin',
      email: 'admin@hubup.com.br',
      initials: 'HU',
    },
    newBoardForm: {
      name: '',
      prefix_key: '',
      description: '',
    },

    searchQuery: '',
    priorityFilter: 'all',

    selectedCard: null,
    newSubtaskTitle: '',
    editMode: false,
    editForm: {
      title: '', description: '', priority: 'media', story_points: '', assignee: '',
      column_id: null, label_ids: [], is_blocked: false, blocked_reason: '',
    },
    isDragging: false,
    _dragFrom: null,
    _dragNextSibling: null,
    quickAddColumnId: null,
    quickAddTitle: '',
    _pan: null,

    // Menu lateral direito do quadro
    menuOpen: false,
    menuSection: 'main', // 'main' | 'about' | 'background' | 'export' | 'settings'
    boardPrefs: JSON.parse(localStorage.getItem('hubup_board_prefs') || '{}'),
    uploadedBackgrounds: JSON.parse(localStorage.getItem('hubup_uploaded_bgs') || '[]'),
    uploadingBg: false,
    customBgColor: '#1E293B',

    // Compartilhamento com contatos
    showShareModal: false,
    shareInput: '',
    shareRole: 'editor', // 'admin' | 'editor' | 'viewer'
    workspaceContacts: [
      { id: 'c-andre', name: 'André Silva', email: 'andre.silva@hubup.com.br', role: 'Tech Lead & IA' },
      { id: 'c-beatriz', name: 'Beatriz Rocha', email: 'beatriz.rocha@hubup.com.br', role: 'Product Design' },
      { id: 'c-marina', name: 'Marina Costa', email: 'marina.costa@hubup.com.br', role: 'Product Manager' },
      { id: 'c-rafael', name: 'Rafael Lima', email: 'rafael.lima@hubup.com.br', role: 'SecOps & Backend' },
      { id: 'c-sofia', name: 'Sofia Ribeiro', email: 'sofia.ribeiro@hubup.com.br', role: 'Growth & Ads' },
      { id: 'c-felipe', name: 'Felipe Duarte', email: 'felipe.duarte@hubup.com.br', role: 'Cloud & DevOps' },
      { id: 'c-lucas', name: 'Lucas Mendes', email: 'lucas.mendes@hubup.com.br', role: 'Eng. Software' },
      { id: 'c-camila', name: 'Camila Nogueira', email: 'camila.nogueira@hubup.com.br', role: 'Quant & Dados' },
      { id: 'c-diego', name: 'Diego Alves', email: 'diego.alves@hubup.com.br', role: 'Backend FX' },
      { id: 'c-juliana', name: 'Juliana Prado', email: 'juliana.prado@hubup.com.br', role: 'Frontend PDV' },
      { id: 'c-thiago', name: 'Thiago Martins', email: 'thiago.martins@hubup.com.br', role: 'Full-Stack' },
    ],
    showCardCodes: localStorage.getItem('hubup_show_codes') !== 'false',
    compactCards: localStorage.getItem('hubup_compact_cards') === 'true',

    bgGradients: [
      { id: 'violet', name: 'Violeta Neon', value: 'linear-gradient(135deg, #4C3BCF 0%, #8E4FD6 48%, #E06AAE 100%)' },
      { id: 'ocean', name: 'Oceano Ciano', value: 'linear-gradient(135deg, #0B5FD1 0%, #0A9FC4 55%, #1FC2A0 100%)' },
      { id: 'sunset', name: 'Pôr do Sol', value: 'linear-gradient(135deg, #D96A2B 0%, #DE4660 55%, #A8357F 100%)' },
      { id: 'deepblue', name: 'Azul Profundo', value: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #38BDF8 100%)' },
      { id: 'emerald', name: 'Esmeralda', value: 'linear-gradient(135deg, #0F6B63 0%, #159957 55%, #8CCB3A 100%)' },
      { id: 'hubnight', name: 'Noite HubUP', value: 'linear-gradient(135deg, #090D16 0%, #0F172A 55%, #0E3A5E 100%)' },
      { id: 'aurora', name: 'Aurora', value: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' },
      { id: 'rose', name: 'Rosa Elétrico', value: 'linear-gradient(135deg, #831843 0%, #DB2777 55%, #F472B6 100%)' },
    ],
    bgSolids: [
      { id: 's-blue', name: 'Azul Safira', value: '#0079BF' },
      { id: 's-indigo', name: 'Índigo', value: '#3730A3' },
      { id: 's-purple', name: 'Roxo', value: '#7E22CE' },
      { id: 's-teal', name: 'Petróleo', value: '#0F766E' },
      { id: 's-green', name: 'Verde', value: '#15803D' },
      { id: 's-orange', name: 'Laranja', value: '#C2410C' },
      { id: 's-crimson', name: 'Carmesim', value: '#BE123C' },
      { id: 's-slate', name: 'Grafite', value: '#1E293B' },
    ],

    showNewCardModal: false,
    newCard: {
      title: '',
      column_id: null,
      priority: 'media',
      story_points: '',
      assignee: '',
      description: '',
      label_ids: [],
    },

    toast: {
      visible: false,
      message: '',
      type: 'info',
    },

    sortableInstances: [],

    async init() {
      this.applyTheme(this.theme);
      this.refreshIcons();
      await this.checkHealth();
      await this.fetchBoards();
      if (this.boards.length > 0) {
        const hashMatch = window.location.hash.match(/board=(\d+)/);
        const targetId = hashMatch ? Number(hashMatch[1]) : null;
        const found = targetId && this.boards.find((b) => b.id === targetId);
        await this.selectBoard(found ? found.id : this.boards[0].id);
      } else {
        this.loading = false;
      }
      this.refreshIcons();
    },

    applyTheme(mode) {
      this.theme = mode === 'light' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', this.theme === 'dark');
      localStorage.setItem('hubup_flow_theme', this.theme);
      this.refreshIcons();
    },

    toggleTheme() {
      this.applyTheme(this.theme === 'dark' ? 'light' : 'dark');
    },

    refreshIcons() {
      this.$nextTick(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    },

    notify(message, type = 'info') {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.visible = true;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        this.toast.visible = false;
      }, 3200);
    },

    async apiFetch(path, options = {}) {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        let detail = `Erro HTTP ${response.status}`;
        try {
          const data = await response.json();
          if (data.detail) {
            detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
          }
        } catch (_) {
          // ignore parse error
        }
        throw new Error(detail);
      }

      if (response.status === 204) return null;
      return response.json();
    },

    async checkHealth() {
      try {
        const data = await this.apiFetch('/health');
        this.apiOnline = data.status === 'online';
        this.apiVersion = data.version || '1.0.0';
      } catch (_) {
        this.apiOnline = false;
      }
    },

    async fetchBoards() {
      try {
        this.boards = await this.apiFetch('/boards');
      } catch (err) {
        this.notify(`Falha ao carregar quadros: ${err.message}`, 'error');
      }
    },

    teamHubBoard() {
      return this.boards.find((b) => b.prefix_key === 'HUB') || null;
    },

    productBoards() {
      return this.boards.filter((b) => b.prefix_key !== 'HUB');
    },

    async openTeamHub() {
      const hub = this.teamHubBoard();
      if (!hub) {
        this.notify('Central da Equipe não encontrada.', 'error');
        return;
      }
      this.viewMode = 'kanban';
      await this.selectBoard(hub.id);
    },

    isTeamHubActive() {
      return Boolean(this.activeBoard && this.activeBoard.prefix_key === 'HUB');
    },

    async selectBoard(boardId) {
      this.loading = true;
      this.selectedCard = null;
      try {
        this.activeBoard = await this.apiFetch(`/boards/${boardId}`);
        this.ensureDemoCardMeta(this.activeBoard);
        if (this.viewMode === 'metrics') {
          await this.fetchMetrics(boardId);
        }
      } catch (err) {
        this.notify(`Erro ao carregar quadro: ${err.message}`, 'error');
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.initSortable();
          this.refreshIcons();
        });
      }
    },

    async refreshActiveBoard() {
      if (!this.activeBoard) return;
      const boardId = this.activeBoard.id;
      const [boardData] = await Promise.all([
        this.apiFetch(`/boards/${boardId}`),
        this.fetchBoards(),
      ]);
      this.activeBoard = boardData;

      // Mantém modal de detalhes sincronizado caso esteja aberto
      if (this.selectedCard) {
        const updated = this.findCardInBoard(this.selectedCard.id);
        this.selectedCard = updated || null;
      }

      if (this.viewMode === 'metrics') {
        await this.fetchMetrics(boardId);
      }

      this.$nextTick(() => {
        this.initSortable();
        this.refreshIcons();
      });
    },

    findCardInBoard(cardId) {
      if (!this.activeBoard) return null;
      for (const col of this.activeBoard.columns) {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) return found;
      }
      return null;
    },

    async switchView(mode) {
      this.viewMode = mode;
      if (mode === 'metrics' && this.activeBoard) {
        await this.fetchMetrics(this.activeBoard.id);
      }
      this.$nextTick(() => {
        if (mode === 'kanban') {
          this.initSortable();
        }
        this.refreshIcons();
      });
    },

    async fetchMetrics(boardId) {
      try {
        this.metrics = await this.apiFetch(`/boards/${boardId}/metrics`);
        this.refreshIcons();
      } catch (err) {
        this.notify(`Erro ao carregar métricas: ${err.message}`, 'error');
      }
    },

    filteredCards(column) {
      if (!column || !column.cards) return [];
      const q = this.searchQuery.trim().toLowerCase();
      return column.cards.filter((card) => {
        if (this.priorityFilter !== 'all' && card.priority !== this.priorityFilter) {
          return false;
        }
        if (!q) return true;
        const inCode = (card.code || '').toLowerCase().includes(q);
        const inTitle = (card.title || '').toLowerCase().includes(q);
        const inDesc = (card.description || '').toLowerCase().includes(q);
        const inAssignee = (card.assignee || '').toLowerCase().includes(q);
        return inCode || inTitle || inDesc || inAssignee;
      });
    },

    destroySortable() {
      this.sortableInstances.forEach((inst) => inst.destroy());
      this.sortableInstances = [];
    },

    initSortable() {
      this.destroySortable();
      if (!window.Sortable) return;

      const sharedOptions = {
        group: 'hubup-kanban',
        animation: 180,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        draggable: '.kanban-card, .inbox-drag-item, .planner-drag-item',
        filter: '.no-drag, input, button, textarea, select, a',
        preventOnFilter: false,
        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 4,
        emptyInsertThreshold: 40,
        scroll: true,
        bubbleScroll: true,
        scrollSensitivity: 90,
        scrollSpeed: 16,
        ghostClass: 'card-placeholder',
        chosenClass: 'card-chosen',
        dragClass: 'card-dragging',
        fallbackClass: 'card-dragging',
        onStart: (evt) => {
          this.isDragging = true;
          this._dragFrom = evt.from;
          this._dragNextSibling = evt.item.nextSibling;
          document.body.classList.add('dragging-card');
        },
        onEnd: (evt) => {
          document.body.classList.remove('dragging-card');
          this.handleDrop(evt);
        },
      };

      // 1. Colunas do Quadro Kanban (cartões) + Reordenação das Listas/Colunas inteiras
      if (this.viewMode === 'kanban') {
        const columnsWrap = document.querySelector('.kanban-columns-container');
        if (columnsWrap) {
          this.sortableInstances.push(
            Sortable.create(columnsWrap, {
              group: 'hubup-columns',
              direction: 'horizontal',
              animation: 200,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              draggable: '.kanban-list',
              handle: '.kanban-list-header',
              filter: '.no-drag, button, input, select, textarea',
              preventOnFilter: false,
              forceFallback: true,
              fallbackOnBody: true,
              fallbackTolerance: 4,
              scroll: true,
              bubbleScroll: true,
              scrollSensitivity: 100,
              scrollSpeed: 18,
              ghostClass: 'list-placeholder',
              dragClass: 'list-dragging',
              fallbackClass: 'list-dragging',
              onStart: (evt) => {
                this.isDragging = true;
                this._colDragFrom = evt.from;
                this._colDragNext = evt.item.nextSibling;
                document.body.classList.add('dragging-card');
              },
              onEnd: (evt) => {
                document.body.classList.remove('dragging-card');
                this.handleColumnDrop(evt);
              },
            })
          );
        }

        document.querySelectorAll('.kanban-column-list').forEach((listEl) => {
          this.sortableInstances.push(Sortable.create(listEl, sharedOptions));
        });
      }

      // 2. Caixa de Entrada (Inbox)
      document.querySelectorAll('.inbox-drop-list').forEach((listEl) => {
        this.sortableInstances.push(Sortable.create(listEl, sharedOptions));
      });

      // 3. Dias do Planejador (Agenda semanal)
      document.querySelectorAll('.planner-day-drop').forEach((listEl) => {
        this.sortableInstances.push(Sortable.create(listEl, sharedOptions));
      });
    },

    async handleColumnDrop(evt) {
      const oldIdx = evt.oldDraggableIndex ?? evt.oldIndex;
      const newIdx = evt.newDraggableIndex ?? evt.newIndex;

      // Devolve o nó DOM ao lugar original para o Alpine.js reordenar via x-for sem duplicar
      evt.item.remove();
      this._colDragFrom.insertBefore(evt.item, this._colDragNext);
      setTimeout(() => { this.isDragging = false; }, 60);

      if (!this.activeBoard || oldIdx === newIdx || oldIdx == null || newIdx == null) return;

      const cols = [...this.activeBoard.columns];
      const [moved] = cols.splice(oldIdx, 1);
      if (!moved) return;
      cols.splice(newIdx, 0, moved);
      this.activeBoard.columns = cols;

      try {
        await this.apiFetch(`/boards/${this.activeBoard.id}/columns/reorder`, {
          method: 'PATCH',
          body: JSON.stringify({ column_ids: cols.map((c) => c.id) }),
        });
        this.notify(`Lista "${moved.name}" movida!`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao mover lista: ${err.message}`, 'error');
        await this.refreshActiveBoard();
      }
    },

    async handleDrop(evt) {
      const fromType = evt.from.dataset.dropType || 'column';
      const toType = evt.to.dataset.dropType || 'column';
      const newIdx = evt.newDraggableIndex ?? evt.newIndex;
      const oldIdx = evt.oldDraggableIndex ?? evt.oldIndex;

      // Devolve o nó DOM à posição original para o Alpine.js controlar o x-for sem duplicação
      evt.item.remove();
      this._dragFrom.insertBefore(evt.item, this._dragNextSibling);
      setTimeout(() => { this.isDragging = false; }, 60);

      // Caso 1: Coluna -> Coluna
      if (fromType === 'column' && toType === 'column') {
        const cardId = Number(evt.item.dataset.cardId);
        const fromId = Number(evt.from.dataset.columnId);
        const toId = Number(evt.to.dataset.columnId);
        if (fromId === toId && oldIdx === newIdx) return;
        await this.moveCard(cardId, toId, newIdx);
        return;
      }

      // Caso 2: Caixa de Entrada -> Coluna do Quadro
      if (fromType === 'inbox' && toType === 'column') {
        const inboxId = evt.item.dataset.inboxId;
        const toId = Number(evt.to.dataset.columnId);
        const item = this.inboxItems.find((x) => x.id === inboxId);
        if (!item || !this.activeBoard) return;
        try {
          const created = await this.apiFetch(`/boards/${this.activeBoard.id}/cards`, {
            method: 'POST',
            body: JSON.stringify({ title: item.title, column_id: toId, priority: 'media' }),
          });
          await this.apiFetch(`/cards/${created.id}/move`, {
            method: 'PATCH',
            body: JSON.stringify({ target_column_id: toId, new_position: newIdx }),
          });
          this.deleteInboxItem(inboxId);
          this.notify(`"${created.code}" movido da Caixa de Entrada para "${this.columnName(toId)}"!`);
          await this.refreshActiveBoard();
        } catch (err) {
          this.notify(`Erro ao mover da Caixa de Entrada: ${err.message}`, 'error');
        }
        return;
      }

      // Caso 3: Coluna do Quadro -> Caixa de Entrada
      if (fromType === 'column' && toType === 'inbox') {
        const cardId = Number(evt.item.dataset.cardId);
        const card = this.findCardInBoard(cardId);
        if (!card) return;
        try {
          await this.apiFetch(`/cards/${cardId}`, { method: 'DELETE' });
          this.inboxItems = [
            { id: `inb-${Date.now()}`, title: `${card.code}: ${card.title}`, done: false },
            ...this.inboxItems,
          ];
          this.saveInbox();
          this.notify(`${card.code} movido para a Caixa de Entrada.`);
          await this.refreshActiveBoard();
        } catch (err) {
          this.notify(`Erro ao mover para Caixa de Entrada: ${err.message}`, 'error');
        }
        return;
      }

      // Caso 4: Coluna do Quadro -> Dia do Planejador (agenda o card naquele dia)
      if (fromType === 'column' && toType === 'planner') {
        const cardId = Number(evt.item.dataset.cardId);
        const targetDate = evt.to.dataset.plannerDate;
        const card = this.findCardInBoard(cardId);
        if (!card || !targetDate) return;
        const list = [...(this.plannerItems[targetDate] || [])];
        list.splice(newIdx, 0, { id: `pl-${Date.now()}`, title: `${card.code} — ${card.title}`, done: false });
        this.plannerItems = { ...this.plannerItems, [targetDate]: list };
        this.savePlanner();
        this.notify(`${card.code} planejado para ${targetDate}!`);
        this.refreshIcons();
        return;
      }

      // Caso 5: Caixa de Entrada -> Dia do Planejador
      if (fromType === 'inbox' && toType === 'planner') {
        const inboxId = evt.item.dataset.inboxId;
        const targetDate = evt.to.dataset.plannerDate;
        const item = this.inboxItems.find((x) => x.id === inboxId);
        if (!item || !targetDate) return;
        const list = [...(this.plannerItems[targetDate] || [])];
        list.splice(newIdx, 0, { id: `pl-${Date.now()}`, title: item.title, done: item.done });
        this.plannerItems = { ...this.plannerItems, [targetDate]: list };
        this.savePlanner();
        this.deleteInboxItem(inboxId);
        this.notify(`Tarefa movida para o Planejador (${targetDate})!`);
        this.refreshIcons();
        return;
      }

      // Caso 6: Dia do Planejador -> Outro Dia do Planejador
      if (fromType === 'planner' && toType === 'planner') {
        const taskId = evt.item.dataset.plannerTaskId;
        const fromDate = evt.from.dataset.plannerDate;
        const toDate = evt.to.dataset.plannerDate;
        if (fromDate === toDate && oldIdx === newIdx) return;
        const sourceList = [...(this.plannerItems[fromDate] || [])];
        const task = sourceList.find((t) => t.id === taskId);
        if (!task) return;
        const nextSource = sourceList.filter((t) => t.id !== taskId);
        const targetList = fromDate === toDate ? nextSource : [...(this.plannerItems[toDate] || [])];
        targetList.splice(newIdx, 0, task);
        this.plannerItems = {
          ...this.plannerItems,
          [fromDate]: nextSource,
          [toDate]: targetList,
        };
        this.savePlanner();
        this.refreshIcons();
      }
    },

    async moveCard(cardId, toColumnId, visibleIndex = Number.MAX_SAFE_INTEGER) {
      if (!this.activeBoard) return;
      const cols = this.activeBoard.columns;
      const fromCol = cols.find((c) => c.cards.some((x) => x.id === cardId));
      const toCol = cols.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return;

      const card = fromCol.cards.find((x) => x.id === cardId);
      const visible = this.filteredCards(toCol).filter((c) => c.id !== cardId);
      const fullWithout = toCol.cards.filter((c) => c.id !== cardId);
      let position = visibleIndex >= visible.length
        ? fullWithout.length
        : fullWithout.indexOf(visible[visibleIndex]);
      if (position < 0) position = fullWithout.length;

      // Atualização otimista
      fromCol.cards = fromCol.cards.filter((c) => c.id !== cardId);
      const updated = [...toCol.cards.filter((c) => c.id !== cardId)];
      updated.splice(position, 0, { ...card, column_id: toColumnId });
      toCol.cards = updated;

      try {
        await this.apiFetch(`/cards/${cardId}/move`, {
          method: 'PATCH',
          body: JSON.stringify({ target_column_id: toColumnId, new_position: position }),
        });
        if (fromCol.id !== toCol.id) {
          this.notify(`${card.code} movido para "${toCol.name}"`);
        }
      } catch (err) {
        this.notify(`Erro ao mover card: ${err.message}`, 'error');
      }
      await this.refreshActiveBoard();
    },

    moveCardStep(card, column, direction) {
      const cols = this.activeBoard.columns;
      const idx = cols.findIndex((c) => c.id === column.id);
      const target = cols[idx + direction];
      if (target) this.moveCard(card.id, target.id);
    },

    onCardClick(card) {
      if (this.isDragging) return;
      this.openCardDetail(card);
    },

    // ---------------- Edição de Card ----------------
    startEdit() {
      const c = this.selectedCard;
      if (!c) return;
      this.editForm = {
        title: c.title,
        description: c.description || '',
        priority: c.priority,
        story_points: c.story_points === null || c.story_points === undefined ? '' : String(c.story_points),
        assignee: c.assignee || '',
        column_id: c.column_id,
        label_ids: (c.labels || []).map((l) => l.id),
        is_blocked: c.is_blocked,
        blocked_reason: c.blocked_reason || '',
      };
      this.editMode = true;
      this.refreshIcons();
    },

    cancelEdit() {
      this.editMode = false;
      this.refreshIcons();
    },

    toggleEditLabel(labelId) {
      const ids = this.editForm.label_ids;
      const i = ids.indexOf(labelId);
      if (i >= 0) ids.splice(i, 1); else ids.push(labelId);
    },

    async saveEdit() {
      if (!this.selectedCard || !this.editForm.title.trim()) {
        this.notify('O título é obrigatório.', 'error');
        return;
      }
      this.submitting = true;
      const f = this.editForm;
      try {
        await this.apiFetch(`/cards/${this.selectedCard.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: f.title.trim(),
            description: f.description.trim() || null,
            priority: f.priority,
            story_points: f.story_points === '' ? null : Number(f.story_points),
            assignee: f.assignee.trim() || null,
            column_id: Number(f.column_id),
            label_ids: f.label_ids,
            is_blocked: f.is_blocked,
            blocked_reason: f.is_blocked ? (f.blocked_reason.trim() || 'Aguardando definição externa.') : null,
          }),
        });
        this.editMode = false;
        this.notify(`${this.selectedCard.code} atualizado com sucesso!`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao salvar card: ${err.message}`, 'error');
      } finally {
        this.submitting = false;
      }
    },

    // ---------------- Visualizações (Quadro, Tabela, Calendário, Painel, Cronograma, Mapa) ----------------
    toggleViewsMenu() {
      this.viewsMenuOpen = !this.viewsMenuOpen;
      this.refreshIcons();
    },

    selectView(mode) {
      this.viewsMenuOpen = false;
      this.switchView(mode);
    },

    viewLabel(mode) {
      const map = {
        kanban: 'Quadro',
        table: 'Tabela',
        calendar: 'Calendário',
        dashboard: 'Painel',
        timeline: 'Cronograma',
        map: 'Mapa',
        metrics: 'Métricas & WIP',
      };
      return map[mode] || 'Quadro';
    },

    saveCardMeta() {
      localStorage.setItem('hubup_card_meta', JSON.stringify(this.cardMeta));
    },

    ensureDemoCardMeta(board) {
      if (!board || !board.columns) return;
      let changed = false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fmt = (offset) => {
        const d = new Date(today);
        d.setDate(today.getDate() + offset);
        return d.toISOString().slice(0, 10);
      };
      const locIds = this.mapLocations.map((l) => l.id);
      let idx = 0;

      for (const col of board.columns) {
        for (const card of col.cards) {
          const key = String(card.id);
          if (!this.cardMeta[key]) {
            // Distribui datas realistas para demonstrar Calendário, Painel e Cronograma
            let dueDate = null;
            let startDate = null;
            if (col.is_done) {
              dueDate = fmt(-2);
              startDate = fmt(-7);
            } else if (card.priority === 'critica') {
              dueDate = fmt(-1); // em atraso para destaque no Painel
              startDate = fmt(-5);
            } else if (card.priority === 'alta') {
              dueDate = fmt(1 + (idx % 3)); // entregar em breve
              startDate = fmt(-2);
            } else if (idx % 3 === 0) {
              dueDate = fmt(5 + (idx % 9)); // a ser entregue
              startDate = fmt(1);
            }
            const locationId = locIds[idx % locIds.length];
            this.cardMeta[key] = { dueDate, startDate, locationId };
            changed = true;
          }
          idx++;
        }
      }
      if (changed) this.saveCardMeta();
    },

    getCardMeta(cardId) {
      return this.cardMeta[String(cardId)] || { dueDate: null, startDate: null, locationId: null };
    },

    setCardDueDate(cardId, dateStr) {
      const key = String(cardId);
      const cur = this.getCardMeta(cardId);
      this.cardMeta = {
        ...this.cardMeta,
        [key]: { ...cur, dueDate: dateStr || null, startDate: cur.startDate || dateStr || null },
      };
      this.saveCardMeta();
      this.notify(dateStr ? `Data de entrega definida para ${dateStr}.` : 'Data de entrega removida.');
    },

    setCardLocation(cardId, locationId) {
      const key = String(cardId);
      const cur = this.getCardMeta(cardId);
      this.cardMeta = { ...this.cardMeta, [key]: { ...cur, locationId: locationId || null } };
      this.saveCardMeta();
      this.notify('Localização do cartão atualizada.');
    },

    allFilteredBoardCards() {
      if (!this.activeBoard) return [];
      const list = [];
      for (const col of this.activeBoard.columns) {
        for (const card of this.filteredCards(col)) {
          list.push({ ...card, _column: col, _meta: this.getCardMeta(card.id) });
        }
      }
      return list;
    },

    sortedTableCards() {
      const rows = [...this.allFilteredBoardCards()];
      const prioOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
      const dir = this.tableSortAsc ? 1 : -1;
      rows.sort((a, b) => {
        if (this.tableSortBy === 'title') return a.title.localeCompare(b.title) * dir;
        if (this.tableSortBy === 'column') return (a._column.position - b._column.position) * dir;
        if (this.tableSortBy === 'priority') return ((prioOrder[a.priority] ?? 9) - (prioOrder[b.priority] ?? 9)) * dir;
        if (this.tableSortBy === 'points') return ((a.story_points || 0) - (b.story_points || 0)) * dir;
        if (this.tableSortBy === 'due') return String(a._meta.dueDate || '9999').localeCompare(String(b._meta.dueDate || '9999')) * dir;
        return 0;
      });
      return rows;
    },

    toggleTableSort(field) {
      if (this.tableSortBy === field) {
        this.tableSortAsc = !this.tableSortAsc;
      } else {
        this.tableSortBy = field;
        this.tableSortAsc = true;
      }
    },

    // --- Calendário Mensal ---
    calendarMonthTitle() {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() + this.calendarMonthOffset);
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    calendarGridDays() {
      const first = new Date();
      first.setDate(1);
      first.setMonth(first.getMonth() + this.calendarMonthOffset);
      const year = first.getFullYear();
      const month = first.getMonth();
      const startWeekday = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const todayIso = new Date().toISOString().slice(0, 10);

      const cells = [];
      for (let i = 0; i < startWeekday; i++) {
        cells.push({ empty: true, key: `e-${i}` });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cells.push({
          empty: false,
          key: iso,
          day,
          iso,
          isToday: iso === todayIso,
        });
      }
      return cells;
    },

    cardsForDate(iso) {
      return this.allFilteredBoardCards().filter((c) => c._meta.dueDate === iso);
    },

    cardsWithoutDate() {
      return this.allFilteredBoardCards().filter((c) => !c._meta.dueDate);
    },

    // --- Painel (4 gráficos idênticos ao anexo) ---
    dashboardByColumn() {
      if (!this.activeBoard) return [];
      const cols = this.activeBoard.columns.map((col) => ({
        name: col.name,
        count: this.filteredCards(col).length,
        color: col.color,
      }));
      const max = Math.max(1, ...cols.map((c) => c.count));
      return cols.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }));
    },

    dashboardByDueDate() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const soon = new Date(today);
      soon.setDate(today.getDate() + 3);
      const todayIso = today.toISOString().slice(0, 10);
      const soonIso = soon.toISOString().slice(0, 10);

      const buckets = [
        { key: 'done', label: 'Concluído', count: 0, color: '#22A06B' },
        { key: 'soon', label: 'Entregar em breve', count: 0, color: '#E2B203' },
        { key: 'future', label: 'A ser entregue', count: 0, color: '#0EA5E9' },
        { key: 'overdue', label: 'Em Atraso', count: 0, color: '#E2483D' },
        { key: 'none', label: 'Sem data de entrega', count: 0, color: '#CBD5E1' },
      ];

      for (const card of this.allFilteredBoardCards()) {
        if (card._column.is_done) {
          buckets[0].count++;
        } else if (!card._meta.dueDate) {
          buckets[4].count++;
        } else if (card._meta.dueDate < todayIso) {
          buckets[3].count++;
        } else if (card._meta.dueDate <= soonIso) {
          buckets[1].count++;
        } else {
          buckets[2].count++;
        }
      }
      const max = Math.max(1, ...buckets.map((b) => b.count));
      return buckets.map((b) => ({ ...b, pct: Math.round((b.count / max) * 100) }));
    },

    dashboardByMember() {
      const counts = {};
      for (const card of this.allFilteredBoardCards()) {
        const key = card.assignee || 'Não atribuído';
        counts[key] = (counts[key] || 0) + 1;
      }
      const arr = Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          color: name === 'Não atribuído' ? '#334155' : this.avatarColor(name),
        }))
        .sort((a, b) => b.count - a.count);
      const max = Math.max(1, ...arr.map((x) => x.count));
      return arr.map((x) => ({ ...x, pct: Math.round((x.count / max) * 100) }));
    },

    dashboardByLabel() {
      const counts = {};
      for (const card of this.allFilteredBoardCards()) {
        for (const lbl of card.labels || []) {
          if (!counts[lbl.name]) counts[lbl.name] = { name: lbl.name, color: lbl.color, count: 0 };
          counts[lbl.name].count++;
        }
      }
      const arr = Object.values(counts).sort((a, b) => b.count - a.count);
      const max = Math.max(1, ...arr.map((x) => x.count));
      return arr.map((x) => ({ ...x, pct: Math.round((x.count / max) * 100) }));
    },

    // --- Cronograma (Gantt 14 dias) ---
    timelineDays() {
      const days = [];
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      base.setDate(base.getDate() - 3);
      const w = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const todayIso = new Date().toISOString().slice(0, 10);
      for (let i = 0; i < 14; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        days.push({ iso, day: d.getDate(), wd: w[d.getDay()], isToday: iso === todayIso });
      }
      return days;
    },

    timelineBarStyle(card) {
      const days = this.timelineDays();
      const firstIso = days[0].iso;
      const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
      const due = card._meta.dueDate || days[5].iso;
      const start = card._meta.startDate || due;
      let startIdx = Math.max(0, Math.min(days.length - 1, diffDays(firstIso, start)));
      let endIdx = Math.max(startIdx, Math.min(days.length - 1, diffDays(firstIso, due)));
      const leftPct = (startIdx / days.length) * 100;
      const widthPct = Math.max(((endIdx - startIdx + 1) / days.length) * 100, 100 / days.length);
      return `left: ${leftPct}%; width: ${widthPct}%; background-color: ${card._column.color};`;
    },

    // --- Mapa ---
    cardsByLocation(locId) {
      return this.allFilteredBoardCards().filter((c) => c._meta.locationId === locId);
    },

    locationName(locId) {
      const loc = this.mapLocations.find((l) => l.id === locId);
      return loc ? loc.name : 'Sem local';
    },

    // ---------------- Painéis Laterais (Caixa de Entrada & Planejador) ----------------
    toggleLeftPanel(panel) {
      this.leftPanel = this.leftPanel === panel ? 'none' : panel;
      this.$nextTick(() => {
        this.initSortable();
        this.refreshIcons();
      });
    },

    saveInbox() {
      localStorage.setItem('hubup_inbox_items', JSON.stringify(this.inboxItems));
    },

    addInboxItem() {
      const title = this.newInboxTitle.trim();
      if (!title) return;
      this.inboxItems = [{ id: `inb-${Date.now()}`, title, done: false }, ...this.inboxItems];
      this.newInboxTitle = '';
      this.saveInbox();
      this.refreshIcons();
    },

    toggleInboxItem(id) {
      this.inboxItems = this.inboxItems.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
      this.saveInbox();
    },

    deleteInboxItem(id) {
      this.inboxItems = this.inboxItems.filter((it) => it.id !== id);
      this.saveInbox();
    },

    async sendInboxToBoard(item) {
      if (!this.activeBoard || !this.activeBoard.columns.length) return;
      try {
        const created = await this.apiFetch(`/boards/${this.activeBoard.id}/cards`, {
          method: 'POST',
          body: JSON.stringify({
            title: item.title,
            column_id: this.activeBoard.columns[0].id,
            priority: 'media',
          }),
        });
        this.deleteInboxItem(item.id);
        this.notify(`Cartão ${created.code} enviado para "${this.activeBoard.columns[0].name}"!`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao enviar cartão: ${err.message}`, 'error');
      }
    },

    // Planejador (7 dias dinâmicos)
    plannerDays() {
      const days = [];
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      const weekdays = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + this.plannerOffsetDays + i);
        const iso = d.toISOString().slice(0, 10);
        const rel = this.plannerOffsetDays + i;
        let prefix = '';
        if (rel === 0) prefix = 'Hoje';
        else if (rel === 1) prefix = 'Amanhã';
        days.push({
          iso,
          prefix,
          label: `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`,
          isToday: rel === 0,
        });
      }
      return days;
    },

    plannerMonthLabel() {
      const base = new Date();
      base.setDate(base.getDate() + this.plannerOffsetDays);
      const shortMonths = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      return shortMonths[base.getMonth()];
    },

    shiftPlanner(delta) {
      this.plannerOffsetDays += delta;
    },

    resetPlannerToday() {
      this.plannerOffsetDays = 0;
    },

    getPlannerTasks(iso) {
      return this.plannerItems[iso] || [];
    },

    savePlanner() {
      localStorage.setItem('hubup_planner_items', JSON.stringify(this.plannerItems));
    },

    openPlannerAdd(iso) {
      this.plannerAddingDate = iso;
      this.plannerNewTitle = '';
      this.$nextTick(() => document.getElementById(`planner-input-${iso}`)?.focus());
    },

    submitPlannerTask(iso) {
      const title = this.plannerNewTitle.trim();
      if (!title) return;
      const list = [...(this.plannerItems[iso] || []), { id: `pl-${Date.now()}`, title, done: false }];
      this.plannerItems = { ...this.plannerItems, [iso]: list };
      this.plannerNewTitle = '';
      this.plannerAddingDate = null;
      this.savePlanner();
      this.refreshIcons();
    },

    togglePlannerTask(iso, id) {
      const list = (this.plannerItems[iso] || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      this.plannerItems = { ...this.plannerItems, [iso]: list };
      this.savePlanner();
    },

    deletePlannerTask(iso, id) {
      const list = (this.plannerItems[iso] || []).filter((t) => t.id !== id);
      this.plannerItems = { ...this.plannerItems, [iso]: list };
      this.savePlanner();
    },

    // ---------------- Menu da Conta & Novo Quadro ----------------
    toggleAccountMenu() {
      this.accountMenuOpen = !this.accountMenuOpen;
      if (!this.accountMenuOpen) this.accountThemeOpen = false;
      this.refreshIcons();
    },

    closeAccountMenu() {
      this.accountMenuOpen = false;
      this.accountThemeOpen = false;
    },

    toggleLabs() {
      this.labsEnabled = !this.labsEnabled;
      localStorage.setItem('hubup_labs', String(this.labsEnabled));
      this.notify(this.labsEnabled ? 'Recursos de Laboratórios ativados!' : 'Recursos de Laboratórios desativados.');
    },

    openNewBoardModal() {
      this.closeAccountMenu();
      this.newBoardForm = { name: '', prefix_key: '', description: '' };
      this.showNewBoardModal = true;
      this.refreshIcons();
    },

    async submitNewBoard() {
      const name = this.newBoardForm.name.trim();
      const prefix = this.newBoardForm.prefix_key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      if (!name || prefix.length < 2) {
        this.notify('Informe nome e um prefixo de 2 a 8 letras (ex: CRM).', 'error');
        return;
      }
      this.submitting = true;
      try {
        const created = await this.apiFetch('/boards', {
          method: 'POST',
          body: JSON.stringify({
            name,
            prefix_key: prefix,
            description: this.newBoardForm.description.trim() || null,
          }),
        });
        this.showNewBoardModal = false;
        await this.fetchBoards();
        await this.selectBoard(created.id);
        this.notify(`Quadro "${created.name}" (${created.prefix_key}) criado!`);
      } catch (err) {
        this.notify(`Erro ao criar quadro: ${err.message}`, 'error');
      } finally {
        this.submitting = false;
      }
    },

    // ---------------- Helpers visuais ----------------
    saveBoardPrefs() {
      try {
        localStorage.setItem('hubup_board_prefs', JSON.stringify(this.boardPrefs));
      } catch (_) {
        this.notify('Armazenamento local cheio: imagem aplicada apenas nesta sessão.', 'error');
      }
    },

    getBoardPref(boardId) {
      if (!boardId) return {};
      return this.boardPrefs[String(boardId)] || {};
    },

    setBoardPref(boardId, patch) {
      if (!boardId) return;
      const key = String(boardId);
      this.boardPrefs = {
        ...this.boardPrefs,
        [key]: { ...(this.boardPrefs[key] || {}), ...patch },
      };
      this.saveBoardPrefs();
    },

    boardGradient(board) {
      const pref = this.getBoardPref(board?.id);
      if (pref.background) return pref.background;
      const gradients = this.bgGradients.map((g) => g.value);
      return gradients[((board?.id || 1) - 1) % gradients.length];
    },

    isImageBackground(bgValue) {
      return typeof bgValue === 'string' && (bgValue.startsWith('data:image/') || bgValue.startsWith('http'));
    },

    boardBgStyle(board) {
      const bg = this.boardGradient(board);
      if (this.isImageBackground(bg)) {
        return `background-image: url('${bg}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
      }
      return `background: ${bg};`;
    },

    saveUploadedBackgrounds() {
      try {
        localStorage.setItem('hubup_uploaded_bgs', JSON.stringify(this.uploadedBackgrounds));
      } catch (_) {
        // Caso ultrapasse a cota do localStorage, mantém apenas as 3 imagens mais recentes
        this.uploadedBackgrounds = this.uploadedBackgrounds.slice(0, 3);
        try {
          localStorage.setItem('hubup_uploaded_bgs', JSON.stringify(this.uploadedBackgrounds));
        } catch (__) {
          // ignore
        }
      }
    },

    compressImageFile(file, maxDim = 1920, quality = 0.82) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('Arquivo inválido ou não é uma imagem suportada.'));
          img.onload = () => {
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              const ratio = Math.min(maxDim / width, maxDim / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    },

    async handleBackgroundUpload(event) {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.notify('Selecione um arquivo de imagem válido (PNG, JPG, WEBP).', 'error');
        return;
      }

      this.uploadingBg = true;
      try {
        const dataUrl = await this.compressImageFile(file);
        const item = {
          id: `img-${Date.now()}`,
          name: file.name,
          value: dataUrl,
        };
        this.uploadedBackgrounds = [item, ...this.uploadedBackgrounds.filter((x) => x.value !== dataUrl)].slice(0, 6);
        this.saveUploadedBackgrounds();
        this.setBoardBackground(dataUrl);
        this.refreshIcons();
      } catch (err) {
        this.notify(err.message || 'Erro ao carregar imagem.', 'error');
      } finally {
        this.uploadingBg = false;
      }
    },

    removeUploadedBackground(imgId) {
      const target = this.uploadedBackgrounds.find((x) => x.id === imgId);
      this.uploadedBackgrounds = this.uploadedBackgrounds.filter((x) => x.id !== imgId);
      this.saveUploadedBackgrounds();
      if (target && this.activeBoard && this.boardGradient(this.activeBoard) === target.value) {
        this.resetBoardBackground();
      }
      this.refreshIcons();
    },

    isBoardStarred(boardId) {
      return Boolean(this.getBoardPref(boardId).starred);
    },

    toggleBoardStar(boardId = null) {
      const id = boardId || this.activeBoard?.id;
      if (!id) return;
      const next = !this.isBoardStarred(id);
      this.setBoardPref(id, { starred: next });
      this.notify(next ? 'Quadro marcado com estrela!' : 'Estrela removida do quadro.');
      this.refreshIcons();
    },

    setBoardBackground(bgValue) {
      if (!this.activeBoard) return;
      this.setBoardPref(this.activeBoard.id, { background: bgValue });
      this.notify('Plano de fundo atualizado!');
    },

    applyCustomBackground() {
      this.setBoardBackground(this.customBgColor);
    },

    resetBoardBackground() {
      if (!this.activeBoard) return;
      this.setBoardPref(this.activeBoard.id, { background: null });
      this.notify('Plano de fundo restaurado para o padrão.');
    },

    openMenu(section = 'main') {
      this.menuSection = section;
      this.menuOpen = true;
      this.refreshIcons();
    },

    closeMenu() {
      this.menuOpen = false;
      this.menuSection = 'main';
    },

    setMenuSection(section) {
      this.menuSection = section;
      this.refreshIcons();
    },

    toggleShowCardCodes() {
      this.showCardCodes = !this.showCardCodes;
      localStorage.setItem('hubup_show_codes', String(this.showCardCodes));
    },

    toggleCompactCards() {
      this.compactCards = !this.compactCards;
      localStorage.setItem('hubup_compact_cards', String(this.compactCards));
    },

    // ---------------- Compartilhar & Descompartilhar com Contatos ----------------
    openShareModal() {
      if (!this.activeBoard) return;
      this.ensureDefaultShares(this.activeBoard);
      this.shareInput = '';
      this.shareRole = 'editor';
      this.showShareModal = true;
      this.closeMenu();
      this.refreshIcons();
    },

    closeShareModal() {
      this.showShareModal = false;
      this.shareInput = '';
    },

    ensureDefaultShares(board) {
      if (!board) return;
      const pref = this.getBoardPref(board.id);
      if (Array.isArray(pref.sharedContacts)) return;
      // Inicializa com os responsáveis já presentes nos cartões do quadro
      const names = new Set();
      (board.columns || []).forEach((col) => (col.cards || []).forEach((c) => c.assignee && names.add(c.assignee)));
      const initial = [...names].map((name, idx) => {
        const known = this.workspaceContacts.find((wc) => wc.name.toLowerCase() === name.toLowerCase());
        return {
          id: known ? known.id : `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          email: known ? known.email : `${name.toLowerCase().replace(/\s+/g, '.')}@hubup.com.br`,
          access: idx === 0 ? 'admin' : 'editor',
        };
      });
      this.setBoardPref(board.id, { sharedContacts: initial, linkEnabled: true });
    },

    sharedContacts(board = null) {
      const target = board || this.activeBoard;
      if (!target) return [];
      const pref = this.getBoardPref(target.id);
      if (Array.isArray(pref.sharedContacts)) return pref.sharedContacts;
      // Fallback antes da primeira abertura do modal
      const names = new Set();
      (target.columns || []).forEach((col) => (col.cards || []).forEach((c) => c.assignee && names.add(c.assignee)));
      return [...names].map((name, idx) => {
        const known = this.workspaceContacts.find((wc) => wc.name.toLowerCase() === name.toLowerCase());
        return {
          id: known ? known.id : `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          email: known ? known.email : `${name.toLowerCase().replace(/\s+/g, '.')}@hubup.com.br`,
          access: idx === 0 ? 'admin' : 'editor',
        };
      });
    },

    availableContactsToShare() {
      const current = this.sharedContacts();
      const sharedEmails = new Set(current.map((c) => c.email.toLowerCase()));
      const sharedNames = new Set(current.map((c) => c.name.toLowerCase()));
      const q = this.shareInput.trim().toLowerCase();
      return this.workspaceContacts.filter((c) => {
        if (sharedEmails.has(c.email.toLowerCase()) || sharedNames.has(c.name.toLowerCase())) return false;
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
      });
    },

    shareWithContact(contact, access = null) {
      if (!this.activeBoard) return;
      this.ensureDefaultShares(this.activeBoard);
      const list = [...this.sharedContacts()];
      const already = list.some(
        (c) => c.email.toLowerCase() === contact.email.toLowerCase() || c.name.toLowerCase() === contact.name.toLowerCase()
      );
      if (already) {
        this.notify(`${contact.name} já tem acesso a este quadro.`, 'error');
        return;
      }
      list.push({
        id: contact.id || `c-${Date.now()}`,
        name: contact.name,
        email: contact.email,
        access: access || this.shareRole || 'editor',
      });
      this.setBoardPref(this.activeBoard.id, { sharedContacts: list });
      this.shareInput = '';
      this.notify(`Quadro compartilhado com ${contact.name}!`);
      this.refreshIcons();
    },

    submitShareInput() {
      const raw = this.shareInput.trim();
      if (!raw || !this.activeBoard) return;
      const match = this.workspaceContacts.find(
        (c) => c.email.toLowerCase() === raw.toLowerCase() || c.name.toLowerCase() === raw.toLowerCase()
      );
      if (match) {
        this.shareWithContact(match, this.shareRole);
        return;
      }
      const isEmail = raw.includes('@');
      const name = isEmail
        ? raw.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : raw;
      const email = isEmail ? raw.toLowerCase() : `${raw.toLowerCase().replace(/\s+/g, '.')}@hubup.com.br`;
      this.shareWithContact({ id: `ext-${Date.now()}`, name, email }, this.shareRole);
    },

    updateContactAccess(contactId, newAccess) {
      if (!this.activeBoard) return;
      this.ensureDefaultShares(this.activeBoard);
      const list = this.sharedContacts().map((c) => (c.id === contactId ? { ...c, access: newAccess } : c));
      this.setBoardPref(this.activeBoard.id, { sharedContacts: list });
      this.notify('Permissão atualizada!');
    },

    unshareContact(contactId) {
      if (!this.activeBoard) return;
      this.ensureDefaultShares(this.activeBoard);
      const current = this.sharedContacts();
      const target = current.find((c) => c.id === contactId);
      const next = current.filter((c) => c.id !== contactId);
      this.setBoardPref(this.activeBoard.id, { sharedContacts: next });
      this.notify(target ? `Acesso removido para ${target.name}.` : 'Contato descompartilhado.');
      this.refreshIcons();
    },

    unshareAllContacts() {
      if (!this.activeBoard) return;
      if (!window.confirm('Deseja descompartilhar este quadro com todos os contatos?')) return;
      this.setBoardPref(this.activeBoard.id, { sharedContacts: [] });
      this.notify('Quadro descompartilhado com todos os contatos.');
      this.refreshIcons();
    },

    isShareLinkEnabled() {
      if (!this.activeBoard) return true;
      const pref = this.getBoardPref(this.activeBoard.id);
      return pref.linkEnabled !== false;
    },

    toggleShareLink() {
      if (!this.activeBoard) return;
      const next = !this.isShareLinkEnabled();
      this.setBoardPref(this.activeBoard.id, { linkEnabled: next });
      this.notify(next ? 'Link de compartilhamento ativado.' : 'Link de compartilhamento desativado.');
    },

    accessLabel(access) {
      return { admin: 'Administrador', editor: 'Editor', viewer: 'Visualizador' }[access] || access;
    },

    async shareBoardLink() {
      if (!this.activeBoard) return;
      const url = `${window.location.origin}${window.location.pathname}#board=${this.activeBoard.id}`;
      try {
        await navigator.clipboard.writeText(url);
        this.notify('Link do quadro copiado para a área de transferência!');
      } catch (_) {
        window.prompt('Copie o link do quadro:', url);
      }
    },

    exportBoardJson() {
      if (!this.activeBoard) return;
      const blob = new Blob([JSON.stringify(this.activeBoard, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hubup-${this.activeBoard.prefix_key.toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.notify('Quadro exportado em JSON!');
    },

    exportBoardCsv() {
      if (!this.activeBoard) return;
      const rows = [['Código', 'Coluna', 'Título', 'Prioridade', 'Story Points', 'Responsável', 'Bloqueado', 'Subtarefas']];
      for (const col of this.activeBoard.columns) {
        for (const card of col.cards) {
          const stDone = this.completedSubtasksCount(card);
          rows.push([
            card.code,
            col.name,
            card.title,
            this.priorityLabel(card.priority),
            card.story_points ?? '',
            card.assignee || '',
            card.is_blocked ? 'Sim' : 'Não',
            `${stDone}/${(card.subtasks || []).length}`,
          ]);
        }
      }
      const csv = rows
        .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hubup-${this.activeBoard.prefix_key.toLowerCase()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.notify('Quadro exportado em CSV!');
    },

    printBoard() {
      this.closeMenu();
      setTimeout(() => window.print(), 150);
    },

    async updateColumnWipDirect(column, rawVal) {
      const parsed = Number.parseInt(rawVal, 10);
      const wip = Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
      try {
        await this.apiFetch(`/columns/${column.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ wip_limit: wip }),
        });
        this.notify(`WIP de "${column.name}" atualizado.`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao atualizar WIP: ${err.message}`, 'error');
      }
    },

    labelTextColor(hex) {
      const h = (hex || '#000000').replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? '#172B4D' : '#FFFFFF';
    },

    initials(name) {
      if (!name) return '?';
      const parts = name.trim().split(/\s+/);
      return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    },

    avatarColor(name) {
      const palette = ['#0C66E4', '#6E5DC6', '#E2483D', '#1F845A', '#B65C02', '#C9372C', '#0055CC', '#943D73'];
      let hash = 0;
      for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
      return palette[hash % palette.length];
    },

    boardMembers() {
      return this.sharedContacts().map((c) => c.name);
    },

    columnName(columnId) {
      const col = this.activeBoard?.columns.find((c) => c.id === columnId);
      return col ? col.name : '';
    },

    // ---------------- Cadastro rápido inline ----------------
    openQuickAdd(columnId) {
      this.quickAddColumnId = columnId;
      this.quickAddTitle = '';
      this.$nextTick(() => {
        const el = document.getElementById(`quick-add-${columnId}`);
        if (el) el.focus();
        this.refreshIcons();
      });
    },

    closeQuickAdd() {
      this.quickAddColumnId = null;
      this.quickAddTitle = '';
      this.refreshIcons();
    },

    async submitQuickAdd(column) {
      const title = this.quickAddTitle.trim();
      if (!title || !this.activeBoard) return;
      try {
        const created = await this.apiFetch(`/boards/${this.activeBoard.id}/cards`, {
          method: 'POST',
          body: JSON.stringify({ title, column_id: column.id, priority: 'media' }),
        });
        this.quickAddTitle = '';
        this.notify(`Cartão ${created.code} adicionado em "${column.name}"`);
        await this.refreshActiveBoard();
        this.$nextTick(() => document.getElementById(`quick-add-${column.id}`)?.focus());
      } catch (err) {
        this.notify(`Erro ao criar cartão: ${err.message}`, 'error');
      }
    },

    // ---------------- Arrastar o fundo do quadro (pan horizontal) ----------------
    startPan(e) {
      if (e.button !== 0 || e.target.closest('.kanban-list, button, input, textarea, select, a')) return;
      const scroller = e.currentTarget;
      this._pan = { x: e.clientX, left: scroller.scrollLeft, el: scroller };
      scroller.classList.add('is-panning');
      const move = (ev) => {
        if (!this._pan) return;
        this._pan.el.scrollLeft = this._pan.left - (ev.clientX - this._pan.x);
      };
      const up = () => {
        if (this._pan) this._pan.el.classList.remove('is-panning');
        this._pan = null;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    boardColor(board) {
      const palette = ['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#14B8A6'];
      return palette[((board?.id || 1) - 1) % palette.length];
    },

    priorityColor(priority) {
      return { critica: '#EF4444', alta: '#F59E0B', media: '#0EA5E9', baixa: '#94A3B8' }[priority] || '#0EA5E9';
    },

    columnStyle(column) {
      const color = column.wip_exceeded ? '#EF4444' : column.color;
      if (this.theme === 'light') {
        return `border-top: 3px solid ${color}; background: linear-gradient(180deg, ${color}1F 0%, ${color}0A 120px, #FFFFFFCC 260px);`;
      }
      return `border-top: 3px solid ${color};`;
    },

    openNewCardModal(columnId = null) {
      if (!this.activeBoard || !this.activeBoard.columns.length) return;
      this.newCard = {
        title: '',
        column_id: columnId || this.activeBoard.columns[0].id,
        priority: 'media',
        story_points: '',
        assignee: '',
        description: '',
        label_ids: [],
      };
      this.showNewCardModal = true;
      this.refreshIcons();
    },

    toggleNewCardLabel(labelId) {
      const idx = this.newCard.label_ids.indexOf(labelId);
      if (idx >= 0) {
        this.newCard.label_ids.splice(idx, 1);
      } else {
        this.newCard.label_ids.push(labelId);
      }
    },

    async submitNewCard() {
      if (!this.newCard.title.trim() || !this.activeBoard) return;
      this.submitting = true;
      try {
        const payload = {
          title: this.newCard.title.trim(),
          column_id: Number(this.newCard.column_id),
          priority: this.newCard.priority,
          story_points: this.newCard.story_points === '' ? null : Number(this.newCard.story_points),
          assignee: this.newCard.assignee.trim() || null,
          description: this.newCard.description.trim() || null,
          label_ids: this.newCard.label_ids,
        };
        const created = await this.apiFetch(`/boards/${this.activeBoard.id}/cards`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        this.showNewCardModal = false;
        this.notify(`Card ${created.code} criado com sucesso!`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao criar card: ${err.message}`, 'error');
      } finally {
        this.submitting = false;
      }
    },

    openCardDetail(card, edit = false) {
      this.selectedCard = card;
      this.newSubtaskTitle = '';
      this.editMode = false;
      if (edit) this.startEdit();
      this.refreshIcons();
    },

    closeCardDetail() {
      this.selectedCard = null;
      this.editMode = false;
    },

    async toggleSubtask(subtask) {
      const nextState = !subtask.is_completed;
      try {
        await this.apiFetch(`/subtasks/${subtask.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_completed: nextState }),
        });
        subtask.is_completed = nextState;
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao atualizar subtarefa: ${err.message}`, 'error');
      }
    },

    async addSubtask() {
      if (!this.selectedCard || !this.newSubtaskTitle.trim()) return;
      try {
        await this.apiFetch(`/cards/${this.selectedCard.id}/subtasks`, {
          method: 'POST',
          body: JSON.stringify({ title: this.newSubtaskTitle.trim() }),
        });
        this.newSubtaskTitle = '';
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao adicionar subtarefa: ${err.message}`, 'error');
      }
    },

    async deleteSubtask(subtaskId) {
      try {
        await this.apiFetch(`/subtasks/${subtaskId}`, { method: 'DELETE' });
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao remover subtarefa: ${err.message}`, 'error');
      }
    },

    async toggleCardBlock(card) {
      let payload;
      if (card.is_blocked) {
        payload = { is_blocked: false, blocked_reason: null };
      } else {
        const reason = window.prompt('Informe o motivo do bloqueio:');
        if (reason === null) return;
        payload = {
          is_blocked: true,
          blocked_reason: reason.trim() || 'Aguardando definição externa.',
        };
      }
      try {
        await this.apiFetch(`/cards/${card.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        this.notify(payload.is_blocked ? 'Card marcado como bloqueado.' : 'Bloqueio removido.');
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao atualizar bloqueio: ${err.message}`, 'error');
      }
    },

    async deleteCard(cardId) {
      if (!window.confirm('Deseja realmente excluir este card?')) return;
      try {
        await this.apiFetch(`/cards/${cardId}`, { method: 'DELETE' });
        this.selectedCard = null;
        this.notify('Card excluído.');
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao excluir card: ${err.message}`, 'error');
      }
    },

    async editColumnWip(column) {
      const current = column.wip_limit ? String(column.wip_limit) : '0';
      const input = window.prompt(
        `Limite WIP para "${column.name}" (informe 0 para remover o limite):`,
        current
      );
      if (input === null) return;
      const parsed = Number.parseInt(input, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        this.notify('Informe um número inteiro válido (>= 0).', 'error');
        return;
      }
      try {
        await this.apiFetch(`/columns/${column.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ wip_limit: parsed }),
        });
        this.notify(`Limite WIP de "${column.name}" atualizado.`);
        await this.refreshActiveBoard();
      } catch (err) {
        this.notify(`Erro ao atualizar limite WIP: ${err.message}`, 'error');
      }
    },

    completedSubtasksCount(card) {
      if (!card || !card.subtasks) return 0;
      return card.subtasks.filter((s) => s.is_completed).length;
    },

    priorityLabel(priority) {
      const map = {
        critica: 'Crítica',
        alta: 'Alta',
        media: 'Média',
        baixa: 'Baixa',
      };
      return map[priority] || priority;
    },

    priorityBadgeClass(priority) {
      const map = {
        critica: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/40',
        alta: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
        media: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40',
        baixa: 'bg-slate-200/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600/50',
      };
      return map[priority] || map.media;
    },

    columnProgressWidth(col) {
      if (col.wip_limit && col.wip_limit > 0) {
        return Math.min(Math.round((col.card_count / col.wip_limit) * 100), 100);
      }
      if (!this.metrics || this.metrics.total_cards === 0) return 0;
      return Math.min(Math.round((col.card_count / this.metrics.total_cards) * 100), 100);
    },
  };
}
