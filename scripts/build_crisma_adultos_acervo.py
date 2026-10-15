#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Extrator e Construtor do Acervo de Crisma de Adultos (Alta Fidelidade)
Arquivo: scripts/build_crisma_adultos_acervo.py

Recursos de Alta Fidelidade:
- Detecção inteligente de títulos e subtítulos (font size, caixa alta, negrito, numeração)
- Blocos de callout litúrgicos e didáticos (Bíblia 📖, Catecismo ⛪, Ação do Catequista 🎯)
- Preservação de cores de texto, destaques/marca-texto, sublinhado e tabelas
- Extração de imagens embutidas nos documentos Word (convertidas em data URLs)
- Extração estruturada de blocos de texto em PDFs com PyMuPDF
- Extração de slides estruturados com notas do catequista em PPTX
- Geração de relatório detalhado em Markdown para conferência segura
"""

import os
import sys
import json
import re
import base64
import unicodedata
from datetime import datetime, timezone

# Dependências de extração
try:
    import docx
    from docx.shared import Pt, RGBColor
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

try:
    import pptx
    HAS_PPTX = True
except ImportError:
    HAS_PPTX = False

# Constantes de Caminho e Identificadores
DEFAULT_SOURCE_PATH = "/Users/thiagocarvalho/Public/Crisma de Adultos"
FALLBACK_ONEDRIVE_PATH = os.path.expanduser(
    "~/Library/CloudStorage/OneDrive-Pessoal/Catequese 1/Importação Site/Crisma de Adultos"
)
PARENT_ROOT_ID = "dir-crisma-adultos"
ETAPA_NAME = "Crisma Adultos"


def slugify(text):
    """Gera slugs normalizados para IDs determinísticos e seguros."""
    text = unicodedata.normalize('NFKD', str(text or ''))
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text) or 'item'


# Padrões comuns de seções e liturgia na Catequese
KNOWN_SECTION_HEADERS = {
    'MATERIAIS NECESSÁRIOS', 'MATERIAIS NECESSARIOS', 'MATERIAL NECESSÁRIO',
    'REFERÊNCIAS BIBLIOGRÁFICAS', 'REFERENCIAS BIBLIOGRAFICAS', 'REFERÊNCIAS',
    'OBJETIVO', 'OBJETIVOS', 'ACOLHIDA', 'ACOLHIMENTO',
    'ORAÇÃO INICIAL', 'ORACAO INICIAL', 'ORAÇÃO', 'ORACAO',
    'DINÂMICA', 'DINAMICA', 'DESENVOLVIMENTO', 'CONTEÚDO',
    'PALAVRA DE DEUS', 'LEITURA BÍBLICA', 'ILUMINAÇÃO BÍBLICA',
    'COMPROMISSO', 'AVALIAÇÃO', 'AVALIAÇAO', 'AVISOS',
    'ORAÇÃO FINAL', 'ORACAO FINAL', 'CÂNTICO'
}


def is_heading_candidate(p, text):
    """Identifica se um parágrafo do Word é estruturalmente um título/cabeçalho."""
    clean_text = text.strip()
    if not clean_text:
        return False, 0

    style_name = (p.style.name or '').lower()
    if 'heading 1' in style_name or 'título 1' in style_name:
        return True, 1
    if 'heading 2' in style_name or 'título 2' in style_name:
        return True, 2
    if 'heading 3' in style_name or 'título 3' in style_name:
        return True, 3

    # Verifica se os caracteres alfabéticos estão em caixa alta
    letters = [c for c in clean_text if c.isalpha()]
    is_uppercase = len(letters) >= 3 and all(c.isupper() for c in letters)
    stripped_upper = clean_text.rstrip(':').strip().upper()

    if stripped_upper in KNOWN_SECTION_HEADERS:
        return True, 2

    # Verifica se tem tamanho de fonte grande nos runs
    max_font_size = 0
    all_bold = True
    has_text = False

    for run in p.runs:
        if run.text.strip():
            has_text = True
            if run.font.size and run.font.size.pt:
                max_font_size = max(max_font_size, run.font.size.pt)
            if not run.bold:
                all_bold = False

    if not has_text:
        return False, 0

    if max_font_size >= 16:
        return True, 1
    if max_font_size >= 13:
        return True, 2
    if max_font_size >= 12 and all_bold:
        return True, 3

    # Se for todo em maiúsculas, curto e negrito
    if is_uppercase and len(clean_text) <= 90:
        return True, 2

    # Se começa com numeração de tópicos em negrito (ex: "1. Acolhida e diagnóstico (10 min)")
    num_match = re.match(r'^(\d+|[IVXLCDM]+)[\.\-\)]\s+(.*)', clean_text)
    if num_match and (all_bold or len(clean_text) <= 80):
        return True, 2

    return False, 0


def format_callout_content(text):
    """Detecta citações bíblicas, do Catecismo ou ações e formata em callout estilizado."""
    clean = text.strip()

    # 1. Catecismo da Igreja Católica (CIC)
    cic_match = re.search(r'\b(CIC|Catecismo)[\s\-\:\.\–\—]+(§+|artigos?|nº?|parágrafos?)?\s*([0-9\s\–\—a-z]+)', clean, re.IGNORECASE)
    if cic_match or clean.startswith('CIC -') or clean.startswith('CIC:'):
        return (
            '<div class="wiki-callout wiki-callout-catechism">\n'
            '  <div class="wiki-callout-title">⛪ Catecismo da Igreja Católica</div>\n'
            f'  <p>{clean}</p>\n'
            '</div>'
        )

    # 2. Ação do Catequista / Dinâmica
    if re.match(r'^(Ação|Atenção|Aviso|Dica|Dinâmica|Instrução|Passo a Passo)[\s\:]', clean, re.IGNORECASE):
        return (
            '<div class="wiki-callout wiki-callout-action">\n'
            '  <div class="wiki-callout-title">🎯 Ação do Catequista</div>\n'
            f'  <p>{clean}</p>\n'
            '</div>'
        )

    # 3. Citação Bíblica (ex: Jo 3, 16 / Mt 5, 1-12 / Sl 23)
    biblical_books = r'(Gn|Ex|Lv|Nm|Dt|Js|Jz|Rt|1Sm|2Sm|1Rs|2Rs|1Cr|2Cr|Esd|Ne|Tb|Jt|Est|1Mc|2Mc|Jó|Sl|Pr|Ecl|Ct|Sab|Eclo|Is|Jr|Lm|Br|Ez|Dn|Os|Jl|Am|Ab|Jn|Mq|Na|Hab|Sf|Ag|Zc|Ml|Mt|Mc|Lc|Jo|At|Rm|1Cor|2Cor|Gl|Ef|Fl|Cl|1Ts|2Ts|1Tm|2Tm|Tt|Fm|Hb|Tg|1Pd|2Pd|1Jo|2Jo|3Jo|Jd|Ap)'
    if re.search(rf'\b{biblical_books}\s+[0-9]+[\,\:][0-9\-]+', clean, re.IGNORECASE) or (clean.startswith('“') and clean.endswith('”') and len(clean) > 30):
        return (
            '<div class="wiki-callout wiki-callout-bible">\n'
            '  <div class="wiki-callout-title">📖 Palavra de Deus</div>\n'
            f'  <p>{clean}</p>\n'
            '</div>'
        )

    return None


def convert_docx_to_markdown(file_path):
    """Converte arquivo DOCX em Markdown limpo, semântico e com alta fidelidade visual."""
    if not HAS_DOCX or not os.path.exists(file_path):
        return None, 0
    try:
        doc = docx.Document(file_path)
        md_lines = []
        extracted_images = 0

        # 1. Extração de Imagens Embutidas
        images_html = []
        try:
            for rel in doc.part.rels.values():
                if 'image' in rel.target_ref:
                    target = rel.target_part
                    blob = target.blob
                    # Limite de segurança de 3 MB por imagem
                    if len(blob) <= 3 * 1024 * 1024:
                        content_type = target.content_type or 'image/jpeg'
                        b64 = base64.b64encode(blob).decode('ascii')
                        images_html.append(
                            f'<div class="my-4 text-center">'
                            f'<img src="data:{content_type};base64,{b64}" alt="Ilustração do Encontro" class="rounded-2xl shadow-md mx-auto max-h-96 border border-slate-200" />'
                            f'</div>'
                        )
                        extracted_images += 1
        except Exception as img_err:
            print(f"  [Aviso] Falha ao extrair imagens de {os.path.basename(file_path)}: {img_err}")

        # Se houver imagens de capa/topo, insere a primeira
        if images_html:
            md_lines.append(images_html[0])

        # 2. Processa Parágrafos
        for p in doc.paragraphs:
            raw_text = p.text.strip()
            if not raw_text:
                continue

            style_name = (p.style.name or '').lower()

            # Identifica se é cabeçalho
            is_head, head_level = is_heading_candidate(p, raw_text)

            if is_head:
                prefix = '#' * head_level
                clean_heading = raw_text.rstrip(':')
                md_lines.append(f"\n{prefix} {clean_heading}\n")
                continue

            # Identifica se deve virar Callout litúrgico ou instrução prática
            callout = format_callout_content(raw_text)
            if callout:
                md_lines.append(f"\n{callout}\n")
                continue

            # Se for lista
            if 'list' in style_name or 'bullet' in style_name or raw_text.startswith(('• ', '- ', '* ')):
                cleaned_item = re.sub(r'^[•\-\*]\s*', '', raw_text)
                md_lines.append(f"- {cleaned_item}")
                continue

            # Formata runs com negrito, itálico, sublinhado e cores
            runs_formatted = []
            for run in p.runs:
                r_text = run.text
                if not r_text:
                    continue

                # Preserva espaços em branco externos antes da formatação
                leading_spaces = len(r_text) - len(r_text.lstrip(' '))
                trailing_spaces = len(r_text) - len(r_text.rstrip(' '))
                core = r_text.strip(' ')

                if not core:
                    runs_formatted.append(r_text)
                    continue

                # Formatações inline
                if run.bold and run.italic:
                    core = f"***{core}***"
                elif run.bold:
                    core = f"**{core}**"
                elif run.italic:
                    core = f"*{core}*"

                if run.underline:
                    core = f"<u>{core}</u>"

                # Preserva cor de texto se for diferente de preto/automático
                try:
                    if run.font.color and run.font.color.rgb:
                        rgb = str(run.font.color.rgb)
                        if rgb not in ('000000', 'None'):
                            core = f'<span style="color: #{rgb};">{core}</span>'
                except Exception:
                    pass

                # Preserva marca-texto (highlight)
                try:
                    if run.font.highlight_color:
                        core = f'<mark class="bg-amber-100 text-amber-900 px-1 rounded">{core}</mark>'
                except Exception:
                    pass

                runs_formatted.append((' ' * leading_spaces) + core + (' ' * trailing_spaces))

            formatted_p = "".join(runs_formatted).strip()
            if formatted_p:
                md_lines.append(formatted_p)

        # 3. Insere imagens secundárias no meio/fim do conteúdo
        if len(images_html) > 1:
            for extra_img in images_html[1:]:
                md_lines.append(extra_img)

        # 4. Trata Tabelas com Alta Fidelidade
        for table in doc.tables:
            table_rows = []
            for row_idx, row in enumerate(table.rows):
                row_cells = [c.text.strip().replace('\n', '<br>') for c in row.cells]
                table_rows.append("| " + " | ".join(row_cells) + " |")
                if row_idx == 0:
                    table_rows.append("| " + " | ".join(["---"] * len(row_cells)) + " |")
            if table_rows:
                md_lines.append("\n" + "\n".join(table_rows) + "\n")

        content = "\n\n".join(md_lines).strip()

        # Limite de segurança de tamanho para o documento Firestore (máx 600 KB)
        if len(content.encode('utf-8')) > 650000:
            content = content[:550000] + "\n\n*(Documento longo truncado para preservação dos limites do banco. Consulte o arquivo anexo original).* "

        return content, extracted_images
    except Exception as e:
        return f"# Erro na conversão do DOCX\n\nNão foi possível ler o arquivo: {str(e)}", 0


def convert_pdf_to_markdown(file_path, max_pages=35):
    """Extrai texto estruturado em blocos e parágrafos de PDF com PyMuPDF."""
    if not HAS_FITZ or not os.path.exists(file_path):
        return None, 0
    try:
        doc = fitz.open(file_path)
        pages_text = []
        num_pages = len(doc)
        limit = min(num_pages, max_pages)

        for page_num in range(limit):
            page = doc[page_num]
            # Usa 'blocks' para agrupar visualmente parágrafos e títulos sem quebrar palavras
            blocks = page.get_text("blocks")
            page_paragraphs = []

            for b in blocks:
                # b = (x0, y0, x1, y1, text, block_no, block_type)
                # block_type 0 = texto, 1 = imagem
                if len(b) >= 5 and b[6] == 0:
                    b_text = b[4].strip()
                    if b_text:
                        # Limpa quebras de linha duras dentro do mesmo parágrafo
                        lines = [l.strip() for l in b_text.splitlines() if l.strip()]
                        clean_block = " ".join(lines)
                        page_paragraphs.append(clean_block)

            if page_paragraphs:
                joined = "\n\n".join(page_paragraphs)
                pages_text.append(f"### Página {page_num + 1}\n\n{joined}")

        doc.close()

        if num_pages > max_pages:
            pages_text.append(f"\n*(Exibindo as primeiras {max_pages} de {num_pages} páginas. Consulte o visualizador de PDF acima ou baixe o original para ler a íntegra).*")

        content = "\n\n---\n\n".join(pages_text).strip()
        if len(content.encode('utf-8')) > 650000:
            content = content[:550000] + "\n\n*(Texto truncado para limites do banco. Consulte o PDF no visualizador).* "

        return content or "*(Documento digitalizado/gráfico. Utilize o visualizador de PDF integrado acima para leitura completa).* ", num_pages
    except Exception as e:
        return f"# Erro na extração do PDF\n\n{str(e)}", 0


def convert_pptx_to_slides(file_path):
    """Extrai slides estruturados com títulos, tópicos e notas de PPTX."""
    if not HAS_PPTX or not os.path.exists(file_path):
        return None, []
    try:
        prs = pptx.Presentation(file_path)
        slides_data = []
        md_sections = []

        for idx, slide in enumerate(prs.slides, 1):
            slide_title = ""
            bullets = []
            notes = ""

            for shape in slide.shapes:
                if shape.has_text_frame:
                    paragraphs = shape.text_frame.paragraphs
                    for p in paragraphs:
                        t = p.text.strip()
                        if not t:
                            continue
                        if not slide_title and (shape.name.lower().startswith('title') or len(t) < 70):
                            slide_title = t
                        else:
                            # Divide em tópicos se houver quebras de linha
                            for line in t.splitlines():
                                line_clean = line.strip().lstrip('•-* ').strip()
                                if line_clean and line_clean != slide_title:
                                    bullets.append(line_clean)

            # Extrai notas do catequista se existirem
            try:
                if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                    n_text = slide.notes_slide.notes_text_frame.text.strip()
                    if n_text:
                        notes = n_text
            except Exception:
                pass

            if not slide_title:
                slide_title = f"Slide {idx}"

            slides_data.append({
                "slideNumber": idx,
                "title": slide_title,
                "bullets": bullets,
                "notes": notes
            })

            # Monta versão Markdown complementar
            bullets_md = "\n".join([f"- {b}" for b in bullets]) if bullets else "*(Slide visual/gráfico)*"
            notes_md = f"\n\n> 💡 **Nota do Catequista:** {notes}" if notes else ""
            md_sections.append(f"### Slide {idx}: {slide_title}\n\n{bullets_md}{notes_md}")

        content_md = "\n\n---\n\n".join(md_sections) if md_sections else "*(Apresentação de slides sem camada de texto)*"
        return content_md, slides_data
    except Exception as e:
        return f"# Erro ao ler apresentação\n\n{str(e)}", []


def build_crisma_adultos_acervo(source_path=DEFAULT_SOURCE_PATH):
    """
    Constrói a árvore completa de nós para o acervo de Crisma de Adultos
    diretamente sob dir-crisma-adultos.
    """
    source_path = os.path.abspath(os.path.expanduser(source_path))
    if not os.path.exists(source_path):
        if os.path.exists(FALLBACK_ONEDRIVE_PATH):
            source_path = FALLBACK_ONEDRIVE_PATH
        else:
            raise FileNotFoundError(f"Pasta de origem não encontrada: {source_path}")

    now_iso = datetime.now(timezone.utc).isoformat()
    nodes = []
    stats = {
        "source_path": source_path,
        "total_folders": 0,
        "total_files": 0,
        "docx_count": 0,
        "pdf_count": 0,
        "pptx_count": 0,
        "media_count": 0,
        "other_count": 0,
        "embedded_images_count": 0,
        "total_bytes": 0,
        "folders_summary": []
    }

    # Mapeamento de caminhos relativos para IDs de pastas e paths completos
    folder_id_map = {
        '': PARENT_ROOT_ID
    }
    folder_path_map = {
        '': [PARENT_ROOT_ID]
    }

    # Percorre o diretório
    for root, dirs, files in os.walk(source_path):
        dirs[:] = sorted([d for d in dirs if not d.startswith('.')])
        rel_root = os.path.relpath(root, source_path)
        if rel_root == '.':
            rel_root = ''
            current_folder_id = PARENT_ROOT_ID
            current_ancestors = [PARENT_ROOT_ID]
        else:
            current_folder_id = folder_id_map.get(rel_root, PARENT_ROOT_ID)
            current_ancestors = folder_path_map.get(rel_root, [PARENT_ROOT_ID])

        # 1. Registra subpastas imediatas
        for d in dirs:
            stats["total_folders"] += 1
            rel_dir_path = os.path.join(rel_root, d) if rel_root else d
            folder_slug = slugify(rel_dir_path)
            folder_id = f"fld-ca-{folder_slug}"
            folder_id_map[rel_dir_path] = folder_id

            ancestors = current_ancestors + [folder_id]
            folder_path_map[rel_dir_path] = ancestors

            nodes.append({
                "id": folder_id,
                "parentId": current_folder_id,
                "path": current_ancestors,
                "title": d,
                "type": "folder",
                "etapa": ETAPA_NAME,
                "relativePath": rel_dir_path,
                "description": f"Pasta de formação de Crisma de Adultos: {d}",
                "order": 10,
                "createdAt": now_iso,
                "updatedAt": now_iso
            })

        # 2. Registra arquivos da pasta atual
        current_folder_files = []
        for f in sorted(files):
            if f.startswith('.') or f.startswith('~$'):
                continue

            full_path = os.path.join(root, f)
            rel_file_path = os.path.join(rel_root, f) if rel_root else f
            ext = os.path.splitext(f)[1].lower().replace('.', '')
            base_name = os.path.splitext(f)[0]

            try:
                st = os.stat(full_path)
                file_size = st.st_size
            except Exception:
                file_size = 0

            stats["total_files"] += 1
            stats["total_bytes"] += file_size

            node_type = 'document'
            id_prefix = 'doc'
            content_md = None
            page_count = 0
            slides_data = None
            doc_images = 0

            # Determina tipo e processa com alta fidelidade
            if ext in ('docx', 'doc'):
                node_type = 'document'
                id_prefix = 'doc'
                stats["docx_count"] += 1
                content_md, doc_images = convert_docx_to_markdown(full_path)
                stats["embedded_images_count"] += doc_images
            elif ext == 'pdf':
                node_type = 'document'
                id_prefix = 'doc'
                stats["pdf_count"] += 1
                content_md, page_count = convert_pdf_to_markdown(full_path)
            elif ext in ('pptx', 'ppt'):
                node_type = 'presentation'
                id_prefix = 'pres'
                stats["pptx_count"] += 1
                if ext == 'pptx':
                    content_md, slides_data = convert_pptx_to_slides(full_path)
                else:
                    content_md = "*(Apresentação em formato clássico .PPT. Baixe o arquivo para abrir no PowerPoint ou converta para .PPTX para visualização interativa de slides).* "
            elif ext in ('mov', 'mp4', 'm4v', 'avi'):
                node_type = 'media'
                id_prefix = 'med'
                stats["media_count"] += 1
                content_md = f"### 🎬 Vídeo de Apoio Catequético: {base_name}\n\nArquivo de vídeo para estudo e encontros da Crisma de Adultos ({file_size / (1024*1024):.1f} MB)."
            elif ext in ('jpg', 'jpeg', 'png', 'gif', 'webp'):
                node_type = 'media'
                id_prefix = 'med'
                stats["media_count"] += 1
                content_md = f"### 🖼️ Imagem Ilustrativa: {base_name}\n\nMaterial gráfico para encontros de Crisma de Adultos."
            else:
                node_type = 'document'
                id_prefix = 'doc'
                stats["other_count"] += 1
                content_md = f"### Material Anexo: {f}\n\nArquivo de apoio complementar para a Catequese."

            # Gera ID único e determinístico
            folder_part = slugify(rel_root) if rel_root else 'raiz'
            file_slug = slugify(base_name)
            node_id = f"{id_prefix}-ca-{folder_part}-{file_slug}-{ext}"

            node = {
                "id": node_id,
                "parentId": current_folder_id,
                "path": current_ancestors,
                "title": base_name,
                "type": node_type,
                "extension": ext,
                "etapa": ETAPA_NAME,
                "fileSizeBytes": file_size,
                "fullLocalPath": full_path,
                "relativePath": rel_file_path,
                "fileName": f,
                "description": f"Material de Crisma de Adultos ({f})",
                "createdAt": now_iso,
                "updatedAt": now_iso
            }

            if content_md:
                node["contentMarkdown"] = content_md

            if ext == 'pdf':
                node["isPdf"] = True
                node["pageCount"] = page_count
                node["pdfLocalPath"] = full_path

            if slides_data:
                node["slides"] = slides_data
                node["slideCount"] = len(slides_data)

            if doc_images:
                node["embeddedImagesCount"] = doc_images

            nodes.append(node)
            current_folder_files.append({"name": f, "ext": ext, "size": file_size, "id": node_id})

        if rel_root:
            stats["folders_summary"].append({
                "folder": rel_root,
                "files_count": len(current_folder_files),
                "files": current_folder_files
            })

    return nodes, stats


def generate_markdown_report(stats, nodes, output_path):
    """Gera um relatório minucioso em Markdown para validação humana pré-ingestão."""
    report_lines = [
        "# ⛪ Relatório de Pré-Validação — Acervo Crisma de Adultos",
        "",
        f"> **Data de Geração:** {datetime.now().strftime('%d/%m/%Y às %H:%M')}",
        f"> **Diretório Escaneado:** `{stats['source_path']}`",
        f"> **Status:** Prévia concluída (Merge Construtivo pronto para conferência)",
        "",
        "---",
        "",
        "## 📊 Estatísticas Gerais do Acervo",
        "",
        f"- **📁 Pastas Mapeadas:** {stats['total_folders']}",
        f"- **📄 Total de Arquivos:** {stats['total_files']}",
        f"  - **Documentos Word (.docx):** {stats['docx_count']} *(com detecção semântica de títulos, callouts litúrgicos e marca-texto)*",
        f"  - **Documentos PDF (.pdf):** {stats['pdf_count']} *(extração em blocos estruturados e integração com visualizador)*",
        f"  - **Apresentações (.pptx/.ppt):** {stats['pptx_count']} *(slides estruturados com notas do catequista para Slide Viewer)*",
        f"  - **Mídias e Vídeos (.mov/.mp4/.img):** {stats['media_count']}",
        f"- **🖼️ Imagens Extraídas de Documentos Word:** {stats['embedded_images_count']}",
        f"- **💾 Volume Total de Dados:** {stats['total_bytes'] / (1024 * 1024):.2f} MB",
        f"- **🌳 Nós Totais da Base de Conhecimento:** {len(nodes)}",
        "",
        "---",
        "",
        "## 📁 Estrutura das 35 Pastas Mapeadas",
        "",
        "| Pasta de Formação | Arquivos | Destaques |",
        "| :--- | :---: | :--- |"
    ]

    for f_info in stats.get("folders_summary", []):
        exts = set(f["ext"].upper() for f in f_info["files"])
        exts_str = ", ".join(sorted(exts)) if exts else "Vazia"
        report_lines.append(f"| **{f_info['folder']}** | {f_info['files_count']} | {exts_str} |")

    report_lines.extend([
        "",
        "---",
        "",
        "## 🔍 Amostra de Extração de Alta Fidelidade",
        ""
    ])

    # Pega uma amostra de DOCX para demonstrar a fidelidade
    sample_doc = next((n for n in nodes if n.get('extension') == 'docx' and 'contentMarkdown' in n), None)
    if sample_doc:
        sample_snippet = sample_doc['contentMarkdown'][:1200]
        report_lines.extend([
            f"### Documento Amostra: `{sample_doc['title']}.docx`",
            f"*Imagens extraídas:* {sample_doc.get('embeddedImagesCount', 0)}",
            "",
            "```markdown",
            sample_snippet + "\n...",
            "```",
            ""
        ])

    sample_ppt = next((n for n in nodes if n.get('extension') == 'pptx' and n.get('slides')), None)
    if sample_ppt:
        report_lines.extend([
            f"### Apresentação Amostra (Slide Viewer): `{sample_ppt['title']}.pptx`",
            f"*Total de Slides:* {sample_ppt.get('slideCount', 0)}",
            "",
            "**Primeiros 2 slides catalogados:**",
            ""
        ])
        for s in sample_ppt.get('slides', [])[:2]:
            report_lines.append(f"- **Slide {s['slideNumber']}: {s['title']}**")
            for b in s.get('bullets', [])[:3]:
                report_lines.append(f"  - {b}")
            if s.get('notes'):
                report_lines.append(f"  - *Nota:* {s['notes']}")
        report_lines.append("")

    report_lines.extend([
        "---",
        "",
        "## 🛡️ Política de Segurança do Banco de Dados",
        "",
        "- ✅ Nenhum dado no Firestore foi sobrescrito ou alterado durante a geração deste relatório.",
        "- ✅ A ingestão final utilizará estritamente a política de **merge construtivo** (`set(..., merge=True)`).",
        "- ✅ Os IDs gerados são determinísticos e vinculados à raiz `dir-crisma-adultos`."
    ])

    with open(output_path, "w", encoding="utf-8") as rf:
        rf.write("\n".join(report_lines))


def main():
    source_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SOURCE_PATH
    print("=" * 70)
    print("⛪ SANTUÁRIO IMACULADO CORAÇÃO DE MARIA — CATEQUESE ICM")
    print("📚 Gerador de Acervo Estruturado da Crisma de Adultos (Alta Fidelidade)")
    print("=" * 70)
    print(f"📂 Diretório de Origem: {source_dir}")
    print(f"🏛️ Pasta Raiz de Destino: {PARENT_ROOT_ID} (Crisma Adultos (+18 anos))")
    print("-" * 70)

    nodes, stats = build_crisma_adultos_acervo(source_dir)

    print(f"✅ Processamento Concluído com Alta Fidelidade:")
    print(f"   • Pastas Mapeadas: {stats['total_folders']}")
    print(f"   • Arquivos Totais: {stats['total_files']}")
    print(f"     - Documentos DOCX: {stats['docx_count']} (com semântica e callouts)")
    print(f"     - Arquivos PDF: {stats['pdf_count']} (extração em blocos estruturados)")
    print(f"     - Apresentações PPTX/PPT: {stats['pptx_count']} (slides para Slide Viewer)")
    print(f"     - Mídias e Vídeos MOV: {stats['media_count']}")
    print(f"   • Imagens Extraídas dos DOCX: {stats['embedded_images_count']}")
    print(f"   • Tamanho Total: {stats['total_bytes'] / (1024*1024):.2f} MB")
    print(f"   • Nós Totais Gerados: {len(nodes)}")
    print("-" * 70)

    # Grava crisma_adultos_seed.json
    out_file1 = os.path.join(os.path.dirname(__file__), "crisma_adultos_seed.json")
    with open(out_file1, "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "stats": stats, "basePath": source_dir}, f, ensure_ascii=False, indent=2)
    print(f"💾 Carga salva em: {out_file1}")

    # Grava onedrive_seed.json para compatibilidade
    out_file2 = os.path.join(os.path.dirname(__file__), "onedrive_seed.json")
    with open(out_file2, "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "stats": stats, "basePath": source_dir}, f, ensure_ascii=False, indent=2)
    print(f"💾 Carga salva em: {out_file2}")

    # Gera relatório detalhado em Markdown
    report_file = os.path.join(os.path.dirname(__file__), "crisma_adultos_acervo_report.md")
    generate_markdown_report(stats, nodes, report_file)
    print(f"📑 Relatório detalhado gerado em: {report_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
