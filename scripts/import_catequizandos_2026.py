#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extrator Oficial de Catequizandos 2026 — Santuário ICM
Processa os 7 PDFs de Eucaristia II, Crisma Jovem e Crisma Adultos,
executa merge construtivo com a base preexistente e atualiza o SEED_ALUNOS_DATABASE.
"""

import fitz
import re
import json
import os
import unicodedata

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def normalize_name(name):
    words = clean_text(name).split()
    lower_words = {'de', 'da', 'do', 'das', 'dos', 'e'}
    res = []
    for i, w in enumerate(words):
        wl = w.lower()
        if i > 0 and wl in lower_words:
            res.append(wl)
        else:
            res.append(w.capitalize())
    return " ".join(res)

def parse_eucaristia_ii(pdf_path):
    doc = fitz.open(pdf_path)
    turmas = {}
    for p_idx, page in enumerate(doc):
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        turma_indices = []
        for idx, l in enumerate(lines):
            m = re.match(r'^TURMA\s+(\d+)', l, re.IGNORECASE)
            if m:
                turma_indices.append((idx, int(m.group(1))))
                
        for t_i, (start_idx, turma_num) in enumerate(turma_indices):
            end_idx = turma_indices[t_i+1][0] if t_i+1 < len(turma_indices) else len(lines)
            sub_lines = lines[start_idx:end_idx]
            
            alunos = []
            for sl in sub_lines:
                m_a = re.match(r'^(\d+)\.\s*(.*)', sl)
                if m_a:
                    nome = clean_text(m_a.group(2))
                    if nome and not re.match(r'^(CATEQUIZANDO|ASSINATURA|\d+)$', nome, re.IGNORECASE):
                        alunos.append(normalize_name(nome))
                        
            turma_key = f"Turma {turma_num:02d}"
            turmas[turma_key] = alunos
            
    return turmas

def parse_crisma_jovem(pdf_path):
    doc = fitz.open(pdf_path)
    
    def parse_tokens(token_list):
        res = []
        for t in token_list:
            for sub in t.split():
                res.append(sub.strip().lower())
        return res

    pages_data = []
    for p_idx, page in enumerate(doc):
        lines = [l.strip() for l in page.get_text().split('\n') if l.strip()]
        start_i = 0
        for i, l in enumerate(lines[:12]):
            if 'Batismo' in l:
                start_i = i + 1
                break
        student_lines = lines[start_i:]
        
        students = []
        cur_name = None
        cur_tokens = []
        for l in student_lines:
            is_token = re.match(r'^(ok|não|nao)$', l, re.IGNORECASE) or all(w.lower() in ['ok', 'não', 'nao'] for w in l.split())
            if not is_token:
                if cur_name:
                    students.append((clean_text(cur_name), parse_tokens(cur_tokens)))
                cur_name = l
                cur_tokens = []
            else:
                cur_tokens.append(l)
        if cur_name:
            students.append((clean_text(cur_name), parse_tokens(cur_tokens)))
            
        cleaned_students = []
        for raw_name, toks in students:
            c_name = re.sub(r'^\d+[\.\-\s]+', '', raw_name).strip()
            cleaned_students.append((normalize_name(c_name), toks))
            
        pages_data.append(cleaned_students)
        
    return pages_data

def parse_adultos_file(pdf_path):
    doc = fitz.open(pdf_path)
    students = []
    
    for p_idx in range(len(doc)):
        page = doc[p_idx]
        words = page.get_text('words')
        min_y = 80 if p_idx == 0 else 15
        
        lines = {}
        for w in words:
            if w[1] < min_y:
                continue
            y_k = round(w[1] / 5.0) * 5
            lines.setdefault(y_k, []).append(w)
            
        pending_name = []
        for y_k in sorted(lines.keys()):
            row = sorted(lines[y_k], key=lambda x: x[0])
            row_txt = ' '.join(w[4] for w in row).lower()
            if any(k in row_txt for k in ['theos', 'comunhão', 'matrimonio', 'etapa:', 'turma', 'catequistas:']):
                continue
                
            name_words = []
            val_words = []
            for w in row:
                txt = w[4].strip()
                if txt.lower() in ['ok', 'não', 'nao', '.']:
                    val_words.append(txt.lower())
                else:
                    name_words.append(txt)
                    
            if name_words and not val_words:
                pending_name.extend(name_words)
            elif name_words and val_words:
                full_name = ' '.join(pending_name + name_words).strip()
                pending_name = []
                students.append((normalize_name(full_name), val_words))
            elif not name_words and val_words:
                if pending_name:
                    full_name = ' '.join(pending_name).strip()
                    pending_name = []
                    students.append((normalize_name(full_name), val_words))
                else:
                    if students:
                        last_name, last_vals = students[-1]
                        students[-1] = (last_name, last_vals + val_words)
                        
    return students

def build_student_object(uid, nome, batizado_ok=None, eucaristia_ok=None, rg_ok=None, theos_cad_ok=None, theos_docs_ok=None, extra_obs=""):
    bat_str = "Sim, na Igreja Católica" if batizado_ok is True else ("Não" if batizado_ok is False else "")
    euc_str = "Sim" if eucaristia_ok is True else ("Não" if eucaristia_ok is False else "")
    
    comprovante_bat = "OK" if batizado_ok is True else ("Pendente" if batizado_ok is False else "")
    comprovante_euc = "OK" if eucaristia_ok is True else ("Pendente" if eucaristia_ok is False else "")
    doc_id = "OK" if rg_ok is True else ("Pendente" if rg_ok is False else "")
    
    obs_parts = []
    if theos_cad_ok is not None:
        obs_parts.append(f"Theos Cadastro: {'OK' if theos_cad_ok else 'Não'}")
    if theos_docs_ok is not None:
        obs_parts.append(f"Docs: {'OK' if theos_docs_ok else 'Não'}")
    if extra_obs:
        obs_parts.append(extra_obs)
        
    obs = " | ".join(obs_parts)
    
    return {
        "id": uid,
        "nome": nome,
        "cpf": "",
        "dataNascimento": "",
        "contato": "",
        "email": "",
        "endereco": "",
        "estadoCivil": "Solteiro(a)",
        "batizado": bat_str,
        "primeiraEucaristia": euc_str,
        "comprovanteBatismo": comprovante_bat,
        "comprovanteEucaristia": comprovante_euc,
        "comprovanteMatrimonio": "",
        "docIdentificacao": doc_id,
        "comprovantePagamento": "",
        "observacoes": obs,
        "impedido": "Não",
        "justificativa": "",
        "statusAprovacao": "aprovado"
    }

def main():
    downloads = "/Users/thiagocarvalho/Downloads"
    
    # 1. EUCARISTIA II
    euc_file = os.path.join(downloads, "LISTA GERAL - ENCONTRINHO EUC II.pdf")
    euc_turmas = parse_eucaristia_ii(euc_file)
    print(f"Eucaristia II processada: {len(euc_turmas)} turmas encontradas.")
    
    dataset_euc = {}
    for t_key, nomes in euc_turmas.items():
        alunos_objs = []
        t_num = t_key.replace("Turma ", "")
        for idx, nome in enumerate(nomes):
            uid = f"euc2-t{int(t_num)}-{idx+1}"
            alunos_objs.append(build_student_object(uid, nome))
        dataset_euc[f"Eucaristia II__{t_key}"] = alunos_objs
        print(f"  {t_key}: {len(alunos_objs)} alunos")

    # 2. CRISMA JOVEM
    cj_file = os.path.join(downloads, "Turmas da Crisma Jovem.pdf")
    cj_pages = parse_crisma_jovem(cj_file)
    print(f"\nCrisma Jovem processada: {len(cj_pages)} páginas.")
    
    # Mapeamento oficial confirmado com a coordenação:
    # Page 0 (Pág 1): Turma 01 (Giovanna e Heloisa)
    # Page 1 (Pág 2): Turma 02 (Artur)
    # Page 2 (Pág 3): Turma 03 (Alessandra e Mônica)
    # Page 3 (Pág 4): Turma 04 (Piante, Jonatan e Davi) -> Confirmado como Turma 04 pela coordenação
    # Page 4 (Pág 5): Turma 05 (Anderson e Kéllibe)
    # Page 5 (Pág 6): Turma 03 (Amanda, Flávia e Gabriela) -> Confirmado como Turma 03 (Sábado 15h)
    cj_turmas_map = {
        0: "Turma 01",
        1: "Turma 02",
        2: "Turma 03",
        3: "Turma 04",
        4: "Turma 05",
        5: "Turma 03"
    }
    
    dataset_cj = {}
    for p_idx, students in enumerate(cj_pages):
        t_key = cj_turmas_map[p_idx]
        full_key = f"Crisma Jovem__{t_key}"
        if full_key not in dataset_cj:
            dataset_cj[full_key] = []
            
        t_num = t_key.replace("Turma ", "")
        start_idx = len(dataset_cj[full_key])
        for idx, (nome, toks) in enumerate(students):
            uid = f"cj-t{int(t_num)}-{start_idx + idx + 1}"
            # toks: [theos_cad, theos_docs, rg, comunhao, batismo]
            theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
            theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
            rg = toks[2] == 'ok' if len(toks) > 2 else None
            comunhao = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
            batismo = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
            
            obj = build_student_object(uid, nome, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs)
            dataset_cj[full_key].append(obj)
            
    # Adiciona Turma 07 de Crisma Jovem vinda de turmas adultos 2.pdf (Ricardo e Tiago)
    t2_file = os.path.join(downloads, "turmas adultos 2.pdf")
    t2_students = parse_adultos_file(t2_file)
    print(f"\nTurmas Adultos 2 (Ricardo e Tiago -> Crisma Jovem Turma 07): {len(t2_students)} alunos.")
    dataset_cj["Crisma Jovem__Turma 07"] = []
    for idx, (nome, toks) in enumerate(t2_students):
        uid = f"cj-t7-{idx+1}"
        theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
        theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
        rg = toks[2] == 'ok' if len(toks) > 2 else None
        batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
        comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
        residencia = toks[5] if len(toks) > 5 else ''
        matrimonio = toks[6] if len(toks) > 6 else ''
        extra = []
        if residencia and residencia != '.':
            extra.append(f"Residência: {residencia}")
        if matrimonio and matrimonio != '.':
            extra.append(f"Matrimônio: {matrimonio}")
        extra_str = " | ".join(extra)
        
        obj = build_student_object(uid, nome, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs, extra_obs=extra_str)
        dataset_cj["Crisma Jovem__Turma 07"].append(obj)

    for k, v in dataset_cj.items():
        print(f"  {k}: {len(v)} alunos")

    # 3. CRISMA DE ADULTOS
    t1_file = os.path.join(downloads, "turmas adultos 1.pdf")
    t1_students = parse_adultos_file(t1_file)
    print(f"\nTurmas Adultos 1 (Letícia -> Turma 01): {len(t1_students)} alunos.")
    
    t4_file = os.path.join(downloads, "turmas adultos 4.pdf")
    t4_students = parse_adultos_file(t4_file)
    print(f"Turmas Adultos 4 (Daniel e Alexandre -> Turma 05): {len(t4_students)} alunos.")
    
    t5_file = os.path.join(downloads, "turmas adultos 5.pdf")
    t5_students = parse_adultos_file(t5_file)
    print(f"Turmas Adultos 5 (Guilherme -> Turma 06): {len(t5_students)} alunos.")
    
    t3_file = os.path.join(downloads, "turmas adultos 3.pdf")
    t3_students = parse_adultos_file(t3_file)
    print(f"Turmas Adultos 3 (Thiago e Thais -> Turma 07): {len(t3_students)} alunos.")
    
    dataset_ca = {}
    
    # T01
    dataset_ca["Crisma Adultos__Turma 01"] = []
    for idx, (nome, toks) in enumerate(t1_students):
        uid = f"ca-t1-{idx+1}"
        theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
        theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
        rg = toks[2] == 'ok' if len(toks) > 2 else None
        batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
        comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
        residencia = toks[5] if len(toks) > 5 else ''
        matrimonio = toks[6] if len(toks) > 6 else ''
        extra = []
        if residencia and residencia != '.':
            extra.append(f"Residência: {residencia}")
        if matrimonio and matrimonio != '.':
            extra.append(f"Matrimônio: {matrimonio}")
        extra_str = " | ".join(extra)
        dataset_ca["Crisma Adultos__Turma 01"].append(
            build_student_object(uid, nome, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs, extra_obs=extra_str)
        )
        
    # T05
    dataset_ca["Crisma Adultos__Turma 05"] = []
    for idx, (nome, toks) in enumerate(t4_students):
        uid = f"ca-t5-{idx+1}"
        theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
        theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
        rg = toks[2] == 'ok' if len(toks) > 2 else None
        batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
        comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
        residencia = toks[5] if len(toks) > 5 else ''
        matrimonio = toks[6] if len(toks) > 6 else ''
        extra = []
        if residencia and residencia != '.':
            extra.append(f"Residência: {residencia}")
        if matrimonio and matrimonio != '.':
            extra.append(f"Matrimônio: {matrimonio}")
        extra_str = " | ".join(extra)
        dataset_ca["Crisma Adultos__Turma 05"].append(
            build_student_object(uid, nome, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs, extra_obs=extra_str)
        )
        
    # T06
    dataset_ca["Crisma Adultos__Turma 06"] = []
    for idx, (nome, toks) in enumerate(t5_students):
        uid = f"ca-t6-{idx+1}"
        theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
        theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
        rg = toks[2] == 'ok' if len(toks) > 2 else None
        batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
        comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
        residencia = toks[5] if len(toks) > 5 else ''
        matrimonio = toks[6] if len(toks) > 6 else ''
        extra = []
        if residencia and residencia != '.':
            extra.append(f"Residência: {residencia}")
        if matrimonio and matrimonio != '.':
            extra.append(f"Matrimônio: {matrimonio}")
        extra_str = " | ".join(extra)
        dataset_ca["Crisma Adultos__Turma 06"].append(
            build_student_object(uid, nome, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs, extra_obs=extra_str)
        )

    # 4. CARREGA BANCO ATUAL E REALIZA MERGE CONSTRUTIVO
    with open("index.html", "r", encoding="utf-8") as f:
        html_lines = f.readlines()

    start_i = None
    end_i = None
    for i, l in enumerate(html_lines):
        if 'const SEED_ALUNOS_DATABASE = {' in l:
            start_i = i
        if start_i is not None and i > start_i and l.strip() == '};':
            end_i = i
            break
            
    if start_i is None or end_i is None:
        raise ValueError("Não foi possível localizar o bloco SEED_ALUNOS_DATABASE em index.html")

    raw_seed_js = "".join(html_lines[start_i:end_i+1])
    raw_seed_json = raw_seed_js.split("=", 1)[1].strip().rstrip(";")
    current_db = json.loads(raw_seed_json)
    print(f"\nBanco existente lido com sucesso ({len(current_db)} turmas preexistentes).")

    # Merge construtivo
    merged_db = {}
    for k, v in current_db.items():
        merged_db[k] = v

    # Enriquece Turma 07 de Crisma Adultos com t3_students
    existing_t7 = merged_db.get("Crisma Adultos__Turma 07", [])
    t3_by_norm_name = {}
    for nome, toks in t3_students:
        norm_k = unicodedata.normalize('NFKD', nome.lower()).encode('ASCII', 'ignore').decode('utf-8')
        t3_by_norm_name[norm_k] = (nome, toks)
        
    enriched_t7 = []
    matched_names = set()
    for existing_s in existing_t7:
        s_copy = dict(existing_s)
        norm_s = unicodedata.normalize('NFKD', s_copy.get('nome', '').lower()).encode('ASCII', 'ignore').decode('utf-8')
        
        best_match = None
        for cand_norm, (c_orig, toks) in t3_by_norm_name.items():
            if cand_norm in norm_s or norm_s in cand_norm:
                best_match = (cand_norm, toks)
                break
                
        if best_match:
            cand_norm, toks = best_match
            matched_names.add(cand_norm)
            theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
            theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
            rg = toks[2] == 'ok' if len(toks) > 2 else None
            batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
            comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
            residencia = toks[5] if len(toks) > 5 else ''
            matrimonio = toks[6] if len(toks) > 6 else ''
            
            if batismo is not None:
                s_copy["batizado"] = "Sim, na Igreja Católica" if batismo else "Não"
                s_copy["comprovanteBatismo"] = "OK" if batismo else "Pendente"
            if comunhao is not None:
                s_copy["primeiraEucaristia"] = "Sim" if comunhao else "Não"
                s_copy["comprovanteEucaristia"] = "OK" if comunhao else "Pendente"
            if rg is not None:
                s_copy["docIdentificacao"] = "OK" if rg else "Pendente"
                
            obs_parts = [s_copy.get("observacoes", "")] if s_copy.get("observacoes") else []
            if theos_cad is not None:
                obs_parts.append(f"Theos Cadastro: {'OK' if theos_cad else 'Não'}")
            if theos_docs is not None:
                obs_parts.append(f"Docs: {'OK' if theos_docs else 'Não'}")
            if residencia and residencia != '.':
                obs_parts.append(f"Residência: {residencia}")
            if matrimonio and matrimonio != '.':
                obs_parts.append(f"Matrimônio: {matrimonio}")
            s_copy["observacoes"] = " | ".join(obs_parts)
            
        enriched_t7.append(s_copy)
        
    for cand_norm, (c_orig, toks) in t3_by_norm_name.items():
        if cand_norm not in matched_names:
            uid = f"ca-t7-{len(enriched_t7)+1}"
            theos_cad = toks[0] == 'ok' if len(toks) > 0 else None
            theos_docs = toks[1] == 'ok' if len(toks) > 1 else None
            rg = toks[2] == 'ok' if len(toks) > 2 else None
            batismo = toks[3] == 'ok' if len(toks) > 3 else (False if len(toks) > 3 and toks[3] in ['não', 'nao'] else None)
            comunhao = toks[4] == 'ok' if len(toks) > 4 else (False if len(toks) > 4 and toks[4] in ['não', 'nao'] else None)
            residencia = toks[5] if len(toks) > 5 else ''
            matrimonio = toks[6] if len(toks) > 6 else ''
            extra = []
            if residencia and residencia != '.':
                extra.append(f"Residência: {residencia}")
            if matrimonio and matrimonio != '.':
                extra.append(f"Matrimônio: {matrimonio}")
            extra_str = " | ".join(extra)
            enriched_t7.append(build_student_object(uid, c_orig, batizado_ok=batismo, eucaristia_ok=comunhao, rg_ok=rg, theos_cad_ok=theos_cad, theos_docs_ok=theos_docs, extra_obs=extra_str))

    merged_db["Crisma Adultos__Turma 07"] = enriched_t7

    # Adiciona novas turmas de Crisma Adultos
    for k, v in dataset_ca.items():
        merged_db[k] = v
        
    # Adiciona Crisma Jovem
    for k, v in dataset_cj.items():
        merged_db[k] = v
        
    # Adiciona Eucaristia II
    for k, v in dataset_euc.items():
        merged_db[k] = v

    total_alunos = sum(len(v) for v in merged_db.values())
    print("\n================ RESUMO FINAL ================")
    print(f"Total de turmas cadastradas: {len(merged_db)}")
    print(f"Total de catequizandos consolidados: {total_alunos}")
    for k in sorted(merged_db.keys()):
        print(f"  - {k}: {len(merged_db[k])} alunos")

    out_json = "scripts/catequizandos_database_consolidado.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(merged_db, f, indent=2, ensure_ascii=False)
    print(f"\nBase consolidada salva em: {out_json}")

if __name__ == "__main__":
    main()
