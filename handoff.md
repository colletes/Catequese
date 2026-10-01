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

- **Fase**: **Todos os 6 Incrementos Concluídos com Sucesso! 🏁**
- **Roadmap**: Roteiro 100% finalizado (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 6** (01/10/2026) — Assistente Local de Ingestão do OneDrive:
  - Criação do script Python [`scripts/knowledge_importer.py`](file:///Users/thiagocarvalho/Public/Catequese/scripts/knowledge_importer.py) com servidor HTTP local embutido (`http://localhost:8080`).
  - Criação do launcher amigável [`scripts/run_importer.sh`](file:///Users/thiagocarvalho/Public/Catequese/scripts/run_importer.sh).
  - Escaneamento profundo de `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1`:
    - **28 pastas temáticas** mapeadas.
    - **223 arquivos** classificados (86 DOCX, 87 PDF, 16 PPT/PPTX, 11 vídeos MOV, 18 imagens).
  - Detecção transparente do estado do FileProvider (`UF_DATALESS`) informando se o arquivo está na nuvem (On-Demand) ou local no Mac.
  - Prévia de conversão de texto de DOCX e PDF.
  - Exportação em lote e geração de [`scripts/onedrive_seed.json`](file:///Users/thiagocarvalho/Public/Catequese/scripts/onedrive_seed.json).
  - Suporte à sincronização no Cloud Firestore com merge construtivo seguro (`set(..., { merge: true })`).

---

## 🧪 5. Como Testar o Incremento 6 (Assistente Local do OneDrive)

1. No terminal do Mac, inicie o assistente executando:
   ```bash
   ./scripts/run_importer.sh
   # Ou diretamente:
   python3 scripts/knowledge_importer.py
   ```
2. O servidor iniciará em `http://localhost:8080` e abrirá automaticamente no seu navegador.
3. No painel web:
   - Observe os cards de estatísticas (28 pastas, 223 arquivos totais, contagem de DOCX, PDF, PPTX e Mídias).
   - Visualize a tabela com a árvore mapeada, tipos, etapas sugeridas e badges de status (*💾 Local* ou *☁️ Na Nuvem*).
   - Use os filtros rápidos (*Todos*, *Documentos*, *PPTX*, *Vídeos/Áudios*) ou a caixa de seleção para escolher quais itens importar.
   - Clique em **"👁️ Prévia"** em qualquer documento para inspecionar o texto.
   - Clique em **"📦 Exportar Seed JSON"** para gerar o arquivo de carga estruturado em `scripts/onedrive_seed.json`.
   - Clique em **"🚀 Iniciar Ingestão no Firestore"** para processar os nós com merge construtivo seguro.

---

## 🏁 6. Conclusão da Base de Conhecimento (Resumo dos 6 Incrementos)

1. **Inc 1**: Interface Confluence no SPA (`knowledge-base.js`, `knowledge-base.css`, sidebar em árvore, leitor Markdown, filtros por etapa e busca em tempo real).
2. **Inc 2**: Persistência no Cloud Firestore (`knowledge-service.js`, cache offline em `localStorage`, regras de segurança RBAC em `firestore.rules` atualizadas pelo subagent).
3. **Inc 3**: Visualizador multimídia com player customizado de áudio (MP3), player de vídeo (MP4), visualizador duplo de apresentações PPTX (Office Online + Google Docs) e lightbox para imagens.
4. **Inc 4**: Motor teológico inteligente via Google Gemini e heurística local (`gemini-reference-extractor.js`), rodapé de citações (Bíblia, CIC, Vaticano, Google Livros) e modal de revisão teológica.
5. **Inc 5**: Painel web de upload e gestão no site (`knowledge-upload-panel.js`), modais de "+ Nova Pasta", "+ Novo Material" com conversão client-side (Mammoth + Turndown + PDF.js) e upload para Firebase Storage com barra de progresso.
6. **Inc 6**: Assistente local em Python (`scripts/knowledge_importer.py` e `scripts/run_importer.sh`) com interface em `http://localhost:8080` para leitura e ingestão em lote do acervo da pasta do OneDrive.

