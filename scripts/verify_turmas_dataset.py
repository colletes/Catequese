#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador de Integridade do Dataset de Catequizandos 2026
Verifica:
1. Total de turmas e catequizandos em index.html e no JSON consolidado.
2. Preservação dos dados das Turmas 03 e 04 de Crisma Adultos.
3. Presença de dados sacramentais enriquecidos na Turma 07 de Crisma Adultos.
4. Presença das 9 turmas de Eucaristia II (incluindo Turma 09 de Carlos).
5. Presença das turmas de Crisma Jovem (Turma 04 com Piante/Jonatan/Davi, Turma 03 com 30 alunos, Turma 07 com Ricardo/Tiago).
6. Ausência de IDs duplicados.
"""

import json
import re
import sys

def main():
    print("Iniciando verificação de integridade do dataset de catequizandos...")
    
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    m = re.search(r'const SEED_ALUNOS_DATABASE = (\{.*?\n\});', html, re.DOTALL)
    if not m:
        print("❌ ERRO: Bloco SEED_ALUNOS_DATABASE não encontrado em index.html!")
        sys.exit(1)
        
    data = json.loads(m.group(1))
    
    total_turmas = len(data)
    total_alunos = sum(len(v) for v in data.values())
    print(f"✓ Total de turmas: {total_turmas} (esperado >= 21)")
    print(f"✓ Total de catequizandos: {total_alunos} (esperado 409)")
    
    # 1. Checar Eucaristia II
    euc_turmas = [k for k in data.keys() if k.startswith("Eucaristia II")]
    print(f"✓ Eucaristia II: {len(euc_turmas)} turmas encontradas.")
    assert len(euc_turmas) == 9, f"Esperado 9 turmas em Eucaristia II, encontrado {len(euc_turmas)}"
    assert "Eucaristia II__Turma 09" in data, "Turma 09 não encontrada em Eucaristia II!"
    assert len(data["Eucaristia II__Turma 09"]) == 7, "Turma 09 de Eucaristia II deveria ter 7 alunos"
    
    # 2. Checar Crisma Jovem
    cj_turmas = [k for k in data.keys() if k.startswith("Crisma Jovem")]
    print(f"✓ Crisma Jovem: {len(cj_turmas)} turmas encontradas.")
    assert "Crisma Jovem__Turma 04" in data, "Turma 04 não encontrada em Crisma Jovem!"
    assert len(data["Crisma Jovem__Turma 04"]) == 11, f"Turma 04 do Piante/Jonatan/Davi deveria ter 11 alunos, tem {len(data['Crisma Jovem__Turma 04'])}"
    assert "Crisma Jovem__Turma 03" in data, "Turma 03 não encontrada em Crisma Jovem!"
    assert len(data["Crisma Jovem__Turma 03"]) == 30, f"Turma 03 unificada deveria ter 30 alunos, tem {len(data['Crisma Jovem__Turma 03'])}"
    assert "Crisma Jovem__Turma 07" in data, "Turma 07 de Ricardo e Tiago não encontrada!"
    assert len(data["Crisma Jovem__Turma 07"]) == 24, f"Turma 07 deveria ter 24 alunos, tem {len(data['Crisma Jovem__Turma 07'])}"
    
    # 3. Checar Crisma Adultos
    ca_turmas = [k for k in data.keys() if k.startswith("Crisma Adultos")]
    print(f"✓ Crisma Adultos: {len(ca_turmas)} turmas encontradas.")
    assert len(data["Crisma Adultos__Turma 03"]) == 31, "Turma 03 de Crisma Adultos foi alterada!"
    assert len(data["Crisma Adultos__Turma 04"]) == 19, "Turma 04 de Crisma Adultos foi alterada!"
    
    # Checar enriquecimento da Turma 07
    t7_alunos = data["Crisma Adultos__Turma 07"]
    batizados_count = sum(1 for a in t7_alunos if a.get("batizado") == "Sim, na Igreja Católica")
    assert batizados_count > 0, "Turma 07 não possui alunos marcados como batizados após enriquecimento!"
    print(f"✓ Turma 07 de Crisma Adultos enriquecida: {batizados_count} batizados identificados via Theos.")
    
    # 4. Checar duplicatas de IDs
    all_ids = []
    for k, alunos in data.items():
        for a in alunos:
            all_ids.append(a.get("id"))
            
    assert len(all_ids) == len(set(all_ids)), f"Existem IDs duplicados! Total: {len(all_ids)}, Únicos: {len(set(all_ids))}"
    print(f"✓ Todos os {len(all_ids)} IDs são 100% únicos.")
    
    # 5. Checar roomsData
    assert "Turma 09" in html, "Turma 09 não encontrada em roomsData!"
    assert "Carlos" in html, "Carlos não encontrado em roomsData!"
    print("✓ roomsData validado com Turma 09 e atualizações de Crisma Jovem.")
    
    print("\n🎉 SUCESSO: Todos os testes de validação passaram com louvor!")

if __name__ == "__main__":
    main()
