"""Restaura os registros de presença de uma turma em turma_chamadas/{etapa}__{turma} (Firestore).

Uso:
  GOOGLE_APPLICATION_CREDENTIALS=/caminho/service-account.json \
  python3 scripts/restore_chamada_firestore.py records_recovered.json "Crisma Adultos__Turma 03"

Faz backup do documento atual em <chave>.backup.json e mescla só o campo `records`.
"""
import json
import sys
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore

records_path, doc_key = sys.argv[1], sys.argv[2]
with open(records_path, encoding="utf-8") as f:
    recovered = json.load(f)

firebase_admin.initialize_app(credentials.ApplicationDefault(), {"projectId": "catequese-icm"})
ref = firestore.client().collection("turma_chamadas").document(doc_key)

snap = ref.get()
if not snap.exists:
    sys.exit(f"Documento {doc_key} não existe; abortando.")

current = snap.to_dict()
backup_path = f"{doc_key.replace(' ', '_')}.backup.json"
with open(backup_path, "w", encoding="utf-8") as f:
    json.dump(current, f, ensure_ascii=False, indent=1, default=str)

merged = dict(current.get("records") or {})
for date, alunos in recovered.items():
    merged.setdefault(date, {}).update(alunos)

ref.set({"records": merged, "updatedAt": datetime.now(timezone.utc).isoformat()}, merge=True)
print(f"Backup em {backup_path}; datas restauradas: {sorted(recovered)}")
