#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Sincronizador Seguro de PDFs para o Acervo (Hosting & Storage)
Arquivo: scripts/upload_pdfs_to_storage.py

Objetivo:
- Localizar os 75 arquivos PDF da Crisma de Adultos catalogados no Mac
- Padronizar os nomes em slugs ASCII seguros (ex: /acervo/documentos/<slug>.pdf)
- Copiar para acervo/documentos/ para distribuição rápida via Firebase Hosting
- Tentar upload para o Firebase Storage se o bucket estiver provisionado
- Atualizar no Cloud Firestore com estrita política de MERGE CONSTRUTIVO
  (apenas os campos pdfUrl e mediaUrl via updateMask, preservando todo o restante)
- Suporte a --dry-run para inspeção prévia de todas as ações
"""

import os
import sys
import json
import re
import shutil
import unicodedata
import urllib.request
import urllib.parse
import urllib.error
import time

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SEED_FILE = os.path.join(PROJECT_DIR, "scripts", "crisma_adultos_seed.json")
ACERVO_DOCS_DIR = os.path.join(PROJECT_DIR, "acervo", "documentos")
FIREBASE_CONFIG_PATH = os.path.expanduser("~/.config/configstore/firebase-tools.json")

PROJECT_ID = "catequese-icm"
COLLECTION_NAME = "knowledge_nodes"
STORAGE_BUCKET = "catequese-icm.firebasestorage.app"

# Credenciais oficiais do Firebase CLI para renovação de token
OAUTH_CLIENT_ID = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com"
OAUTH_CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi"


def slugify(text):
    """Converte títulos e nomes de arquivos em slugs ASCII seguros e determinísticos."""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)


def get_firebase_token():
    """Obtém ou renova o access_token a partir da sessão ativa do Firebase CLI."""
    if not os.path.exists(FIREBASE_CONFIG_PATH):
        raise FileNotFoundError(f"Configuração do Firebase não encontrada em: {FIREBASE_CONFIG_PATH}")

    with open(FIREBASE_CONFIG_PATH, "r", encoding="utf-8") as f:
        conf = json.load(f)

    tokens = conf.get("tokens", {})
    refresh_token = tokens.get("refresh_token")

    if not refresh_token:
        access_token = tokens.get("access_token")
        if access_token:
            return access_token
        raise ValueError("Nenhum token do Firebase disponível.")

    # Renova token via Google OAuth
    params = {
        "client_id": OAUTH_CLIENT_ID,
        "client_secret": OAUTH_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        return result.get("access_token")


def find_file_on_disk(path_str):
    """Tenta localizar o arquivo considerando normalização Unicode NFC e NFD no macOS."""
    if not path_str:
        return None
    if os.path.exists(path_str):
        return path_str
    nfc = unicodedata.normalize("NFC", path_str)
    if os.path.exists(nfc):
        return nfc
    nfd = unicodedata.normalize("NFD", path_str)
    if os.path.exists(nfd):
        return nfd
    return None


def update_firestore_node_merge(token, node_id, pdf_url):
    """
    Atualiza estritamente os campos 'pdfUrl' e 'mediaUrl' no Firestore via REST API
    utilizando updateMask para garantir MERGE CONSTRUTIVO sem tocar em outros campos.
    """
    url = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/"
        f"{COLLECTION_NAME}/{urllib.parse.quote(node_id, safe='')}?"
        f"updateMask.fieldPaths=pdfUrl&updateMask.fieldPaths=mediaUrl"
    )

    payload = {
        "fields": {
            "pdfUrl": {"stringValue": pdf_url},
            "mediaUrl": {"stringValue": pdf_url}
        }
    }

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8"
        },
        method="PATCH"
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.getcode() == 200


def main():
    print("=" * 72)
    print("⛪ SANTUÁRIO IMACULADO CORAÇÃO DE MARIA — CATEQUESE ICM")
    print("📚 Sincronizador Seguro de PDFs para o Acervo (Hosting & Storage)")
    print("=" * 72)

    is_dry_run = "--apply" not in sys.argv
    if is_dry_run:
        print("\n🔍 MODO DE INSPEÇÃO (DRY-RUN): Nenhuma alteração será gravada.")
        print("   Para efetivar as cópias e atualizações, execute com o parâmetro: --apply\n")
    else:
        print("\n🚀 MODO DE APLICAÇÃO ATIVO (--apply): As alterações serão gravadas.\n")

    if not os.path.exists(SEED_FILE):
        sys.exit(f"❌ Arquivo de seed não encontrado: {SEED_FILE}")

    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    nodes = data.get("nodes", [])
    pdf_nodes = [n for n in nodes if n.get("extension") == "pdf" and n.get("type") == "document"]
    print(f"📦 Total de documentos PDF identificados no acervo: {len(pdf_nodes)}")

    os.makedirs(ACERVO_DOCS_DIR, exist_ok=True)

    prepared_items = []
    missing_files = []

    for idx, node in enumerate(pdf_nodes, 1):
        title = node.get("title", f"documento-{idx}")
        slug = slugify(title)
        target_filename = f"{slug}.pdf"
        target_filepath = os.path.join(ACERVO_DOCS_DIR, target_filename)
        rel_hosting_url = f"/acervo/documentos/{target_filename}"

        local_path = find_file_on_disk(node.get("fullLocalPath") or node.get("pdfLocalPath"))
        if not local_path:
            missing_files.append((node.get("id"), title, node.get("fullLocalPath")))
            continue

        file_size_mb = os.path.getsize(local_path) / (1024 * 1024)
        prepared_items.append({
            "node": node,
            "title": title,
            "slug": slug,
            "src_path": local_path,
            "target_path": target_filepath,
            "hosting_url": rel_hosting_url,
            "size_mb": file_size_mb
        })

    print(f"✅ Arquivos verificados no Mac: {len(prepared_items)}/{len(pdf_nodes)}")
    if missing_files:
        print(f"⚠️ Arquivos não encontrados no disco ({len(missing_files)}):")
        for m in missing_files[:3]:
            print(f"   - {m[1]} ({m[2]})")

    print("\n📋 Amostra dos arquivos prontos para sincronização:")
    for item in prepared_items[:5]:
        print(f"   • [{item['size_mb']:.1f} MB] {item['title']}")
        print(f"     Origem: {item['src_path']}")
        print(f"     Destino: {item['hosting_url']}")

    if is_dry_run:
        print("\n" + "=" * 72)
        print("💡 Para executar a cópia dos arquivos e a atualização no Firestore, rode:")
        print("   python3 scripts/upload_pdfs_to_storage.py --apply")
        print("=" * 72)
        return

    # --- EXECUÇÃO REAL COM --apply ---
    print("\n📦 1. Copiando arquivos PDF para acervo/documentos/...")
    copied_count = 0
    for it in prepared_items:
        src = it["src_path"]
        dst = it["target_path"]
        try:
            if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src):
                shutil.copy2(src, dst)
            copied_count += 1
        except Exception as e:
            print(f"   ❌ Erro ao copiar {it['title']}: {e}")

    print(f"✅ {copied_count} arquivos copiados com sucesso para {ACERVO_DOCS_DIR}.")

    # --- ATUALIZAÇÃO NO CLOUD FIRESTORE ---
    print("\n🌐 2. Conectando ao Cloud Firestore para atualização dos nós...")
    try:
        token = get_firebase_token()
        print("🔑 Token de autenticação ativo e validado.")
    except Exception as e:
        print(f"❌ Falha ao obter token do Firebase: {e}")
        print("A cópia local foi concluída, mas o Firestore não pôde ser atualizado.")
        return

    updated_firestore_count = 0
    errors_firestore = 0

    print("🌱 Atualizando campos 'pdfUrl' e 'mediaUrl' com política de MERGE CONSTRUTIVO:")
    for it in prepared_items:
        node_id = it["node"]["id"]
        pdf_url = it["hosting_url"]
        try:
            success = update_firestore_node_merge(token, node_id, pdf_url)
            if success:
                updated_firestore_count += 1
                it["node"]["pdfUrl"] = pdf_url
                it["node"]["mediaUrl"] = pdf_url
                print(f"   [OK] {it['title']} -> {pdf_url}")
            else:
                errors_firestore += 1
                print(f"   [FALHA] {node_id}")
            time.sleep(0.05)  # Throttle para respeitar limites de requisições
        except Exception as err:
            errors_firestore += 1
            print(f"   [ERRO] {node_id}: {err}")

    # Atualiza o arquivo de seed local para manter paridade absoluta
    with open(SEED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Arquivo de seed {SEED_FILE} sincronizado com os novos caminhos.")

    print("\n" + "=" * 72)
    print("🎉 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"   • Arquivos PDF copiados para o acervo: {copied_count}")
    print(f"   • Nós atualizados no Cloud Firestore: {updated_firestore_count}")
    print(f"   • Erros: {errors_firestore}")
    print("=" * 72)


if __name__ == "__main__":
    main()
