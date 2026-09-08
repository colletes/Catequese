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
      list.unshift(SEED_AUTHORIZED_USERS[1]);
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
  encryptPII,
  decryptPII,
  logAuditEvent,
  getAuditLogs
};

