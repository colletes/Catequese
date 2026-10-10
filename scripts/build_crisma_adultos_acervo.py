#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Extrator e Construtor do Acervo de Crisma de Adultos
Arquivo: scripts/build_crisma_adultos_acervo.py

Objetivo:
- Escanear a pasta local:
  ~/Library/CloudStorage/OneDrive-Pessoal/Catequese 1/Importação Site/Crisma de Adultos
- Mapear todas as 35 subpastas diretamente dentro de "dir-crisma-adultos" (Crisma Adultos (+18 anos))
- Converter todos os 84 arquivos DOCX e 75 PDFs em artigos ricos formatados em Markdown
- Extrair texto das apresentações PPTX e catalogar mídias/vídeos (.mov)
- Gerar scripts/crisma_adultos_seed.json e scripts/onedrive_seed.json
- Preparar a estrutura para upload no Firebase Storage e merge construtivo no Cloud Firestore
"""

import os
import sys
import json
import re
import unicodedata
from datetime import datetime, timezone

# Dependências de extração
try:
    import docx
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
DEFAULT_SOURCE_PATH = os.path.expanduser(
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


def convert_docx_to_markdown(file_path):
    """Converte arquivo DOCX em Markdown limpo e bem formatado."""
    if not HAS_DOCX or not os.path.exists(file_path):
        return None
    try:
        doc = docx.Document(file_path)
        md_lines = []
        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            style_name = (p.style.name or '').lower()
            if 'heading 1' in style_name or 'título 1' in style_name:
                md_lines.append(f"\n# {text}\n")
            elif 'heading 2' in style_name or 'título 2' in style_name:
                md_lines.append(f"\n## {text}\n")
            elif 'heading 3' in style_name or 'título 3' in style_name:
                md_lines.append(f"\n### {text}\n")
            elif 'list' in style_name or 'bullet' in style_name:
                md_lines.append(f"- {text}")
            else:
                runs_text = []
                for run in p.runs:
                    r_text = run.text
                    if not r_text:
                        continue
                    if run.bold and run.italic:
                        r_text = f"***{r_text}***"
                    elif run.bold:
                        r_text = f"**{r_text}**"
                    elif run.italic:
                        r_text = f"*{r_text}*"
                    runs_text.append(r_text)
                formatted_p = "".join(runs_text).strip()
                if formatted_p:
                    md_lines.append(formatted_p)

        # Trata tabelas simples do DOCX
        for table in doc.tables:
            md_lines.append("\n")
            for row_idx, row in enumerate(table.rows):
                row_cells = [c.text.strip().replace('\n', ' ') for c in row.cells]
                md_lines.append("| " + " | ".join(row_cells) + " |")
                if row_idx == 0:
                    md_lines.append("| " + " | ".join(["---"] * len(row_cells)) + " |")
            md_lines.append("\n")

        content = "\n\n".join(md_lines).strip()
        # Limite de segurança de tamanho de texto para o documento Firestore (máx 600 KB)
        if len(content.encode('utf-8')) > 600000:
            content = content[:500000] + "\n\n*(Texto longo truncado para preservação dos limites do documento. Consulte o anexo original).* "
        return content
    except Exception as e:
        return f"# Erro na conversão do DOCX\n\nNão foi possível ler o arquivo: {str(e)}"


def convert_pdf_to_markdown(file_path, max_pages=35):
    """Extrai texto estruturado de PDF com PyMuPDF."""
    if not HAS_FITZ or not os.path.exists(file_path):
        return None
    try:
        doc = fitz.open(file_path)
        pages_text = []
        num_pages = len(doc)
        limit = min(num_pages, max_pages)

        for page_num in range(limit):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                pages_text.append(f"### Página {page_num + 1}\n\n{text.strip()}")
        doc.close()

        if num_pages > max_pages:
            pages_text.append(f"\n*(Exibindo as primeiras {max_pages} de {num_pages} páginas. Consulte o anexo original para o documento completo).*")

        content = "\n\n---\n\n".join(pages_text).strip()
        if len(content.encode('utf-8')) > 600000:
            content = content[:500000] + "\n\n*(Texto truncado para limites do Firestore. Consulte o PDF anexo).* "
        return content or "*(Documento digitalizado/imagem sem camada de texto OCR selecionável. Baixe o PDF para visualizar).* "
    except Exception as e:
        return f"# Erro na extração do PDF\n\n{str(e)}"


def convert_pptx_to_markdown(file_path):
    """Extrai tópicos de apresentações PPTX."""
    if not HAS_PPTX or not os.path.exists(file_path):
        return None
    try:
        prs = pptx.Presentation(file_path)
        slides_md = []
        for idx, slide in enumerate(prs.slides, 1):
            slide_texts = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        t = paragraph.text.strip()
                        if t:
                            slide_texts.append(t)
            if slide_texts:
                slides_md.append(f"### Slide {idx}\n\n" + "\n\n".join(slide_texts))
        return "\n\n---\n\n".join(slides_md) if slides_md else "*(Apresentação visual de slides)*"
    except Exception as e:
        return f"# Erro ao ler apresentação\n\n{str(e)}"


def build_crisma_adultos_acervo(source_path=DEFAULT_SOURCE_PATH):
    """
    Constrói a árvore completa de nós para o acervo de Crisma de Adultos
    diretamente sob dir-crisma-adultos.
    """
    source_path = os.path.abspath(os.path.expanduser(source_path))
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Pasta de origem não encontrada: {source_path}")

    now_iso = datetime.now(timezone.utc).isoformat()
    nodes = []
    stats = {
        "total_folders": 0,
        "total_files": 0,
        "docx_count": 0,
        "pdf_count": 0,
        "pptx_count": 0,
        "media_count": 0,
        "other_count": 0,
        "total_bytes": 0,
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
        for f in sorted(files):
            if f.startswith('.'):
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

            # Determina tipo e prefixo
            if ext in ('docx', 'doc'):
                node_type = 'document'
                id_prefix = 'doc'
                stats["docx_count"] += 1
                content_md = convert_docx_to_markdown(full_path)
            elif ext == 'pdf':
                node_type = 'document'
                id_prefix = 'doc'
                stats["pdf_count"] += 1
                content_md = convert_pdf_to_markdown(full_path)
            elif ext in ('pptx', 'ppt'):
                node_type = 'presentation'
                id_prefix = 'pres'
                stats["pptx_count"] += 1
                content_md = convert_pptx_to_markdown(full_path) if ext == 'pptx' else "*(Apresentação PPT - Baixe o arquivo para abrir no PowerPoint)*"
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

            nodes.append(node)

    return nodes, stats


def main():
    source_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SOURCE_PATH
    print("=" * 70)
    print("⛪ SANTUÁRIO IMACULADO CORAÇÃO DE MARIA — CATEQUESE ICM")
    print("📚 Gerador de Acervo Estruturado da Crisma de Adultos")
    print("=" * 70)
    print(f"📂 Diretório de Origem: {source_dir}")
    print(f"🏛️ Pasta Raiz de Destino: {PARENT_ROOT_ID} (Crisma Adultos (+18 anos))")
    print("-" * 70)

    nodes, stats = build_crisma_adultos_acervo(source_dir)

    print(f"✅ Processamento Concluído:")
    print(f"   • Pastas Criadas: {stats['total_folders']}")
    print(f"   • Arquivos Totais: {stats['total_files']}")
    print(f"     - Documentos DOCX: {stats['docx_count']} (convertidos para Markdown)")
    print(f"     - Arquivos PDF: {stats['pdf_count']} (páginas extraídas em Markdown)")
    print(f"     - Apresentações PPTX/PPT: {stats['pptx_count']}")
    print(f"     - Mídias e Vídeos MOV: {stats['media_count']}")
    print(f"   • Tamanho Total: {stats['total_bytes'] / (1024*1024):.2f} MB")
    print(f"   • Nós Totais Gerados: {len(nodes)}")
    print("-" * 70)

    # Grava crisma_adultos_seed.json
    out_file1 = os.path.join(os.path.dirname(__file__), "crisma_adultos_seed.json")
    with open(out_file1, "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "stats": stats, "basePath": source_dir}, f, ensure_ascii=False, indent=2)
    print(f"💾 Carga salva em: {out_file1}")

    # Também grava onedrive_seed.json para compatibilidade total com o assistente existente
    out_file2 = os.path.join(os.path.dirname(__file__), "onedrive_seed.json")
    with open(out_file2, "w", encoding="utf-8") as f:
        json.dump({"nodes": nodes, "stats": stats, "basePath": source_dir}, f, ensure_ascii=False, indent=2)
    print(f"💾 Carga salva em: {out_file2}")
    print("=" * 70)


if __name__ == "__main__":
    main()
