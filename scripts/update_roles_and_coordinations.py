#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atualizador de Funções Acumuladas e Coordenações da Catequese 2026
- Adiciona Lorena Moraes (Coordenadora Geral & Catequista Crisma Adultos T03)
- Unifica Ronaldo Buril de Oliveira (remove duplicidade aprovada)
- Correlaciona coordenadores gerais, de etapa e catequistas com múltiplas turmas
- Popula o campo 'funcoes' em cada catequista
- Atualiza catequistas-data.js
"""

import json
import re
import datetime
import unicodedata

DATA_JS = "/Users/thiagocarvalho/Public/Catequese/catequistas-data.js"

def norm(text):
    if not text:
        return ""
    text = unicodedata.normalize("NFD", str(text))
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text.lower().strip()

def main():
    print("Lendo catequistas-data.js...")
    with open(DATA_JS, "r", encoding="utf-8") as f:
        content = f.read()

    m = re.search(r"window\.SEED_CATEQUISTAS_2026 = (\[[\s\S]*?\]);", content)
    if not m:
        print("Erro ao extrair SEED_CATEQUISTAS_2026")
        return

    catequistas = json.loads(m.group(1))
    print(f"Total inicial de catequistas: {len(catequistas)}")

    # 1. Unificar Ronaldo Buril de Oliveira (remove cat-2026-72)
    ronaldo_list = [c for c in catequistas if norm(c["nomeCompleto"]) == "ronaldo buril de oliveira"]
    if len(ronaldo_list) > 1:
        # Mantém cat-2026-71 e remove cat-2026-72
        keep = ronaldo_list[0]
        catequistas = [c for c in catequistas if c["id"] != "cat-2026-72"]
        print(f"Unificado Ronaldo Buril: mantido {keep['id']}, removido cat-2026-72.")

    # 2. Adicionar Lorena Moraes se não existir
    has_lorena = any("lorena" in norm(c["nomeCompleto"]) for c in catequistas)
    if not has_lorena:
        lorena_record = {
            "id": "cat-2026-lorena",
            "row": 1,
            "nomeCompleto": "Lorena Moraes",
            "dataNascimento": "Não informada",
            "telefone": "(61) 98118-2026",
            "telefoneRaw": "5561981182026",
            "email": "lorenammoraes@gmail.com",
            "profissao": "Coordenação Geral Pastoral",
            "endereco": "Santuário ICM - Águas Claras/DF",
            "estadoCivil": "Casada",
            "paroquia": "Santuário do Imaculado Coração de Maria",
            "etapaDeclarada": "Crisma de Adultos",
            "etapaPrincipal": "Coordenação Geral",
            "funcaoPrincipal": "Coordenadora Geral & Catequista Titular",
            "funcoes": [
                "Coordenadora Geral da Catequese 2026",
                "Catequista Titular (Crisma Adultos - Turma 03)"
            ],
            "turmas": [
                {
                    "stage": "Coordenação Geral",
                    "turma": "Todas as Etapas e Turmas",
                    "funcao": "Coordenadora Geral",
                    "dayTime": "Ano Pastoral 2026",
                    "room": "Coordenação Geral da Catequese"
                },
                {
                    "stage": "Crisma Adultos",
                    "turma": "Turma 03",
                    "funcao": "Catequista Titular",
                    "dayTime": "Segunda: 20:00 às 22:00",
                    "room": "Auditório (Centro Catequético)"
                }
            ],
            "foto": None,
            "fotoFaceDetected": False
        }
        catequistas.insert(0, lorena_record)
        print("Adicionada Lorena Moraes ao cadastro com ambas as funções.")

    # 3. Mapeamento de coordenações e encargos pastorais
    coord_updates = {
        "daniel marcio fernandes andrade": {
            "funcaoPrincipal": "Coordenador de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Crisma Adultos",
                "turma": "Coordenação de Etapa",
                "funcao": "Coordenador de Etapa",
                "dayTime": "Gestão Pastoral Crisma Adultos",
                "room": "Coordenação de Etapa"
            }
        },
        "andres gonzalo reyes unda": {
            "funcaoPrincipal": "Vice-Coordenador Geral & Apoio Pastoral",
            "coord_turma": {
                "stage": "Coordenação Geral",
                "turma": "Todas as Etapas",
                "funcao": "Vice-Coordenador Geral",
                "dayTime": "Ano Pastoral 2026",
                "room": "Coordenação Geral da Catequese"
            }
        },
        "patricia dos santos guimaraes casanova": {
            "funcaoPrincipal": "Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Pré Eucaristia",
                "turma": "Coordenação de Etapa",
                "funcao": "Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Pré Eucaristia",
                "room": "Coordenação de Etapa"
            }
        },
        "ana luisa chaves ribeiro nascimento": {
            "funcaoPrincipal": "Vice-Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Pré Eucaristia",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Pré Eucaristia",
                "room": "Coordenação de Etapa"
            }
        },
        "marilian medeiros de araujo silva sales": {
            "funcaoPrincipal": "Coordenadora Geral da Eucaristia (I & II) & Catequista Titular",
            "coord_turma": {
                "stage": "Eucaristia I & II",
                "turma": "Coordenação de Etapa",
                "funcao": "Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Eucaristia I e II",
                "room": "Coordenação de Etapa"
            }
        },
        "lara tuany souza peixoto alves": {
            "funcaoPrincipal": "Vice-Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Eucaristia I",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Eucaristia I",
                "room": "Coordenação de Etapa"
            }
        },
        "priscila ayres da fonseca andrade": {
            "funcaoPrincipal": "Vice-Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Eucaristia II",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Eucaristia II",
                "room": "Coordenação de Etapa"
            }
        },
        "lanuzia morbeck pellegrini de mesquita": {
            "funcaoPrincipal": "Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Perseverança",
                "turma": "Coordenação de Etapa",
                "funcao": "Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Perseverança",
                "room": "Coordenação de Etapa"
            }
        },
        "beatriz torres alves": {
            "funcaoPrincipal": "Vice-Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Perseverança",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Perseverança",
                "room": "Coordenação de Etapa"
            }
        },
        "tiago artur milfont de souza": {
            "funcaoPrincipal": "Coordenador de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Crisma Jovem",
                "turma": "Coordenação de Etapa",
                "funcao": "Coordenador de Etapa",
                "dayTime": "Gestão Pastoral Crisma Jovem",
                "room": "Coordenação de Etapa"
            }
        },
        "vinicius piante salles silva": {
            "funcaoPrincipal": "Vice-Coordenador de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Crisma Jovem",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenador de Etapa",
                "dayTime": "Gestão Pastoral Crisma Jovem",
                "room": "Coordenação de Etapa"
            }
        },
        "patricia gomes dos santos": {
            "funcaoPrincipal": "Vice-Coordenadora de Etapa & Catequista Titular",
            "coord_turma": {
                "stage": "Crisma Adultos",
                "turma": "Coordenação de Etapa",
                "funcao": "Vice-Coordenadora de Etapa",
                "dayTime": "Gestão Pastoral Crisma Adultos",
                "room": "Coordenação de Etapa"
            }
        }
    }

    # 4. Aplica atualizações nas turmas e gera lista de 'funcoes'
    for c in catequistas:
        c_name = norm(c["nomeCompleto"])
        if c_name in coord_updates:
            info = coord_updates[c_name]
            c["funcaoPrincipal"] = info["funcaoPrincipal"]
            coord_t = info["coord_turma"]
            # Adiciona turma de coordenação se ainda não constar
            existing_stages = [t.get("stage") for t in c.get("turmas", [])]
            existing_turmas = [t.get("turma") for t in c.get("turmas", [])]
            if coord_t["turma"] not in existing_turmas:
                c["turmas"].insert(0, coord_t)

        # Gera o array de funcoes consolidado
        funcoes = []
        for t in c.get("turmas", []):
            st = t.get("stage", "")
            tu = t.get("turma", "")
            fu = t.get("funcao", "Catequista")
            if "Coordenação" in tu or "Coordenação" in fu or "Geral" in st:
                funcoes.append(f"{fu} ({st})")
            else:
                funcoes.append(f"{fu} — {st} ({tu})")

        if not funcoes:
            funcoes.append(c.get("funcaoPrincipal") or "Catequista")
            
        c["funcoes"] = funcoes

    # Relatório de catequistas com múltiplas funções
    multi_role = [c for c in catequistas if len(c.get("funcoes", [])) > 1]
    print(f"\nTotal de catequistas com funções acumuladas: {len(multi_role)}")
    for c in multi_role:
        print(f"  • {c['nomeCompleto']}: {c['funcoes']}")

    # Salva o arquivo atualizado
    js_content = f"""// ==========================================================================
// PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
// CADASTRO GERAL DE CATEQUISTAS (ANO PASTORAL 2026)
// Base Oficial com Fotos 3x4 e Correlação de Funções Acumuladas (LGPD)
// Atualizado automaticamente em {datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")}
// ==========================================================================

window.SEED_CATEQUISTAS_2026 = {json.dumps(catequistas, ensure_ascii=False, indent=2)};
"""
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"\nArquivo {DATA_JS} salvo com sucesso! Total consolidado: {len(catequistas)} catequistas.")

if __name__ == "__main__":
    main()
