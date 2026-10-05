#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Assistente Local de Ingestão em Lote do OneDrive (Incremento 6)
Arquivo: scripts/knowledge_importer.py

Objetivo:
- Escanear a pasta local do OneDrive:
  /Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1
- Identificar estrutura de pastas, arquivos DOCX, PDF, PPTX, áudios e vídeos
- Fornecer interface web local em http://localhost:8080 para seleção e visualização
- Permitir conversão de DOCX para Markdown e ingestão em lote no Cloud Firestore
  com estrita política de MERGE CONSTRUTIVO (sem sobrescrita destrutiva)
"""

import os
import sys
import json
import re
import unicodedata
import http.server
import socketserver
import urllib.parse
import subprocess
from datetime import datetime

# Constantes e Caminhos
DEFAULT_PORT = 8080
DEFAULT_ONEDRIVE_PATH = os.path.expanduser(
    "~/Library/CloudStorage/OneDrive-Pessoal/Catequese 1"
)
CURRENT_SCAN_PATH = DEFAULT_ONEDRIVE_PATH
UF_DATALESS = 0x40000000  # Flag do macOS para arquivos na nuvem do FileProvider (OneDrive/iCloud)


def choose_folder_dialog(default_dir=None):
    """Abre o diálogo nativo do Finder no macOS para escolher uma pasta"""
    if sys.platform != 'darwin':
        return None
    try:
        script = 'tell application "System Events"\n'
        script += '  activate\n'
        if default_dir and os.path.exists(os.path.expanduser(default_dir)):
            clean_dir = os.path.abspath(os.path.expanduser(default_dir)).replace('"', '\\"')
            script += f'  set chosen to choose folder with prompt "Selecione a pasta de materiais da Catequese:" default location (POSIX file "{clean_dir}")\n'
        else:
            script += '  set chosen to choose folder with prompt "Selecione a pasta de materiais da Catequese:"\n'
        script += '  return POSIX path of chosen\n'
        script += 'end tell'

        res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=120)
        if res.returncode == 0 and res.stdout.strip():
            return res.stdout.strip()
        return None
    except Exception as e:
        print(f"Aviso ao abrir diálogo de pastas: {e}")
        return None


# Tenta carregar python-docx e fitz (PyMuPDF)
try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

try:
    import fitz
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False


def slugify(text):
    """Gera slugs amigáveis para identificadores de nós"""
    text = unicodedata.normalize('NFD', str(text or ''))
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text) or 'item'


def infer_etapa(folder_name):
    """Inferência inteligente de etapa catequética com base no nome da pasta"""
    fn = (folder_name or '').lower()
    if 'pre' in fn or 'pre-catecumenato' in fn or 'acolhida' in fn:
        return 'Pré-Eucaristia'
    elif 'eucaristia i' in fn or '1' in fn and 'etapa' in fn:
        return 'Eucaristia I'
    elif 'eucaristia ii' in fn or '2' in fn and 'etapa' in fn:
        return 'Eucaristia II'
    elif 'crisma jovem' in fn or 'jovem' in fn:
        return 'Crisma Jovem'
    elif 'crisma adulto' in fn or 'adulto' in fn:
        return 'Crisma Adultos'
    elif 'sacramento' in fn or 'missa' in fn or 'mandamento' in fn:
        return 'Eucaristia I'
    return 'Geral'


def extract_docx_markdown(file_path):
    """Converte arquivo DOCX em Markdown limpo usando python-docx"""
    if not HAS_DOCX:
        return None
    try:
        doc = docx.Document(file_path)
        md_lines = []
        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            # Mapeamento de estilos de cabeçalho
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
                # Trata formatação interna (negrito, itálico)
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

        return "\n\n".join(md_lines)
    except Exception as e:
        return f"# Erro na conversão do DOCX\n\nNão foi possível ler o arquivo: {str(e)}"


def extract_pdf_text(file_path, max_pages=25):
    """Extrai texto estruturado de PDF usando PyMuPDF (fitz)"""
    if not HAS_FITZ:
        return None
    try:
        doc = fitz.open(file_path)
        pages_text = []
        for page_num in range(min(len(doc), max_pages)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                pages_text.append(f"### Página {page_num + 1}\n\n{text.strip()}")
        doc.close()
        return "\n\n".join(pages_text)
    except Exception as e:
        return f"# Erro na extração do PDF\n\n{str(e)}"


def scan_onedrive_directory(base_path):
    """
    Escaneia recursivamente o diretório informado e constrói
    a árvore completa de pastas e arquivos compatíveis com o schema da Wiki.
    """
    if not base_path:
        base_path = DEFAULT_ONEDRIVE_PATH

    base_path = os.path.abspath(os.path.expanduser(base_path))

    if not os.path.exists(base_path):
        return {
            'error': f'Diretório não encontrado: {base_path}',
            'nodes': [],
            'stats': {},
            'basePath': base_path
        }

    if not os.path.isdir(base_path):
        return {
            'error': f'O caminho informado não é uma pasta: {base_path}',
            'nodes': [],
            'stats': {},
            'basePath': base_path
        }

    nodes = []
    stats = {
        'total_folders': 0,
        'total_files': 0,
        'docx_count': 0,
        'pdf_count': 0,
        'pptx_count': 0,
        'media_count': 0,
        'dataless_count': 0,
        'local_count': 0,
        'total_size_bytes': 0
    }

    # Dicionário de caminhos relativos para IDs de pastas
    folder_id_map = {
        '': None  # Raiz não tem parentId
    }

    for root, dirs, files in os.walk(base_path):
        # Ignora diretórios ocultos (como .git, .DS_Store, etc.)
        dirs[:] = sorted([d for d in dirs if not d.startswith('.')])

        rel_root = os.path.relpath(root, base_path)
        if rel_root == '.':
            rel_root = ''
            current_folder_id = None
        else:
            current_folder_id = folder_id_map.get(rel_root)

        # 1. Registra as subpastas imediatas
        for d in dirs:
            stats['total_folders'] += 1
            rel_dir_path = os.path.join(rel_root, d) if rel_root else d
            folder_id = f"fld-od-{slugify(rel_dir_path)}"
            folder_id_map[rel_dir_path] = folder_id

            etapa = infer_etapa(d)
            nodes.append({
                'id': folder_id,
                'parentId': current_folder_id,
                'title': d,
                'type': 'folder',
                'etapa': etapa,
                'relativePath': rel_dir_path,
                'description': f'Pasta importada do acervo OneDrive ({d}).',
                'order': 10,
                'createdAt': datetime.utcnow().isoformat() + 'Z',
                'updatedAt': datetime.utcnow().isoformat() + 'Z'
            })

        # 2. Registra os arquivos contidos na pasta atual
        for f in sorted(files):
            if f.startswith('.'):
                continue

            full_path = os.path.join(root, f)
            rel_file_path = os.path.join(rel_root, f) if rel_root else f
            ext = os.path.splitext(f)[1].lower().replace('.', '')

            try:
                st = os.stat(full_path)
                file_size = st.st_size
                is_dataless = bool(st.st_flags & UF_DATALESS)
            except Exception:
                file_size = 0
                is_dataless = True

            stats['total_files'] += 1
            stats['total_size_bytes'] += file_size
            if is_dataless:
                stats['dataless_count'] += 1
            else:
                stats['local_count'] += 1

            # Categorização do nó
            node_type = 'document'
            clean_title = os.path.splitext(f)[0].replace(' - Revisado', '').replace('_', ' ')
            clean_title = re.sub(r'^\d+[\.\-\s]+', '', clean_title)  # Remove numeração inicial

            if ext in ('docx', 'doc'):
                stats['docx_count'] += 1
                node_type = 'document'
            elif ext == 'pdf':
                stats['pdf_count'] += 1
                node_type = 'document'
            elif ext in ('pptx', 'ppt'):
                stats['pptx_count'] += 1
                node_type = 'presentation'
            elif ext in ('mp4', 'mov'):
                stats['media_count'] += 1
                node_type = 'media'
            elif ext in ('mp3', 'wav', 'm4a'):
                stats['media_count'] += 1
                node_type = 'media'
            elif ext in ('jpg', 'jpeg', 'png'):
                node_type = 'media'
            else:
                # Arquivos auxiliares como xlsx, zip, etc.
                continue

            file_id = f"doc-od-{slugify(rel_file_path)}"
            etapa = infer_etapa(rel_root)

            nodes.append({
                'id': file_id,
                'parentId': current_folder_id,
                'title': clean_title or f,
                'type': node_type,
                'extension': ext,
                'etapa': etapa,
                'fileSizeBytes': file_size,
                'isDataless': is_dataless,
                'fullLocalPath': full_path,
                'relativePath': rel_file_path,
                'description': f'Material importado do OneDrive: {f}',
                'createdAt': datetime.utcnow().isoformat() + 'Z',
                'updatedAt': datetime.utcnow().isoformat() + 'Z'
            })

    return {
        'nodes': nodes,
        'stats': stats,
        'basePath': base_path
    }


# ============================================================================
# SERVIDOR HTTP LOCAL COM INTERFACE VISUAL
# ============================================================================

HTML_DASHBOARD = r"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assistente de Importação OneDrive • Catequese Santuário ICM</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Nunito:wght@400;600;700;800;900&family=Questrial&display=swap" rel="stylesheet">
  
  <!-- Firebase SDK v10 Compat para persistência direta no Firestore com Merge Construtivo -->
  <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-storage-compat.js"></script>

  <style>
    body { font-family: 'Nunito', sans-serif; }
    .font-heading { font-family: 'Questrial', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">

  <!-- Topo Oficial -->
  <header class="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 shadow-lg border-b border-emerald-500/30">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl">⛪</span>
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 font-heading">
            Incremento 6 • Ingestão em Lote
          </span>
          <h1 class="text-xl sm:text-2xl font-black font-heading text-white">
            Assistente Local do OneDrive • Pastoral da Catequese
          </h1>
          <p class="text-xs text-slate-300">
            Santuário Imaculado Coração de Maria • Ingestão seletiva com merge construtivo seguro
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          onclick="runScan()"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span>🔄</span> <span>Re-escanear Pasta</span>
        </button>
        <button
          onclick="exportSeedJson()"
          class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span>📦</span> <span>Exportar Seed JSON</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Container Principal -->
  <main class="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

    <!-- Card de Seleção e Configuração da Pasta do Acervo -->
    <div class="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label for="input-folder-path" class="text-xs font-bold text-slate-800 flex items-center gap-2">
          <span class="text-xl">📁</span>
          <span class="font-heading text-sm font-black text-slate-900">Pasta do Acervo para Escaneamento:</span>
        </label>
        <span class="text-[11px] text-slate-400">Escolha pelo Finder do Mac ou digite qualquer caminho</span>
      </div>

      <div class="flex flex-col md:flex-row items-stretch gap-2.5">
        <div class="relative flex-1">
          <input
            type="text"
            id="input-folder-path"
            placeholder="/Users/.../OneDrive-Pessoal/Catequese 1"
            onkeydown="if(event.key==='Enter') triggerScanFromInput()"
            class="w-full pl-3 pr-8 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition shadow-inner"
          />
          <button
            type="button"
            onclick="clearFolderPath()"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
            title="Limpar campo"
          >
            ✕
          </button>
        </div>

        <!-- Botão Procurar Pasta (Nativo macOS Finder) -->
        <button
          type="button"
          id="btn-pick-folder"
          onclick="pickFolderNative()"
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          title="Abre a janela do Finder para escolher qualquer pasta no seu computador"
        >
          <span>📂</span> <span id="btn-pick-folder-text">Escolher Pasta no Mac...</span>
        </button>

        <!-- Botão Escanear Pasta -->
        <button
          type="button"
          id="btn-scan-folder"
          onclick="triggerScanFromInput()"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>🔍</span> <span id="btn-scan-folder-text">Escanear Pasta</span>
        </button>
      </div>

      <!-- Atalhos rápidos para pastas conhecidas -->
      <div class="flex items-center gap-2 flex-wrap pt-1 text-xs">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atalhos rápidos:</span>
        <button
          type="button"
          onclick="setFolderPathShortcut('~/Library/CloudStorage/OneDrive-Pessoal/Catequese 1')"
          class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer"
        >
          ☁️ OneDrive / Catequese 1
        </button>
        <button
          type="button"
          onclick="setFolderPathShortcut('~/Library/CloudStorage/OneDrive-Pessoal/Catequese')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
        >
          ☁️ OneDrive / Catequese
        </button>
        <button
          type="button"
          onclick="setFolderPathShortcut('~/Library/CloudStorage/OneDrive-Pessoal')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
        >
          ☁️ OneDrive Raiz
        </button>
        <button
          type="button"
          onclick="setFolderPathShortcut('~/Documents')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
        >
          📄 Documentos
        </button>
      </div>

      <!-- Alerta de Erro de Diretório -->
      <div id="folder-error-alert" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span id="folder-error-msg">Diretório não encontrado.</span>
        </div>
        <button type="button" onclick="document.getElementById('folder-error-alert').classList.add('hidden')" class="text-red-600 font-bold px-2 py-0.5">✕</button>
      </div>
    </div>

    <!-- Card de Alerta sobre Arquivos na Nuvem (OneDrive Dataless) -->
    <div id="cloud-info-banner" class="hidden p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-3">
        <span class="text-2xl">☁️</span>
        <div>
          <strong class="font-bold block">Arquivos do OneDrive na Nuvem detectados:</strong>
          <span id="cloud-count-text">Alguns arquivos estão como "Files On-Demand".</span>
          <span class="text-amber-800 mt-0.5 block">Dica: No Finder, clique com o botão direito na pasta <strong>Catequese 1</strong> e selecione <em>"Sempre Manter Neste Dispositivo"</em> para baixar tudo em alta velocidade.</span>
        </div>
      </div>
      <button
        onclick="document.getElementById('cloud-info-banner').classList.add('hidden')"
        class="text-amber-700 hover:text-amber-900 font-bold px-3 py-1 rounded-lg bg-amber-100/80"
      >
        Entendido ✕
      </button>
    </div>

    <!-- Estatísticas do Acervo Escaneado -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pastas</span>
        <span id="stat-folders" class="text-2xl font-black text-slate-900 font-heading">--</span>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Arquivos Totais</span>
        <span id="stat-files" class="text-2xl font-black text-slate-900 font-heading">--</span>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Documentos Word</span>
        <span id="stat-docx" class="text-2xl font-black text-blue-600 font-heading">--</span>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Arquivos PDF</span>
        <span id="stat-pdf" class="text-2xl font-black text-red-600 font-heading">--</span>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Apresentações</span>
        <span id="stat-pptx" class="text-2xl font-black text-orange-600 font-heading">--</span>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Mídias (Áudio/Vídeo)</span>
        <span id="stat-media" class="text-2xl font-black text-purple-600 font-heading">--</span>
      </div>
    </div>

    <!-- Barra de Controle de Importação -->
    <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          id="select-all-cb"
          checked
          onchange="toggleSelectAll(this.checked)"
          class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
        <label for="select-all-cb" class="text-xs font-bold text-slate-700 cursor-pointer">
          Selecionar Todos (<span id="selected-count">0</span> selecionados)
        </label>
      </div>

      <!-- Filtro Rápido por Tipo -->
      <div class="flex items-center gap-1.5 flex-wrap text-xs">
        <span class="text-[11px] font-bold text-slate-400 uppercase mr-1">Filtrar:</span>
        <button onclick="filterType('all')" class="type-filter-btn px-2.5 py-1 rounded-full font-bold bg-emerald-700 text-white" data-type="all">Todos</button>
        <button onclick="filterType('document')" class="type-filter-btn px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-type="document">Documentos</button>
        <button onclick="filterType('presentation')" class="type-filter-btn px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-type="presentation">PPTX</button>
        <button onclick="filterType('media')" class="type-filter-btn px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-type="media">Vídeos/Áudios</button>
      </div>

      <!-- Ação de Início de Ingestão -->
      <button
        id="btn-start-import"
        onclick="startBatchImport()"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
      >
        <span>📦</span> <span>Preparar &amp; Gerar Carga do Acervo</span>
      </button>
    </div>

    <!-- Progresso da Ingestão em Tempo Real -->
    <div id="import-progress-panel" class="hidden bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
      <div class="flex items-center justify-between text-xs font-bold">
        <span id="progress-status-title">Preparando Ingestão...</span>
        <span id="progress-percentage-label">0%</span>
      </div>
      <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div id="progress-bar-el" class="bg-gradient-to-r from-emerald-400 to-amber-400 h-2.5 rounded-full transition-all duration-150" style="width: 0%"></div>
      </div>
      <div id="progress-log" class="font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto space-y-1 bg-black/40 p-3 rounded-2xl">
        <div>Iniciando monitoramento...</div>
      </div>
    </div>

    <!-- Tabela / Lista da Árvore de Arquivos -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-600 font-heading">
          Arquivos e Pastas Mapeados no OneDrive
        </h3>
        <span id="path-label" class="text-[11px] text-slate-400 font-mono truncate max-w-md"></span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th class="p-3 w-10 text-center">Sel.</th>
              <th class="p-3">Título / Arquivo</th>
              <th class="p-3">Tipo</th>
              <th class="p-3">Etapa</th>
              <th class="p-3">Tamanho</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody id="tree-table-body" class="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td colspan="7" class="p-8 text-center text-slate-400">Carregando acervo do OneDrive...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Modal de Prévia de Conteúdo -->
  <div id="modal-preview" class="hidden fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
      <div class="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">📄</span>
          <h3 id="preview-modal-title" class="font-bold text-sm truncate font-heading"></h3>
        </div>
        <button onclick="document.getElementById('modal-preview').classList.add('hidden')" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">✕</button>
      </div>
      <div class="p-6 overflow-y-auto flex-1 font-mono text-xs whitespace-pre-wrap bg-slate-50 leading-relaxed text-slate-800" id="preview-modal-body">
        Carregando...
      </div>
    </div>
  </div>

  <script>
    // Configuração oficial do Firebase
    const FIREBASE_CONFIG = {
      apiKey: "AIzaSyAWrOAoRIfWQTerWqP4TO-XlQ8xuk192vU",
      authDomain: "catequese-icm.firebaseapp.com",
      projectId: "catequese-icm",
      storageBucket: "catequese-icm.firebasestorage.app",
      messagingSenderId: "30745657329",
      appId: "1:30745657329:web:0ff21f4671238f64fa0e50"
    };

    let firebaseDb = null;
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      try {
        firebase.initializeApp(FIREBASE_CONFIG);
        firebaseDb = firebase.firestore();
      } catch (e) {
        console.warn('Firebase init warning:', e);
      }
    } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
      firebaseDb = firebase.firestore();
    }

    // Estado do Dashboard Local
    let currentData = null;
    let selectedIds = new Set();
    let activeFilter = 'all';

    // Inicialização
    window.addEventListener('DOMContentLoaded', () => {
      const savedPath = localStorage.getItem('catequese_import_path');
      const inputEl = document.getElementById('input-folder-path');
      if (savedPath && inputEl) {
        inputEl.value = savedPath;
      }
      runScan(savedPath || '');
    });

    function clearFolderPath() {
      const inputEl = document.getElementById('input-folder-path');
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
    }

    function triggerScanFromInput() {
      const inputEl = document.getElementById('input-folder-path');
      const val = (inputEl && inputEl.value) ? inputEl.value.trim() : '';
      runScan(val);
    }

    function setFolderPathShortcut(path) {
      const inputEl = document.getElementById('input-folder-path');
      if (inputEl) inputEl.value = path;
      runScan(path);
    }

    async function pickFolderNative() {
      const btn = document.getElementById('btn-pick-folder');
      const btnText = document.getElementById('btn-pick-folder-text');
      const oldText = btnText ? btnText.textContent : 'Escolher Pasta no Mac...';
      const inputEl = document.getElementById('input-folder-path');
      const currentVal = inputEl ? inputEl.value.trim() : '';

      try {
        if (btnText) btnText.textContent = '⏳ Selecionando no Mac...';
        btn.classList.add('opacity-75');

        const res = await fetch('/api/choose-folder?current=' + encodeURIComponent(currentVal));
        const data = await res.json();

        if (data && data.path) {
          if (inputEl) inputEl.value = data.path;
          localStorage.setItem('catequese_import_path', data.path);
          await runScan(data.path);
        }
      } catch (err) {
        console.error('Erro ao escolher pasta:', err);
      } finally {
        if (btnText) btnText.textContent = oldText;
        btn.classList.remove('opacity-75');
      }
    }

    async function runScan(targetPath) {
      const tbody = document.getElementById('tree-table-body');
      const scanBtnText = document.getElementById('btn-scan-folder-text');
      if (scanBtnText) scanBtnText.textContent = 'Escaneando...';

      tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-400">⏳ Escaneando pastas e materiais...</td></tr>';

      const errAlert = document.getElementById('folder-error-alert');
      if (errAlert) errAlert.classList.add('hidden');

      try {
        const queryParam = targetPath ? `?path=${encodeURIComponent(targetPath)}` : '';
        const res = await fetch(`/api/scan${queryParam}`);
        const data = await res.json();
        currentData = data;

        if (data.error) {
          if (errAlert) {
            errAlert.classList.remove('hidden');
            document.getElementById('folder-error-msg').textContent = data.error;
          }
          tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500 font-bold">⚠️ ${data.error}</td></tr>`;
          document.getElementById('stat-folders').textContent = '0';
          document.getElementById('stat-files').textContent = '0';
          document.getElementById('stat-docx').textContent = '0';
          document.getElementById('stat-pdf').textContent = '0';
          document.getElementById('stat-pptx').textContent = '0';
          document.getElementById('stat-media').textContent = '0';
          document.getElementById('path-label').textContent = data.basePath || targetPath || '';
          return;
        }

        if (data.basePath) {
          const inputEl = document.getElementById('input-folder-path');
          if (inputEl) inputEl.value = data.basePath;
          localStorage.setItem('catequese_import_path', data.basePath);
        }

        renderDashboard(data);
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500 font-bold">❌ Erro ao conectar com o serviço local: ${err.message}</td></tr>`;
      } finally {
        if (scanBtnText) scanBtnText.textContent = 'Escanear Pasta';
      }
    }

    function renderDashboard(data) {
      if (!data || !data.nodes) return;
      const stats = data.stats || {};
      document.getElementById('stat-folders').textContent = stats.total_folders || 0;
      document.getElementById('stat-files').textContent = stats.total_files || 0;
      document.getElementById('stat-docx').textContent = stats.docx_count || 0;
      document.getElementById('stat-pdf').textContent = stats.pdf_count || 0;
      document.getElementById('stat-pptx').textContent = stats.pptx_count || 0;
      document.getElementById('stat-media').textContent = stats.media_count || 0;
      document.getElementById('path-label').textContent = data.basePath || '';

      const banner = document.getElementById('cloud-info-banner');
      if (stats.dataless_count > 0) {
        if (banner) {
          banner.classList.remove('hidden');
          document.getElementById('cloud-count-text').textContent = 
            `${stats.dataless_count} de ${stats.total_files} arquivos estão no OneDrive em nuvem (Files On-Demand).`;
        }
      } else {
        if (banner) banner.classList.add('hidden');
      }

      // Inicializa todos os itens selecionados por padrão
      selectedIds.clear();
      data.nodes.forEach(n => selectedIds.add(n.id));
      updateSelectedCount();

      renderTable();
    }

    function renderTable() {
      const tbody = document.getElementById('tree-table-body');
      if (!currentData || !currentData.nodes) return;

      let filtered = currentData.nodes;
      if (activeFilter !== 'all') {
        filtered = filtered.filter(n => n.type === activeFilter || n.type === 'folder');
      }

      tbody.innerHTML = filtered.map(n => {
        const isFolder = n.type === 'folder';
        const isChecked = selectedIds.has(n.id) ? 'checked' : '';
        const sizeMb = n.fileSizeBytes ? (n.fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '—';
        
        let icon = '📄';
        let badgeColor = 'bg-slate-100 text-slate-700';
        if (isFolder) {
          icon = '📁';
          badgeColor = 'bg-amber-100 text-amber-900 border border-amber-200';
        } else if (n.extension === 'docx') {
          icon = '📘';
          badgeColor = 'bg-blue-100 text-blue-900 border border-blue-200';
        } else if (n.extension === 'pdf') {
          icon = '📕';
          badgeColor = 'bg-red-100 text-red-900 border border-red-200';
        } else if (n.type === 'presentation') {
          icon = '📊';
          badgeColor = 'bg-orange-100 text-orange-900 border border-orange-200';
        } else if (n.type === 'media') {
          icon = n.extension === 'mp4' || n.extension === 'mov' ? '🎬' : '🎵';
          badgeColor = 'bg-purple-100 text-purple-900 border border-purple-200';
        }

        const cloudBadge = n.isDataless
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">☁️ Na Nuvem</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">💾 Local</span>';

        return `
          <tr class="hover:bg-slate-50/80 transition">
            <td class="p-3 text-center">
              <input
                type="checkbox"
                ${isChecked}
                onchange="toggleItem('${n.id}', this.checked)"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </td>
            <td class="p-3 font-semibold text-slate-900 flex items-center gap-2">
              <span class="text-base">${icon}</span>
              <span class="truncate max-w-sm">${n.title}</span>
            </td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor} uppercase">
                ${isFolder ? 'Pasta' : (n.extension ? n.extension.toUpperCase() : n.type)}
              </span>
            </td>
            <td class="p-3 text-slate-500 text-[11px] font-medium">
              ${n.etapa || 'Geral'}
            </td>
            <td class="p-3 text-slate-400 font-mono text-[11px]">
              ${sizeMb}
            </td>
            <td class="p-3">
              ${isFolder ? '<span class="text-slate-400 text-[10px] font-bold">Estrutura</span>' : cloudBadge}
            </td>
            <td class="p-3 text-right">
              ${!isFolder && (n.extension === 'docx' || n.extension === 'pdf') ? `
                <button
                  onclick="previewFile('${n.fullLocalPath}', '${n.title}')"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                >
                  👁️ Prévia
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');
    }

    function toggleItem(id, isChecked) {
      if (isChecked) selectedIds.add(id);
      else selectedIds.delete(id);
      updateSelectedCount();
    }

    function toggleSelectAll(isChecked) {
      if (!currentData || !currentData.nodes) return;
      if (isChecked) {
        currentData.nodes.forEach(n => selectedIds.add(n.id));
      } else {
        selectedIds.clear();
      }
      updateSelectedCount();
      renderTable();
    }

    function updateSelectedCount() {
      document.getElementById('selected-count').textContent = selectedIds.size;
    }

    function filterType(type) {
      activeFilter = type;
      document.querySelectorAll('.type-filter-btn').forEach(btn => {
        if (btn.getAttribute('data-type') === type) {
          btn.className = 'type-filter-btn px-2.5 py-1 rounded-full font-bold bg-emerald-700 text-white';
        } else {
          btn.className = 'type-filter-btn px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });
      renderTable();
    }

    async function previewFile(fullPath, title) {
      const modal = document.getElementById('modal-preview');
      const modalTitle = document.getElementById('preview-modal-title');
      const modalBody = document.getElementById('preview-modal-body');
      modalTitle.textContent = title;
      modalBody.textContent = 'Carregando e convertendo arquivo...';
      modal.classList.remove('hidden');

      try {
        const res = await fetch('/api/file-content?path=' + encodeURIComponent(fullPath));
        const data = await res.json();
        modalBody.textContent = data.content || 'Arquivo vazio ou sem texto extraível.';
      } catch (e) {
        modalBody.textContent = 'Erro ao ler arquivo: ' + e.message;
      }
    }

    function triggerDownloadJson(filename, jsonString) {
      try {
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Download fallback:', e);
      }
    }

    async function exportSeedJson(silent = false) {
      if (!currentData) return;
      try {
        const jsonStr = JSON.stringify(currentData, null, 2);
        const res = await fetch('/api/export-seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStr
        });
        const r = await res.json();
        
        // Também dispara download no navegador para conveniência
        triggerDownloadJson('onedrive_seed.json', jsonStr);

        if (!silent) {
          alert('✅ Acervo exportado e baixado com sucesso!\n\nArquivo salvo no disco em:\n' + r.file + '\n\nE na sua pasta de Downloads.');
        }
        return r.file;
      } catch (err) {
        if (!silent) alert('Erro ao exportar JSON: ' + err.message);
        throw err;
      }
    }

    // Ingestão em Lote
    async function startBatchImport() {
      if (selectedIds.size === 0) {
        alert('Selecione pelo menos uma pasta ou material para preparar a carga.');
        return;
      }

      const proceed = confirm(
        `Deseja preparar a carga de ${selectedIds.size} itens selecionados do acervo?\n\n` +
        `• O assistente irá consolidar todas as pastas e documentos no formato oficial da Wiki.\n` +
        `• Gerará o arquivo onedrive_seed.json para publicação no site via Master Admin.`
      );
      if (!proceed) return;

      const progressPanel = document.getElementById('import-progress-panel');
      const progressBar = document.getElementById('progress-bar-el');
      const percentLabel = document.getElementById('progress-percentage-label');
      const statusTitle = document.getElementById('progress-status-title');
      const logEl = document.getElementById('progress-log');
      progressPanel.classList.remove('hidden');

      const items = currentData.nodes.filter(n => selectedIds.has(n.id));
      let processed = 0;

      function log(msg) {
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
      }

      log(`Iniciando consolidação de ${items.length} nós do acervo...`);

      for (const item of items) {
        processed++;
        const pct = Math.round((processed / items.length) * 100);
        progressBar.style.width = pct + '%';
        percentLabel.textContent = pct + '%';
        statusTitle.textContent = `Preparando (${processed}/${items.length}): ${item.title}`;
        log(`✓ Nó preparado: [${item.type.toUpperCase()}] ${item.title}`);
        await new Promise(r => setTimeout(r, 15));
      }

      // 1. Grava no arquivo oficial de carga local e inicia download
      log('Salvando scripts/onedrive_seed.json e iniciando download...');
      await exportSeedJson(true);

      // 2. Se houver usuário autenticado no Firebase local, tenta gravar
      const currentUser = firebase.auth && firebase.auth().currentUser;
      if (firebaseDb && currentUser) {
        log('Usuário autenticado detectado. Gravando lotes no Cloud Firestore (knowledge_nodes)...');
        try {
          const BATCH_SIZE = 400;
          for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const chunk = items.slice(i, i + BATCH_SIZE);
            const batch = firebaseDb.batch();
            for (const item of chunk) {
              const ref = firebaseDb.collection('knowledge_nodes').doc(item.id);
              batch.set(ref, {
                ...item,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
            await batch.commit();
            log(`✓ Lote gravado no Firestore (${Math.min(i + BATCH_SIZE, items.length)}/${items.length})`);
          }
          statusTitle.textContent = '✅ Ingestão finalizada e salva no Cloud Firestore!';
          log('✅ Todos os nós foram gravados no Firestore com merge construtivo!');
          alert('🎉 Ingestão de materiais concluída com sucesso no Cloud Firestore!');
          return;
        } catch (dbErr) {
          console.warn('Firestore direto:', dbErr);
        }
      }

      // 3. Instruções oficiais para importação no site (Master Admin)
      statusTitle.textContent = '📦 Carga pronta! Importe no site oficial.';
      log('✅ Carga completa exportada em: scripts/onedrive_seed.json');
      log('📥 Arquivo baixado para sua pasta de Downloads.');
      log('👉 Acesse o site oficial como Master Admin e clique em "📥 Importar Acervo (JSON)" para publicar.');

      alert(
        `🎉 Carga do Acervo Preparada com Sucesso!\n\n` +
        `• ${items.length} itens (pastas e materiais) foram consolidados.\n` +
        `• O arquivo "onedrive_seed.json" foi gerado na pasta "scripts/" e baixado para o seu computador.\n\n` +
        `👉 COMO PUBLICAR NO SITE DA CATEQUESE:\n` +
        `1. Acesse o site oficial (https://colletes.github.io/Catequese);\n` +
        `2. Certifique-se de estar logado como Master Admin (colletes@gmail.com);\n` +
        `3. Vá na aba "Base de Conhecimento";\n` +
        `4. Clique no botão "📥 Importar Acervo (JSON)";\n` +
        `5. Selecione o arquivo "onedrive_seed.json" e clique em "Iniciar Ingestão no Firestore".\n\n` +
        `Seus materiais aparecerão imediatamente na Wiki!`
      );
  </script>
</body>
</html>
"""


class KnowledgeImporterHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Manipulador de requisições HTTP do assistente local"""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/' or path == '/index.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HTML_DASHBOARD.encode('utf-8'))
            return

        elif path == '/api/scan':
            global CURRENT_SCAN_PATH
            query = urllib.parse.parse_qs(parsed.query)
            target = query.get('path', [''])[0].strip()
            if not target:
                target = CURRENT_SCAN_PATH or DEFAULT_ONEDRIVE_PATH
            data = scan_onedrive_directory(target)
            if not data.get('error'):
                CURRENT_SCAN_PATH = data.get('basePath')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            return

        elif path == '/api/choose-folder':
            query = urllib.parse.parse_qs(parsed.query)
            current = query.get('current', [''])[0].strip() or CURRENT_SCAN_PATH or DEFAULT_ONEDRIVE_PATH
            chosen = choose_folder_dialog(current)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'path': chosen}, ensure_ascii=False).encode('utf-8'))
            return

        elif path == '/api/file-content':
            query = urllib.parse.parse_qs(parsed.query)
            file_path = query.get('path', [''])[0]
            if not file_path or not os.path.exists(file_path):
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Arquivo não encontrado'}).encode('utf-8'))
                return

            ext = os.path.splitext(file_path)[1].lower()
            content = ''
            if ext == '.docx':
                content = extract_docx_markdown(file_path)
            elif ext == '.pdf':
                content = extract_pdf_text(file_path)
            else:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read(50000)
                except Exception as e:
                    content = str(e)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'content': content or 'Sem conteúdo legível'}, ensure_ascii=False).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/export-seed':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                target_file = os.path.join(
                    os.path.dirname(__file__), 'onedrive_seed.json'
                )
                with open(target_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok', 'file': target_file}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()


def start_server(port=DEFAULT_PORT, initial_path=None):
    """Inicia o servidor HTTP local do assistente"""
    global CURRENT_SCAN_PATH
    if initial_path:
        CURRENT_SCAN_PATH = os.path.abspath(os.path.expanduser(initial_path))
    handler = KnowledgeImporterHTTPHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print("=" * 70)
        print("⛪ PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA")
        print("🚀 Assistente Local de Ingestão em Lote do OneDrive")
        print("=" * 70)
        print(f"📂 Diretório Inicial: {CURRENT_SCAN_PATH}")
        print(f"🌐 Servidor ativo em: http://localhost:{port}")
        print("💡 Você pode escolher qualquer pasta diretamente na interface web!")
        print("📌 Pressione Ctrl+C para encerrar o servidor.")
        print("=" * 70)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor local encerrado pelo usuário.")


if __name__ == '__main__':
    port = DEFAULT_PORT
    custom_path = None
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg in ('--path', '-p') and i + 1 < len(args):
            custom_path = args[i + 1]
        elif arg.startswith('--path='):
            custom_path = arg.split('=', 1)[1]
        elif arg.isdigit():
            port = int(arg)
        elif not arg.startswith('-') and (os.path.exists(os.path.expanduser(arg)) or '/' in arg or '~' in arg):
            custom_path = arg

    start_server(port, custom_path)
