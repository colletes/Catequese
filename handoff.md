# 🤝 Documento de Handoff: Base de Conhecimento (Wiki da Catequese)

> **Instruções para Modelos de IA e Desenvolvedores**:  
> Leia este documento atentamente antes de realizar qualquer alteração no código. Ele resume o estado atual do projeto, as diretrizes de governança, o roadmap e o próximo incremento a ser implementado.

---

## 📌 1. Visão Geral do Projeto
A Catequese do Santuário Imaculado Coração de Maria (Park Way / DF) possui uma aplicação web estática hospedada no Firebase Hosting, servida a partir de um SPA autocontido em `index.html`, com autenticação, RBAC e banco de dados Cloud Firestore configurados em `firebase-config.js`.

Estamos criando uma **Base de Conhecimento (estilo Confluence)** para os catequistas, onde materiais de ensino (PDFs, DOCXs convertidos em Markdown, apresentações PPTX, áudios e vídeos) são organizados em uma árvore hierárquica de pastas, com extração inteligente de referências religiosas (Bíblia, CIC, Vaticano e Google Livros via Gemini).

---

## ⚠️ 2. Regras Críticas de Segurança e Governança

1. **Proteção do Firestore (Regra de Ouro)**:
   - **NUNCA** execute operações destrutivas ou scripts que usem `set({ ... }, { merge: false })` ou `delete()` em massa sem confirmação explícita do usuário.
   - Sempre utilize estratégia de **merge construtivo** (`set(..., { merge: true })` ou `update()`).
   - Respeite integralmente as regras do arquivo `.agents/rules/github-deploy.md`.
2. **Armazenamento de Arquivos Grandes**:
   - Arquivos binários pesados (áudios, vídeos, PPTX) e imagens extraídas de documentos **NUNCA** devem ser commitados no Git. Devem ser enviados para o bucket do **Firebase Storage** (`catequese-icm.firebasestorage.app`).
3. **Padrão Visual do Site**:
   - Manter a paleta de cores oficial (tons de verde esmeralda `#064e3b` / `#059669`, dourado/âmbar, cinzas neutros claros), fontes Questrial e Nunito, e classes Tailwind CSS compatíveis com o `index.html`.

---

## 📂 3. Caminhos e Arquivos Relevantes

| Caminho | Finalidade |
| :--- | :--- |
| `knowledge-service.js` | Serviço de persistência no Cloud Firestore (`knowledge_nodes`), cache offline (`localStorage`), merge construtivo e checagem de permissões RBAC. |
| `knowledge-base.js` | Módulo cliente da Wiki: gerenciamento da árvore, dados semente, navegação, filtros, Markdown e escuta em tempo real. |
| `knowledge-base.css` | Folha de estilos da Wiki: layout Confluence, tipografia `.wiki-prose`, breadcrumbs e árvore. |
| `index.html` | SPA principal do site (contém a aplicação, estilos, layout e abas). |
| `firebase-config.js` | Configurações do Firebase, RBAC (roles e permissões), encriptação e chaves. |
| `firestore.rules` | Regras de segurança do Cloud Firestore (incluindo regra para `knowledge_nodes`). |
| `firebase.json` | Configurações do Firebase Hosting e Firestore. |
| `roadmap.md` | Roteiro oficial de incrementos testáveis e seus status. |
| `scripts/` | Diretório de utilitários e scripts de automação. |
| `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1` | Pasta local de origem no Mac com o acervo original de pastas e materiais. |

---

## 📊 4. Estado Atual do Projeto

- **Fase**: Incremento 5 Concluído com sucesso.
- **Roadmap**: Roteiro com 6 incrementos testáveis (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 5** (01/10/2026) — Painel Web de Upload & Gestão no Site:
  - Criação do módulo [`knowledge-upload-panel.js`](file:///Users/thiagocarvalho/Public/Catequese/knowledge-upload-panel.js).
  - Modal **"+ Nova Pasta"**: seleção de pasta-mãe hierárquica com indentação visual, etapa catequética, ordem e descrição.
  - Modal **"+ Novo Material"**:
    - Drag & drop de arquivos `.docx`, `.pdf`, `.mp3`, `.mp4`, `.pptx`, `.md` e `.txt`.
    - Conversão client-side em tempo real de DOCX para Markdown limpo (via `Mammoth.js` + `Turndown.js`).
    - Extração de texto de PDF por páginas (via `PDF.js`).
    - Upload binário de arquivos de mídia (áudios, vídeos e apresentações) diretamente para o Firebase Storage (`catequese-icm.firebasestorage.app`) com barra de progresso interativa (`0% -> 100%`).
    - Editor integrado de Markdown com abas "Editor" e "Prévia", além de acionamento imediato da extração de referências por IA (`GeminiReferenceExtractor`).
  - Modal **"✏️ Editar Documento"**: permite atualizar metadados e conteúdo Markdown com re-escaneamento de referências e gravação com merge construtivo seguro no Firestore.
- **Próximo Incremento a Executar**: **Incremento 6** (Assistente Local do OneDrive: script Python com interface visual local em `http://localhost:8080` para escanear a pasta `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1`, exibir a árvore para seleção e realizar ingestão em lote com upload de mídias para o Storage e merge construtivo no Firestore).

---

## 🧪 5. Como Testar o Incremento 5

1. Abra a **Base de Conhecimento** no site.
2. No cabeçalho da Wiki ou no dashboard de qualquer pasta:
   - Clique em **"📁 + Nova Pasta"** (ou **"+ Subpasta"**):
     - Selecione a pasta mãe, defina o nome (ex: `Módulo 5: Liturgia e Orações`), a etapa e a ordem.
     - Clique em **"Criar Pasta"**. O sistema grava no Firestore via merge construtivo e navega automaticamente para a nova pasta criada.
   - Clique em **"📤 + Novo Material"** (ou **"+ Material"**):
     - Arraste ou selecione um arquivo `.docx`: veja a conversão instantânea para Markdown e a prévia visual formatada com a tipografia do Santuário.
     - Arraste ou selecione um arquivo `.pdf`: veja o texto extraído por páginas.
     - Arraste ou selecione um arquivo de áudio (`.mp3`), vídeo (`.mp4`) ou apresentação (`.pptx`): veja o upload no Firebase Storage com a barra de progresso.
     - Clique no botão **"✨ Detectar Referências (IA)"** para testar a extração teológica antes de publicar.
     - Clique em **"Publicar no Acervo"**: o material é gravado no Firestore e selecionado imediatamente na árvore.
3. Ao visualizar qualquer documento, clique no botão **"✏️ Editar"** para alterar títulos ou texto e salvar a nova versão.

---

## 🎯 6. Instruções para o Incremento 6 (Assistente Local de Ingestão do OneDrive)

1. Criar o script Python [`scripts/knowledge_importer.py`](file:///Users/thiagocarvalho/Public/Catequese/scripts/knowledge_importer.py):
   - Escanear a pasta local do OneDrive: `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1`.
   - Iniciar um servidor web leve local (`http://localhost:8080`) com interface gráfica amigável:
     - Árvore de diretórios detectados no OneDrive com checkboxes para seleção seletiva de pastas e arquivos.
     - Detecção automática de tipos (`.docx`, `.pdf`, `.pptx`, `.mp4`, `.mp3`).
     - Conversão de `.docx` para Markdown (via biblioteca Python `python-docx` / `pypandoc` / `mammoth`).
     - Envio de mídias para o Firebase Storage via Firebase Admin SDK ou REST API.
     - Ingestão em lote no Cloud Firestore (`knowledge_nodes`) com estrita política de **merge construtivo** (`set(..., merge=True)`).
2. Criar script de inicialização amigável (`scripts/run_importer.sh` ou similar).
3. Testar a importação visual e validar o acervo no site.
