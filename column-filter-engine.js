/**
 * ============================================================================
 * PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
 * ColumnFilterEngine — Filtros por Coluna Estilo Planilha (Excel / Google Sheets)
 * ============================================================================
 */

(function (window) {
  'use strict';

  const tablesState = {}; // tableId -> { activeFilters: { colKey: Set(...) }, datasetFn: fn, onChange: fn }
  let activePopover = null;

  function normValue(val) {
    if (val === null || val === undefined) return '(Vazio)';
    const s = String(val).trim();
    return s === '' ? '(Vazio)' : s;
  }

  const ColumnFilterEngine = {
    /**
     * Registra uma tabela para ter suporte a filtros de coluna
     * @param {string} tableId 
     * @param {Object} options { getDataset: Function, onChange: Function, keyExtractors: Object }
     */
    registerTable(tableId, options) {
      const changeCallback = options.onChange || options.onFilterChange || (() => {});
      if (!tablesState[tableId]) {
        tablesState[tableId] = {
          activeFilters: {},
          datasetFn: options.getDataset || (() => []),
          onChange: changeCallback,
          keyExtractors: options.keyExtractors || {}
        };
      } else {
        if (options.getDataset) tablesState[tableId].datasetFn = options.getDataset;
        if (options.onChange || options.onFilterChange) tablesState[tableId].onChange = changeCallback;
        if (options.keyExtractors) tablesState[tableId].keyExtractors = options.keyExtractors;
      }
    },

    /**
     * Retorna os filtros ativos de uma tabela
     */
    getActiveFilters(tableId) {
      return tablesState[tableId]?.activeFilters || {};
    },

    /**
     * Retorna o mapa de filtros ativos serializado em formato de objeto { colKey: Array<string> }
     */
    getActiveFiltersState(tableId) {
      const filters = this.getActiveFilters(tableId);
      const res = {};
      for (const k in filters) {
        if (filters[k] && filters[k].size > 0) {
          if (filters[k].has('__NO_MATCH__')) {
            res[k] = [];
          } else {
            res[k] = Array.from(filters[k]);
          }
        }
      }
      return res;
    },

    /**
     * Alias para clearAll
     */
    clearTableFilters(tableId) {
      return this.clearAll(tableId);
    },

    /**
     * Verifica se uma coluna específica tem filtro ativo
     */
    hasActiveFilter(tableId, colKey) {
      const colFilter = tablesState[tableId]?.activeFilters[colKey];
      return colFilter && colFilter.size > 0;
    },

    /**
     * Número total de colunas com filtros ativos
     */
    getActiveFilterCount(tableId) {
      const filters = tablesState[tableId]?.activeFilters || {};
      let count = 0;
      for (const k in filters) {
        if (filters[k] && filters[k].size > 0) count++;
      }
      return count;
    },

    /**
     * Aplica os filtros ativos sobre o dataset
     */
    filterDataset(tableId, dataset, customExtractors = {}) {
      const state = tablesState[tableId];
      if (!state) return dataset;

      const active = state.activeFilters;
      const colKeys = Object.keys(active).filter(k => active[k] && active[k].size > 0);
      if (colKeys.length === 0) return dataset;

      const extractors = { ...(state.keyExtractors || {}), ...customExtractors };

      return dataset.filter(row => {
        for (const col of colKeys) {
          const allowed = active[col];
          const rawVal = extractors[col] ? extractors[col](row) : row[col];
          const val = normValue(rawVal);
          if (!allowed.has(val)) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * Limpa todos os filtros de uma tabela
     */
    clearAll(tableId) {
      if (tablesState[tableId]) {
        tablesState[tableId].activeFilters = {};
        this.updateHeaderIcons(tableId);
        if (typeof tablesState[tableId].onChange === 'function') {
          tablesState[tableId].onChange();
        }
        this.closePopover();
      }
    },

    /**
     * Limpa o filtro de uma coluna específica
     */
    clearColumnFilter(tableId, colKey) {
      if (tablesState[tableId]) {
        if (tablesState[tableId].activeFilters && tablesState[tableId].activeFilters[colKey]) {
          delete tablesState[tableId].activeFilters[colKey];
          this.updateHeaderIcons(tableId);
          if (typeof tablesState[tableId].onChange === 'function') {
            tablesState[tableId].onChange();
          }
        }
        this.closePopover();
      }
    },

    /**
     * Atualiza os ícones de filtro nos cabeçalhos
     */
    updateHeaderIcons(tableId) {
      const state = tablesState[tableId];
      if (!state) return;

      const container = document.getElementById(tableId) || document;
      const btns = container.querySelectorAll(`[data-col-filter-table="${tableId}"]`);

      btns.forEach(btn => {
        const colKey = btn.getAttribute('data-col-filter-key');
        const colFilter = state.activeFilters[colKey];
        const isActive = colFilter && colFilter.size > 0;
        if (isActive) {
          btn.classList.add('text-amber-400', 'bg-amber-950/80', 'ring-1', 'ring-amber-400/80', 'scale-110');
          btn.classList.remove('text-slate-400', 'hover:text-slate-200');
          const count = colFilter.has('__NO_MATCH__') ? 0 : colFilter.size;
          btn.title = `Filtro ativo: ${count} selecionado(s). Clique para editar.`;
        } else {
          btn.classList.remove('text-amber-400', 'bg-amber-950/80', 'ring-1', 'ring-amber-400/80', 'scale-110');
          btn.classList.add('text-slate-400', 'hover:text-slate-200');
          btn.title = 'Filtrar por esta coluna';
        }
      });
    },

    /**
     * Gera o HTML do botãozinho de filtro para o cabeçalho
     */
    renderFilterButtonHtml(tableId, colKey, colTitle = '') {
      const isActive = this.hasActiveFilter(tableId, colKey);
      const activeClasses = isActive
        ? 'text-amber-400 bg-amber-950/80 ring-1 ring-amber-400/80 scale-110'
        : 'text-slate-400 hover:text-slate-200';

      return `
        <button type="button"
          data-col-filter-table="${tableId}"
          data-col-filter-key="${colKey}"
          data-col-filter-title="${colTitle}"
          onclick="event.stopPropagation(); ColumnFilterEngine.open(this, '${tableId}', '${colKey}', '${colTitle.replace(/'/g, "\\'")}')"
          class="inline-flex items-center justify-center p-1 rounded-md text-[11px] transition duration-150 ml-1 cursor-pointer ${activeClasses}"
          title="${isActive ? 'Filtro ativo' : 'Filtrar por esta coluna'}">
          <svg class="w-3 h-3 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
        </button>
      `;
    },

    /**
     * Abre o popover de filtragem estilo Excel
     */
    open(triggerEl, tableId, colKey, colTitle) {
      if (activePopover && activePopover.colKey === colKey && activePopover.tableId === tableId) {
        this.closePopover();
        return;
      }
      this.closePopover();

      const state = tablesState[tableId];
      if (!state) return;

      const dataset = state.datasetFn() || [];
      const extractors = state.keyExtractors || {};
      const extractor = extractors[colKey];

      // Coleta valores únicos e suas frequências
      const countsMap = new Map();
      dataset.forEach(row => {
        const rawVal = extractor ? extractor(row) : row[colKey];
        const val = normValue(rawVal);
        countsMap.set(val, (countsMap.get(val) || 0) + 1);
      });

      const uniqueValues = Array.from(countsMap.keys()).sort((a, b) => {
        if (a === '(Vazio)') return 1;
        if (b === '(Vazio)') return -1;
        return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
      });

      // Valores atualmente selecionados
      const currentSelected = state.activeFilters[colKey]
        ? new Set(state.activeFilters[colKey])
        : new Set(uniqueValues);

      // Cria elemento do popover
      const popover = document.createElement('div');
      popover.id = 'column-filter-popover';
      popover.className = 'fixed z-[9999] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-300 w-72 p-3.5 text-xs animate-in fade-in duration-150 select-none';
      popover.style.display = 'block';

      popover.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-amber-600 text-sm">🔽</span>
            <span class="font-bold text-slate-800 truncate" title="${colTitle || colKey}">Filtro: ${colTitle || colKey}</span>
          </div>
          <button type="button" onclick="ColumnFilterEngine.closePopover()" class="text-slate-400 hover:text-slate-700 text-base font-bold p-0.5 rounded leading-none">✕</button>
        </div>

        <!-- Busca de valores -->
        <div class="mb-2">
          <input type="text" id="popover-filter-search" placeholder="Pesquisar nesta coluna..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none" />
        </div>

        <!-- Atalhos Selecionar Tudo / Limpar -->
        <div class="flex items-center justify-between text-[11px] text-indigo-700 font-semibold mb-2 px-1">
          <button type="button" id="btn-select-all-filter" class="hover:underline">Selecionar Tudo</button>
          <span class="text-slate-300">•</span>
          <button type="button" id="btn-clear-all-filter" class="hover:underline">Limpar Seleção</button>
        </div>

        <!-- Lista de Checkboxes -->
        <div id="popover-checkbox-container" class="max-h-48 overflow-y-auto space-y-1 py-1 pr-1 border border-slate-100 rounded-xl bg-slate-50/60 p-2">
          ${uniqueValues.map((val, idx) => {
            const isChecked = currentSelected.has(val);
            const count = countsMap.get(val);
            const escapedVal = String(val).replace(/"/g, '&quot;');
            return `
              <label class="filter-item-row flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-indigo-50/80 cursor-pointer text-slate-700 hover:text-indigo-950 transition">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <input type="checkbox" data-val-idx="${idx}" value="${escapedVal}" ${isChecked ? 'checked' : ''} class="filter-val-chk rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer w-3.5 h-3.5" />
                  <span class="truncate text-xs ${val === '(Vazio)' ? 'italic text-slate-400' : 'font-medium'}">${val}</span>
                </div>
                <span class="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">${count}</span>
              </label>
            `;
          }).join('')}
        </div>

        <!-- Ações do Rodapé -->
        <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-2.5">
          <button type="button" id="btn-popover-reset-col" class="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline">
            Remover Filtro
          </button>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="ColumnFilterEngine.closePopover()" class="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="button" id="btn-popover-apply" class="px-3.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              Aplicar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(popover);

      // Posicionamento inteligente em relação ao botão
      const rect = triggerEl.getBoundingClientRect();
      const popoverWidth = 288;
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }
      if (left < 16) left = 16;

      let top = rect.bottom + 6;
      if (top + 320 > window.innerHeight) {
        top = Math.max(16, rect.top - 326);
      }

      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;

      // Eventos internos do Popover
      const searchInput = popover.querySelector('#popover-filter-search');
      const itemRows = popover.querySelectorAll('.filter-item-row');
      const chkBoxes = popover.querySelectorAll('.filter-val-chk');

      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        itemRows.forEach(row => {
          const txt = row.querySelector('span').textContent.toLowerCase();
          row.style.display = txt.includes(q) ? 'flex' : 'none';
        });
      });

      popover.querySelector('#btn-select-all-filter').addEventListener('click', () => {
        chkBoxes.forEach(chk => {
          if (chk.closest('.filter-item-row').style.display !== 'none') {
            chk.checked = true;
          }
        });
      });

      popover.querySelector('#btn-clear-all-filter').addEventListener('click', () => {
        chkBoxes.forEach(chk => {
          if (chk.closest('.filter-item-row').style.display !== 'none') {
            chk.checked = false;
          }
        });
      });

      popover.querySelector('#btn-popover-reset-col').addEventListener('click', () => {
        this.clearColumnFilter(tableId, colKey);
      });

      popover.querySelector('#btn-popover-apply').addEventListener('click', () => {
        const selected = new Set();
        chkBoxes.forEach(chk => {
          if (chk.checked) {
            const idx = parseInt(chk.getAttribute('data-val-idx'), 10);
            if (!isNaN(idx) && idx >= 0 && idx < uniqueValues.length) {
              selected.add(uniqueValues[idx]);
            } else {
              selected.add(chk.value);
            }
          }
        });

        // Se todos foram marcados, considera sem filtro para essa coluna
        if (selected.size === uniqueValues.length) {
          delete state.activeFilters[colKey];
        } else if (selected.size === 0) {
          // Se nenhum foi marcado, filtra para não exibir registros dessa coluna
          state.activeFilters[colKey] = new Set(['__NO_MATCH__']);
        } else {
          state.activeFilters[colKey] = selected;
        }

        this.updateHeaderIcons(tableId);
        if (typeof state.onChange === 'function') {
          state.onChange();
        }
        this.closePopover();
      });

      // Fechar ao clicar fora
      const onDocClick = (e) => {
        if (!popover.contains(e.target) && !triggerEl.contains(e.target)) {
          this.closePopover();
        }
      };
      setTimeout(() => {
        document.addEventListener('click', onDocClick, { once: true });
      }, 50);

      activePopover = { popover, tableId, colKey, onDocClick };
      searchInput.focus();
    },

    /**
     * Fecha o popover ativo se existir
     */
    closePopover() {
      if (activePopover && activePopover.popover) {
        try {
          if (activePopover.onDocClick) {
            document.removeEventListener('click', activePopover.onDocClick);
          }
          activePopover.popover.remove();
        } catch (e) {}
      }
      activePopover = null;
    }
  };

  window.ColumnFilterEngine = ColumnFilterEngine;

})(window);
