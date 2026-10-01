/**
 * PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
 * Módulo: Extrator Inteligente de Referências Bíblicas, CIC, Vaticano e Google Livros
 * Integração: Google Gemini API + Heurística RegEx de Alta Fidelidade Teológica
 * Arquivo: gemini-reference-extractor.js
 */

(function () {
  'use strict';

  const STORAGE_KEY_GEMINI = 'catequese_gemini_api_key_v1';

  // ==========================================================================
  // 1. MAPEAMENTO TEOLÓGICO DE FONTES OFICIAIS DA IGREJA
  // ==========================================================================
  const VATICAN_OFFICIAL_DOCS = [
    {
      keywords: ['catechesi tradendae', 'catechesi'],
      citation: 'Exortação Apostólica Catechesi Tradendae (São João Paulo II)',
      url: 'https://www.vatican.va/content/john-paul-ii/pt/apost_exhortations/documents/hf_jp-ii_exh_16101979_catechesi-tradendae.html',
      description: 'Sobre a catequese no nosso tempo, a pedagogia da fé e a missão dos catequistas.'
    },
    {
      keywords: ['dei verbum', 'dei-verbum'],
      citation: 'Constituição Dogmática Dei Verbum (Concílio Vaticano II)',
      url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_po.html',
      description: 'Sobre a Revelação Divina e a centralidade da Sagrada Escritura na catequese.'
    },
    {
      keywords: ['lumen gentium', 'lumen-gentium'],
      citation: 'Constituição Dogmática Lumen Gentium (Concílio Vaticano II)',
      url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_po.html',
      description: 'Sobre a Igreja, o Povo de Deus, o sacerdócio comum e a vocação à santidade.'
    },
    {
      keywords: ['sacrosanctum concilium'],
      citation: 'Constituição Sacrosanctum Concilium (Concílio Vaticano II)',
      url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19631204_sacrosanctum-concilium_po.html',
      description: 'Sobre a Sagrada Liturgia como cume e fonte da vida da Igreja.'
    },
    {
      keywords: ['gaudium et spes'],
      citation: 'Constituição Pastoral Gaudium et Spes (Concílio Vaticano II)',
      url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651207_gaudium-et-spes_po.html',
      description: 'A Igreja no mundo contemporâneo e a solidariedade cristã.'
    },
    {
      keywords: ['laudato si', 'laudato si’', 'cuidado da casa comum'],
      citation: 'Carta Encíclica Laudato Si’ (Papa Francisco)',
      url: 'https://www.vatican.va/content/francesco/pt/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html',
      description: 'Sobre o cuidado da Casa Comum, ecologia integral e a beleza sagrada da Criação.'
    },
    {
      keywords: ['fratelli tutti'],
      citation: 'Carta Encíclica Fratelli Tutti (Papa Francisco)',
      url: 'https://www.vatican.va/content/francesco/pt/encyclicals/documents/papa-francesco_20201003_enciclica-fratelli-tutti.html',
      description: 'Sobre a fraternidade humana e a amizade social inspirada no Bom Samaritano.'
    },
    {
      keywords: ['christus vivit'],
      citation: 'Exortação Apostólica Christus Vivit (Papa Francisco)',
      url: 'https://www.vatican.va/content/francesco/pt/apost_exhortations/documents/papa-francesco_esortazione-ap_20190325_christus-vivit.html',
      description: 'Aos jovens e a todo o Povo de Deus: "Cristo vive e é nossa esperança".'
    },
    {
      keywords: ['evangelii gaudium'],
      citation: 'Exortação Apostólica Evangelii Gaudium (Papa Francisco)',
      url: 'https://www.vatican.va/content/francesco/pt/apost_exhortations/documents/papa-francesco_esortazione-ap_20131124_evangelii-gaudium.html',
      description: 'Sobre o anúncio do Evangelho e a alegria missionária da Igreja.'
    },
    {
      keywords: ['diretório para a catequese', 'diretorio para a catequese'],
      citation: 'Diretório para a Catequese (Pontifício Conselho para a Promoção da Nova Evangelização)',
      url: 'https://www.google.com/search?tbm=bks&q=Diretorio+para+a+Catequese+Pontificio+Conselho',
      description: 'Diretrizes oficiais mundiais para a catequese da Igreja Católica.'
    }
  ];

  const BIBLE_BOOKS_MAP = {
    'gn': 'gn', 'gênesis': 'gn', 'genesis': 'gn',
    'ex': 'ex', 'êxodo': 'ex', 'exodo': 'ex',
    'lv': 'lv', 'levítico': 'lv',
    'nm': 'nm', 'números': 'nm',
    'dt': 'dt', 'deuteronômio': 'dt',
    'sl': 'sl', 'salmo': 'sl', 'salmos': 'sl',
    'is': 'is', 'isaías': 'is', 'isaias': 'is',
    'jr': 'jr', 'jeremias': 'jr',
    'mt': 'mt', 'mateus': 'mt',
    'mc': 'mc', 'marcos': 'mc',
    'lc': 'lc', 'lucas': 'lc',
    'jo': 'jo', 'joão': 'jo', 'joao': 'jo',
    'at': 'at', 'atos': 'at',
    'rm': 'rm', 'romanos': 'rm',
    '1co': '1co', '1cor': '1co', '1 coríntios': '1co',
    '2co': '2co', '2cor': '2co', '2 coríntios': '2co',
    'gl': 'gl', 'gálatas': 'gl',
    'ef': 'ef', 'efésios': 'ef',
    'fp': 'fp', 'filipenses': 'fp',
    'cl': 'cl', 'colossenses': 'cl',
    '1ts': '1ts', '1 tessalonicenses': '1ts',
    '2ts': '2ts', '2 tessalonicenses': '2ts',
    '1tm': '1tm', '1 timóteo': '1tm',
    '2tm': '2tm', '2 timóteo': '2tm',
    'tt': 'tt', 'tito': 'tt',
    'hb': 'hb', 'hebreus': 'hb',
    'tg': 'tg', 'tiago': 'tg',
    '1pe': '1pe', '1 pedro': '1pe',
    '2pe': '2pe', '2 pedro': '2pe',
    '1jo': '1jo', '1 joão': '1jo',
    'ap': 'ap', 'apocalipse': 'ap'
  };

  // ==========================================================================
  // 2. SERVIÇO PRINCIPAL DO EXTRATOR
  // ==========================================================================
  window.GeminiReferenceExtractor = {
    getApiKey: function () {
      return localStorage.getItem(STORAGE_KEY_GEMINI) || '';
    },

    setApiKey: function (key) {
      if (!key) {
        localStorage.removeItem(STORAGE_KEY_GEMINI);
      } else {
        localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
      }
    },

    hasApiKey: function () {
      return !!this.getApiKey();
    },

    // Extrai referências combinando Gemini com fallback Heurístico Regex
    extractReferences: async function (markdownText, options = {}) {
      if (!markdownText || typeof markdownText !== 'string') return [];

      const apiKey = options.apiKey || this.getApiKey();

      // Se houver chave Gemini, tenta a extração com IA primeiro
      if (apiKey) {
        try {
          console.log('🤖 GeminiReferenceExtractor: Extraindo referências com Google Gemini...');
          const aiRefs = await this.extractWithGeminiApi(markdownText, apiKey);
          if (aiRefs && aiRefs.length > 0) {
            console.log(`✅ Gemini retornou ${aiRefs.length} referências teológicas.`);
            return this.enrichAndDeduplicate(aiRefs);
          }
        } catch (err) {
          console.warn('⚠️ Falha na API Gemini, acionando motor heurístico local:', err);
        }
      }

      // Fallback Heurístico Local baseado em RegEx e Mapeamento Eclesial
      console.log('📖 GeminiReferenceExtractor: Processando via motor heurístico local...');
      const regexRefs = this.extractWithRegex(markdownText);
      return this.enrichAndDeduplicate(regexRefs);
    },

    // Chamada à API Google Gemini (modelo gemini-1.5-flash / gemini-2.0-flash)
    extractWithGeminiApi: async function (text, apiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const promptSystem = `
Você é um especialista em Teologia Católica, Sagrada Escritura e Documentos da Santa Sé da Pastoral da Catequese do Santuário Imaculado Coração de Maria.
Sua missão é ler o texto fornecido e extrair TODAS as referências teológicas em formato JSON rigoroso.

Tipos permitidos:
- "biblia": passagens bíblicas citadas (Ex: "Mt 28, 19-20", "Gn 1, 1-31", "Sl 8").
- "cic": parágrafos do Catecismo da Igreja Católica (Ex: "CIC § 1285-1321", "CIC § 4-9").
- "vaticano": encíclicas, concílios ou exortações apostólicas da Santa Sé (Ex: "Laudato Si’", "Lumen Gentium", "Dei Verbum", "Catechesi Tradendae").
- "livro": livros católicos, diretórios pastorais e bibliografia recomendada (Ex: "Diretório para a Catequese").

Para cada referência, retorne um objeto com:
- "type": "biblia" | "cic" | "vaticano" | "livro"
- "citation": citação exata e padronizada em português.
- "description": explicação concisa (1 linha) sobre o conteúdo daquela citação no contexto.
- "url": URL direta confiável (para Bíblia use "https://www.bibliaonline.com.br/nvi/livro/cap/vers" se possível; para Vaticano use link do vatican.va; para livros use link de busca do Google Livros: "https://www.google.com/search?tbm=bks&q=Nome+do+Livro").

Retorne APENAS um array JSON de objetos, sem formatações Markdown adicionais nem comentários.
`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptSystem },
              { text: `TEXTO A ANALISAR:\n\n${text.substring(0, 15000)}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Gemini API Error [${resp.status}]: ${errorText}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return [];

      try {
        const parsed = JSON.parse(rawText);
        return Array.isArray(parsed) ? parsed : (parsed.references || []);
      } catch (e) {
        console.warn('Erro ao fazer parse do JSON do Gemini:', e, rawText);
        return [];
      }
    },

    // Extração Heurística Local via RegEx e Mapeamentos
    extractWithRegex: function (text) {
      const results = [];
      const lower = text.toLowerCase();

      // 1. Detecta Documentos do Vaticano pelo catálogo de palavras-chave
      for (const doc of VATICAN_OFFICIAL_DOCS) {
        const matched = doc.keywords.some(kw => lower.includes(kw));
        if (matched) {
          results.push({
            type: doc.keywords.includes('diretório') ? 'livro' : 'vaticano',
            citation: doc.citation,
            url: doc.url,
            description: doc.description
          });
        }
      }

      // 2. Detecta Parágrafos do Catecismo da Igreja Católica (CIC)
      // Ex: CIC § 1285, CIC 1213-1274, CIC § 4-9
      const cicRegex = /(?:CIC|Catecismo(?:\s+da\s+Igreja\s+Católica)?)\s*(?:§|n\.?|parágrafos?|artigo)?\s*([0-9]+(?:\s*[-–]\s*[0-9]+)?)/gi;
      let cicMatch;
      while ((cicMatch = cicRegex.exec(text)) !== null) {
        const nums = cicMatch[1].trim();
        results.push({
          type: 'cic',
          citation: `CIC § ${nums}`,
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/p1s1c1_po.html',
          description: `Catecismo da Igreja Católica: Doutrina oficial sobre os parágrafos ${nums}.`
        });
      }

      // 3. Detecta Citações Bíblicas clássicas
      // Ex: Mt 28, 19-20 | Gn 1, 1-31 | 1Cor 12, 4-11 | Sl 8, 4-10
      const bibleRegex = /\b(Gn|Gênesis|Ex|Êxodo|Lv|Nm|Dt|Sl|Salmo|Is|Isaías|Jr|Mt|Mateus|Mc|Marcos|Lc|Lucas|Jo|João|At|Atos|Rm|Romanos|1Cor|2Cor|Gl|Ef|Fp|Cl|1Ts|2Ts|1Tm|2Tm|Tt|Hb|Tg|1Pe|2Pe|1Jo|Ap)\.?\s*([0-9]{1,3})\s*[,:]\s*([0-9]{1,3}(?:\s*[-–]\s*[0-9]{1,3})?)/gi;
      let bibleMatch;
      while ((bibleMatch = bibleRegex.exec(text)) !== null) {
        const rawBook = bibleMatch[1].toLowerCase().replace('.', '');
        const cap = bibleMatch[2];
        const vers = bibleMatch[3].replace(/\s+/g, '');
        const bookSlug = BIBLE_BOOKS_MAP[rawBook] || rawBook;

        results.push({
          type: 'biblia',
          citation: `${bibleMatch[1]} ${cap}, ${vers}`,
          url: `https://www.bibliaonline.com.br/nvi/${bookSlug}/${cap}/${vers}`,
          description: `Sagrada Escritura: Leitura orante de ${bibleMatch[1]} capítulo ${cap}, versículos ${vers}.`
        });
      }

      return results;
    },

    // Enriquecimento e Deduplicação de Referências
    enrichAndDeduplicate: function (refs) {
      const seen = new Set();
      const unique = [];

      for (const r of refs) {
        if (!r || !r.citation) continue;
        const key = r.citation.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(key)) {
          seen.add(key);

          // Garante fallback de URL segura se ausente
          let url = r.url;
          if (!url || !url.startsWith('http')) {
            if (r.type === 'biblia') {
              url = `https://www.bibliaonline.com.br/nvi/busca?q=${encodeURIComponent(r.citation)}`;
            } else if (r.type === 'cic') {
              url = 'https://www.vatican.va/archive/cathechism_po/index_new/p1s1c1_po.html';
            } else if (r.type === 'vaticano') {
              url = `https://www.vatican.va/content/vatican/pt.html`;
            } else {
              url = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(r.citation)}`;
            }
          }

          unique.push({
            type: r.type || 'outro',
            citation: r.citation.trim(),
            description: r.description ? r.description.trim() : '',
            url: url
          });
        }
      }

      return unique;
    },

    // ==========================================================================
    // 3. MODAIS E INTERFACES VISUAIS
    // ==========================================================================

    // Modal de Configuração da Chave Gemini
    openApiKeyModal: function () {
      let modal = document.getElementById('modal-gemini-config');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-gemini-config';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity';
        modal.innerHTML = `
          <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
                  ✨
                </span>
                <div>
                  <h3 class="text-sm sm:text-base font-bold font-heading text-slate-900">Configuração da IA Gemini</h3>
                  <p class="text-[11px] text-slate-500">Extração inteligente de referências bíblicas e vaticanas</p>
                </div>
              </div>
              <button onclick="window.GeminiReferenceExtractor.closeApiKeyModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition">✕</button>
            </div>

            <div class="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Insira sua chave de API gratuita do <strong>Google AI Studio (Gemini)</strong>. Ela é armazenada de forma segura e local no seu navegador para uso da Coordenação.
              </p>

              <div>
                <label for="input-gemini-api-key" class="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1 font-heading">
                  Chave de API (Gemini API Key):
                </label>
                <div class="relative">
                  <input
                    type="password"
                    id="input-gemini-api-key"
                    placeholder="AIzaSy..."
                    class="w-full bg-slate-50 border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onclick="window.GeminiReferenceExtractor.toggleKeyVisibility()"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                    title="Mostrar/Ocultar chave"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <div class="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-900 text-[11px]">
                <span>💡 Não tem uma chave? </span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="font-bold underline text-purple-700 hover:text-purple-900">
                  Gere sua chave gratuita em 30 segundos no Google AI Studio ↗
                </a>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onclick="window.GeminiReferenceExtractor.closeApiKeyModal()"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onclick="window.GeminiReferenceExtractor.saveApiKeyFromInput()"
                class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition"
              >
                Salvar Chave
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const input = document.getElementById('input-gemini-api-key');
      if (input) input.value = this.getApiKey();

      modal.classList.remove('hidden');
    },

    closeApiKeyModal: function () {
      const modal = document.getElementById('modal-gemini-config');
      if (modal) modal.classList.add('hidden');
    },

    toggleKeyVisibility: function () {
      const input = document.getElementById('input-gemini-api-key');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    },

    saveApiKeyFromInput: function () {
      const input = document.getElementById('input-gemini-api-key');
      if (!input) return;
      const key = input.value.trim();
      this.setApiKey(key);
      this.closeApiKeyModal();
      alert(key ? '✅ Chave da API Gemini configurada com sucesso!' : 'ℹ️ Chave da API Gemini removida. O sistema utilizará o motor heurístico local.');
    },

    // Modal de Análise e Revisão de Referências de um Documento
    openReviewModalForCurrentDoc: async function (docNode) {
      if (!docNode || !docNode.contentMarkdown) {
        alert('Este documento não possui texto para análise de referências.');
        return;
      }

      let modal = document.getElementById('modal-review-references');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-review-references';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                📜
              </span>
              <div>
                <h3 class="text-base font-bold font-heading text-slate-900">
                  Referências e Fontes Teológicas
                </h3>
                <p class="text-xs text-slate-500">${docNode.title}</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-review-references').classList.add('hidden')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition">✕</button>
          </div>

          <div id="modal-review-loading" class="py-12 text-center space-y-3">
            <div class="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-slate-600">Identificando citações bíblicas, CIC, encíclicas e livros com IA...</p>
          </div>

          <div id="modal-review-content" class="hidden flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            <!-- Preenchido dinamicamente -->
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onclick="window.GeminiReferenceExtractor.openApiKeyModal()"
              class="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>⚙️</span> <span>Configurar Chave Gemini</span>
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="document.getElementById('modal-review-references').classList.add('hidden')"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Fechar
              </button>
              <button
                type="button"
                id="btn-modal-save-references"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>💾</span> <span>Salvar Referências no Documento</span>
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      // Executa a extração
      const extracted = await this.extractReferences(docNode.contentMarkdown);
      const loadingEl = document.getElementById('modal-review-loading');
      const contentEl = document.getElementById('modal-review-content');
      const saveBtn = document.getElementById('btn-modal-save-references');

      if (loadingEl) loadingEl.classList.add('hidden');
      if (contentEl) {
        contentEl.classList.remove('hidden');
        if (extracted.length === 0) {
          contentEl.innerHTML = `
            <div class="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="text-2xl block mb-1">🔍</span>
              <p class="font-bold text-slate-600">Nenhuma citação explícita encontrada no texto.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Você pode inserir citações bíblicas ou do Catecismo diretamente no texto do documento.</p>
            </div>
          `;
        } else {
          contentEl.innerHTML = `
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-950 p-3 rounded-2xl flex items-center gap-2.5">
              <span class="text-emerald-600 text-base">✨</span>
              <span class="text-[11.5px] font-medium">Foram detectadas <strong>${extracted.length} referências</strong> neste documento. Confira e clique em salvar para anexá-las ao rodapé oficial:</span>
            </div>
            <div class="space-y-2.5" id="modal-review-items-list">
              ${extracted.map((ref, idx) => `
                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 group hover:border-amber-400 transition" data-idx="${idx}">
                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[9.5px] font-bold px-2 py-0.2 rounded-full uppercase ${ref.type === 'biblia' ? 'bg-blue-100 text-blue-900 border border-blue-200' : (ref.type === 'cic' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200')}">
                        ${ref.type.toUpperCase()}
                      </span>
                      <strong class="text-slate-900 text-xs sm:text-sm font-heading">${ref.citation}</strong>
                    </div>
                    <p class="text-[11px] text-slate-500 leading-normal">${ref.description || 'Sem descrição'}</p>
                    <a href="${ref.url}" target="_blank" class="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono truncate">
                      <span>🔗</span> <span class="truncate">${ref.url}</span>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      if (saveBtn) {
        saveBtn.onclick = async () => {
          if (!window.KnowledgeService || !window.KnowledgeService.canEdit()) {
            alert('Apenas a Coordenação e o Master Admin podem atualizar documentos no banco de dados.');
            return;
          }
          try {
            docNode.references = extracted;
            await window.KnowledgeService.saveNode(docNode);
            alert('✅ Referências atualizadas e salvas com sucesso no Firestore!');
            modal.classList.add('hidden');
            window.WikiKB.selectNode(docNode.id);
          } catch (err) {
            console.error('Erro ao salvar referências:', err);
            alert('Erro ao salvar no Firestore: ' + err.message);
          }
        };
      }
    }
  };
})();
