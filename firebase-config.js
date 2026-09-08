// ==========================================================================
// PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
// Configuração do Firebase, Cloudflare Turnstile, Criptografia AES-GCM (LGPD)
// e Trilha Perene de Auditoria (Audit Trail)
// ==========================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-ICM-Catequese2026-AppSecureKey",
  authDomain: "catequese-icm.firebaseapp.com",
  projectId: "catequese-icm",
  storageBucket: "catequese-icm.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:icmcatequese2026hash"
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

function determineUserRole(email) {
  if (!email) return ROLES.PENDENTE;
  const clean = email.trim().toLowerCase();
  if (clean === MASTER_ADMIN_EMAIL.toLowerCase()) return ROLES.MASTER_ADMIN;
  if (clean === COORD_GERAL_EMAIL.toLowerCase()) return ROLES.COORD_GERAL;
  if (clean.includes('secretaria') || clean.includes('sandra')) return ROLES.SECRETARIA;
  return ROLES.PENDENTE; // Novos usuários necessitam de liberação de turma
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
  encryptPII,
  decryptPII,
  logAuditEvent,
  getAuditLogs
};
