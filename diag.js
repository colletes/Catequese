/* Diagnóstico do "Código de erro 5" — SOMENTE LEITURA, nunca escreve no Firestore.
 * Uso na URL:
 *   ?diag=1                 -> registra cada onSnapshot/get (coleção, nº docs, tamanho) em localStorage
 *                              e mostra o log da sessão anterior (sobrevive ao crash)
 *   ?diag=1&off=kanban,chat -> além disso, BLOQUEIA leituras cujo caminho contenha cada termo
 *   ?diag=clear             -> apaga o log
 * Sem ?diag na URL este arquivo não faz nada. */
(function () {
  var qs = new URLSearchParams(location.search);
  var diag = qs.get('diag');
  if (!diag) return;
  var KEY = 'icm_diag_log';
  if (diag === 'clear') { try { localStorage.removeItem(KEY); } catch (e) {} return; }
  var off = (qs.get('off') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  var previous = load();
  var session = Date.now().toString(36);
  function log(msg) {
    try {
      var arr = load();
      arr.push(new Date().toISOString().substr(11, 12) + ' [' + session + '] ' + msg);
      localStorage.setItem(KEY, JSON.stringify(arr.slice(-80)));
    } catch (e) {}
    try { console.log('[diag]', msg); } catch (e) {}
  }
  function blocked(path) {
    return off.some(function (t) { return String(path).indexOf(t) !== -1; });
  }
  function bytes(snap) {
    try {
      var n = 0;
      if (snap && typeof snap.forEach === 'function' && !snap.data) {
        snap.forEach(function (d) { n += JSON.stringify(d.data()).length; });
      } else if (snap && typeof snap.data === 'function') {
        n = JSON.stringify(snap.data() || {}).length;
      }
      return n;
    } catch (e) { return -1; }
  }
  function pathOf(o) { return (o && (o.path || (o._query && o._query.path && o._query.path.canonicalString && o._query.path.canonicalString()))) || 'query'; }

  function wrapSnapshot(proto, label) {
    if (!proto || !proto.onSnapshot || proto.__icmDiag) return;
    proto.__icmDiag = true;
    var orig = proto.onSnapshot;
    proto.onSnapshot = function () {
      var path = pathOf(this);
      var args = Array.prototype.slice.call(arguments);
      if (blocked(path)) { log('BLOQUEADO onSnapshot ' + path); return function () {}; }
      log('onSnapshot ' + label + ' ' + path);
      var cbIdx = -1;
      for (var i = 0; i < args.length; i++) { if (typeof args[i] === 'function') { cbIdx = i; break; } }
      if (cbIdx === -1 && args[0] && typeof args[0].next === 'function') {
        var o = args[0], n = o.next;
        o.next = function (s) { log('snap ' + path + ' docs=' + (s && s.size) + ' bytes=' + bytes(s)); return n.apply(this, arguments); };
      } else if (cbIdx !== -1) {
        var cb = args[cbIdx];
        args[cbIdx] = function (s) { log('snap ' + path + ' docs=' + (s && s.size) + ' bytes=' + bytes(s)); return cb.apply(this, arguments); };
      }
      return orig.apply(this, args);
    };
  }
  function wrapGet(proto, label) {
    if (!proto || !proto.get || proto.__icmDiagGet) return;
    proto.__icmDiagGet = true;
    var orig = proto.get;
    proto.get = function () {
      var path = pathOf(this);
      if (blocked(path)) { log('BLOQUEADO get ' + path); return Promise.reject(new Error('diag: bloqueado ' + path)); }
      return orig.apply(this, arguments).then(function (s) {
        log('get ' + label + ' ' + path + ' size=' + (s && s.size) + ' bytes=' + bytes(s));
        return s;
      });
    };
  }

  function install() {
    var f = window.firebase && firebase.firestore;
    if (!f) return false;
    wrapSnapshot(f.Query && f.Query.prototype, 'query');
    wrapSnapshot(f.CollectionReference && f.CollectionReference.prototype, 'col');
    wrapSnapshot(f.DocumentReference && f.DocumentReference.prototype, 'doc');
    wrapGet(f.Query && f.Query.prototype, 'query');
    wrapGet(f.CollectionReference && f.CollectionReference.prototype, 'col');
    wrapGet(f.DocumentReference && f.DocumentReference.prototype, 'doc');
    return true;
  }
  var ok = install();
  log('diag ativo; off=[' + off.join(',') + '] instalado=' + ok);

  window.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('pre');
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:35vh;overflow:auto;margin:0;padding:6px;z-index:2147483647;background:#000c;color:#9f9;font:11px monospace;white-space:pre-wrap';
    box.textContent = '[DIAG sessão anterior]\n' + previous.join('\n') + '\n[fim — clique para fechar]';
    box.onclick = function () { box.remove(); };
    document.body.appendChild(box);
  });
})();
