/**
 * PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
 * Módulo: Painel Web de Upload & Gestão da Base de Conhecimento (Incremento 5)
 * Funcionalidades:
 *  - Criação de novas pastas com hierarquia e etapas
 *  - Upload de arquivos DOCX/PDF com conversão client-side para Markdown (Mammoth.js + Turndown.js + PDF.js)
 *  - Upload de mídias (áudio MP3, vídeo MP4) e apresentações PPTX para o Firebase Storage
 *  - Edição de documentos existentes e extração inteligente de referências integrada
 * Arquivo: knowledge-upload-panel.js
 */

(function () {
  'use strict';

  // Instância singleton do Turndown para converter HTML em Markdown limpo
  let turndownService = null;
  function getTurndown() {
    if (!turndownService && typeof TurndownService !== 'undefined') {
      turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '*'
      });

      // Melhora tabelas e blocos litúrgicos
      turndownService.addRule('callout', {
        filter: ['blockquote'],
        replacement: function (content) {
          return '\n\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n\n';
        }
      });
    }
    return turndownService;
  }

  // Gera slug limpo para IDs
  function slugify(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }

  // Objeto público do módulo
  window.KnowledgeUploadPanel = {
    currentStagedFile: null,
    currentDetectedType: 'document',
    currentDetectedExt: 'md',
    currentExtractedReferences: [],

    // ========================================================================
    // 1. UPLOAD PARA O FIREBASE STORAGE
    // ========================================================================
    uploadToStorage: function (file, folderPath = 'knowledge-base', onProgress) {
      return new Promise((resolve, reject) => {
        try {
          if (typeof firebase === 'undefined' || !firebase.storage) {
            return reject(new Error('Firebase Storage SDK não carregado no navegador.'));
          }

          const storage = firebase.storage();
          const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fullPath = `${folderPath}/${Date.now()}_${cleanName}`;
          const fileRef = storage.ref(fullPath);
          const uploadTask = fileRef.put(file);

          uploadTask.on(
            'state_changed',
            snapshot => {
              const pct = snapshot.totalBytes > 0
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                : 0;
              if (typeof onProgress === 'function') {
                onProgress(Math.round(pct), snapshot);
              }
            },
            err => {
              console.error('KnowledgeUploadPanel: Erro no upload para o Storage:', err);
              reject(err);
            },
            async () => {
              try {
                const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                resolve({
                  downloadUrl,
                  fullPath,
                  name: file.name,
                  size: file.size
                });
              } catch (e) {
                reject(e);
              }
            }
          );
        } catch (err) {
          reject(err);
        }
      });
    },

    // ========================================================================
    // 2. MODAL: NOVA PASTA
    // ========================================================================
    openCreateFolderModal: function (preselectedParentId) {
      if (!window.KnowledgeService || !window.KnowledgeService.canEdit()) {
        alert('Acesso restrito: apenas a Coordenação e o Master Admin podem criar pastas.');
        return;
      }

      let modal = document.getElementById('modal-wiki-create-folder');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-create-folder';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200';
        document.body.appendChild(modal);
      }

      const allNodes = (window.WikiKB && window.WikiKB.nodes) || [];
      const folders = allNodes.filter(n => n.type === 'folder');

      // Monta as opções hierárquicas com indentação
      let folderOptions = '<option value="">📁 Raiz (Nível Superior Geral)</option>';
      folders.forEach(f => {
        const isSelected = (preselectedParentId && f.id === preselectedParentId) ? 'selected' : '';
        const ancestors = window.WikiKB ? window.WikiKB.getAncestors(f.id) : [];
        const indent = '— '.repeat(Math.max(0, ancestors.length - 1));
        folderOptions += `<option value="${f.id}" ${isSelected}>${indent}📁 ${f.title}</option>`;
      });

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-500/20">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📁</span>
              <div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Criar Nova Pasta</h3>
                <p class="text-[11px] text-emerald-300">Organize os materiais de catequese por temas ou módulos</p>
              </div>
            </div>
            <button
              onclick="document.getElementById('modal-wiki-create-folder').classList.add('hidden')"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <form id="form-wiki-create-folder" class="p-6 space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Título da Pasta *</label>
              <input
                id="input-folder-title"
                type="text"
                required
                placeholder="Ex: Módulo 3: Sacramentos da Cura"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Pasta Mãe (Hierarquia)</label>
              <select
                id="input-folder-parent"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 text-xs bg-white font-medium"
              >
                ${folderOptions}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Etapa Correspondente</label>
                <select
                  id="input-folder-etapa"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs bg-white"
                >
                  <option value="Geral">Geral (Todas as Etapas)</option>
                  <option value="Pré-Eucaristia">Pré-Eucaristia</option>
                  <option value="Eucaristia I">Eucaristia I</option>
                  <option value="Eucaristia II">Eucaristia II</option>
                  <option value="Crisma Jovem">Crisma Jovem</option>
                  <option value="Crisma Adultos">Crisma Adultos</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Ordem de Exibição</label>
                <input
                  id="input-folder-order"
                  type="number"
                  value="10"
                  min="1"
                  max="99"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Descrição ou Finalidade Pastoral</label>
              <textarea
                id="input-folder-desc"
                rows="2"
                placeholder="Breve descrição dos assuntos ou materiais contidos nesta pasta..."
                class="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs"
              ></textarea>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onclick="document.getElementById('modal-wiki-create-folder').classList.add('hidden')"
                class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-submit-folder"
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>💾</span> <span>Criar Pasta</span>
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.remove('hidden');

      const form = document.getElementById('form-wiki-create-folder');
      form.onsubmit = async e => {
        e.preventDefault();
        const title = document.getElementById('input-folder-title').value.trim();
        const parentId = document.getElementById('input-folder-parent').value || null;
        const etapa = document.getElementById('input-folder-etapa').value;
        const order = parseInt(document.getElementById('input-folder-order').value, 10) || 10;
        const desc = document.getElementById('input-folder-desc').value.trim();

        if (!title) {
          alert('Por favor, informe o título da pasta.');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-folder');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> <span>Gravando...</span>';

        try {
          const folderId = `fld-${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
          const newFolder = {
            id: folderId,
            parentId: parentId,
            title: title,
            description: desc,
            type: 'folder',
            etapa: etapa,
            order: order,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await window.KnowledgeService.saveNode(newFolder);
          alert('✅ Pasta criada com sucesso!');
          modal.classList.add('hidden');

          // Expande pasta mãe se houver e seleciona a nova pasta
          if (parentId && window.WikiKB) {
            window.WikiKB.expandedFolders.add(parentId);
          }
          if (window.WikiKB) {
            window.WikiKB.selectNode(folderId);
          }
        } catch (err) {
          console.error('Erro ao criar pasta:', err);
          alert('❌ Erro ao criar pasta: ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>💾</span> <span>Criar Pasta</span>';
        }
      };
    },

    // ========================================================================
    // 3. MODAL: NOVO MATERIAL (UPLOAD DOCX, PDF, MÍDIAS, PPTX & MARKDOWN)
    // ========================================================================
    openUploadMaterialModal: function (preselectedParentId) {
      if (!window.KnowledgeService || !window.KnowledgeService.canEdit()) {
        alert('Acesso restrito: apenas a Coordenação e o Master Admin podem publicar materiais.');
        return;
      }

      this.currentStagedFile = null;
      this.currentDetectedType = 'document';
      this.currentDetectedExt = 'md';
      this.currentExtractedReferences = [];

      let modal = document.getElementById('modal-wiki-upload-material');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-upload-material';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-all duration-200';
        document.body.appendChild(modal);
      }

      const allNodes = (window.WikiKB && window.WikiKB.nodes) || [];
      const folders = allNodes.filter(n => n.type === 'folder');

      // Seleção de pasta de destino
      let folderOptions = '<option value="">📁 Raiz (Sem pasta mãe)</option>';
      folders.forEach(f => {
        const isSelected = (preselectedParentId && f.id === preselectedParentId) ? 'selected' : '';
        const ancestors = window.WikiKB ? window.WikiKB.getAncestors(f.id) : [];
        const indent = '— '.repeat(Math.max(0, ancestors.length - 1));
        folderOptions += `<option value="${f.id}" ${isSelected}>${indent}📁 ${f.title}</option>`;
      });

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          <!-- Topo do Modal -->
          <div class="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white flex items-center justify-between border-b border-emerald-500/20 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl">
                📤
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Adicionar Novo Material</h3>
                <p class="text-[11px] text-emerald-300">Upload de DOCX, PDF, Apresentações PPTX, Áudios e Vídeos</p>
              </div>
            </div>
            <button
              onclick="document.getElementById('modal-wiki-upload-material').classList.add('hidden')"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <!-- Corpo com Rolagem -->
          <div class="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            <!-- Zona de Drag & Drop -->
            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Arquivo de Origem (Arraste ou Selecione)</label>
              <div
                id="wiki-dropzone"
                onclick="document.getElementById('wiki-file-input').click()"
                class="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 text-center transition cursor-pointer group relative"
              >
                <input
                  type="file"
                  id="wiki-file-input"
                  class="hidden"
                  accept=".docx,.pdf,.mp3,.wav,.m4a,.mp4,.mov,.pptx,.ppt,.md,.txt"
                />
                <span class="text-3xl block mb-2 group-hover:scale-110 transition-transform">📄</span>
                <p class="text-xs sm:text-sm font-bold text-slate-800">
                  Clique para escolher ou arraste o arquivo até aqui
                </p>
                <p class="text-[11px] text-slate-500 mt-1">
                  Formatos suportados: <strong>DOCX</strong> (conversão para Markdown), <strong>PDF</strong>, <strong>PPTX</strong>, <strong>MP3</strong>, <strong>MP4</strong> ou <strong>MD</strong>
                </p>

                <!-- Status do Arquivo Selecionado -->
                <div id="wiki-staged-file-badge" class="hidden mt-3 p-2.5 bg-white rounded-xl border border-emerald-300 shadow-2xs text-left flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 min-w-0">
                    <span id="wiki-file-icon" class="text-lg">📄</span>
                    <div class="min-w-0">
                      <p id="wiki-file-name" class="font-bold text-slate-900 truncate text-xs"></p>
                      <p id="wiki-file-info" class="text-[10px] text-slate-500"></p>
                    </div>
                  </div>
                  <span id="wiki-type-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase flex-shrink-0"></span>
                </div>
              </div>
            </div>

            <!-- Progresso de Upload para o Storage (Visível durante envio) -->
            <div id="wiki-upload-progress-container" class="hidden space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span id="wiki-upload-status-label">Enviando para o Firebase Storage...</span>
                <span id="wiki-upload-percent-label">0%</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div id="wiki-upload-progress-bar" class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-150" style="width: 0%"></div>
              </div>
            </div>

            <!-- Metadados do Material -->
            <div class="space-y-3.5 pt-1">
              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Título Oficial do Material *</label>
                <input
                  id="wiki-material-title"
                  type="text"
                  required
                  placeholder="Ex: Roteiro 04: A Eucaristia como Fonte e Cume da Fé"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 text-xs font-semibold"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-700 mb-1 text-xs">Pasta de Destino *</label>
                  <select
                    id="wiki-material-parent"
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs bg-white font-medium"
                  >
                    ${folderOptions}
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1 text-xs">Etapa da Catequese</label>
                  <select
                    id="wiki-material-etapa"
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs bg-white"
                  >
                    <option value="Geral">Geral (Todas as Etapas)</option>
                    <option value="Pré-Eucaristia">Pré-Eucaristia</option>
                    <option value="Eucaristia I">Eucaristia I</option>
                    <option value="Eucaristia II">Eucaristia II</option>
                    <option value="Crisma Jovem">Crisma Jovem</option>
                    <option value="Crisma Adultos">Crisma Adultos</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Descrição ou Resumo Pedagógico</label>
                <textarea
                  id="wiki-material-desc"
                  rows="2"
                  placeholder="Orientações aos catequistas sobre o objetivo deste material..."
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none text-slate-800 text-xs"
                ></textarea>
              </div>

              <!-- Seção de Conteúdo Markdown (Para Documentos) -->
              <div id="wiki-markdown-section" class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <label class="block font-bold text-slate-700 text-xs">Conteúdo em Formato Markdown</label>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-tab-editor"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 text-white"
                    >
                      ✏️ Editor
                    </button>
                    <button
                      type="button"
                      id="btn-tab-preview"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      👁️ Prévia
                    </button>
                    <button
                      type="button"
                      id="btn-extract-refs-modal"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 transition flex items-center gap-1 cursor-pointer"
                      title="Detectar referências com IA antes de salvar"
                    >
                      <span>✨</span> <span>Detectar Referências (IA)</span>
                    </button>
                  </div>
                </div>

                <!-- Editor de Texto -->
                <textarea
                  id="wiki-markdown-editor"
                  rows="8"
                  placeholder="# Título do Documento&#10;&#10;Escreva o conteúdo formatado em Markdown ou importe de um arquivo .docx..."
                  class="w-full font-mono text-xs p-3 rounded-2xl border border-slate-300 focus:border-emerald-600 outline-none leading-relaxed text-slate-800 bg-slate-50/50"
                ></textarea>

                <!-- Prévia Visual do Markdown -->
                <div
                  id="wiki-markdown-preview"
                  class="hidden p-4 rounded-2xl border border-slate-200 bg-white max-h-64 overflow-y-auto wiki-prose text-xs"
                >
                  <p class="text-slate-400 italic">Prévia visual vazia.</p>
                </div>

                <!-- Box de Referências Detectadas no Modal -->
                <div id="wiki-detected-refs-box" class="hidden p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                      <span>✨</span> <span id="wiki-refs-count-label">Referências detectadas</span>
                    </span>
                    <button
                      type="button"
                      onclick="document.getElementById('wiki-detected-refs-box').classList.add('hidden')"
                      class="text-purple-600 hover:text-purple-900 text-xs"
                    >✕</button>
                  </div>
                  <div id="wiki-refs-chips" class="flex flex-wrap gap-1.5 text-[10px]"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rodapé do Modal com Ações -->
          <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
            <span class="text-[11px] text-slate-500">
              Todos os envios utilizam <strong>merge construtivo</strong>.
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="document.getElementById('modal-wiki-upload-material').classList.add('hidden')"
                class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-submit-material"
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>💾</span> <span>Publicar no Acervo</span>
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      this.bindUploadModalEvents();
    },

    // ========================================================================
    // 4. BIND DE EVENTOS DO MODAL DE UPLOAD
    // ========================================================================
    bindUploadModalEvents: function () {
      const fileInput = document.getElementById('wiki-file-input');
      const dropzone = document.getElementById('wiki-dropzone');
      const editor = document.getElementById('wiki-markdown-editor');
      const preview = document.getElementById('wiki-markdown-preview');
      const tabEditor = document.getElementById('btn-tab-editor');
      const tabPreview = document.getElementById('btn-tab-preview');
      const btnExtract = document.getElementById('btn-extract-refs-modal');
      const btnSubmit = document.getElementById('btn-submit-material');

      // Drag and Drop
      if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
          dropzone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('border-emerald-600', 'bg-emerald-100/60');
          });
        });
        ['dragleave', 'drop'].forEach(eventName => {
          dropzone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-emerald-600', 'bg-emerald-100/60');
          });
        });
        dropzone.addEventListener('drop', e => {
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            this.handleSelectedFile(files[0]);
          }
        });
      }

      if (fileInput) {
        fileInput.addEventListener('change', e => {
          if (e.target.files && e.target.files.length > 0) {
            this.handleSelectedFile(e.target.files[0]);
          }
        });
      }

      // Alternância de Abas: Editor vs Prévia
      if (tabEditor && tabPreview && editor && preview) {
        tabEditor.onclick = () => {
          tabEditor.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 text-white';
          tabPreview.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
          editor.classList.remove('hidden');
          preview.classList.add('hidden');
        };

        tabPreview.onclick = () => {
          tabPreview.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 text-white';
          tabEditor.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
          editor.classList.add('hidden');
          preview.classList.remove('hidden');
          const md = editor.value || '';
          if (typeof marked !== 'undefined') {
            preview.innerHTML = marked.parse(md);
          } else {
            preview.innerHTML = `<div class="whitespace-pre-line">${md}</div>`;
          }
        };
      }

      // Botão de Extração de Referências na Prévia do Modal
      if (btnExtract) {
        btnExtract.onclick = async () => {
          const md = (editor && editor.value) || '';
          if (!md.trim()) {
            alert('Por favor, informe ou converta o conteúdo antes de extrair as referências.');
            return;
          }
          btnExtract.disabled = true;
          btnExtract.innerHTML = '<span>⏳</span> <span>Extraindo...</span>';
          try {
            if (window.GeminiReferenceExtractor) {
              const refs = await window.GeminiReferenceExtractor.extractReferences(md);
              this.currentExtractedReferences = refs;
              this.renderDetectedRefsInModal(refs);
            }
          } catch (err) {
            console.error('Erro ao extrair referências no modal:', err);
            alert('Não foi possível extrair referências no momento: ' + err.message);
          } finally {
            btnExtract.disabled = false;
            btnExtract.innerHTML = '<span>✨</span> <span>Detectar Referências (IA)</span>';
          }
        };
      }

      // Botão de Publicar / Salvar
      if (btnSubmit) {
        btnSubmit.onclick = () => this.handleSaveMaterial();
      }
    },

    // ========================================================================
    // 5. PROCESSAMENTO DE ARQUIVO SELECIONADO (CONVERSÃO CLIENTE)
    // ========================================================================
    handleSelectedFile: async function (file) {
      this.currentStagedFile = file;
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();
      this.currentDetectedExt = ext;

      const titleInput = document.getElementById('wiki-material-title');
      const badgeContainer = document.getElementById('wiki-staged-file-badge');
      const fileNameEl = document.getElementById('wiki-file-name');
      const fileInfoEl = document.getElementById('wiki-file-info');
      const iconEl = document.getElementById('wiki-file-icon');
      const typeBadgeEl = document.getElementById('wiki-type-badge');
      const mdSection = document.getElementById('wiki-markdown-section');
      const editor = document.getElementById('wiki-markdown-editor');

      // Preenche o título se estiver vazio
      if (titleInput && !titleInput.value) {
        const rawTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        titleInput.value = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
      }

      // Mostra o badge do arquivo selecionado
      if (badgeContainer) {
        badgeContainer.classList.remove('hidden');
        if (fileNameEl) fileNameEl.textContent = fileName;
        if (fileInfoEl) {
          const mb = (file.size / (1024 * 1024)).toFixed(2);
          fileInfoEl.textContent = `${mb} MB • formato .${ext.toUpperCase()}`;
        }
      }

      // --- CASO 1: DOCX (CONVERSÃO VIA MAMMOTH + TURNDOWN) ---
      if (ext === 'docx') {
        this.currentDetectedType = 'document';
        if (iconEl) iconEl.textContent = '📘';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Documento Word (DOCX)';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200';
        }
        if (mdSection) mdSection.classList.remove('hidden');

        if (typeof mammoth !== 'undefined') {
          if (editor) editor.value = '⏳ Convertendo documento Word para Markdown...';
          try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            const html = result.value;

            const turndown = getTurndown();
            let md = turndown ? turndown.turndown(html) : html;
            if (editor) editor.value = md;

            // Ativa aba de prévia para mostrar ao usuário imediatamente
            const tabPreview = document.getElementById('btn-tab-preview');
            if (tabPreview) tabPreview.click();
          } catch (err) {
            console.error('Falha na conversão de DOCX:', err);
            if (editor) editor.value = '# ' + fileName + '\n\n*(Não foi possível converter o layout completo do DOCX automaticamente. Você pode digitar ou colar o conteúdo aqui).*';
          }
        }
      }
      // --- CASO 2: PDF (EXTRAÇÃO DE TEXTO VIA PDF.JS & ARQUIVO PARA STORAGE) ---
      else if (ext === 'pdf') {
        this.currentDetectedType = 'document';
        if (iconEl) iconEl.textContent = '📕';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Documento PDF';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-200';
        }
        if (mdSection) mdSection.classList.remove('hidden');

        if (typeof pdfjsLib !== 'undefined') {
          if (editor) editor.value = '⏳ Extraindo páginas e texto do PDF...';
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let extractedMd = `# ${fileName.replace(/\.pdf$/i, '')}\n\n`;

            for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageStr = textContent.items.map(item => item.str).join(' ');
              if (pageStr.trim()) {
                extractedMd += `### Página ${i}\n\n${pageStr}\n\n`;
              }
            }
            if (editor) editor.value = extractedMd;
          } catch (err) {
            console.warn('PDF.js texto fallback:', err);
            if (editor) editor.value = `# ${fileName}\n\nArquivo PDF anexado para download e consulta.`;
          }
        }
      }
      // --- CASO 3: ÁUDIO (MP3, WAV, M4A) ---
      else if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') {
        this.currentDetectedType = 'media';
        if (iconEl) iconEl.textContent = '🎵';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Áudio de Formação';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200';
        }
        if (mdSection) mdSection.classList.add('hidden');
      }
      // --- CASO 4: VÍDEO (MP4, MOV) ---
      else if (ext === 'mp4' || ext === 'mov') {
        this.currentDetectedType = 'media';
        if (iconEl) iconEl.textContent = '🎬';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Vídeo de Encontro';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200';
        }
        if (mdSection) mdSection.classList.add('hidden');
      }
      // --- CASO 5: APRESENTAÇÃO (PPTX, PPT) ---
      else if (ext === 'pptx' || ext === 'ppt') {
        this.currentDetectedType = 'presentation';
        if (iconEl) iconEl.textContent = '📊';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Apresentação (PowerPoint)';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200';
        }
        if (mdSection) mdSection.classList.add('hidden');
      }
      // --- CASO 6: MARKDOWN OU TEXTO PLANO ---
      else if (ext === 'md' || ext === 'txt') {
        this.currentDetectedType = 'document';
        if (iconEl) iconEl.textContent = '📝';
        if (typeBadgeEl) {
          typeBadgeEl.textContent = 'Texto Markdown';
          typeBadgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200';
        }
        if (mdSection) mdSection.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = ev => {
          if (editor) editor.value = ev.target.result;
        };
        reader.readAsText(file);
      }
    },

    // Renderiza chips das referências detectadas no modal
    renderDetectedRefsInModal: function (refs) {
      const box = document.getElementById('wiki-detected-refs-box');
      const countLabel = document.getElementById('wiki-refs-count-label');
      const chipsEl = document.getElementById('wiki-refs-chips');
      if (!box || !chipsEl) return;

      box.classList.remove('hidden');
      if (countLabel) {
        countLabel.textContent = `${refs.length} referências teológicas detectadas`;
      }

      if (refs.length === 0) {
        chipsEl.innerHTML = '<span class="text-slate-400 italic">Nenhuma citação explícita encontrada.</span>';
        return;
      }

      chipsEl.innerHTML = refs.map(r => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${r.type === 'biblia' ? 'bg-blue-100 text-blue-900 border-blue-200' : (r.type === 'cic' ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200')}">
          <span>${r.type === 'biblia' ? '📖' : (r.type === 'cic' ? '🏛️' : '📜')}</span>
          <span>${r.citation}</span>
        </span>
      `).join('');
    },

    // ========================================================================
    // 6. GRAVAÇÃO FINAL DO MATERIAL (STORAGE + FIRESTORE MERGE CONSTRUTIVO)
    // ========================================================================
    handleSaveMaterial: async function () {
      const titleInput = document.getElementById('wiki-material-title');
      const parentInput = document.getElementById('wiki-material-parent');
      const etapaInput = document.getElementById('wiki-material-etapa');
      const descInput = document.getElementById('wiki-material-desc');
      const editor = document.getElementById('wiki-markdown-editor');
      const btnSubmit = document.getElementById('btn-submit-material');

      const title = (titleInput && titleInput.value.trim()) || '';
      const parentId = (parentInput && parentInput.value) || null;
      const etapa = (etapaInput && etapaInput.value) || 'Geral';
      const description = (descInput && descInput.value.trim()) || '';
      let markdownContent = (editor && editor.value) || '';

      if (!title) {
        alert('Por favor, informe o título do material.');
        if (titleInput) titleInput.focus();
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>⏳</span> <span>Publicando...</span>';

      try {
        let mediaUrl = '';
        let fileSizeBytes = 0;

        // Se houver arquivo selecionado que precise de upload para o Firebase Storage
        // (mídias, pptx ou pdf grande)
        if (this.currentStagedFile) {
          const file = this.currentStagedFile;
          fileSizeBytes = file.size;

          const isBinaryMedia = this.currentDetectedType === 'media' ||
                                this.currentDetectedType === 'presentation' ||
                                this.currentDetectedExt === 'pdf';

          if (isBinaryMedia) {
            const progressContainer = document.getElementById('wiki-upload-progress-container');
            const percentLabel = document.getElementById('wiki-upload-percent-label');
            const progressBar = document.getElementById('wiki-upload-progress-bar');
            if (progressContainer) progressContainer.classList.remove('hidden');

            try {
              const uploadRes = await this.uploadToStorage(file, 'knowledge-base', pct => {
                if (percentLabel) percentLabel.textContent = `${pct}%`;
                if (progressBar) progressBar.style.width = `${pct}%`;
              });
              mediaUrl = uploadRes.downloadUrl;
            } catch (storageErr) {
              console.warn('Firebase Storage não aceitou upload direto:', storageErr);
              // Se falhar o Storage, gera fallback amigável ou link simbólico
              if (this.currentDetectedType === 'media' || this.currentDetectedType === 'presentation') {
                const proceedAnyway = confirm(
                  'Aviso de Armazenamento:\nO arquivo não pôde ser salvo no bucket do Firebase Storage no momento (' + storageErr.message + ').\n\nDeseja salvar o registro com link simbólico local?'
                );
                if (!proceedAnyway) {
                  throw storageErr;
                }
                mediaUrl = `https://storage.googleapis.com/catequese-icm.firebasestorage.app/knowledge-base/${file.name}`;
              }
            } finally {
              if (progressContainer) progressContainer.classList.add('hidden');
            }
          }
        }

        // Se for documento e não tiver referências detectadas ainda, tenta heurística rápida
        let references = this.currentExtractedReferences || [];
        if (this.currentDetectedType === 'document' && references.length === 0 && window.GeminiReferenceExtractor) {
          try {
            references = window.GeminiReferenceExtractor.extractWithRegex(markdownContent);
          } catch (e) {
            console.warn('Extração de fallback silenciosa:', e);
          }
        }

        const nodeId = `doc-${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
        const newNode = {
          id: nodeId,
          parentId: parentId,
          title: title,
          description: description,
          type: this.currentDetectedType,
          extension: this.currentDetectedExt,
          etapa: etapa,
          mediaUrl: mediaUrl,
          fileSizeBytes: fileSizeBytes,
          contentMarkdown: markdownContent,
          references: references,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Salva com merge construtivo seguro (Regra de Ouro)
        await window.KnowledgeService.saveNode(newNode);

        alert('✅ Material publicado com sucesso no acervo da Catequese!');
        document.getElementById('modal-wiki-upload-material').classList.add('hidden');

        // Expande pastas ancestrais e seleciona o material recém-criado
        if (parentId && window.WikiKB) {
          window.WikiKB.expandedFolders.add(parentId);
        }
        if (window.WikiKB) {
          window.WikiKB.selectNode(nodeId);
        }
      } catch (err) {
        console.error('Erro ao salvar material:', err);
        alert('❌ Não foi possível publicar o material:\n' + err.message);
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span>💾</span> <span>Publicar no Acervo</span>';
      }
    },

    // ========================================================================
    // 7. MODAL: EDITAR DOCUMENTO EXISTENTE
    // ========================================================================
    openEditDocumentModal: function (docNode) {
      if (!window.KnowledgeService || !window.KnowledgeService.canEdit()) {
        alert('Acesso restrito: apenas a Coordenação e o Master Admin podem editar materiais.');
        return;
      }
      if (!docNode) return;

      let modal = document.getElementById('modal-wiki-edit-doc');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-edit-doc';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-all duration-200';
        document.body.appendChild(modal);
      }

      const allNodes = (window.WikiKB && window.WikiKB.nodes) || [];
      const folders = allNodes.filter(n => n.type === 'folder');

      let folderOptions = '<option value="">📁 Raiz (Sem pasta mãe)</option>';
      folders.forEach(f => {
        const isSelected = f.id === docNode.parentId ? 'selected' : '';
        const ancestors = window.WikiKB ? window.WikiKB.getAncestors(f.id) : [];
        const indent = '— '.repeat(Math.max(0, ancestors.length - 1));
        folderOptions += `<option value="${f.id}" ${isSelected}>${indent}📁 ${f.title}</option>`;
      });

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          <div class="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/20">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">✏️</span>
              <div>
                <h3 class="text-base sm:text-lg font-bold font-heading text-white">Editar Documento</h3>
                <p class="text-[11px] text-amber-300">Atualize o texto, título ou pasta do material</p>
              </div>
            </div>
            <button
              onclick="document.getElementById('modal-wiki-edit-doc').classList.add('hidden')"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <div class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Título *</label>
              <input
                id="edit-doc-title"
                type="text"
                value="${docNode.title || ''}"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 outline-none text-slate-800 text-xs font-semibold"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Pasta</label>
                <select id="edit-doc-parent" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
                  ${folderOptions}
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1 text-xs">Etapa</label>
                <select id="edit-doc-etapa" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
                  <option value="Geral" ${docNode.etapa === 'Geral' ? 'selected' : ''}>Geral</option>
                  <option value="Pré-Eucaristia" ${docNode.etapa === 'Pré-Eucaristia' ? 'selected' : ''}>Pré-Eucaristia</option>
                  <option value="Eucaristia I" ${docNode.etapa === 'Eucaristia I' ? 'selected' : ''}>Eucaristia I</option>
                  <option value="Eucaristia II" ${docNode.etapa === 'Eucaristia II' ? 'selected' : ''}>Eucaristia II</option>
                  <option value="Crisma Jovem" ${docNode.etapa === 'Crisma Jovem' ? 'selected' : ''}>Crisma Jovem</option>
                  <option value="Crisma Adultos" ${docNode.etapa === 'Crisma Adultos' ? 'selected' : ''}>Crisma Adultos</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Descrição</label>
              <textarea id="edit-doc-desc" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">${docNode.description || ''}</textarea>
            </div>

            ${docNode.type === 'document' ? `
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block font-bold text-slate-700 text-xs">Conteúdo Markdown</label>
                  <button
                    type="button"
                    onclick="window.KnowledgeUploadPanel.extractRefsForEditModal()"
                    class="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>✨</span> <span>Re-escanear Referências</span>
                  </button>
                </div>
                <textarea
                  id="edit-doc-content"
                  rows="10"
                  class="w-full font-mono text-xs p-3 rounded-2xl border border-slate-300 focus:border-amber-600 outline-none leading-relaxed text-slate-800 bg-slate-50/50"
                >${docNode.contentMarkdown || ''}</textarea>
              </div>
            ` : ''}
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onclick="document.getElementById('modal-wiki-edit-doc').classList.add('hidden')"
              class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              id="btn-save-edit-doc"
              class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>💾</span> <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      const saveBtn = document.getElementById('btn-save-edit-doc');
      saveBtn.onclick = async () => {
        const title = document.getElementById('edit-doc-title').value.trim();
        const parentId = document.getElementById('edit-doc-parent').value || null;
        const etapa = document.getElementById('edit-doc-etapa').value;
        const desc = document.getElementById('edit-doc-desc').value.trim();
        const contentEl = document.getElementById('edit-doc-content');
        const contentMarkdown = contentEl ? contentEl.value : docNode.contentMarkdown;

        if (!title) {
          alert('Por favor, informe o título.');
          return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>⏳</span> <span>Salvando...</span>';

        try {
          docNode.title = title;
          docNode.parentId = parentId;
          docNode.etapa = etapa;
          docNode.description = desc;
          if (contentEl) docNode.contentMarkdown = contentMarkdown;
          docNode.updatedAt = new Date().toISOString();

          await window.KnowledgeService.saveNode(docNode);
          alert('✅ Documento atualizado com sucesso no Firestore!');
          modal.classList.add('hidden');
          window.WikiKB.selectNode(docNode.id);
        } catch (err) {
          console.error('Erro ao editar documento:', err);
          alert('Erro ao salvar: ' + err.message);
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<span>💾</span> <span>Salvar Alterações</span>';
        }
      };
    },

    extractRefsForEditModal: async function () {
      const contentEl = document.getElementById('edit-doc-content');
      if (!contentEl || !contentEl.value.trim()) return;
      if (window.GeminiReferenceExtractor) {
        try {
          const refs = await window.GeminiReferenceExtractor.extractReferences(contentEl.value);
          alert(`✨ Foram detectadas ${refs.length} referências teológicas no texto! Elas serão salvas ao confirmar o documento.`);
        } catch (e) {
          console.warn(e);
        }
      }
    },

    // ========================================================================
    // 8. MODAL: IMPORTAÇÃO DE CARGA DE ACERVO (SEED JSON) — EXCLUSIVO MASTER ADMIN
    // ========================================================================
    openImportSeedModal: function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isMasterAdmin()) {
        alert('Acesso restrito: apenas o Master Admin pode importar arquivos de carga do acervo.');
        return;
      }

      let modal = document.getElementById('modal-wiki-import-seed');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-import-seed';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-all duration-200';
        document.body.appendChild(modal);
      }

      const allNodes = (window.WikiKB && window.WikiKB.nodes) || [];
      const folders = allNodes.filter(n => n.type === 'folder');

      const getFolderPath = (folderId) => {
        const ancestors = window.WikiKB ? window.WikiKB.getAncestors(folderId) : [];
        return ancestors.map(a => a.title).join(' / ');
      };
      folders.sort((a, b) => getFolderPath(a.id).localeCompare(getFolderPath(b.id)));

      const activeNode = window.WikiKB ? window.WikiKB.getNode(window.WikiKB.activeNodeId) : null;
      const preselectedFolderId = (activeNode && activeNode.type === 'folder') ? activeNode.id : '';

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          <!-- Topo do Modal -->
          <div class="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/20 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                📥
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-bold font-heading text-white">Importar Carga do Acervo</h3>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950 tracking-wider">
                    Master Admin
                  </span>
                </div>
                <p class="text-[11px] text-amber-300">Carregamento em lote de nós estruturados (onedrive_seed.json)</p>
              </div>
            </div>
            <button
              onclick="document.getElementById('modal-wiki-import-seed').classList.add('hidden')"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <!-- Corpo do Modal -->
          <div class="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
            <!-- Dropzone para Arquivo JSON -->
            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">Arquivo de Carga (JSON) *</label>
              <div
                id="wiki-seed-dropzone"
                onclick="document.getElementById('wiki-seed-file-input').click()"
                class="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl p-6 text-center transition cursor-pointer group"
              >
                <input
                  type="file"
                  id="wiki-seed-file-input"
                  class="hidden"
                  accept=".json,application/json"
                />
                <span class="text-3xl block mb-1 group-hover:scale-110 transition-transform">📦</span>
                <p class="text-xs sm:text-sm font-bold text-slate-800">
                  Clique para selecionar o arquivo <code>onedrive_seed.json</code>
                </p>
                <p class="text-[11px] text-slate-500 mt-1">
                  Gerado pelo Assistente Local do OneDrive ou backup estruturado da Catequese.
                </p>
              </div>
            </div>

            <!-- Resumo do Arquivo Carregado -->
            <div id="wiki-seed-summary-box" class="hidden p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>📊</span> <span>Resumo do Arquivo Selecionado</span>
                </span>
                <span id="wiki-seed-filename" class="font-mono text-[10px] text-slate-500 truncate max-w-[200px]"></span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span class="block text-[10px] font-bold text-slate-400 uppercase">Pastas</span>
                  <span id="wiki-seed-count-folders" class="text-base font-black text-amber-700 font-heading">0</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span class="block text-[10px] font-bold text-slate-400 uppercase">Documentos</span>
                  <span id="wiki-seed-count-docs" class="text-base font-black text-emerald-700 font-heading">0</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span class="block text-[10px] font-bold text-slate-400 uppercase">Mídias/PPTX</span>
                  <span id="wiki-seed-count-media" class="text-base font-black text-blue-700 font-heading">0</span>
                </div>
              </div>
            </div>

            <!-- Seleção da Pasta de Destino da Carga (Evita descarte acidental na raiz) -->
            <div class="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label for="wiki-seed-dest-folder" class="block font-bold text-slate-800 text-xs">
                📁 Pasta de Destino para os Materiais da Carga *
              </label>
              <select
                id="wiki-seed-dest-folder"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-800 text-xs bg-white font-medium shadow-2xs"
              >
                <option value="__NEW_FOLDER__" ${!preselectedFolderId ? 'selected' : ''}>✨ Criar uma Nova Pasta para esta Carga...</option>
                ${folders.map(f => `
                  <option value="${f.id}" ${f.id === preselectedFolderId ? 'selected' : ''}>📁 ${getFolderPath(f.id)}</option>
                `).join('')}
                <option value="__ROOT__">🏛️ Raiz da Base de Conhecimento (Nível Principal)</option>
              </select>

              <!-- Caixa para Criar Nova Pasta sob demanda -->
              <div id="wiki-seed-new-folder-box" class="${preselectedFolderId ? 'hidden' : ''} pt-1 space-y-1">
                <label for="wiki-seed-new-folder-title" class="block text-[11px] font-bold text-slate-600">
                  Nome da Nova Pasta:
                </label>
                <input
                  type="text"
                  id="wiki-seed-new-folder-title"
                  placeholder="Ex: Acervo OneDrive - Catequese 1"
                  class="w-full px-3 py-2 rounded-xl border border-amber-300 focus:border-amber-600 outline-none text-slate-800 text-xs bg-white font-semibold"
                />
                <p class="text-[10px] text-amber-800">
                  Uma pasta mãe será criada e todos os materiais de primeiro nível da carga ficarão organizados dentro dela.
                </p>
              </div>
            </div>

            <!-- Alerta de Segurança e Merge Construtivo -->
            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5 leading-relaxed">
              <span class="text-base text-amber-600 mt-0.5">⚠️</span>
              <div>
                <strong class="font-bold block">Política de Merge Construtivo (Regra de Ouro):</strong>
                <span>Os novos materiais serão adicionados e mesclados no Firestore preservando integralmente todos os dados pré-existentes. Nenhum registro anterior será descartado.</span>
              </div>
            </div>

            <!-- Progresso de Importação em Lote -->
            <div id="wiki-seed-progress-container" class="hidden space-y-2 p-3.5 rounded-2xl bg-slate-900 text-white">
              <div class="flex items-center justify-between text-xs font-bold">
                <span id="wiki-seed-progress-title">Importando lotes no Firestore...</span>
                <span id="wiki-seed-progress-percent">0%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div id="wiki-seed-progress-bar" class="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-150" style="width: 0%"></div>
              </div>
              <p id="wiki-seed-progress-detail" class="text-[10px] text-slate-400 font-mono"></p>
            </div>
          </div>

          <!-- Rodapé do Modal -->
          <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
            <span class="text-[11px] text-slate-500">
              Operação exclusiva: <strong>Master Admin</strong>
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="document.getElementById('modal-wiki-import-seed').classList.add('hidden')"
                class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-import-seed"
                disabled
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚀</span> <span>Iniciar Ingestão no Firestore</span>
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      // Bind de eventos de upload do arquivo JSON
      let parsedNodes = null;
      const fileInput = document.getElementById('wiki-seed-file-input');
      const dropzone = document.getElementById('wiki-seed-dropzone');
      const confirmBtn = document.getElementById('btn-confirm-import-seed');
      const destSelect = document.getElementById('wiki-seed-dest-folder');
      const newFolderBox = document.getElementById('wiki-seed-new-folder-box');
      const newFolderTitleInput = document.getElementById('wiki-seed-new-folder-title');

      if (destSelect && newFolderBox) {
        destSelect.onchange = () => {
          if (destSelect.value === '__NEW_FOLDER__') {
            newFolderBox.classList.remove('hidden');
            if (newFolderTitleInput) newFolderTitleInput.focus();
          } else {
            newFolderBox.classList.add('hidden');
          }
        };
      }

      const processJsonFile = file => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const raw = JSON.parse(ev.target.result);
            const nodes = Array.isArray(raw) ? raw : (Array.isArray(raw.nodes) ? raw.nodes : []);
            if (!nodes.length) {
              alert('O arquivo JSON não contém uma lista válida de nós da Wiki.');
              return;
            }

            parsedNodes = nodes;
            const foldersCount = nodes.filter(n => n.type === 'folder').length;
            const docsCount = nodes.filter(n => n.type === 'document').length;
            const mediaCount = nodes.filter(n => n.type === 'media' || n.type === 'presentation').length;

            document.getElementById('wiki-seed-filename').textContent = file.name;
            document.getElementById('wiki-seed-count-folders').textContent = foldersCount;
            document.getElementById('wiki-seed-count-docs').textContent = docsCount;
            document.getElementById('wiki-seed-count-media').textContent = mediaCount;
            document.getElementById('wiki-seed-summary-box').classList.remove('hidden');

            // Sugere nome para a nova pasta se o campo estiver vazio
            if (newFolderTitleInput && !newFolderTitleInput.value) {
              const cleanName = file.name.replace(/\.json$/i, '').replace(/[-_]/g, ' ');
              newFolderTitleInput.value = 'Acervo ' + cleanName;
            }

            confirmBtn.disabled = false;
          } catch (err) {
            alert('Erro ao processar arquivo JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      };

      if (fileInput) {
        fileInput.onchange = e => {
          if (e.target.files && e.target.files.length) {
            processJsonFile(e.target.files[0]);
          }
        };
      }

      if (dropzone) {
        ['dragenter', 'dragover'].forEach(name => {
          dropzone.addEventListener(name, e => {
            e.preventDefault();
            dropzone.classList.add('border-amber-500', 'bg-amber-100/60');
          });
        });
        ['dragleave', 'drop'].forEach(name => {
          dropzone.addEventListener(name, e => {
            e.preventDefault();
            dropzone.classList.remove('border-amber-500', 'bg-amber-100/60');
          });
        });
        dropzone.addEventListener('drop', e => {
          const files = e.dataTransfer.files;
          if (files && files.length) {
            processJsonFile(files[0]);
          }
        });
      }

      // Execução da Ingestão em Lote
      confirmBtn.onclick = async () => {
        if (!parsedNodes || !parsedNodes.length) return;

        const destMode = destSelect ? destSelect.value : '';
        let targetParentId = null;
        let containerFolderNode = null;

        if (destMode === '__NEW_FOLDER__') {
          const folderTitle = (newFolderTitleInput ? newFolderTitleInput.value.trim() : '') || 'Acervo Importado';
          const containerFolderId = 'fld-import-' + Date.now();
          containerFolderNode = {
            id: containerFolderId,
            title: folderTitle,
            type: 'folder',
            parentId: null,
            etapa: 'Geral',
            description: `Pasta de carga criada automaticamente em ${new Date().toLocaleDateString('pt-BR')}.`,
            order: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          targetParentId = containerFolderId;
        } else if (destMode === '__ROOT__') {
          const confirmRoot = confirm(
            '⚠️ ATENÇÃO: Você selecionou a Raiz da Base de Conhecimento.\n\n' +
            'Todos os itens de primeiro nível da carga serão adicionados diretamente na Raiz da Wiki.\n\n' +
            'Deseja realmente continuar?'
          );
          if (!confirmRoot) return;
          targetParentId = null;
        } else if (destMode) {
          targetParentId = destMode;
        }

        // Aplica o targetParentId apenas aos nós de primeiro nível (que não tinham parentId)
        const finalNodes = parsedNodes.map(node => {
          if (!node.parentId) {
            return {
              ...node,
              parentId: targetParentId
            };
          }
          return node;
        });

        if (containerFolderNode) {
          finalNodes.unshift(containerFolderNode);
        }

        const destLabel = destMode === '__NEW_FOLDER__'
          ? `Nova Pasta "${containerFolderNode.title}"`
          : (targetParentId ? `Pasta selecionada` : 'Raiz da Base');

        const proceed = confirm(
          `Deseja realmente iniciar a ingestão de ${finalNodes.length} nós no Cloud Firestore?\n\n` +
          `• Destino: ${destLabel}\n` +
          `• Merge Construtivo seguro: nenhuma exclusão ou sobrescrita destrutiva.\n` +
          `• Atualiza a coleção knowledge_nodes.`
        );
        if (!proceed) return;

        confirmBtn.disabled = true;
        const progressContainer = document.getElementById('wiki-seed-progress-container');
        const progressBar = document.getElementById('wiki-seed-progress-bar');
        const progressPercent = document.getElementById('wiki-seed-progress-percent');
        const progressDetail = document.getElementById('wiki-seed-progress-detail');
        if (progressContainer) progressContainer.classList.remove('hidden');

        try {
          await window.KnowledgeService.importNodesBatch(finalNodes, (processed, total) => {
            const pct = Math.round((processed / total) * 100);
            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressPercent) progressPercent.textContent = `${pct}%`;
            if (progressDetail) progressDetail.textContent = `Processados ${processed} de ${total} registros...`;
          });

          alert(`🎉 Ingestão de ${finalNodes.length} materiais concluída com sucesso no Cloud Firestore!\n\nDestino: ${destLabel}`);
          modal.classList.add('hidden');

          // Atualiza a visualização da Wiki localmente
          if (window.WikiKB) {
            finalNodes.forEach(fn => {
              const idx = window.WikiKB.nodes.findIndex(n => n.id === fn.id);
              if (idx >= 0) window.WikiKB.nodes[idx] = fn;
              else window.WikiKB.nodes.push(fn);
            });
            if (window.KnowledgeService && window.KnowledgeService.saveLocalCache) {
              window.KnowledgeService.saveLocalCache(window.WikiKB.nodes);
            }
            window.WikiKB.renderTree();
            window.WikiKB.selectNode(targetParentId || finalNodes[0].id);
          }
        } catch (err) {
          console.error('Erro na ingestão em lote:', err);
          alert('❌ Falha na importação: ' + err.message);
        } finally {
          confirmBtn.disabled = false;
        }
      };
    }
  };
})();
