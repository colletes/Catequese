#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Construtor do Dataset Oficial de Catequistas 2026
Mescla fotos 3x4 processadas com o SEED existente e adiciona novos catequistas da planilha.
Gera o arquivo catequistas-data.js protegido por LGPD.
"""

import os
import re
import json
import datetime
import unicodedata
import openpyxl

EXCEL_PATH = "/Users/thiagocarvalho/Downloads/Cadastro Catequese 21´-09-2026.xlsx"
PHOTOS_JSON = "/Users/thiagocarvalho/Public/Catequese/scripts/catequistas_com_fotos.json"
INDEX_HTML = "/Users/thiagocarvalho/Public/Catequese/index.html"
OUTPUT_JS = "/Users/thiagocarvalho/Public/Catequese/catequistas-data.js"

def norm(text):
    if not text:
        return ""
    text = unicodedata.normalize("NFD", str(text))
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text.lower().strip()

def format_date(val):
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.strftime("%d/%m/%Y")
    val_str = str(val).strip()
    if "/" in val_str:
        return val_str
    if "-" in val_str and len(val_str) >= 10:
        parts = val_str[:10].split("-")
        if len(parts) == 3 and len(parts[0]) == 4:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
    return val_str or "Não informada"

def format_phone(val):
    if not val:
        return ("Não informado", "")
    digits = re.sub(r"\D", "", str(val).split(".")[0])
    if digits.startswith("55") and len(digits) > 11:
        raw = digits
        core = digits[2:]
    else:
        core = digits
        raw = "55" + digits if len(digits) >= 10 else digits
    if len(core) == 11:
        formatted = f"({core[:2]}) {core[2:7]}-{core[7:]}"
    elif len(core) == 10:
        formatted = f"({core[:2]}) {core[2:6]}-{core[6:]}"
    else:
        formatted = str(val)
    return (formatted, raw)

def main():
    print("Carregando SEED atual de index.html...")
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    m = re.search(r"const SEED_CATEQUISTAS_2026 = (\[[\s\S]*?\]);", html)
    if not m:
        print("Erro: SEED_CATEQUISTAS_2026 não encontrado em index.html")
        return
    seed_list = json.loads(m.group(1))
    print(f"Total existente no SEED: {len(seed_list)}")

    with open(PHOTOS_JSON, "r", encoding="utf-8") as f:
        photos = json.load(f)
    print(f"Total de fotos processadas: {len(photos)}")

    # 1. Atribui fotos aos registros existentes
    existing_matched = 0
    for c in seed_list:
        row_str = str(c.get("row"))
        matched_photo = None
        if row_str in photos:
            matched_photo = photos[row_str]
        else:
            # Fallback por nome
            c_name = norm(c["nomeCompleto"])
            for r_k, p_data in photos.items():
                if norm(p_data["nome"]) == c_name:
                    matched_photo = p_data
                    break
        
        if matched_photo:
            c["foto"] = matched_photo["dataUri"]
            c["fotoFaceDetected"] = matched_photo["faceDetected"]
            existing_matched += 1
        else:
            c["foto"] = None
            c["fotoFaceDetected"] = False

    print(f"Fotos associadas ao SEED existente: {existing_matched} de {len(seed_list)}")

    # 2. Adiciona novos catequistas da planilha (rows 78 a 99)
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active

    seen_names = {norm(c["nomeCompleto"]) for c in seed_list}
    new_catequistas = []
    current_max_id = max([int(c["id"].replace("cat-2026-", "")) for c in seed_list if c["id"].startswith("cat-2026-")])

    for r in range(78, ws.max_row + 1):
        name = ws.cell(r, 2).value
        if not name:
            continue
        clean_name = norm(name)
        if clean_name in seen_names:
            continue
        seen_names.add(clean_name)

        current_max_id += 1
        cat_id = f"cat-2026-{current_max_id}"
        
        dob = format_date(ws.cell(r, 3).value)
        phone_fmt, phone_raw = format_phone(ws.cell(r, 4).value)
        email = str(ws.cell(r, 5).value or "").strip()
        prof = str(ws.cell(r, 6).value or "Não informada").strip()
        endereco = str(ws.cell(r, 7).value or "Não informado").strip()
        estado_civil = str(ws.cell(r, 8).value or "Não informado").strip()
        paroquia = str(ws.cell(r, 9).value or "Santuário do Imaculado Coração de Maria").strip()
        etapa_declarada = str(ws.cell(r, 10).value or "Geral").strip()
        if etapa_declarada == "None" or not etapa_declarada:
            etapa_declarada = "Geral"

        # Foto
        row_str = str(r)
        matched_photo = None
        if row_str in photos:
            matched_photo = photos[row_str]
        else:
            for r_k, p_data in photos.items():
                if norm(p_data["nome"]) == clean_name:
                    matched_photo = p_data
                    break

        new_cat = {
            "id": cat_id,
            "row": r,
            "nomeCompleto": str(name).strip(),
            "dataNascimento": dob,
            "telefone": phone_fmt,
            "telefoneRaw": phone_raw,
            "email": email,
            "profissao": prof,
            "endereco": endereco,
            "estadoCivil": estado_civil,
            "paroquia": paroquia,
            "etapaDeclarada": etapa_declarada,
            "turmas": [],
            "etapaPrincipal": etapa_declarada,
            "funcaoPrincipal": "Catequista",
            "foto": matched_photo["dataUri"] if matched_photo else None,
            "fotoFaceDetected": matched_photo["faceDetected"] if matched_photo else False
        }
        new_catequistas.append(new_cat)

    print(f"Novos catequistas cadastrados adicionados: {len(new_catequistas)}")
    consolidated_list = seed_list + new_catequistas
    print(f"Total consolidado de catequistas: {len(consolidated_list)}")
    
    total_with_photos = sum(1 for c in consolidated_list if c.get("foto"))
    print(f"Total com fotos 3x4 válidas: {total_with_photos}")

    # Gera catequistas-data.js
    js_content = f"""// ==========================================================================
// PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
// CADASTRO GERAL DE CATEQUISTAS (ANO PASTORAL 2026)
// Base Oficial com Fotos 3x4 Identificadas por IA e Protegidas sob a LGPD
// Gerado automaticamente em {datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")}
// ==========================================================================

window.SEED_CATEQUISTAS_2026 = {json.dumps(consolidated_list, ensure_ascii=False, indent=2)};
"""
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Arquivo gerado com sucesso: {OUTPUT_JS} ({os.path.getsize(OUTPUT_JS)} bytes)")

if __name__ == "__main__":
    main()
