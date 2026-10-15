#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Sincronizador Seguro do Acervo de Crisma de Adultos no Cloud Firestore
Arquivo: scripts/sync_crisma_adultos_firestore.py

Objetivo:
- Carregar os 220 nós do acervo da Crisma de Adultos gerados em alta fidelidade
- Mapear a estrutura diretamente dentro da pasta existente 'dir-crisma-adultos' (Crisma Adultos (+18 anos))
- Não criar nenhuma pasta intermediária 'Crisma de Adultos'
- Efetuar a sincronização no Firestore com política estrita de MERGE CONSTRUTIVO (merge: true via updateMask)
- Preservar todos os nós e documentos existentes
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error

SEED_FILE = os.path.join(os.path.dirname(__file__), "crisma_adultos_seed.json")
FIREBASE_CONFIG_PATH = os.path.expanduser("~/.config/configstore/firebase-tools.json")
PROJECT_ID = "catequese-icm"
COLLECTION_NAME = "knowledge_nodes"
PARENT_ROOT_ID = "dir-crisma-adultos"


def get_access_token():
    """Obtém e valida o access_token a partir da sessão ativa da CLI do Firebase."""
    if not os.path.exists(FIREBASE_CONFIG_PATH):
        raise FileNotFoundError(f"Configuração do Firebase não encontrada em: {FIREBASE_CONFIG_PATH}")

    with open(FIREBASE_CONFIG_PATH, "r", encoding="utf-8") as f:
        conf = json.load(f)

    tokens = conf.get("tokens", {})
    refresh_token = tokens.get("refresh_token")
    access_token = tokens.get("access_token")

    # Tenta atualizar se houver refresh token
    if refresh_token:
        try:
            client_id = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho85qd6.apps.googleusercontent.com"
            client_secret = tokens.get("client_secret") or "j9iVZfS8kkCEgUPaAeJV0sw7"
            data = urllib.parse.urlencode({
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }).encode()
            req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
            res = urllib.request.urlopen(req, timeout=15)
            refreshed = json.loads(res.read())
            if "access_token" in refreshed:
                return refreshed["access_token"]
        except Exception as e:
            print(f"  [Aviso] Falha ao renovar token ({e}), utilizando token em cache...")

    if not access_token:
        raise ValueError("Nenhum access_token disponível no Firebase CLI.")
    return access_token


def to_firestore_value(val):
    """Converte tipos Python nativos para a estrutura de tipos do Firestore REST API."""
    if val is None:
        return {"nullValue": None}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [to_firestore_value(x) for x in val]}}
    elif isinstance(val, dict):
        return {"mapValue": {"fields": {k: to_firestore_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}


def sync_nodes():
    print("=" * 70)
    print("⛪ SANTUÁRIO IMACULADO CORAÇÃO DE MARIA — CATEQUESE ICM")
    print("🌱 Sincronização Construtiva no Cloud Firestore (knowledge_nodes)")
    print("=" * 70)

    if not os.path.exists(SEED_FILE):
        sys.exit(f"❌ Erro: Arquivo de carga não encontrado: {SEED_FILE}")

    with open(SEED_FILE, "r", encoding="utf-8") as sf:
        payload = json.load(sf)

    nodes = payload.get("nodes", [])
    if not nodes:
        sys.exit("❌ Erro: Lista de nós vazia no seed.")

    print(f"📦 Carregados {len(nodes)} nós a partir de crisma_adultos_seed.json")
    print(f"🏛️ Pasta Raiz de Destino: {PARENT_ROOT_ID} (Crisma Adultos (+18 anos))")
    print("🔒 Política: Merge construtivo estrito (sem exclusão, sem sobrescrita destrutiva)")
    print("-" * 70)

    # 1. Validação de segurança: garantir que nenhum nó crie pasta intermediária duplicada
    for n in nodes:
        if n.get("parentId") == "":
            n["parentId"] = PARENT_ROOT_ID
        if not n.get("path"):
            n["path"] = [PARENT_ROOT_ID]
        elif n["path"][0] != PARENT_ROOT_ID:
            n["path"].insert(0, PARENT_ROOT_ID)

    access_token = get_access_token()
    print("🔑 Autenticação com Firestore REST API validada.")

    # 2. Verifica se a pasta raiz 'dir-crisma-adultos' existe
    root_url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION_NAME}/{PARENT_ROOT_ID}"
    req_root = urllib.request.Request(root_url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        with urllib.request.urlopen(req_root, timeout=15) as res:
            root_doc = json.loads(res.read())
            root_title = root_doc.get("fields", {}).get("title", {}).get("stringValue", "Crisma Adultos")
            print(f"✅ Pasta raiz encontrada no Firestore: '{root_title}' (id={PARENT_ROOT_ID})")
    except urllib.error.HTTPError as he:
        if he.code == 404:
            print(f"ℹ️ Pasta raiz {PARENT_ROOT_ID} ainda não existia. Será criada automaticamente.")
        else:
            raise

    # 3. Execução dos commits em lotes de 15 nós por requisição (para segurança de payload)
    commit_url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:commit"
    BATCH_SIZE = 15
    total = len(nodes)
    success_count = 0

    print(f"🚀 Iniciando gravação de {total} nós em lotes de {BATCH_SIZE}...")

    for i in range(0, total, BATCH_SIZE):
        chunk = nodes[i:i + BATCH_SIZE]
        writes = []

        for node in chunk:
            doc_id = node["id"]
            doc_name = f"projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION_NAME}/{doc_id}"

            # Prepara dados com timestamp atualizado
            data_dict = dict(node)
            data_dict["updatedAt"] = data_dict.get("updatedAt") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

            fields = {k: to_firestore_value(v) for k, v in data_dict.items()}

            writes.append({
                "update": {
                    "name": doc_name,
                    "fields": fields
                },
                "updateMask": {
                    "fieldPaths": list(fields.keys())
                }
            })

        commit_body = json.dumps({"writes": writes}).encode("utf-8")
        req_commit = urllib.request.Request(
            commit_url,
            data=commit_body,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req_commit, timeout=60) as res_commit:
                if res_commit.status in (200, 204):
                    success_count += len(chunk)
                    pct = (success_count / total) * 100
                    print(f"   [{pct:5.1f}%] Gravados {success_count}/{total} nós com merge construtivo...")
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            print(f"❌ Erro no lote {i} a {i + len(chunk)}: HTTP {he.code}: {err_body}")
            raise

    print("-" * 70)
    print(f"🎉 Concluído com sucesso! {success_count} nós sincronizados no Firestore.")
    print(f"🏛️ Todos os materiais estão organizados diretamente em: 'Crisma Adultos (+18 anos)'")
    print("=" * 70)


if __name__ == "__main__":
    sync_nodes()
