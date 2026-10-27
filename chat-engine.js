// ==========================================================================
// PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
// Motor de Chat Assíncrono com Presença em Tempo Real, Listas e Expurgo
// Conformidade LGPD & Expurgo Automático de 7 Dias
// ==========================================================================

(function (window, document) {
  'use strict';

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const HEARTBEAT_INTERVAL_MS = 45 * 1000; // 45 segundos
  const ONLINE_TIMEOUT_MS = 150 * 1000; // 2.5 minutos

  const STORAGE_MUTED_KEY = 'chat_icm_audio_muted_v1';
  const STORAGE_OPEN_ROOMS_KEY = 'chat_icm_open_rooms_v1';

  // Objeto Global do Chat
  const ChatEngine = {
    user: null,
    db: null,
    heartbeatTimer: null,
    presences: new Map(),
    salas: [],
    customLists: [],
    activeRooms: new Map(), // salaId -> { open: bool, minimized: bool, messages: [], unsubscribe: fn }
    unsubscribePresences: null,
    unsubscribeSalas: null,
    unsubscribeLists: null,
    audioMuted: localStorage.getItem(STORAGE_MUTED_KEY) === 'true',
    isHubOpen: false,
    activeTab: 'conversas', // 'conversas' | 'online' | 'contatos'
    filterChip: 'todos',
    searchQuery: '',
    originalDocTitle: document.title,
    titleBlinkTimer: null,
    isWindowFocused: true,

    // ------------------------------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------------------------------
    init(userData) {
      if (!userData || !userData.uid) {
        console.warn('ChatEngine: Usuário inválido para inicialização.');
        return;
      }

      this.db = window.firebaseDb || (window.firebase && firebase.firestore());
      if (!this.db) {
        console.warn('ChatEngine: Firestore não disponível no momento.');
        return;
      }

      this.user = this._resolveUserProfile(userData);
      console.log('💬 Inicializando Chat Pastoral para:', this.user.displayName, `(${this.user.email})`);

      // Eventos de foco da janela e fechamento
      window.addEventListener('focus', () => this._onWindowFocus());
      window.addEventListener('blur', () => this._onWindowBlur());
      window.addEventListener('beforeunload', () => this._onWindowUnload());
      document.addEventListener('visibilitychange', () => this._onVisibilityChange());

      // Monta HTML base do widget
      this._injectChatHtml();

      // Inicia Presença & Heartbeat
      this._startPresenceHeartbeat();
      this._listenPresences();

      // Inicia Listeners de Salas e Listas
      this._listenSalas();
      this._listenCustomLists();

      // Restaura salas abertas anteriormente se houver
      this._restoreSavedOpenRooms();
    },

    // Encerra sessão do chat no logout
    cleanup() {
      console.log('💬 Encerrando ChatEngine...');
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      if (this.titleBlinkTimer) {
        clearInterval(this.titleBlinkTimer);
        this.titleBlinkTimer = null;
        document.title = this.originalDocTitle;
      }

      if (this.user && this.db) {
        try {
          this.db.collection('chat_presenca').doc(this.user.uid).set({
            isOnline: false,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).catch(console.warn);
        } catch (e) {
          console.warn('Erro ao atualizar presença no logout:', e);
        }
      }

      if (this.unsubscribePresences) this.unsubscribePresences();
      if (this.unsubscribeSalas) this.unsubscribeSalas();
      if (this.unsubscribeLists) this.unsubscribeLists();

      this.activeRooms.forEach((r) => {
        if (r.unsubscribe) r.unsubscribe();
      });
      this.activeRooms.clear();

      const root = document.getElementById('chat-widget-root');
      if (root) root.remove();

      this.user = null;
    },

    // ------------------------------------------------------------------------
    // PERFIL & RESOLUÇÃO DE FOTOS E PAPÉIS
    // ------------------------------------------------------------------------
    _resolveUserProfile(authData) {
      const email = (authData.email || '').toLowerCase().trim();
      let photoURL = authData.photoURL || null;
      let role = (window.appAuthState && window.appAuthState.role) || 'catequista';
      let funcao = 'Catequista';
      let displayName = authData.displayName || (email ? email.split('@')[0] : 'Usuário');

      // Tenta cruzar com base oficial de catequistas 2026 (foto 3x4 e função exata)
      const official = this._findOfficialCatequista(email);
      if (official) {
        if (!photoURL && official.foto) {
          photoURL = official.foto;
        }
        if (official.funcaoPrincipal) {
          funcao = official.funcaoPrincipal;
        }
        if (official.nomeCompleto && displayName === email.split('@')[0]) {
          displayName = official.nomeCompleto;
        }
      }

      // Se for coordenação geral ou admin pelo email
      if (email === 'colletes@gmail.com') {
        role = 'master_admin';
        funcao = 'Master Admin & Pastoral';
      } else if (email === 'lorenammoraes@gmail.com') {
        role = 'coord_geral';
        funcao = 'Coordenadora Geral da Catequese';
      } else if (email === 'andresprojetos@gmail.com') {
        role = 'vice_coord_geral';
        funcao = 'Vice-Coordenador Geral';
      } else if (email.includes('secretaria') || email.includes('sandra')) {
        role = 'secretaria';
        funcao = 'Secretaria Paroquial';
      }

      return {
        uid: authData.uid,
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        role: role,
        funcao: funcao
      };
    },

    _findOfficialCatequista(email) {
      if (!email || !window.SEED_CATEQUISTAS_2026 || !Array.isArray(window.SEED_CATEQUISTAS_2026)) {
        return null;
      }
      const clean = email.toLowerCase().trim();
      return window.SEED_CATEQUISTAS_2026.find(c => c.email && c.email.toLowerCase().trim() === clean) || null;
    },

    getUserPhoto(userOrPresence) {
      if (!userOrPresence) return null;
      if (userOrPresence.photoURL && userOrPresence.photoURL.length > 10) {
        return userOrPresence.photoURL;
      }
      const official = this._findOfficialCatequista(userOrPresence.email);
      if (official && official.foto) {
        return official.foto;
      }
      return null;
    },

    getInitials(name) {
      if (!name) return '??';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    getRoleBadgeHtml(role, funcao) {
      let label = funcao || 'Catequista';
      let bg = 'bg-slate-100 text-slate-700 border-slate-300';

      const r = (role || '').toLowerCase();
      if (r === 'master_admin') {
        bg = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
        label = 'Master Admin';
      } else if (r === 'coord_geral' || r === 'vice_coord_geral') {
        bg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        label = r === 'coord_geral' ? 'Coordenação Geral' : 'Vice-Coord. Geral';
      } else if (r === 'coord_etapa') {
        bg = 'bg-blue-100 text-blue-900 border-blue-300 font-medium';
        label = 'Coord. de Etapa';
      } else if (r === 'secretaria') {
        bg = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium';
        label = 'Secretaria';
      }

      return `<span class="inline-block px-1.5 py-0.5 text-[10px] rounded border ${bg} truncate max-w-[140px]">${this._escapeHtml(label)}</span>`;
    },

    // ------------------------------------------------------------------------
    // PRESENÇA EM TEMPO REAL & HEARTBEAT
    // ------------------------------------------------------------------------
    _startPresenceHeartbeat() {
      if (!this.user || !this.db) return;

      const sendHeartbeat = (isOnline = true) => {
        try {
          const docRef = this.db.collection('chat_presenca').doc(this.user.uid);
          docRef.set({
            uid: this.user.uid,
            displayName: this.user.displayName,
            email: this.user.email,
            photoURL: this.user.photoURL,
            role: this.user.role,
            funcao: this.user.funcao,
            isOnline: isOnline,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).catch(console.warn);
        } catch (err) {
          console.warn('Erro ao enviar heartbeat:', err);
        }
      };

      // Heartbeat imediato
      sendHeartbeat(true);

      // Intervalo de manutenção
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.user && !document.hidden) {
          sendHeartbeat(true);
        }
      }, HEARTBEAT_INTERVAL_MS);
    },

    _onWindowFocus() {
      this.isWindowFocused = true;
      this._stopTitleBlink();
      if (this.user) {
        this.db.collection('chat_presenca').doc(this.user.uid).set({
          isOnline: true,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(console.warn);
      }
    },

    _onWindowBlur() {
      this.isWindowFocused = false;
    },

    _onVisibilityChange() {
      if (!this.user) return;
      const isOnline = !document.hidden;
      this.db.collection('chat_presenca').doc(this.user.uid).set({
        isOnline: isOnline,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(console.warn);
    },

    _onWindowUnload() {
      if (!this.user || !this.db) return;
      try {
        this.db.collection('chat_presenca').doc(this.user.uid).set({
          isOnline: false,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(console.warn);
      } catch (e) {}
    },

    _listenPresences() {
      if (!this.db) return;
      this.unsubscribePresences = this.db.collection('chat_presenca')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (change.type === 'removed') {
              this.presences.delete(change.doc.id);
            } else {
              this.presences.set(change.doc.id, data);
            }
          });
          this._renderHubContent();
          this._renderDockHeadersStatus();
        }, (err) => {
          console.warn('Erro ao escutar presenças:', err);
        });
    },

    isUserOnline(presenceDoc) {
      if (!presenceDoc) return false;
      if (!presenceDoc.isOnline) return false;
      if (!presenceDoc.lastSeen) return false;

      let lastSeenMs = 0;
      if (presenceDoc.lastSeen.toMillis) {
        lastSeenMs = presenceDoc.lastSeen.toMillis();
      } else if (presenceDoc.lastSeen.seconds) {
        lastSeenMs = presenceDoc.lastSeen.seconds * 1000;
      } else if (typeof presenceDoc.lastSeen === 'string') {
        lastSeenMs = new Date(presenceDoc.lastSeen).getTime();
      }

      const diff = Date.now() - lastSeenMs;
      return diff < ONLINE_TIMEOUT_MS;
    },

    // ------------------------------------------------------------------------
    // SALAS DE CONVERSA (1-A-1 E GRUPOS)
    // ------------------------------------------------------------------------
    _listenSalas() {
      if (!this.db || !this.user) return;

      this.unsubscribeSalas = this.db.collection('chat_salas')
        .where('participantes', 'array-contains', this.user.uid)
        .orderBy('updatedAt', 'desc')
        .onSnapshot((snapshot) => {
          this.salas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          this._updateTotalUnreadBadge();
          this._renderHubContent();
        }, (err) => {
          console.warn('Erro ao escutar salas:', err);
        });
    },

    _listenCustomLists() {
      if (!this.db || !this.user) return;

      this.unsubscribeLists = this.db.collection('chat_listas')
        .where('ownerUid', '==', this.user.uid)
        .onSnapshot((snapshot) => {
          this.customLists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          this._renderFilterChips();
          this._renderHubContent();
        }, (err) => {
          console.warn('Erro ao escutar listas personalizadas:', err);
        });
    },

    // Gera ID único determinístico para conversa 1-a-1
    _getDirectSalaId(otherUid) {
      const currentUid = this.user.uid;
      return currentUid < otherUid ? `direct_${currentUid}_${otherUid}` : `direct_${otherUid}_${currentUid}`;
    },

    async openDirectChat(targetUser) {
      if (!targetUser || !targetUser.uid || targetUser.uid === this.user.uid) {
        return;
      }

      const salaId = this._getDirectSalaId(targetUser.uid);
      const salaRef = this.db.collection('chat_salas').doc(salaId);

      try {
        const docSnap = await salaRef.get();
        if (!docSnap.exists) {
          const participantes = [this.user.uid, targetUser.uid];
          const participantesEmails = [this.user.email, (targetUser.email || '').toLowerCase()];
          const participantesInfo = {
            [this.user.uid]: {
              displayName: this.user.displayName,
              email: this.user.email,
              photoURL: this.getUserPhoto(this.user),
              role: this.user.role,
              funcao: this.user.funcao
            },
            [targetUser.uid]: {
              displayName: targetUser.displayName || targetUser.nomeCompleto || 'Catequista',
              email: targetUser.email || '',
              photoURL: this.getUserPhoto(targetUser),
              role: targetUser.role || 'catequista',
              funcao: targetUser.funcao || targetUser.funcaoPrincipal || 'Catequista'
            }
          };

          await salaRef.set({
            tipo: 'individual',
            nome: null,
            participantes: participantes,
            participantesEmails: participantesEmails,
            participantesInfo: participantesInfo,
            criadoPor: this.user.uid,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            ultimaMensagem: null,
            unreadCount: {
              [this.user.uid]: 0,
              [targetUser.uid]: 0
            }
          });
        }

        // Abre janela no Dock
        this.openRoomDock(salaId);
      } catch (err) {
        console.error('Erro ao abrir conversa direta:', err);
        alert('Não foi possível iniciar a conversa. Verifique as permissões.');
      }
    },

    async createGroupChat(groupName, memberUsers) {
      if (!groupName || !groupName.trim()) {
        alert('Por favor, informe o nome do grupo.');
        return;
      }

      if (!memberUsers || memberUsers.length === 0) {
        alert('Selecione pelo menos um participante para o grupo.');
        return;
      }

      const salaId = `grupo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const salaRef = this.db.collection('chat_salas').doc(salaId);

      const participantes = [this.user.uid];
      const participantesEmails = [this.user.email];
      const participantesInfo = {
        [this.user.uid]: {
          displayName: this.user.displayName,
          email: this.user.email,
          photoURL: this.getUserPhoto(this.user),
          role: this.user.role,
          funcao: this.user.funcao
        }
      };

      const unreadCount = {
        [this.user.uid]: 0
      };

      memberUsers.forEach(u => {
        if (u.uid && !participantes.includes(u.uid)) {
          participantes.push(u.uid);
          participantesEmails.push((u.email || '').toLowerCase());
          participantesInfo[u.uid] = {
            displayName: u.displayName || u.nomeCompleto || 'Catequista',
            email: u.email || '',
            photoURL: this.getUserPhoto(u),
            role: u.role || 'catequista',
            funcao: u.funcao || u.funcaoPrincipal || 'Catequista'
          };
          unreadCount[u.uid] = 0;
        }
      });

      try {
        await salaRef.set({
          tipo: 'grupo',
          nome: groupName.trim(),
          participantes: participantes,
          participantesEmails: participantesEmails,
          participantesInfo: participantesInfo,
          criadoPor: this.user.uid,
          criadoPorNome: this.user.displayName,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          ultimaMensagem: {
            texto: `Grupo criado por ${this.user.displayName}`,
            autorNome: 'Sistema',
            timestamp: new Date().toISOString()
          },
          unreadCount: unreadCount
        });

        this.openRoomDock(salaId);
        this.closeGroupModal();
      } catch (err) {
        console.error('Erro ao criar grupo:', err);
        alert('Erro ao criar grupo no Firestore.');
      }
    },

    // ------------------------------------------------------------------------
    // DOCK & JANELAS DE CHAT (ESTILO LINKEDIN / FACEBOOK)
    // ------------------------------------------------------------------------
    openRoomDock(salaId) {
      let roomState = this.activeRooms.get(salaId);
      if (!roomState) {
        roomState = {
          open: true,
          minimized: false,
          messages: [],
          unsubscribe: null
        };
        this.activeRooms.set(salaId, roomState);
        this._listenRoomMessages(salaId);
      } else {
        roomState.open = true;
        roomState.minimized = false;
      }

      this._saveOpenRoomsState();
      this._renderDockContainer();
      this.markRoomAsRead(salaId);

      // Foca no textarea da sala
      setTimeout(() => {
        const input = document.getElementById(`chat-input-${salaId}`);
        if (input) input.focus();
      }, 100);
    },

    minimizeRoomDock(salaId) {
      const roomState = this.activeRooms.get(salaId);
      if (roomState) {
        roomState.minimized = !roomState.minimized;
        this._saveOpenRoomsState();
        this._renderDockContainer();
      }
    },

    closeRoomDock(salaId) {
      const roomState = this.activeRooms.get(salaId);
      if (roomState) {
        if (roomState.unsubscribe) roomState.unsubscribe();
        this.activeRooms.delete(salaId);
        this._saveOpenRoomsState();
        this._renderDockContainer();
      }
    },

    _saveOpenRoomsState() {
      const openIds = [];
      this.activeRooms.forEach((state, id) => {
        if (state.open) openIds.push({ id, minimized: state.minimized });
      });
      sessionStorage.setItem(STORAGE_OPEN_ROOMS_KEY, JSON.stringify(openIds));
    },

    _restoreSavedOpenRooms() {
      try {
        const raw = sessionStorage.getItem(STORAGE_OPEN_ROOMS_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.slice(0, 3).forEach(item => {
              if (item.id) {
                this.activeRooms.set(item.id, {
                  open: true,
                  minimized: !!item.minimized,
                  messages: [],
                  unsubscribe: null
                });
                this._listenRoomMessages(item.id);
              }
            });
            this._renderDockContainer();
          }
        }
      } catch (e) {
        console.warn('Erro ao restaurar salas abertas:', e);
      }
    },

    // ------------------------------------------------------------------------
    // MENSAGENS, EXPURGO DE 7 DIAS E LAZY-CLEANUP
    // ------------------------------------------------------------------------
    _listenRoomMessages(salaId) {
      if (!this.db) return;
      const roomState = this.activeRooms.get(salaId);
      if (!roomState) return;

      if (roomState.unsubscribe) {
        roomState.unsubscribe();
      }

      const cutoffDate = new Date(Date.now() - SEVEN_DAYS_MS);

      // Consulta apenas mensagens dos últimos 7 dias
      const msgQuery = this.db.collection('chat_salas').doc(salaId)
        .collection('mensagens')
        .where('criadoEm', '>=', cutoffDate)
        .orderBy('criadoEm', 'asc');

      roomState.unsubscribe = msgQuery.onSnapshot((snapshot) => {
        let hasNewFromOther = false;
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.remetenteId !== this.user.uid && !snapshot.metadata.hasPendingWrites) {
              hasNewFromOther = true;
            }
          }
        });

        roomState.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this._renderRoomMessages(salaId);

        if (hasNewFromOther) {
          this._handleIncomingMessageNotification(salaId);
          if (!roomState.minimized) {
            this.markRoomAsRead(salaId);
          }
        }
      }, (err) => {
        console.warn(`Erro ao escutar mensagens da sala ${salaId}:`, err);
      });

      // Executa rotina assíncrona de limpeza física das mensagens > 7 dias
      this._purgeExpiredMessages(salaId, cutoffDate);
    },

    async _purgeExpiredMessages(salaId, cutoffDate) {
      try {
        const expiredQuery = await this.db.collection('chat_salas').doc(salaId)
          .collection('mensagens')
          .where('criadoEm', '<', cutoffDate)
          .limit(30)
          .get();

        if (!expiredQuery.empty) {
          const batch = this.db.batch();
          expiredQuery.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`🧹 Expurgo de 7 dias: ${expiredQuery.docs.length} mensagens antigas removidas da sala ${salaId}.`);
        }
      } catch (e) {
        // Ignora silenciosamente se usuário não tiver permissão de exclusão em massa
        console.warn('Rotina de expurgo silenciosa:', e);
      }
    },

    async sendMessage(salaId) {
      const textarea = document.getElementById(`chat-input-${salaId}`);
      if (!textarea) return;

      const texto = textarea.value.trim();
      if (!texto) return;

      textarea.value = '';
      textarea.style.height = 'auto';

      const salaRef = this.db.collection('chat_salas').doc(salaId);
      const msgCollection = salaRef.collection('mensagens');

      try {
        // Envia mensagem
        await msgCollection.add({
          salaId: salaId,
          remetenteId: this.user.uid,
          remetenteNome: this.user.displayName,
          remetenteEmail: this.user.email,
          remetenteRole: this.user.role,
          remetenteFoto: this.getUserPhoto(this.user),
          texto: texto,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Atualiza última mensagem na sala e incrementa contador de não lidas dos demais
        const docSnap = await salaRef.get();
        if (docSnap.exists) {
          const salaData = docSnap.data();
          const unreadCount = salaData.unreadCount || {};
          
          (salaData.participantes || []).forEach(pUid => {
            if (pUid !== this.user.uid) {
              unreadCount[pUid] = (unreadCount[pUid] || 0) + 1;
            }
          });

          await salaRef.update({
            ultimaMensagem: {
              texto: texto.length > 60 ? texto.substring(0, 57) + '...' : texto,
              autorId: this.user.uid,
              autorNome: this.user.displayName,
              timestamp: new Date().toISOString()
            },
            unreadCount: unreadCount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        alert('Não foi possível enviar a mensagem. Verifique a conexão.');
      }
    },

    async markRoomAsRead(salaId) {
      if (!this.db || !this.user) return;
      try {
        const salaRef = this.db.collection('chat_salas').doc(salaId);
        await salaRef.update({
          [`unreadCount.${this.user.uid}`]: 0
        });
      } catch (e) {
        // ignora se doc ainda não existe
      }
    },

    // ------------------------------------------------------------------------
    // NOTIFICAÇÕES (SOM E TÍTULO)
    // ------------------------------------------------------------------------
    _handleIncomingMessageNotification(salaId) {
      if (!this.audioMuted) {
        this.playNotificationChime();
      }
      if (!this.isWindowFocused) {
        this._startTitleBlink();
      }
    },

    playNotificationChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Sintetiza um acorde suave pastoral de 2 notas (Mi - Sol#)
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(830.61, now + 0.12); // G#5

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
      } catch (e) {
        // Autoplay policy pode bloquear se ainda não houve interação
      }
    },

    _startTitleBlink() {
      if (this.titleBlinkTimer) return;
      let count = 0;
      this.titleBlinkTimer = setInterval(() => {
        count++;
        if (count % 2 === 1) {
          document.title = '💬 Nova Mensagem! • Catequese';
        } else {
          document.title = this.originalDocTitle;
        }
      }, 1000);
    },

    _stopTitleBlink() {
      if (this.titleBlinkTimer) {
        clearInterval(this.titleBlinkTimer);
        this.titleBlinkTimer = null;
        document.title = this.originalDocTitle;
      }
    },

    toggleAudioMute() {
      this.audioMuted = !this.audioMuted;
      localStorage.setItem(STORAGE_MUTED_KEY, this.audioMuted ? 'true' : 'false');
      this._updateAudioButtonIcon();
    },

    _updateAudioButtonIcon() {
      const btn = document.getElementById('chat-btn-toggle-audio');
      if (btn) {
        btn.innerHTML = this.audioMuted
          ? '<span title="Som desativado (Clique para ativar)">🔕</span>'
          : '<span title="Som ativado (Clique para silenciar)">🔔</span>';
      }
    },

    _updateTotalUnreadBadge() {
      let total = 0;
      this.salas.forEach(s => {
        if (s.unreadCount && s.unreadCount[this.user.uid]) {
          total += s.unreadCount[this.user.uid];
        }
      });

      const badge = document.getElementById('chat-global-unread-badge');
      if (badge) {
        if (total > 0) {
          badge.textContent = total > 99 ? '99+' : total;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
    },

    // ------------------------------------------------------------------------
    // GERENCIAMENTO DE LISTAS DE CONTATOS PERSONALIZADAS
    // ------------------------------------------------------------------------
    async saveCustomList(listName, membersEmails) {
      if (!listName || !listName.trim()) {
        alert('Informe um nome para a lista de contatos.');
        return;
      }
      if (!membersEmails || membersEmails.length === 0) {
        alert('Adicione ao menos um contato à lista.');
        return;
      }

      try {
        await this.db.collection('chat_listas').add({
          ownerUid: this.user.uid,
          ownerEmail: this.user.email,
          nome: listName.trim(),
          membrosEmails: membersEmails.map(e => e.toLowerCase().trim()),
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        this.closeCustomListModal();
      } catch (err) {
        console.error('Erro ao salvar lista personalizada:', err);
        alert('Erro ao criar lista.');
      }
    },

    async deleteCustomList(listId) {
      if (!confirm('Deseja realmente remover esta lista de contatos personalizada?')) return;
      try {
        await this.db.collection('chat_listas').doc(listId).delete();
      } catch (err) {
        console.error('Erro ao apagar lista:', err);
      }
    },

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO DA INTERFACE (HTML & WIDGETS)
    // ------------------------------------------------------------------------
    _injectChatHtml() {
      const existing = document.getElementById('chat-widget-root');
      if (existing) existing.remove();

      const root = document.createElement('div');
      root.id = 'chat-widget-root';
      root.className = 'fixed bottom-4 right-4 z-[9990] flex items-end gap-3 pointer-events-none select-none';

      root.innerHTML = `
        <!-- DOCK DE JANELAS DE CHAT ATIVAS (LADO ESQUERDO DO HUB) -->
        <div id="chat-dock-windows-area" class="flex items-end gap-3 pointer-events-auto"></div>

        <!-- HUB PRINCIPAL DO CHAT (DROPDOWN / POPUP ESTILO LINKEDIN) -->
        <div id="chat-hub-container" class="relative pointer-events-auto flex flex-col items-end">
          
          <!-- PAINEL EXPANSÍVEL DE CONTATOS E CONVERSAS -->
          <div id="chat-hub-panel" class="hidden mb-3 w-[360px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden chat-fade-in pointer-events-auto text-slate-800">
            
            <!-- HEADER DO HUB -->
            <div class="px-4 py-3 bg-[#1b2838] text-white flex items-center justify-between border-b border-amber-500/30">
              <div class="flex items-center gap-2.5">
                <div class="relative">
                  ${this._renderAvatarImgOrInitials(this.user, 'w-8 h-8 text-xs')}
                  <span class="chat-status-online absolute bottom-0 right-0"></span>
                </div>
                <div>
                  <h3 class="font-bold text-sm tracking-wide text-amber-300">Chat Pastoral</h3>
                  <div class="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span>${this._escapeHtml(this.user.displayName)}</span>
                    <span class="text-amber-400">•</span>
                    <span class="text-emerald-400 font-semibold">Online</span>
                  </div>
                </div>
              </div>

              <!-- AÇÕES DO HEADER -->
              <div class="flex items-center gap-1 text-slate-200">
                <button type="button" id="chat-btn-toggle-audio" onclick="window.ChatEngine.toggleAudioMute()" class="p-1.5 hover:bg-slate-700/60 rounded-lg text-sm transition" title="${this.audioMuted ? 'Ativar som' : 'Silenciar som'}">
                  ${this.audioMuted ? '🔕' : '🔔'}
                </button>
                <button type="button" onclick="window.ChatEngine.openGroupModal()" class="p-1.5 hover:bg-slate-700/60 rounded-lg text-sm transition" title="Novo Grupo">
                  👥+
                </button>
                <button type="button" onclick="window.ChatEngine.openCustomListModal()" class="p-1.5 hover:bg-slate-700/60 rounded-lg text-sm transition" title="Gerenciar Listas de Contatos">
                  📁
                </button>
                <button type="button" onclick="window.ChatEngine.toggleHub()" class="p-1.5 hover:bg-slate-700/60 rounded-lg text-sm transition" title="Minimizar">
                  ✕
                </button>
              </div>
            </div>

            <!-- BARRA DE PESQUISA & ABAS -->
            <div class="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div class="relative">
                <input type="text" id="chat-search-input" oninput="window.ChatEngine.onSearchInput(this.value)" placeholder="Buscar contatos, catequistas ou grupos..." class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-inner">
                <span class="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
                <button type="button" onclick="window.ChatEngine.clearSearch()" class="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600 hidden" id="chat-search-clear">✕</button>
              </div>

              <!-- ABAS PRINCIPAIS -->
              <div class="flex items-center justify-between text-xs font-semibold border-b border-slate-200 pb-1">
                <div class="flex gap-2">
                  <button type="button" onclick="window.ChatEngine.switchHubTab('conversas')" id="chat-tab-btn-conversas" class="px-2.5 py-1 rounded-md text-amber-800 bg-amber-100 font-bold transition">
                    Conversas
                  </button>
                  <button type="button" onclick="window.ChatEngine.switchHubTab('online')" id="chat-tab-btn-online" class="px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-200 transition flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Online
                  </button>
                  <button type="button" onclick="window.ChatEngine.switchHubTab('contatos')" id="chat-tab-btn-contatos" class="px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-200 transition">
                    Todos Contatos
                  </button>
                </div>
              </div>

              <!-- CHIPS DE FILTRO RÁPIDO -->
              <div id="chat-filter-chips-container" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                <!-- Injetado dinamicamente -->
              </div>
            </div>

            <!-- LISTAGEM SCROLLÁVEL -->
            <div id="chat-hub-list" class="flex-1 overflow-y-auto chat-contacts-scroll p-2 divide-y divide-slate-100">
              <!-- Injetado dinamicamente -->
            </div>

            <!-- AVISO DE EXPURGO NO RODAPÉ -->
            <div class="px-3 py-1.5 bg-slate-100 border-t border-slate-200 text-[10.5px] text-slate-500 text-center flex items-center justify-center gap-1">
              <span>🛡️</span>
              <span>Mensagens expurgadas após <strong>7 dias</strong> (LGPD)</span>
            </div>

          </div>

          <!-- BOTÃO FLUTUANTE PRINCIPAL (FAB TRIGGER) -->
          <button type="button" id="chat-fab-trigger" onclick="window.ChatEngine.toggleHub()" class="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#1b2838] text-white shadow-xl hover:shadow-2xl border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer group">
            
            <!-- Ícone de Chat SVG -->
            <svg class="w-6 h-6 text-amber-300 group-hover:rotate-6 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <circle cx="8" cy="10" r="1.5" />
              <circle cx="12" cy="10" r="1.5" />
              <circle cx="16" cy="10" r="1.5" />
            </svg>

            <!-- Bolinha verde de conexão -->
            <span class="chat-status-online absolute top-1 right-1"></span>

            <!-- Badge Geral de Mensagens Não Lidas -->
            <span id="chat-global-unread-badge" class="chat-unread-badge absolute -top-1 -left-1 hidden">0</span>
          </button>

        </div>

        <!-- MODAL PARA CRIAÇÃO DE GRUPO -->
        <div id="chat-modal-group" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] hidden flex items-center justify-center p-4 pointer-events-auto">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden chat-fade-in flex flex-col max-h-[85vh]">
            <div class="px-5 py-3.5 bg-[#1b2838] text-white flex items-center justify-between border-b border-amber-500/30">
              <h3 class="font-bold text-sm text-amber-300 flex items-center gap-2">
                <span>👥</span> <span>Criar Novo Grupo de Chat</span>
              </h3>
              <button type="button" onclick="window.ChatEngine.closeGroupModal()" class="text-slate-300 hover:text-white text-lg">✕</button>
            </div>
            
            <div class="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome do Grupo *</label>
                <input type="text" id="chat-group-name-input" placeholder="Ex: Equipe Eucaristia 2026, Secretaria & Apoio..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Selecionar Participantes *</label>
                <input type="text" id="chat-group-search-members" oninput="window.ChatEngine.filterGroupModalMembers(this.value)" placeholder="Filtrar catequistas por nome ou etapa..." class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg mb-2">
                <div id="chat-group-members-list" class="max-h-52 overflow-y-auto border border-slate-200 rounded-lg p-2 divide-y divide-slate-100 space-y-1">
                  <!-- Injetado dinamicamente -->
                </div>
              </div>
            </div>

            <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onclick="window.ChatEngine.closeGroupModal()" class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button type="button" onclick="window.ChatEngine.submitCreateGroup()" class="px-4 py-1.5 text-xs font-bold bg-[#1b2838] hover:bg-slate-800 text-amber-300 border border-amber-400/50 rounded-lg shadow-sm">Criar Grupo</button>
            </div>
          </div>
        </div>

        <!-- MODAL PARA LISTAS PERSONALIZADAS DE CONTATOS -->
        <div id="chat-modal-custom-lists" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] hidden flex items-center justify-center p-4 pointer-events-auto">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden chat-fade-in flex flex-col max-h-[85vh]">
            <div class="px-5 py-3.5 bg-[#1b2838] text-white flex items-center justify-between border-b border-amber-500/30">
              <h3 class="font-bold text-sm text-amber-300 flex items-center gap-2">
                <span>📁</span> <span>Minhas Listas de Contatos Personalizadas</span>
              </h3>
              <button type="button" onclick="window.ChatEngine.closeCustomListModal()" class="text-slate-300 hover:text-white text-lg">✕</button>
            </div>

            <div class="p-5 space-y-4 overflow-y-auto flex-1">
              <!-- Nova Lista -->
              <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <h4 class="text-xs font-bold text-amber-900">✨ Criar Nova Lista</h4>
                <div>
                  <input type="text" id="chat-new-list-name" placeholder="Nome da Lista (ex: Minha Turma, Secretaria, Eucaristia 2026)" class="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg">
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">Selecionar catequistas para incluir na lista:</label>
                  <div id="chat-new-list-members-selection" class="max-h-40 overflow-y-auto border border-amber-200 bg-white rounded-lg p-2 divide-y divide-slate-100 text-xs">
                    <!-- Injetado dinamicamente -->
                  </div>
                </div>
                <div class="text-right">
                  <button type="button" onclick="window.ChatEngine.submitCreateCustomList()" class="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm">Salvar Lista</button>
                </div>
              </div>

              <!-- Listas Existentes -->
              <div>
                <h4 class="text-xs font-bold text-slate-800 mb-2">Listas Ativas:</h4>
                <div id="chat-custom-lists-existing" class="space-y-2">
                  <!-- Injetado dinamicamente -->
                </div>
              </div>
            </div>

            <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 text-right">
              <button type="button" onclick="window.ChatEngine.closeCustomListModal()" class="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg">Fechar</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(root);
      this._renderFilterChips();
      this._renderHubContent();
    },

    toggleHub() {
      this.isHubOpen = !this.isHubOpen;
      const panel = document.getElementById('chat-hub-panel');
      if (panel) {
        if (this.isHubOpen) {
          panel.classList.remove('hidden');
          this._renderHubContent();
          setTimeout(() => {
            const search = document.getElementById('chat-search-input');
            if (search) search.focus();
          }, 100);
        } else {
          panel.classList.add('hidden');
        }
      }
    },

    switchHubTab(tabName) {
      this.activeTab = tabName;
      ['conversas', 'online', 'contatos'].forEach(t => {
        const btn = document.getElementById(`chat-tab-btn-${t}`);
        if (btn) {
          if (t === tabName) {
            btn.className = 'px-2.5 py-1 rounded-md text-amber-800 bg-amber-100 font-bold transition flex items-center gap-1.5';
          } else {
            btn.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-200 transition flex items-center gap-1.5';
          }
        }
      });
      this._renderHubContent();
    },

    onSearchInput(value) {
      this.searchQuery = (value || '').toLowerCase().trim();
      const clearBtn = document.getElementById('chat-search-clear');
      if (clearBtn) {
        if (this.searchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
      this._renderHubContent();
    },

    clearSearch() {
      const search = document.getElementById('chat-search-input');
      if (search) search.value = '';
      this.onSearchInput('');
    },

    setFilterChip(chipKey) {
      this.filterChip = chipKey;
      this._renderFilterChips();
      this._renderHubContent();
    },

    _renderFilterChips() {
      const container = document.getElementById('chat-filter-chips-container');
      if (!container) return;

      const chips = [
        { key: 'todos', label: 'Todos' },
        { key: 'coord', label: '⭐ Coordenação' },
        { key: 'secretaria', label: '🏛️ Secretaria' },
        { key: 'eucaristia', label: '✝️ Eucaristia' },
        { key: 'crisma', label: '🕊️ Crisma' }
      ];

      // Adiciona chips das listas personalizadas
      this.customLists.forEach(l => {
        chips.push({ key: `custom_${l.id}`, label: `📁 ${l.nome}` });
      });

      container.innerHTML = chips.map(c => {
        const isSelected = this.filterChip === c.key;
        const cls = isSelected
          ? 'bg-[#1b2838] text-amber-300 font-bold border border-amber-400/50 shadow-2xs'
          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200';
        return `
          <button type="button" onclick="window.ChatEngine.setFilterChip('${c.key}')" class="px-2.5 py-0.5 rounded-full whitespace-nowrap transition cursor-pointer ${cls}">
            ${this._escapeHtml(c.label)}
          </button>
        `;
      }).join('');
    },

    // ------------------------------------------------------------------------
    // CONSTRUÇÃO DA LISTA DE CONTATOS & CONVERSAS NO HUB
    // ------------------------------------------------------------------------
    _renderHubContent() {
      const listContainer = document.getElementById('chat-hub-list');
      if (!listContainer) return;

      if (this.activeTab === 'conversas') {
        this._renderHubConversas(listContainer);
      } else if (this.activeTab === 'online') {
        this._renderHubContatos(listContainer, true);
      } else {
        this._renderHubContatos(listContainer, false);
      }
    },

    _renderHubConversas(container) {
      let filtered = [...this.salas];

      if (this.searchQuery) {
        filtered = filtered.filter(s => {
          if (s.tipo === 'grupo') {
            return (s.nome || '').toLowerCase().includes(this.searchQuery);
          }
          // Para 1-a-1 busca o nome do outro participante
          const other = this._getOtherParticipant(s);
          return other && (other.displayName || '').toLowerCase().includes(this.searchQuery);
        });
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="py-12 text-center text-slate-400">
            <span class="text-3xl block mb-2">💬</span>
            <p class="text-xs font-semibold">Nenhuma conversa encontrada</p>
            <p class="text-[11px] text-slate-400 mt-1">Abra a aba <strong>Online</strong> ou <strong>Todos Contatos</strong> para iniciar um bate-papo.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const isGroup = s.tipo === 'grupo';
        let title = s.nome || 'Grupo Pastoral';
        let photo = null;
        let isOnline = false;
        let subtitleRole = '';

        if (!isGroup) {
          const other = this._getOtherParticipant(s);
          if (other) {
            title = other.displayName;
            photo = other.photoURL;
            subtitleRole = other.funcao || other.role;
            const presence = this.presences.get(other.uid);
            isOnline = this.isUserOnline(presence);
          }
        } else {
          subtitleRole = `${(s.participantes || []).length} participantes`;
        }

        const unread = (s.unreadCount && s.unreadCount[this.user.uid]) || 0;
        const lastMsgText = s.ultimaMensagem ? s.ultimaMensagem.texto : 'Sem mensagens recentes';
        const lastMsgTime = s.updatedAt ? this._formatRelativeTime(s.updatedAt) : '';

        return `
          <div onclick="window.ChatEngine.openRoomDock('${s.id}')" class="p-2.5 hover:bg-slate-50 transition cursor-pointer rounded-xl flex items-center justify-between group">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="relative flex-shrink-0">
                ${isGroup
                  ? `<div class="w-9 h-9 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-sm border border-amber-400">👥</div>`
                  : this._renderAvatarImgOrInitials({ displayName: title, photoURL: photo }, 'w-9 h-9 text-xs')}
                ${!isGroup ? `<span class="${isOnline ? 'chat-status-online' : 'chat-status-offline'} absolute bottom-0 right-0"></span>` : ''}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h4 class="text-xs font-bold text-slate-900 truncate group-hover:text-amber-800 transition">${this._escapeHtml(title)}</h4>
                  ${!isGroup ? this.getRoleBadgeHtml(null, subtitleRole) : `<span class="text-[10px] text-slate-400 font-medium">${subtitleRole}</span>`}
                </div>
                <p class="text-[11px] text-slate-500 truncate mt-0.5">${this._escapeHtml(lastMsgText)}</p>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1 flex-shrink-0 pl-2">
              <span class="text-[10px] text-slate-400">${lastMsgTime}</span>
              ${unread > 0 ? `<span class="chat-unread-badge">${unread}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    },

    _renderHubContatos(container, onlyOnline = false) {
      const allContacts = this._getAllCombinedContacts();
      let filtered = allContacts.filter(c => c.uid !== this.user.uid);

      if (onlyOnline) {
        filtered = filtered.filter(c => {
          const presence = this.presences.get(c.uid);
          return this.isUserOnline(presence);
        });
      }

      // Filtro por Chip
      if (this.filterChip !== 'todos') {
        if (this.filterChip === 'coord') {
          filtered = filtered.filter(c => (c.role && c.role.includes('coord')) || (c.funcao && c.funcao.toLowerCase().includes('coord')));
        } else if (this.filterChip === 'secretaria') {
          filtered = filtered.filter(c => (c.role === 'secretaria') || (c.funcao && c.funcao.toLowerCase().includes('secretaria')));
        } else if (this.filterChip === 'eucaristia') {
          filtered = filtered.filter(c => (c.etapa && c.etapa.toLowerCase().includes('eucaristia')) || (c.funcao && c.funcao.toLowerCase().includes('eucaristia')));
        } else if (this.filterChip === 'crisma') {
          filtered = filtered.filter(c => (c.etapa && c.etapa.toLowerCase().includes('crisma')) || (c.funcao && c.funcao.toLowerCase().includes('crisma')));
        } else if (this.filterChip.startsWith('custom_')) {
          const listId = this.filterChip.replace('custom_', '');
          const customList = this.customLists.find(l => l.id === listId);
          if (customList && Array.isArray(customList.membrosEmails)) {
            filtered = filtered.filter(c => customList.membrosEmails.includes((c.email || '').toLowerCase().trim()));
          }
        }
      }

      // Filtro por Busca de texto
      if (this.searchQuery) {
        filtered = filtered.filter(c => {
          const name = (c.displayName || c.nomeCompleto || '').toLowerCase();
          const email = (c.email || '').toLowerCase();
          const funcao = (c.funcao || c.funcaoPrincipal || '').toLowerCase();
          return name.includes(this.searchQuery) || email.includes(this.searchQuery) || funcao.includes(this.searchQuery);
        });
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="py-12 text-center text-slate-400">
            <span class="text-3xl block mb-2">${onlyOnline ? '😴' : '🔍'}</span>
            <p class="text-xs font-semibold">${onlyOnline ? 'Nenhum catequista online no momento' : 'Nenhum contato encontrado'}</p>
            <p class="text-[11px] text-slate-400 mt-1">${onlyOnline ? 'Você pode enviar mensagens assíncronas na aba "Todos Contatos".' : 'Tente buscar por outro termo ou limpar os filtros.'}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(c => {
        const presence = this.presences.get(c.uid);
        const isOnline = this.isUserOnline(presence);
        const photo = this.getUserPhoto(c);
        const name = c.displayName || c.nomeCompleto || c.email;
        const role = c.role || 'catequista';
        const funcao = c.funcao || c.funcaoPrincipal || 'Catequista';

        return `
          <div onclick="window.ChatEngine.openDirectChat(${JSON.stringify({ uid: c.uid, displayName: name, email: c.email, photoURL: photo, role: role, funcao: funcao }).replace(/"/g, '&quot;')})" class="p-2.5 hover:bg-slate-50 transition cursor-pointer rounded-xl flex items-center justify-between group">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="relative flex-shrink-0">
                ${this._renderAvatarImgOrInitials({ displayName: name, photoURL: photo }, 'w-9 h-9 text-xs')}
                <span class="${isOnline ? 'chat-status-online' : 'chat-status-offline'} absolute bottom-0 right-0"></span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="text-xs font-bold text-slate-900 truncate group-hover:text-amber-800 transition">${this._escapeHtml(name)}</h4>
                  ${this.getRoleBadgeHtml(role, funcao)}
                </div>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">${this._escapeHtml(funcao)}</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="text-[10.5px] ${isOnline ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
                ${isOnline ? 'Online' : 'Offline'}
              </span>
              <button type="button" class="p-1 hover:bg-amber-100 text-amber-700 rounded-md transition" title="Enviar Mensagem">
                💬
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    _getAllCombinedContacts() {
      const map = new Map();

      // 1. Presenças ativas gravadas no Firestore
      this.presences.forEach((p, uid) => {
        map.set(uid, {
          uid: uid,
          displayName: p.displayName,
          email: p.email,
          photoURL: p.photoURL,
          role: p.role,
          funcao: p.funcao,
          etapa: p.etapa || 'Catequese'
        });
      });

      // 2. Base de catequistas 2026 oficial (para poder mandar mensagem assíncrona mesmo se offline)
      if (window.SEED_CATEQUISTAS_2026 && Array.isArray(window.SEED_CATEQUISTAS_2026)) {
        window.SEED_CATEQUISTAS_2026.forEach(cat => {
          if (cat.email) {
            const clean = cat.email.toLowerCase().trim();
            // Gera um UID determinístico se ainda não tiver feito login
            const syntheticUid = `cat_email_${clean.replace(/[^a-z0-9]/g, '_')}`;
            if (!map.has(syntheticUid)) {
              map.set(syntheticUid, {
                uid: syntheticUid,
                displayName: cat.nomeCompleto,
                email: clean,
                photoURL: cat.foto || null,
                role: 'catequista',
                funcao: cat.funcaoPrincipal || 'Catequista Titular',
                etapa: cat.etapaPrincipal || cat.etapaDeclarada || 'Catequese'
              });
            }
          }
        });
      }

      return Array.from(map.values());
    },

    _getOtherParticipant(sala) {
      if (!sala || !sala.participantesInfo) return null;
      const otherUid = (sala.participantes || []).find(uid => uid !== this.user.uid);
      if (otherUid && sala.participantesInfo[otherUid]) {
        return { uid: otherUid, ...sala.participantesInfo[otherUid] };
      }
      return null;
    },

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO DAS JANELAS DOCK MINIMIZÁVEIS
    // ------------------------------------------------------------------------
    _renderDockContainer() {
      const dockArea = document.getElementById('chat-dock-windows-area');
      if (!dockArea) return;

      const activeList = Array.from(this.activeRooms.entries());
      dockArea.innerHTML = activeList.map(([salaId, state]) => {
        const sala = this.salas.find(s => s.id === salaId) || { id: salaId, tipo: 'individual' };
        return this._buildDockWindowHtml(sala, state);
      }).join('');

      // Renderiza as mensagens de cada janela aberta
      activeList.forEach(([salaId, state]) => {
        if (!state.minimized) {
          this._renderRoomMessages(salaId);
        }
      });
    },

    _buildDockWindowHtml(sala, state) {
      const isGroup = sala.tipo === 'grupo';
      let title = sala.nome || 'Bate-papo Pastoral';
      let photo = null;
      let subtitle = '';
      let isOnline = false;

      if (!isGroup) {
        const other = this._getOtherParticipant(sala);
        if (other) {
          title = other.displayName;
          photo = other.photoURL;
          subtitle = other.funcao || other.role;
          const presence = this.presences.get(other.uid);
          isOnline = this.isUserOnline(presence);
        }
      } else {
        subtitle = `${(sala.participantes || []).length} membros`;
      }

      const isMin = state.minimized;

      return `
        <div id="chat-dock-window-${sala.id}" class="chat-dock-window ${isMin ? 'minimized' : ''} w-[320px] sm:w-[340px] max-w-[calc(100vw-32px)] h-[440px] bg-white rounded-t-2xl rounded-b-lg border border-slate-300 flex flex-col overflow-hidden text-slate-800 bg-white">
          
          <!-- HEADER DA JANELINHA -->
          <div class="px-3.5 py-2.5 bg-[#1b2838] text-white flex items-center justify-between border-b border-amber-500/30 cursor-pointer select-none" onclick="window.ChatEngine.minimizeRoomDock('${sala.id}')">
            <div class="flex items-center gap-2 min-w-0">
              <div class="relative flex-shrink-0">
                ${isGroup
                  ? `<div class="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400">👥</div>`
                  : this._renderAvatarImgOrInitials({ displayName: title, photoURL: photo }, 'w-7 h-7 text-[10px]')}
                ${!isGroup ? `<span id="chat-dock-online-dot-${sala.id}" class="${isOnline ? 'chat-status-online' : 'chat-status-offline'} absolute bottom-0 right-0"></span>` : ''}
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-amber-300 truncate">${this._escapeHtml(title)}</h4>
                <p class="text-[10px] text-slate-300 truncate">${this._escapeHtml(subtitle)}</p>
              </div>
            </div>

            <!-- CONTROLES -->
            <div class="flex items-center gap-1.5 text-slate-300" onclick="event.stopPropagation()">
              <button type="button" onclick="window.ChatEngine.minimizeRoomDock('${sala.id}')" class="p-1 hover:text-white text-xs font-bold" title="${isMin ? 'Maximizar' : 'Minimizar'}">
                ${isMin ? '▢' : '—'}
              </button>
              <button type="button" onclick="window.ChatEngine.closeRoomDock('${sala.id}')" class="p-1 hover:text-rose-400 text-xs font-bold" title="Fechar">
                ✕
              </button>
            </div>
          </div>

          <!-- CORPO DA CONVERSA (MENSAGENS + INPUT) -->
          <div class="chat-dock-body flex-1 flex flex-col min-h-0 bg-slate-50">
            
            <!-- AVISO DE EXPURGO DE 7 DIAS -->
            <div class="px-3 py-1 bg-amber-50/80 border-b border-amber-200/60 text-[10px] text-amber-800 text-center font-medium">
              🕊️ Mensagens expurgadas após 7 dias
            </div>

            <!-- ÁREA DE MENSAGENS -->
            <div id="chat-messages-scroll-${sala.id}" class="flex-1 overflow-y-auto p-3 space-y-2.5 chat-messages-scroll">
              <!-- Mensagens injetadas via _renderRoomMessages -->
            </div>

            <!-- QUICK EMOJIS PICKER -->
            <div class="px-2 py-1 bg-white border-t border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar text-sm">
              ${['🙏', '✝️', '❤️', '👍', '🕊️', '📖', '⛪', '🕯️', '👏', '🎉', '😊'].map(e => `
                <button type="button" onclick="window.ChatEngine.insertEmoji('${sala.id}', '${e}')" class="p-1 hover:bg-slate-100 rounded text-xs transition">
                  ${e}
                </button>
              `).join('')}
            </div>

            <!-- CAIXA DE TEXTO E ENVIO -->
            <div class="p-2 bg-white border-t border-slate-200 flex items-end gap-1.5">
              <textarea id="chat-input-${sala.id}" onkeydown="window.ChatEngine.onInputKeyDown(event, '${sala.id}')" placeholder="Digite uma mensagem... (Enter para enviar)" rows="1" class="flex-1 max-h-24 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white resize-none"></textarea>
              <button type="button" onclick="window.ChatEngine.sendMessage('${sala.id}')" class="p-2 bg-[#1b2838] hover:bg-slate-800 text-amber-300 rounded-lg transition shadow-sm font-bold text-xs cursor-pointer flex-shrink-0" title="Enviar Mensagem">
                ➤
              </button>
            </div>

          </div>

        </div>
      `;
    },

    _renderRoomMessages(salaId) {
      const container = document.getElementById(`chat-messages-scroll-${salaId}`);
      if (!container) return;

      const roomState = this.activeRooms.get(salaId);
      if (!roomState || !roomState.messages) return;

      if (roomState.messages.length === 0) {
        container.innerHTML = `
          <div class="py-8 text-center text-slate-400 text-xs">
            <span>✨</span> Nenhuma mensagem nos últimos 7 dias.<br>
            <span class="text-[11px] text-slate-400">Envie a primeira mensagem para iniciar!</span>
          </div>
        `;
        return;
      }

      container.innerHTML = roomState.messages.map(msg => {
        const isMe = msg.remetenteId === this.user.uid;
        const timeStr = msg.criadoEm ? this._formatMessageTime(msg.criadoEm) : '';
        const parsedText = this._parseMessageText(msg.texto);

        if (isMe) {
          return `
            <div class="flex flex-col items-end">
              <div class="chat-bubble-me max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words">
                ${parsedText}
              </div>
              <span class="text-[9.5px] text-slate-400 mt-0.5 pr-1">${timeStr}</span>
            </div>
          `;
        } else {
          return `
            <div class="flex items-start gap-2">
              <div class="flex-shrink-0 mt-0.5">
                ${this._renderAvatarImgOrInitials({ displayName: msg.remetenteNome, photoURL: msg.remetenteFoto }, 'w-6 h-6 text-[9px]')}
              </div>
              <div class="flex flex-col items-start min-w-0">
                <div class="flex items-center gap-1 mb-0.5">
                  <span class="text-[10.5px] font-bold text-slate-700 truncate max-w-[140px]">${this._escapeHtml(msg.remetenteNome)}</span>
                  ${msg.remetenteRole ? this.getRoleBadgeHtml(msg.remetenteRole, null) : ''}
                </div>
                <div class="chat-bubble-other max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words">
                  ${parsedText}
                </div>
                <span class="text-[9.5px] text-slate-400 mt-0.5 pl-1">${timeStr}</span>
              </div>
            </div>
          `;
        }
      }).join('');

      // Rolagem automática para a mensagem mais recente
      container.scrollTop = container.scrollHeight;
    },

    _renderDockHeadersStatus() {
      this.activeRooms.forEach((state, salaId) => {
        const sala = this.salas.find(s => s.id === salaId);
        if (sala && sala.tipo !== 'grupo') {
          const other = this._getOtherParticipant(sala);
          if (other) {
            const presence = this.presences.get(other.uid);
            const isOnline = this.isUserOnline(presence);
            const dot = document.getElementById(`chat-dock-online-dot-${salaId}`);
            if (dot) {
              dot.className = `${isOnline ? 'chat-status-online' : 'chat-status-offline'} absolute bottom-0 right-0`;
            }
          }
        }
      });
    },

    insertEmoji(salaId, emoji) {
      const input = document.getElementById(`chat-input-${salaId}`);
      if (input) {
        input.value += emoji;
        input.focus();
      }
    },

    onInputKeyDown(event, salaId) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage(salaId);
      }
    },

    // ------------------------------------------------------------------------
    // MODAL DE NOVO GRUPO
    // ------------------------------------------------------------------------
    openGroupModal() {
      const modal = document.getElementById('chat-modal-group');
      if (!modal) return;
      modal.classList.remove('hidden');

      const nameInput = document.getElementById('chat-group-name-input');
      if (nameInput) nameInput.value = '';

      this.filterGroupModalMembers('');
    },

    closeGroupModal() {
      const modal = document.getElementById('chat-modal-group');
      if (modal) modal.classList.add('hidden');
    },

    filterGroupModalMembers(query) {
      const container = document.getElementById('chat-group-members-list');
      if (!container) return;

      const contacts = this._getAllCombinedContacts().filter(c => c.uid !== this.user.uid);
      const q = (query || '').toLowerCase().trim();

      const filtered = q ? contacts.filter(c => {
        const name = (c.displayName || c.nomeCompleto || '').toLowerCase();
        const funcao = (c.funcao || c.funcaoPrincipal || '').toLowerCase();
        return name.includes(q) || funcao.includes(q);
      }) : contacts;

      container.innerHTML = filtered.map(c => {
        const name = c.displayName || c.nomeCompleto;
        const photo = this.getUserPhoto(c);
        return `
          <label class="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
            <div class="flex items-center gap-2 min-w-0">
              <input type="checkbox" value="${c.uid}" data-email="${c.email || ''}" data-name="${this._escapeHtml(name)}" class="chat-group-member-checkbox rounded text-amber-600 focus:ring-amber-500">
              ${this._renderAvatarImgOrInitials({ displayName: name, photoURL: photo }, 'w-6 h-6 text-[9px]')}
              <div class="min-w-0">
                <div class="text-xs font-semibold text-slate-800 truncate">${this._escapeHtml(name)}</div>
                <div class="text-[10px] text-slate-400 truncate">${this._escapeHtml(c.funcao || 'Catequista')}</div>
              </div>
            </div>
            ${this.getRoleBadgeHtml(c.role, null)}
          </label>
        `;
      }).join('');
    },

    submitCreateGroup() {
      const nameInput = document.getElementById('chat-group-name-input');
      const groupName = nameInput ? nameInput.value.trim() : '';

      const checkboxes = document.querySelectorAll('.chat-group-member-checkbox:checked');
      const members = [];
      checkboxes.forEach(cb => {
        members.push({
          uid: cb.value,
          email: cb.getAttribute('data-email'),
          displayName: cb.getAttribute('data-name')
        });
      });

      this.createGroupChat(groupName, members);
    },

    // ------------------------------------------------------------------------
    // MODAL DE LISTAS PERSONALIZADAS
    // ------------------------------------------------------------------------
    openCustomListModal() {
      const modal = document.getElementById('chat-modal-custom-lists');
      if (!modal) return;
      modal.classList.remove('hidden');

      const nameInput = document.getElementById('chat-new-list-name');
      if (nameInput) nameInput.value = '';

      // Popula contatos para seleção
      const contactsContainer = document.getElementById('chat-new-list-members-selection');
      if (contactsContainer) {
        const contacts = this._getAllCombinedContacts().filter(c => c.uid !== this.user.uid);
        contactsContainer.innerHTML = contacts.map(c => `
          <label class="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
            <input type="checkbox" value="${c.email}" class="chat-custom-list-cb rounded text-amber-600">
            <span class="font-medium text-slate-800">${this._escapeHtml(c.displayName || c.nomeCompleto)}</span>
            <span class="text-[10px] text-slate-400">(${this._escapeHtml(c.funcao || 'Catequista')})</span>
          </label>
        `).join('');
      }

      this._renderCustomListsExisting();
    },

    closeCustomListModal() {
      const modal = document.getElementById('chat-modal-custom-lists');
      if (modal) modal.classList.add('hidden');
    },

    _renderCustomListsExisting() {
      const container = document.getElementById('chat-custom-lists-existing');
      if (!container) return;

      if (this.customLists.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 italic">Nenhuma lista personalizada criada ainda.</p>';
        return;
      }

      container.innerHTML = this.customLists.map(l => `
        <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <span>📁</span> <span>${this._escapeHtml(l.nome)}</span>
            </div>
            <div class="text-[10.5px] text-slate-500 mt-0.5">
              ${(l.membrosEmails || []).length} contatos incluídos
            </div>
          </div>
          <button type="button" onclick="window.ChatEngine.deleteCustomList('${l.id}')" class="p-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded" title="Excluir Lista">
            🗑️
          </button>
        </div>
      `).join('');
    },

    submitCreateCustomList() {
      const nameInput = document.getElementById('chat-new-list-name');
      const listName = nameInput ? nameInput.value.trim() : '';

      const checkboxes = document.querySelectorAll('.chat-custom-list-cb:checked');
      const emails = [];
      checkboxes.forEach(cb => {
        if (cb.value) emails.push(cb.value);
      });

      this.saveCustomList(listName, emails);
    },

    // ------------------------------------------------------------------------
    // UTILITÁRIOS E HELPERS VISUAIS
    // ------------------------------------------------------------------------
    _renderAvatarImgOrInitials(userOrPresence, sizeClass = 'w-8 h-8 text-xs') {
      const photo = this.getUserPhoto(userOrPresence);
      const name = (userOrPresence && (userOrPresence.displayName || userOrPresence.nomeCompleto)) || 'Catequista';
      const initials = this.getInitials(name);

      if (photo) {
        return `<img src="${photo}" alt="${this._escapeHtml(name)}" class="${sizeClass} rounded-full object-cover border border-amber-400/40 shadow-xs flex-shrink-0" onerror="this.onerror=null; this.outerHTML='<div class=\\'${sizeClass} rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-bold border border-amber-400/50 flex-shrink-0\\'>${initials}</div>'">`;
      }

      return `<div class="${sizeClass} rounded-full bg-slate-700 text-amber-300 flex items-center justify-center font-bold border border-amber-400/50 shadow-xs flex-shrink-0">${initials}</div>`;
    },

    _escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    _parseMessageText(text) {
      if (!text) return '';
      let safe = this._escapeHtml(text);
      // Converte quebras de linha
      safe = safe.replace(/\n/g, '<br>');
      // Converte links URLs em tags <a> seguras
      const urlPattern = /(https?:\/\/[^\s<]+)/g;
      safe = safe.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      return safe;
    },

    _formatRelativeTime(timestamp) {
      if (!timestamp) return '';
      let date = null;
      if (timestamp.toDate) date = timestamp.toDate();
      else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
      else date = new Date(timestamp);

      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMin / 60);

      if (diffMin < 1) return 'Agora';
      if (diffMin < 60) return `${diffMin}m`;
      if (diffHrs < 24) return `${diffHrs}h`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    },

    _formatMessageTime(timestamp) {
      if (!timestamp) return '';
      let date = null;
      if (timestamp.toDate) date = timestamp.toDate();
      else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
      else date = new Date(timestamp);

      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Exporta globalmente
  window.ChatEngine = ChatEngine;

})(window, document);
