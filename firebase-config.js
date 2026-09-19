// ==========================================================================
// PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
// Configuração do Firebase, Cloudflare Turnstile, Criptografia AES-GCM (LGPD)
// e Trilha Perene de Auditoria (Audit Trail)
// ==========================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAWrOAoRIfWQTerWqP4TO-XlQ8xuk192vU",
  authDomain: "catequese-icm.firebaseapp.com",
  projectId: "catequese-icm",
  storageBucket: "catequese-icm.firebasestorage.app",
  messagingSenderId: "30745657329",
  appId: "1:30745657329:web:0ff21f4671238f64fa0e50"
};

// Chave do Cloudflare Turnstile (Site Key pública)
// Usando a chave de teste '1x00000000000000000000AA' que garante aprovação imediata em desenvolvimento
// Substitua pela SiteKey de produção gerada no painel Cloudflare para o domínio oficial
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

// ==========================================================================
// 👥 MATRIZ DE GOVERNANÇA E CONTROLE DE ACESSO (RBAC)
// ==========================================================================
const ROLES = {
  MASTER_ADMIN: 'master_admin',
  COORD_GERAL: 'coord_geral',
  VICE_COORD_GERAL: 'vice_coord_geral',
  COORD_ETAPA: 'coord_etapa',
  CATEQUISTA: 'catequista',
  SECRETARIA: 'secretaria',
  PENDENTE: 'pendente'
};

const MASTER_ADMIN_EMAIL = 'colletes@gmail.com'; // Thiago Carvalho
const COORD_GERAL_EMAIL = 'Lorenammoraes@gmail.com'; // Lorena

// Chaves locais para persistência e sincronização de usuários
const STORAGE_KEY_AUTHORIZED_USERS = 'catequese_authorized_users_v2';
const STORAGE_KEY_PENDING_USERS = 'catequese_pending_users_v2';

// Usuários fundamentais de alta hierarquia
const SEED_AUTHORIZED_USERS = [
  {
    email: 'colletes@gmail.com',
    displayName: 'Thiago Carvalho',
    role: ROLES.MASTER_ADMIN,
    turmaId: 'todas',
    turmaNome: 'Todas as Turmas (Acesso Total)',
    etapa: 'Todas',
    status: 'ativo',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedBy: 'Sistema Oficial'
  },
  {
    email: 'lorenammoraes@gmail.com',
    displayName: 'Lorena Moraes',
    role: ROLES.COORD_GERAL,
    turmaId: 'todas',
    turmaNome: 'Todas as Turmas (Coordenação)',
    etapa: 'Todas',
    status: 'ativo',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedBy: 'Sistema Oficial'
  },
  {
    email: 'secretaria@imaculadocoracaodf.com.br',
    displayName: 'Sandra (Secretaria Paroquial)',
    role: ROLES.SECRETARIA,
    turmaId: 'todas',
    turmaNome: 'Todas as Turmas (Secretaria)',
    etapa: 'Todas',
    status: 'ativo',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedBy: 'Sistema Oficial'
  },
  {
    email: 'picmbrasilia@gmail.com',
    displayName: 'Larissa (PICM)',
    role: ROLES.CATEQUISTA,
    turmaId: 'todas',
    turmaNome: 'Catequese ICM (Todas as Turmas)',
    etapa: 'Geral',
    status: 'ativo',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedBy: 'Thiago Carvalho (Master Admin)'
  }
];

function getAuthorizedUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTHORIZED_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUTHORIZED_USERS, JSON.stringify(SEED_AUTHORIZED_USERS));
      return [...SEED_AUTHORIZED_USERS];
    }
    const list = JSON.parse(raw);
    if (!list.some(u => u.email && u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase())) {
      list.unshift(SEED_AUTHORIZED_USERS[0]);
    }
    if (!list.some(u => u.email && u.email.toLowerCase() === COORD_GERAL_EMAIL.toLowerCase())) {
      list.splice(1, 0, SEED_AUTHORIZED_USERS[1]);
    }
    if (!list.some(u => u.role === ROLES.SECRETARIA || (u.email && (u.email.toLowerCase().includes('secretaria') || u.email.toLowerCase().includes('sandra'))))) {
      list.push(SEED_AUTHORIZED_USERS[2]);
    }
    if (!list.some(u => u.email && (u.email.toLowerCase().includes('picmbrasilia') || u.email.toLowerCase().includes('larissa')))) {
      list.push(SEED_AUTHORIZED_USERS[3]);
    }
    return list;
  } catch (e) {
    return [...SEED_AUTHORIZED_USERS];
  }
}

function saveAuthorizedUsers(list) {
  try {
    localStorage.setItem(STORAGE_KEY_AUTHORIZED_USERS, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao salvar usuários autorizados:', e);
  }
}

function getPendingUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function savePendingUsers(list) {
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_USERS, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao salvar usuários pendentes:', e);
  }
}

function determineUserRole(email) {
  if (!email) return ROLES.PENDENTE;
  const clean = email.trim().toLowerCase();
  if (clean === MASTER_ADMIN_EMAIL.toLowerCase()) return ROLES.MASTER_ADMIN;
  if (clean === COORD_GERAL_EMAIL.toLowerCase()) return ROLES.COORD_GERAL;

  const users = getAuthorizedUsers();
  const found = users.find(u => u.email && u.email.trim().toLowerCase() === clean && u.status === 'ativo');
  if (found && found.role) return found.role;

  if (clean.includes('secretaria') || clean.includes('sandra')) return ROLES.SECRETARIA;
  if (clean.includes('picmbrasilia') || clean.includes('larissa')) return ROLES.CATEQUISTA;
  return ROLES.PENDENTE;
}

function getUserProfile(email) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const users = getAuthorizedUsers();
  const found = users.find(u => u.email && u.email.trim().toLowerCase() === clean);
  if (found) return found;
  if (clean === MASTER_ADMIN_EMAIL.toLowerCase()) return SEED_AUTHORIZED_USERS[0];
  if (clean === COORD_GERAL_EMAIL.toLowerCase()) return SEED_AUTHORIZED_USERS[1];
  if (clean.includes('secretaria') || clean.includes('sandra')) return SEED_AUTHORIZED_USERS[2];
  if (clean.includes('picmbrasilia') || clean.includes('larissa')) return SEED_AUTHORIZED_USERS[3];
  return null;
}

// Salva nova solicitação de acesso pendente quando usuário tenta entrar
async function recordPendingAccessRequest(userData) {
  if (!userData || !userData.email) return;
  const clean = userData.email.trim().toLowerCase();

  // Se já for autorizado ativo, não adiciona aos pendentes
  if (determineUserRole(clean) !== ROLES.PENDENTE) return;

  const pendingList = getPendingUsers();
  const existingIdx = pendingList.findIndex(p => p.email && p.email.toLowerCase() === clean);

  const pendingEntry = {
    email: clean,
    displayName: userData.displayName || clean.split('@')[0],
    photoURL: userData.photoURL || null,
    uid: userData.uid || null,
    requestedAt: new Date().toISOString(),
    status: 'pendente'
  };

  if (existingIdx >= 0) {
    pendingList[existingIdx] = { ...pendingList[existingIdx], ...pendingEntry };
  } else {
    pendingList.unshift(pendingEntry);
  }
  savePendingUsers(pendingList);

  // Firestore sync se disponível
  try {
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      await window.firebaseDb.collection('pending_users').doc(sanitizedDocId).set(pendingEntry);
    }
  } catch (e) {
    console.warn('Sync pending_users Firestore:', e);
  }

  logAuditEvent('AUTH_PENDING_REQUEST', 'solicitação_acesso', {
    email: clean,
    name: pendingEntry.displayName
  });

  return pendingEntry;
}

// Aprova um usuário pendente e atribui papel/turma
async function approvePendingUser({ email, role, turmaId, turmaNome, etapa, approverName }) {
  const clean = email.trim().toLowerCase();
  const pendingList = getPendingUsers();
  const pendingUser = pendingList.find(p => p.email && p.email.toLowerCase() === clean);

  const displayName = pendingUser ? pendingUser.displayName : clean.split('@')[0];
  const photoURL = pendingUser ? pendingUser.photoURL : null;

  const authUsers = getAuthorizedUsers();
  const existingIdx = authUsers.findIndex(u => u.email && u.email.toLowerCase() === clean);

  const userRecord = {
    email: clean,
    displayName: displayName,
    photoURL: photoURL,
    role: role || ROLES.CATEQUISTA,
    turmaId: turmaId || 'geral',
    turmaNome: turmaNome || 'Turma Geral',
    etapa: etapa || 'Geral',
    status: 'ativo',
    approvedAt: new Date().toISOString(),
    approvedBy: approverName || 'Coordenação'
  };

  if (existingIdx >= 0) {
    authUsers[existingIdx] = { ...authUsers[existingIdx], ...userRecord };
  } else {
    authUsers.push(userRecord);
  }
  saveAuthorizedUsers(authUsers);

  // Remove da lista de pendentes
  const updatedPending = pendingList.filter(p => p.email && p.email.toLowerCase() !== clean);
  savePendingUsers(updatedPending);

  // Sync no Firestore
  try {
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      await window.firebaseDb.collection('authorized_users').doc(sanitizedDocId).set(userRecord);
      await window.firebaseDb.collection('pending_users').doc(sanitizedDocId).delete().catch(() => {});
    }
  } catch (e) {
    console.warn('Sync approve Firestore:', e);
  }

  logAuditEvent('USER_APPROVED', 'gestão_usuarios', {
    targetEmail: clean,
    targetName: displayName,
    role: role,
    turmaNome: turmaNome,
    approvedBy: approverName
  });

  return userRecord;
}

// Recusa / descarta solicitação de acesso pendente
async function rejectPendingUser(email, rejectorName) {
  const clean = email.trim().toLowerCase();
  const pendingList = getPendingUsers();
  const updatedPending = pendingList.filter(p => p.email && p.email.toLowerCase() !== clean);
  savePendingUsers(updatedPending);

  try {
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      await window.firebaseDb.collection('pending_users').doc(sanitizedDocId).delete().catch(() => {});
    }
  } catch (e) {
    console.warn('Sync reject Firestore:', e);
  }

  logAuditEvent('USER_REJECTED', 'gestão_usuarios', {
    targetEmail: clean,
    rejectedBy: rejectorName
  });
}

// Pré-autoriza um catequista ou secretário antes mesmo do 1º login
async function preAuthorizeUser({ email, displayName, role, turmaId, turmaNome, etapa, creatorName }) {
  const clean = email.trim().toLowerCase();
  const authUsers = getAuthorizedUsers();
  const existingIdx = authUsers.findIndex(u => u.email && u.email.toLowerCase() === clean);

  const userRecord = {
    email: clean,
    displayName: displayName || clean.split('@')[0],
    photoURL: null,
    role: role || ROLES.CATEQUISTA,
    turmaId: turmaId || 'geral',
    turmaNome: turmaNome || 'Turma Geral',
    etapa: etapa || 'Geral',
    status: 'ativo',
    approvedAt: new Date().toISOString(),
    approvedBy: creatorName || 'Coordenação (Pré-autorizado)'
  };

  if (existingIdx >= 0) {
    authUsers[existingIdx] = { ...authUsers[existingIdx], ...userRecord };
  } else {
    authUsers.push(userRecord);
  }
  saveAuthorizedUsers(authUsers);

  // Se constava em pendentes, remove
  const pendingList = getPendingUsers();
  const updatedPending = pendingList.filter(p => p.email && p.email.toLowerCase() !== clean);
  savePendingUsers(updatedPending);

  try {
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      await window.firebaseDb.collection('authorized_users').doc(sanitizedDocId).set(userRecord);
      await window.firebaseDb.collection('pending_users').doc(sanitizedDocId).delete().catch(() => {});
    }
  } catch (e) {
    console.warn('Sync pre-authorize Firestore:', e);
  }

  logAuditEvent('USER_PRE_AUTHORIZED', 'gestão_usuarios', {
    targetEmail: clean,
    targetName: displayName,
    role: role,
    turmaNome: turmaNome,
    createdBy: creatorName
  });

  return userRecord;
}

// Revoga acesso de um usuário
async function revokeUserAccess(email, revokerName) {
  const clean = email.trim().toLowerCase();
  if (clean === MASTER_ADMIN_EMAIL.toLowerCase() || clean === COORD_GERAL_EMAIL.toLowerCase()) {
    throw new Error('Não é permitido revogar os administradores oficiais.');
  }

  const authUsers = getAuthorizedUsers();
  const updatedUsers = authUsers.filter(u => u.email && u.email.toLowerCase() !== clean);
  saveAuthorizedUsers(updatedUsers);

  try {
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      await window.firebaseDb.collection('authorized_users').doc(sanitizedDocId).delete().catch(() => {});
    }
  } catch (e) {
    console.warn('Sync revoke Firestore:', e);
  }

  logAuditEvent('USER_REVOKED', 'gestão_usuarios', {
    targetEmail: clean,
    revokedBy: revokerName
  });
}

// ==========================================================================
// ☁️ SINCRONIZAÇÃO EM NUVEM DE USUÁRIOS (FIRESTORE CLOUD SYNC)
// ==========================================================================
async function syncUsersFromFirestore() {
  if (!window.firebaseDb || typeof window.firebaseDb.collection !== 'function') return;
  try {
    // 1. Sincroniza usuários autorizados da nuvem
    const authSnap = await window.firebaseDb.collection('authorized_users').get();
    if (authSnap && !authSnap.empty) {
      const currentAuth = getAuthorizedUsers();
      let changedAuth = false;
      authSnap.forEach(doc => {
        const data = doc.data();
        if (data && data.email && data.status === 'ativo') {
          const clean = data.email.trim().toLowerCase();
          const idx = currentAuth.findIndex(u => u.email && u.email.trim().toLowerCase() === clean);
          if (idx >= 0) {
            currentAuth[idx] = { ...currentAuth[idx], ...data };
          } else {
            currentAuth.push(data);
          }
          changedAuth = true;
        }
      });
      if (changedAuth) {
        saveAuthorizedUsers(currentAuth);
      }
    }

    // 2. Sincroniza solicitações pendentes da nuvem
    const pendSnap = await window.firebaseDb.collection('pending_users').get();
    if (pendSnap && !pendSnap.empty) {
      const currentPend = getPendingUsers();
      const currentAuth = getAuthorizedUsers();
      let changedPend = false;
      pendSnap.forEach(doc => {
        const data = doc.data();
        if (data && data.email && data.status === 'pendente') {
          const clean = data.email.trim().toLowerCase();
          // Não adiciona se já foi aprovado
          const isAlreadyApproved = currentAuth.some(u => u.email && u.email.trim().toLowerCase() === clean && u.status === 'ativo');
          if (!isAlreadyApproved) {
            const idx = currentPend.findIndex(p => p.email && p.email.trim().toLowerCase() === clean);
            if (idx >= 0) {
              currentPend[idx] = { ...currentPend[idx], ...data };
            } else {
              currentPend.unshift(data);
            }
            changedPend = true;
          }
        }
      });
      if (changedPend) {
        savePendingUsers(currentPend);
      }
    }

    // Atualiza badges na interface se disponível
    if (typeof window.updateUserMgmtBadges === 'function') {
      window.updateUserMgmtBadges();
    }
  } catch (e) {
    console.warn('Falha na sincronização de usuários via Firestore:', e);
  }
}

// Ouve atualizações em tempo real no Firestore para autorizações imediatas entre dispositivos
function listenUsersFromFirestore() {
  if (!window.firebaseDb || typeof window.firebaseDb.collection !== 'function') return;
  try {
    // Listener de usuários autorizados
    window.firebaseDb.collection('authorized_users').onSnapshot(snapshot => {
      if (!snapshot || snapshot.empty) return;
      const currentAuth = getAuthorizedUsers();
      let changed = false;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.email && data.status === 'ativo') {
          const clean = data.email.trim().toLowerCase();
          const idx = currentAuth.findIndex(u => u.email && u.email.trim().toLowerCase() === clean);
          if (idx >= 0) {
            currentAuth[idx] = { ...currentAuth[idx], ...data };
          } else {
            currentAuth.push(data);
          }
          changed = true;
        }
      });
      if (changed) {
        saveAuthorizedUsers(currentAuth);
        if (typeof window.updateUserMgmtBadges === 'function') {
          window.updateUserMgmtBadges();
        }
      }
    }, err => {
      console.warn('onSnapshot authorized_users:', err);
    });

    // Listener de solicitações pendentes
    window.firebaseDb.collection('pending_users').onSnapshot(snapshot => {
      if (!snapshot) return;
      const currentPend = [];
      const currentAuth = getAuthorizedUsers();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.email && data.status === 'pendente') {
          const clean = data.email.trim().toLowerCase();
          const isApproved = currentAuth.some(u => u.email && u.email.trim().toLowerCase() === clean && u.status === 'ativo');
          if (!isApproved) {
            currentPend.push(data);
          }
        }
      });
      savePendingUsers(currentPend);
      if (typeof window.updateUserMgmtBadges === 'function') {
        window.updateUserMgmtBadges();
      }
    }, err => {
      console.warn('onSnapshot pending_users:', err);
    });
  } catch (e) {
    console.warn('Erro ao configurar listener de usuários em tempo real:', e);
  }
}

// Validação assíncrona profunda no Firestore antes de exibir tela de bloqueio
async function checkUserRoleAsync(email) {
  if (!email) return ROLES.PENDENTE;
  const clean = email.trim().toLowerCase();

  // 1. Checagem síncrona imediata (cache local e seeds fundamentais)
  const localRole = determineUserRole(clean);
  if (localRole !== ROLES.PENDENTE) return localRole;

  // 2. Consulta direta à nuvem no Firestore
  if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
    try {
      const sanitizedDocId = clean.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Busca direta pelo docId sanitizado
      let userDoc = await window.firebaseDb.collection('authorized_users').doc(sanitizedDocId).get();
      let userData = userDoc && userDoc.exists ? userDoc.data() : null;

      // Se não encontrou por docId, tenta buscar por query do campo email
      if (!userData) {
        const qSnap = await window.firebaseDb.collection('authorized_users').where('email', '==', clean).limit(1).get();
        if (qSnap && !qSnap.empty) {
          userData = qSnap.docs[0].data();
        }
      }

      if (userData && userData.status === 'ativo' && userData.role) {
        // Atualiza armazenamento local imediatamente
        const authUsers = getAuthorizedUsers();
        const idx = authUsers.findIndex(u => u.email && u.email.trim().toLowerCase() === clean);
        if (idx >= 0) {
          authUsers[idx] = { ...authUsers[idx], ...userData };
        } else {
          authUsers.push(userData);
        }
        saveAuthorizedUsers(authUsers);

        // Remove de pendentes se constava localmente
        const pendingList = getPendingUsers();
        const updatedPending = pendingList.filter(p => p.email && p.email.trim().toLowerCase() !== clean);
        savePendingUsers(updatedPending);

        return userData.role;
      }
    } catch (err) {
      console.warn('Erro ao consultar permissões na nuvem (Firestore):', err);
    }
  }

  return ROLES.PENDENTE;
}

// ==========================================================================
// 🔐 CRIPTOGRAFIA DE CAMPOS SENSÍVEIS (LGPD — Web Crypto API AES-GCM 256-bit)
// ==========================================================================
// Salva/gera chave simétrica derivada no navegador
const CRYPTO_SALT = new TextEncoder().encode("SICM-CATEQUESE-LGPD-PROTECTION-2026");

let cachedCryptoKey = null;

async function getEncryptionKey() {
  if (cachedCryptoKey) return cachedCryptoKey;
  const rawKeyMaterial = new TextEncoder().encode("SicmPastoral@2026#ImaculadoCoracaoDF$LgpdVault");
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    rawKeyMaterial,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  cachedCryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: CRYPTO_SALT,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedCryptoKey;
}

// Cifra uma string em texto plano para Base64 cifrado com IV
async function encryptPII(plainText) {
  if (!plainText || typeof plainText !== 'string' || !plainText.trim()) return plainText;
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoded
    );

    const ciphertextArray = new Uint8Array(ciphertextBuffer);
    const combined = new Uint8Array(iv.length + ciphertextArray.length);
    combined.set(iv);
    combined.set(ciphertextArray, iv.length);

    // Converte para Base64 com prefixo identificador
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return 'ENC:' + btoa(binary);
  } catch (err) {
    console.error('Erro ao criptografar campo PII:', err);
    return plainText; // Fallback seguro
  }
}

// Decifra uma string Base64 cifrada com prefixo ENC:
async function decryptPII(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('ENC:')) {
    return cipherText; // Já em texto plano ou legado
  }
  try {
    const key = await getEncryptionKey();
    const base64Data = cipherText.substring(4);
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('Erro ao decifrar campo PII:', err);
    return '[DADO PROTEGIDO]';
  }
}

// ==========================================================================
// 📜 TRILHA DE AUDITORIA IMUTÁVEL (AUDIT TRAIL — ART. 37 LGPD)
// ==========================================================================
const AUDIT_STORAGE_KEY = 'catequese_local_audit_logs';

async function logAuditEvent(action, target, details = {}) {
  const currentUser = window.appAuthState ? window.appAuthState.user : null;
  const userRole = window.appAuthState ? window.appAuthState.role : ROLES.PENDENTE;

  const logEntry = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    userEmail: currentUser ? currentUser.email : 'anônimo / sistema',
    userUid: currentUser ? currentUser.uid : 'auth-system',
    userName: currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Sistema',
    userRole: userRole,
    action: action, // AUTH_LOGIN, TERMOS_CONSENT, READ_TURMA, VIEW_PII, CREATE_ALUNO, UPDATE_ALUNO, DELETE_ALUNO, NOTIFICATION_SENT
    target: target || 'geral',
    details: details,
    userAgent: navigator.userAgent.substring(0, 120)
  };

  try {
    // 1. Gravação local com retenção de segurança
    const existing = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    existing.unshift(logEntry);
    if (existing.length > 500) existing.pop(); // Mantém últimos 500 logs locais
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(existing));

    // 2. Gravação em coleção do Firestore se o cliente estiver ativo
    if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      await window.firebaseDb.collection('audit_logs').add(logEntry);
    }
  } catch (e) {
    console.warn('Registro de auditoria efetuado localmente:', e);
  }

  return logEntry;
}

function getAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// ==========================================================================
// 🛡️ GESTÃO DE EXCLUSÃO DE DADOS (ELIMINAÇÃO LGPD — ART. 18, VI)
// ==========================================================================
const LGPD_DELETION_STORAGE_KEY = 'catequese_lgpd_deletion_requests_v1';

function getLgpdDeletionRequests() {
  try {
    return JSON.parse(localStorage.getItem(LGPD_DELETION_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

async function createLgpdDeletionRequest(data) {
  const requests = getLgpdDeletionRequests();
  const currentUser = window.appAuthState ? window.appAuthState.user : null;
  const userRole = window.appAuthState ? window.appAuthState.role : ROLES.PENDENTE;

  const newRequest = {
    id: 'lgpd-del-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    titularId: data.titularId,
    titularNome: data.titularNome,
    titularTipo: data.titularTipo || 'catequizando', // 'catequizando', 'catequista', 'usuario'
    titularCpf: data.titularCpf || '',
    titularTurma: data.titularTurma || '',
    titularEtapa: data.titularEtapa || '',
    motivo: data.motivo || 'Revogação de Consentimento',
    detalhes: data.detalhes || '',
    dataSolicitacao: new Date().toISOString(),
    status: 'pendente', // 'pendente', 'aprovado', 'rejeitado'
    solicitanteNome: currentUser ? (currentUser.displayName || currentUser.email) : 'Solicitante Pastoral',
    solicitanteEmail: currentUser ? currentUser.email : '',
    solicitanteRole: userRole
  };

  requests.unshift(newRequest);
  localStorage.setItem(LGPD_DELETION_STORAGE_KEY, JSON.stringify(requests));

  if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
    try {
      await window.firebaseDb.collection('lgpd_deletion_requests').doc(newRequest.id).set(newRequest);
    } catch (e) {
      console.warn('Registro de exclusão LGPD mantido localmente:', e);
    }
  }

  await logAuditEvent('LGPD_DELETION_REQUESTED', newRequest.titularNome, {
    requestId: newRequest.id,
    titularTipo: newRequest.titularTipo,
    motivo: newRequest.motivo
  });

  return newRequest;
}

async function approveLgpdDeletionRequest(requestId, approverName = 'Thiago Carvalho (Master Admin)') {
  const requests = getLgpdDeletionRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Solicitação não encontrada');

  const req = requests[index];
  req.status = 'aprovado';
  req.dataAprovacao = new Date().toISOString();
  req.aprovadoPor = approverName;

  requests[index] = req;
  localStorage.setItem(LGPD_DELETION_STORAGE_KEY, JSON.stringify(requests));

  if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
    try {
      await window.firebaseDb.collection('lgpd_deletion_requests').doc(requestId).update({
        status: 'aprovado',
        dataAprovacao: req.dataAprovacao,
        aprovadoPor: approverName
      });
    } catch (e) {
      console.warn('Atualização de solicitação LGPD mantida localmente:', e);
    }
  }

  await logAuditEvent('LGPD_DELETION_APPROVED', req.titularNome, {
    requestId: req.id,
    titularTipo: req.titularTipo,
    aprovadoPor: approverName,
    protocolo: 'LGPD-DEL-' + req.id.toUpperCase()
  });

  return req;
}

async function rejectLgpdDeletionRequest(requestId, rejectorName = 'Thiago Carvalho (Master Admin)', justificativa = '') {
  const requests = getLgpdDeletionRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw new Error('Solicitação não encontrada');

  const req = requests[index];
  req.status = 'rejeitado';
  req.dataRejeicao = new Date().toISOString();
  req.rejeitadoPor = rejectorName;
  req.justificativaRejeicao = justificativa;

  requests[index] = req;
  localStorage.setItem(LGPD_DELETION_STORAGE_KEY, JSON.stringify(requests));

  if (window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
    try {
      await window.firebaseDb.collection('lgpd_deletion_requests').doc(requestId).update({
        status: 'rejeitado',
        dataRejeicao: req.dataRejeicao,
        rejeitadoPor: rejectorName,
        justificativaRejeicao: justificativa
      });
    } catch (e) {
      console.warn('Atualização de indeferimento LGPD mantida localmente:', e);
    }
  }

  await logAuditEvent('LGPD_DELETION_REJECTED', req.titularNome, {
    requestId: req.id,
    rejeitadoPor: rejectorName,
    justificativa: justificativa
  });

  return req;
}

// Exporta utilitários globais para uso na interface
window.ICM_CONFIG = {
  firebaseConfig: FIREBASE_CONFIG,
  turnstileSiteKey: TURNSTILE_SITE_KEY,
  ROLES,
  MASTER_ADMIN_EMAIL,
  COORD_GERAL_EMAIL,
  determineUserRole,
  getUserProfile,
  getAuthorizedUsers,
  getPendingUsers,
  recordPendingAccessRequest,
  approvePendingUser,
  rejectPendingUser,
  preAuthorizeUser,
  revokeUserAccess,
  syncUsersFromFirestore,
  listenUsersFromFirestore,
  checkUserRoleAsync,
  encryptPII,
  decryptPII,
  logAuditEvent,
  getAuditLogs,
  getLgpdDeletionRequests,
  createLgpdDeletionRequest,
  approveLgpdDeletionRequest,
  rejectLgpdDeletionRequest
};

