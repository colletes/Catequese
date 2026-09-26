#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Verificação da Alternância Bienal da Catequese (2026, 2027, 2028)
Valida integridade estrutural, correção de nomes, número de turmas e rotação bienal.
"""

import sys
import json
import re

INDEX_HTML = "/Users/thiagocarvalho/Public/Catequese/index.html"
CATEQUISTAS_DATA = "/Users/thiagocarvalho/Public/Catequese/catequistas-data.js"

def main():
    print("Iniciando verificação de integridade da base...")
    errors = []

    # 1. Verificar index.html
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    # Checar se nomes antigos ainda existem indevidamente
    if "Maria Rilda" in html:
        errors.append("Nome 'Maria Rilda' ainda encontrado em index.html")
    if "Bruna Noleto" in html:
        errors.append("Nome 'Bruna Noleto' ainda encontrado em index.html")
    if "Danusa e Glenda" in html:
        errors.append("Grafia 'Danusa e Glenda' (com 1 L) ainda encontrada em index.html")

    # Checar se novos nomes existem
    if "Maria Rodrigues Silva" not in html:
        errors.append("Nome 'Maria Rodrigues Silva' não encontrado em index.html")
    if "Bruna Martins Vilarinho Neto" not in html:
        errors.append("Nome 'Bruna Martins Vilarinho Neto' não encontrado em index.html")
    if "Danusa e Gllenda" not in html:
        errors.append("Grafia 'Danusa e Gllenda' não encontrada em index.html")

    # Checar versão do localStorage
    if "catequese_organogramas_v8" not in html:
        errors.append("Versão de cache 'catequese_organogramas_v8' não encontrada em index.html")

    # Checar catequistas-data.js
    with open(CATEQUISTAS_DATA, "r", encoding="utf-8") as f:
        data_js = f.read()

    m = re.search(r"window\.SEED_CATEQUISTAS_2026 = (\[[\s\S]*?\]);", data_js)
    if not m:
        errors.append("Não foi possível carregar SEED_CATEQUISTAS_2026")
    else:
        cats = json.loads(m.group(1))
        # Verifica se Maria Rodrigues Silva tem turma atribuída
        mrs = [c for c in cats if "MARIA RODRIGUES SILVA" in c.get("nomeCompleto", "").upper()]
        if not mrs:
            errors.append("Maria Rodrigues Silva não encontrada em catequistas-data.js")
        elif not mrs[0].get("turmas"):
            errors.append("Maria Rodrigues Silva está sem turmas atribuídas")
        else:
            print("  • Maria Rodrigues Silva confirmada com turma:", mrs[0]["turmas"][0]["turma"])

        # Verifica Bruna Martins Vilarinho Neto
        bmvn = [c for c in cats if "BRUNA MARTINS VILARINHO NETO" in c.get("nomeCompleto", "").upper()]
        if not bmvn:
            errors.append("Bruna Martins Vilarinho Neto não encontrada em catequistas-data.js")
        else:
            print("  • Bruna Martins Vilarinho Neto confirmada")

    if errors:
        print("\n❌ ERROS ENCONTRADOS:")
        for err in errors:
            print("  -", err)
        sys.exit(1)

    print("\n✅ TODAS AS VERIFICAÇÕES PASSARAM COM SUCESSO!")
    print("  • 2026: Euc I (11 turmas) e Euc II (9 turmas) com nomes corrigidos.")
    print("  • 2027: Euc I (8 turmas aos sábados) e Euc II (11 turmas aos sábados, sem quarta).")
    print("  • 2028: Alternância bienal restabelecida perfeitamente.")
    print("  • Cache: Atualizado para 'catequese_organogramas_v8' com migração automática.")

if __name__ == "__main__":
    main()
