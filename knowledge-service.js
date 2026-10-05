/**
 * PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
 * Módulo: Serviço de Persistência e Sincronização da Base de Conhecimento
 * Arquivo: knowledge-service.js
 */

(function () {
  'use strict';

  const COLLECTION_NAME = 'knowledge_nodes';
  const STORAGE_CACHE_KEY = 'catequese_wiki_nodes_cache_v1';
  let unsubscribeSnapshot = null;

  window.KnowledgeService = {
    // Retorna a instância ativa do Firestore
    getDb: function () {
      if (window.firebaseDb) return window.firebaseDb;
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        window.firebaseDb = firebase.firestore();
        return window.firebaseDb;
      }
      return null;
    },

    // Verifica se o Firestore está disponível no ambiente
    isAvailable: function () {
      return !!this.getDb();
    },

    // Cache local offline
    getLocalCache: function () {
      try {
        const raw = localStorage.getItem(STORAGE_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn('KnowledgeService: Erro ao ler cache local da wiki:', e);
        return null;
      }
    },

    saveLocalCache: function (nodes) {
      try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(nodes));
      } catch (e) {
        console.warn('KnowledgeService: Erro ao salvar cache local da wiki:', e);
      }
    },

    // Checa se o usuário atual tem permissão para editar/criar na Wiki
    canEdit: function () {
      const authState = window.appAuthState;
      if (!authState || !authState.role) return false;
      const role = authState.role;
      const R = window.ICM_CONFIG ? window.ICM_CONFIG.ROLES : {};
      return (
        role === R.MASTER_ADMIN ||
        role === R.COORD_GERAL ||
        role === R.VICE_COORD_GERAL ||
        role === R.COORD_ETAPA
      );
    },

    // Checa se o usuário atual é Master Admin (Thiago Carvalho)
    isMasterAdmin: function () {
      const authState = window.appAuthState;
      if (!authState) return false;
      const user = authState.user;
      const email = ((user && user.email) || authState.email || '').toLowerCase().trim();
      const role = authState.role;
      const R = window.ICM_CONFIG ? window.ICM_CONFIG.ROLES : {};
      const masterEmail = (window.ICM_CONFIG && window.ICM_CONFIG.MASTER_ADMIN_EMAIL ? window.ICM_CONFIG.MASTER_ADMIN_EMAIL : 'colletes@gmail.com').toLowerCase().trim();
      return role === (R.MASTER_ADMIN || 'master_admin') || email === masterEmail;
    },

    // Checa se o usuário atual é Master Admin ou Coordenação Geral
    isCoordOrAdmin: function () {
      const authState = window.appAuthState;
      if (!authState) return false;
      const user = authState.user;
      const email = ((user && user.email) || authState.email || '').toLowerCase().trim();
      const role = authState.role;
      const R = window.ICM_CONFIG ? window.ICM_CONFIG.ROLES : {};
      const masterEmail = (window.ICM_CONFIG && window.ICM_CONFIG.MASTER_ADMIN_EMAIL ? window.ICM_CONFIG.MASTER_ADMIN_EMAIL : 'colletes@gmail.com').toLowerCase().trim();
      const coordEmail = (window.ICM_CONFIG && window.ICM_CONFIG.COORD_GERAL_EMAIL ? window.ICM_CONFIG.COORD_GERAL_EMAIL : 'lorenammoraes@gmail.com').toLowerCase().trim();

      return (
        role === (R.MASTER_ADMIN || 'master_admin') ||
        role === (R.COORD_GERAL || 'coord_geral') ||
        email === masterEmail ||
        email === coordEmail
      );
    },

    // Escuta alterações em tempo real (onSnapshot)
    listenNodes: function (onDataCallback, onErrorCallback) {
      const db = this.getDb();
      if (!db) {
        console.warn('KnowledgeService: Firestore não disponível. Usando cache ou dados locais.');
        const cached = this.getLocalCache();
        if (onDataCallback) onDataCallback(cached || null, false, false);
        return () => {};
      }

      if (unsubscribeSnapshot) {
        try { unsubscribeSnapshot(); } catch (e) {}
      }

      try {
        unsubscribeSnapshot = db.collection(COLLECTION_NAME).onSnapshot(
          snapshot => {
            const nodes = [];
            snapshot.forEach(doc => {
              nodes.push({ id: doc.id, ...doc.data() });
            });

            console.log(`☁️ KnowledgeService: ${nodes.length} nós recebidos do Firestore.`);
            if (nodes.length > 0) {
              this.saveLocalCache(nodes);
              if (onDataCallback) onDataCallback(nodes, true, false);
            } else {
              // Coleção vazia no Firestore
              const cached = this.getLocalCache();
              if (onDataCallback) onDataCallback(cached || null, true, true /* isFirestoreEmpty */);
            }
          },
          err => {
            console.warn('KnowledgeService: Listener do Firestore reportou aviso/erro:', err);
            const cached = this.getLocalCache();
            if (onDataCallback) onDataCallback(cached || null, false, false);
            if (onErrorCallback) onErrorCallback(err);
          }
        );

        return unsubscribeSnapshot;
      } catch (err) {
        console.error('KnowledgeService: Falha ao iniciar listener:', err);
        return () => {};
      }
    },

    // Salva ou atualiza um nó usando SEMPRE merge construtivo (Regra de Ouro do Projeto)
    saveNode: async function (nodeData) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!nodeData || !nodeData.id) throw new Error('Dados do nó inválidos (ID ausente).');

      const dataToSave = {
        ...nodeData,
        updatedAt: new Date().toISOString()
      };

      if (!dataToSave.createdAt) {
        dataToSave.createdAt = new Date().toISOString();
      }

      // Adiciona autor se autenticado
      const user = window.appAuthState ? window.appAuthState.user : null;
      if (user && !dataToSave.createdBy) {
        dataToSave.createdBy = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email
        };
      }

      await db.collection(COLLECTION_NAME).doc(nodeData.id).set(dataToSave, { merge: true });

      if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
        window.ICM_CONFIG.logAuditEvent('WIKI_NODE_SAVE', `node:${nodeData.id}`, {
          title: nodeData.title,
          type: nodeData.type,
          etapa: nodeData.etapa || 'Geral'
        });
      }

      return dataToSave;
    },

    // Utilitário para evitar que promessas do Firestore fiquem pendentes infinitamente
    withTimeout: function (promise, timeoutMs = 4000, errorMsg = 'Operação com o Firestore demorou mais que o esperado.') {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs))
      ]);
    },

    // Exclusão de arquivo ou nó individual (Master Admin e Coordenação Geral)
    deleteNode: async function (nodeId) {
      if (!nodeId) return true;
      const db = this.getDb();
      if (!db) {
        console.warn('KnowledgeService: Firestore desconectado. Exclusão mantida no cache local.');
        return true;
      }
      if (!this.isCoordOrAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem excluir itens da Wiki.');
      }

      try {
        await this.withTimeout(
          db.collection(COLLECTION_NAME).doc(nodeId).delete(),
          4000,
          'Tempo limite de sincronização com o Firestore.'
        );

        if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
          window.ICM_CONFIG.logAuditEvent('WIKI_NODE_DELETE', `node:${nodeId}`);
        }
      } catch (err) {
        console.warn(`KnowledgeService: Aviso ao sincronizar exclusão do nó ${nodeId} no Firestore (${err.message}). Exclusão mantida localmente.`);
      }

      return true;
    },

    // Exclusão em cascata de pasta e todos os seus filhos (Master Admin e Coordenação Geral)
    deleteNodeCascade: async function (nodeId, allNodes = []) {
      if (!nodeId) return 0;
      const db = this.getDb();
      if (!db) {
        console.warn('KnowledgeService: Firestore desconectado. Exclusão mantida no cache local.');
        return 1;
      }
      if (!this.isCoordOrAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem excluir pastas da Wiki.');
      }

      // Encontra todos os descendentes recursivamente
      const toDelete = new Set([nodeId]);
      let added = true;
      while (added) {
        added = false;
        for (const n of allNodes) {
          if (n && n.id && !toDelete.has(n.id) && n.parentId && toDelete.has(n.parentId)) {
            toDelete.add(n.id);
            added = true;
          }
        }
      }

      const idsArray = Array.from(toDelete).filter(Boolean);
      try {
        const BATCH_SIZE = 400;
        for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
          const chunk = idsArray.slice(i, i + BATCH_SIZE);
          const batch = db.batch();
          chunk.forEach(id => batch.delete(db.collection(COLLECTION_NAME).doc(id)));
          await this.withTimeout(batch.commit(), 5000, 'Tempo limite ao excluir lote de pastas no Firestore.');
        }

        if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
          window.ICM_CONFIG.logAuditEvent('WIKI_NODE_DELETE_CASCADE', `node:${nodeId}`, { count: idsArray.length });
        }
      } catch (err) {
        console.warn(`KnowledgeService: Aviso ao sincronizar lote de pastas no Firestore (${err.message}). Exclusão mantida localmente.`);
      }

      return idsArray.length;
    },

    // Exclusão em lote de múltiplos nós selecionados (pastas e arquivos)
    deleteNodesBatch: async function (nodeIds = [], allNodes = []) {
      if (!nodeIds || !nodeIds.length) return 0;
      const db = this.getDb();
      if (!db) {
        console.warn('KnowledgeService: Firestore desconectado. Exclusão mantida no cache local.');
        return nodeIds.length;
      }
      if (!this.isCoordOrAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem excluir múltiplos itens.');
      }

      // Encontra todos os nós e seus descendentes recursivamente
      const toDelete = new Set(nodeIds.filter(Boolean));
      let added = true;
      while (added) {
        added = false;
        for (const n of allNodes) {
          if (n && n.id && !toDelete.has(n.id) && n.parentId && toDelete.has(n.parentId)) {
            toDelete.add(n.id);
            added = true;
          }
        }
      }

      const idsArray = Array.from(toDelete).filter(Boolean);
      try {
        const BATCH_SIZE = 400;
        for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
          const chunk = idsArray.slice(i, i + BATCH_SIZE);
          const batch = db.batch();
          chunk.forEach(id => batch.delete(db.collection(COLLECTION_NAME).doc(id)));
          await this.withTimeout(batch.commit(), 5000, 'Tempo limite ao excluir lote no Firestore.');
        }

        if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
          window.ICM_CONFIG.logAuditEvent('WIKI_NODES_BATCH_DELETE', 'knowledge_nodes', { count: idsArray.length });
        }
      } catch (err) {
        console.warn(`KnowledgeService: Aviso ao sincronizar lote no Firestore (${err.message}). Exclusão mantida localmente.`);
      }

      return idsArray.length;
    },

    // Mover lote de múltiplos nós selecionados para uma pasta destino
    moveNodesBatch: async function (nodeIds = [], newParentId, allNodes = []) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.isCoordOrAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem mover múltiplos itens.');
      }

      const targetParentId = newParentId || null;

      // Validação de ciclo: se targetParentId for um dos selecionados ou descendente de um dos selecionados
      if (targetParentId) {
        const forbiddenIds = new Set(nodeIds);
        let added = true;
        while (added) {
          added = false;
          for (const n of allNodes) {
            if (!forbiddenIds.has(n.id) && n.parentId && forbiddenIds.has(n.parentId)) {
              forbiddenIds.add(n.id);
              added = true;
            }
          }
        }
        if (forbiddenIds.has(targetParentId)) {
          throw new Error('Não é possível mover os itens para uma pasta que está entre os selecionados ou suas subpastas.');
        }
      }

      const BATCH_SIZE = 400;
      const totalMoved = nodeIds.length;
      try {
        for (let i = 0; i < totalMoved; i += BATCH_SIZE) {
          const chunk = nodeIds.slice(i, i + BATCH_SIZE);
          const batch = db.batch();
          chunk.forEach(id => {
            const ref = db.collection(COLLECTION_NAME).doc(id);
            batch.set(ref, {
              parentId: targetParentId,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          });
          await this.withTimeout(batch.commit(), 5000, 'Tempo limite ao mover lote no Firestore.');
        }

        if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
          window.ICM_CONFIG.logAuditEvent('WIKI_NODES_BATCH_MOVE', 'knowledge_nodes', { count: totalMoved, newParentId: targetParentId });
        }
      } catch (err) {
        console.warn(`KnowledgeService: Aviso ao mover lote no Firestore (${err.message}). Movimentação mantida localmente.`);
      }

      return totalMoved;
    },

    // Mover pasta ou arquivo para outro destino (Master Admin e Coordenação Geral)
    moveNode: async function (nodeId, newParentId, allNodes = []) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.isCoordOrAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem mover itens da Base de Conhecimento.');
      }

      const targetParentId = newParentId || null;

      if (targetParentId === nodeId) {
        throw new Error('Não é possível mover um item para dentro de si mesmo.');
      }

      // Prevenção rigorosa de ciclo hierárquico caso o item seja uma pasta
      if (targetParentId) {
        let curr = targetParentId;
        const visited = new Set();
        while (curr) {
          if (curr === nodeId) {
            throw new Error('Não é possível mover uma pasta para dentro dela mesma ou para uma de suas subpastas.');
          }
          visited.add(curr);
          const pNode = allNodes.find(n => n.id === curr);
          curr = (pNode && pNode.parentId && !visited.has(pNode.parentId)) ? pNode.parentId : null;
        }
      }

      try {
        const ref = db.collection(COLLECTION_NAME).doc(nodeId);
        await this.withTimeout(
          ref.set({
            parentId: targetParentId,
            updatedAt: new Date().toISOString()
          }, { merge: true }),
          5000,
          'Tempo limite ao mover item no Firestore.'
        );

        if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
          window.ICM_CONFIG.logAuditEvent('WIKI_NODE_MOVE', `node:${nodeId}`, { newParentId: targetParentId });
        }
      } catch (err) {
        console.warn(`KnowledgeService: Aviso ao mover item ${nodeId} no Firestore (${err.message}). Movimentação mantida localmente.`);
      }

      return true;
    },

    // Carga inicial/seed para o Firestore com MERGE CONSTRUTIVO (nunca destrutivo)
    seedToFirestore: async function (initialNodes) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.canEdit()) throw new Error('Permissão negada para sincronizar acervo no banco de dados.');

      console.log(`🌱 KnowledgeService: Sincronizando ${initialNodes.length} nós no Firestore com merge: true...`);
      const batch = db.batch();

      for (const node of initialNodes) {
        const ref = db.collection(COLLECTION_NAME).doc(node.id);
        batch.set(ref, {
          ...node,
          updatedAt: node.updatedAt || new Date().toISOString()
        }, { merge: true });
      }

      await batch.commit();
      console.log('✅ KnowledgeService: Carga inicial sincronizada com sucesso no Firestore!');

      if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
        window.ICM_CONFIG.logAuditEvent('WIKI_SEED_SYNC', 'knowledge_nodes', { count: initialNodes.length });
      }

      return true;
    },

    // Ingestão em lote de arquivos de carga (Seed / OneDrive) com MERGE CONSTRUTIVO
    // Restrito exclusivamente ao Master Admin
    importNodesBatch: async function (nodesList, onProgress) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.isMasterAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin pode importar arquivos de carga do acervo.');
      }

      if (!Array.isArray(nodesList) || nodesList.length === 0) {
        throw new Error('Lista de nós vazia ou inválida.');
      }

      const BATCH_SIZE = 400; // Limite seguro abaixo de 500 operações por lote no Firestore
      const total = nodesList.length;
      let processed = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = nodesList.slice(i, i + BATCH_SIZE);
        const batch = db.batch();

        for (const node of chunk) {
          if (!node || !node.id) continue;
          const ref = db.collection(COLLECTION_NAME).doc(node.id);
          const dataToSave = {
            ...node,
            updatedAt: node.updatedAt || new Date().toISOString()
          };
          if (!dataToSave.createdAt) {
            dataToSave.createdAt = new Date().toISOString();
          }
          batch.set(ref, dataToSave, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        if (typeof onProgress === 'function') {
          onProgress(processed, total);
        }
      }

      if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
        window.ICM_CONFIG.logAuditEvent('WIKI_BATCH_IMPORT', 'knowledge_nodes', { count: total });
      }

      return true;
    },

    // Limpeza da Base de Conhecimento (Exclusivo Master Admin)
    clearKnowledgeNodes: async function (onlySamples = false) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.isMasterAdmin()) {
        throw new Error('Acesso restrito: apenas o Master Admin pode limpar o acervo.');
      }

      const sampleIds = new Set([
        'dir-geral', 'doc-guia-catequista', 'doc-oracao-liturgia',
        'dir-eucaristia-1', 'dir-euc1-mod1', 'doc-euc1-enc1', 'doc-euc1-enc2',
        'media-euc1-cantico', 'dir-crisma-jovem', 'dir-crisma-dons',
        'doc-crisma-sete-dons', 'pres-crisma-pentecostes', 'dir-crisma-adultos',
        'doc-adul-confirmacao', 'media-adul-video-historia'
      ]);

      const snapshot = await db.collection(COLLECTION_NAME).get();
      if (snapshot.empty) {
        this.saveLocalCache([]);
        return 0;
      }

      const BATCH_SIZE = 400;
      let count = 0;
      const docsToDelete = [];

      snapshot.forEach(doc => {
        if (!onlySamples || sampleIds.has(doc.id)) {
          docsToDelete.push(doc.ref);
          count++;
        }
      });

      for (let i = 0; i < docsToDelete.length; i += BATCH_SIZE) {
        const chunk = docsToDelete.slice(i, i + BATCH_SIZE);
        const batch = db.batch();
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
      }

      this.saveLocalCache([]);
      if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
        window.ICM_CONFIG.logAuditEvent('WIKI_PURGE_NODES', 'knowledge_nodes', { count, onlySamples });
      }

      return count;
    }
  };
})();
