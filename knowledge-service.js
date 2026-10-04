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

    // Exclusão segura de nó (somente se não tiver filhos)
    deleteNode: async function (nodeId, allNodes) {
      const db = this.getDb();
      if (!db) throw new Error('Firestore não está conectado.');
      if (!this.canEdit()) throw new Error('Permissão negada. Apenas a coordenação pode remover materiais.');

      // Verifica se tem filhos
      const hasChildren = (allNodes || []).some(n => n.parentId === nodeId);
      if (hasChildren) {
        throw new Error('Não é possível excluir uma pasta que contém subpastas ou documentos. Esvazie a pasta primeiro.');
      }

      await db.collection(COLLECTION_NAME).doc(nodeId).delete();

      if (window.ICM_CONFIG && typeof window.ICM_CONFIG.logAuditEvent === 'function') {
        window.ICM_CONFIG.logAuditEvent('WIKI_NODE_DELETE', `node:${nodeId}`);
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
    }
  };
})();
