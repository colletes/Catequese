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

- **Fase**: Incremento 4 Concluído com sucesso.
- **Roadmap**: Roteiro com 6 incrementos testáveis (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 4** (01/10/2026) — Seção de Referências & Motor Gemini:
  - Módulo `gemini-reference-extractor.js` com mapeamento teológico completo (encíclicas, concílios, exortações apostólicas e livros bíblicos).
  - Suporte à API Google Gemini (`gemini-1.5-flash`) com chave configurável via modal e fallback de heurística de alta fidelidade sem necessidade de chave externa.
  - Seção de rodapé enriquecida com cards categorizados (Bíblia, CIC, Vaticano, Google Livros).
  - Modal de revisão das referências antes de salvar no Cloud Firestore (merge construtivo seguro).
  - Botão de extração por IA no cabeçalho do documento e no rodapé, além de atalho de chave API no topo da Wiki.
- **Próximo Incremento a Executar**: **Incremento 5** (Painel Web de Upload & Gestão no Site: modais de "+ Nova Pasta" e "+ Novo Material" para a Coordenação, upload de PDF/DOCX com conversão cliente para Markdown, e upload de mídias/imagens para o Firebase Storage).

---

## 🧪 5. Como Testar o Incremento 4

1. Abra a **Base de Conhecimento** no site.
2. Navegue até qualquer documento de texto (ex: `Apresentação e Roteiro Geral da 1ª Etapa` ou `Roteiro 01: O Encontro com a Palavra Viva`).
3. Observe no rodapé do documento a seção **"Fontes & Referências Citadas"**:
   - Cada referência possui badge colorido (Bíblia, CIC, Vaticano, Google Livros), título da fonte e resumo teológico.
   - Clicar em qualquer card abre a fonte oficial em nova aba (ex: Bíblia Online, site do Vaticano ou Google Livros).
4. No cabeçalho do documento, clique no botão roxo **"✨ Extrair Referências (IA)"** (ou no rodapé em **"✨ Revisar Fontes com IA"**):
   - Abre-se o modal de revisão teológica.
   - O extrator processa o documento usando a API Gemini (se chave configurada) ou a heurística local de expressões bíblicas/eclesiais.
   - Os resultados são listados de forma clara e visual.
   - Caso o usuário seja Coordenador/Admin, clicar em **"💾 Salvar Referências no Documento"** persiste as alterações no Firestore via merge seguro.
5. No cabeçalho da Wiki, clique no botão **"✨ Chave Gemini (IA)"** para abrir o modal de configuração de chave da API do Google Gemini.

---

## 🎯 6. Instruções para o Incremento 5 (Painel Web de Upload & Gestão no Site)

1. **Ações para Coordenadores/Admin**:
   - Adicionar botões "+ Nova Pasta" e "+ Novo Material" (visíveis condicionalmente para coordenadores autenticados).
2. **Modal "+ Nova Pasta"**:
   - Campos: Título, Descrição, Pasta Mãe (select com a árvore atual) e Etapa (Geral, Pré, Eucaristia I/II, Crisma Jovem/Adultos).
   - Salvar no Firestore via `KnowledgeService.saveNode(...)`.
3. **Modal "+ Novo Material"**:
   - Drag & drop / seleção de arquivos:
     - DOCX: conversão em Markdown no cliente (utilizando biblioteca leve como `mammoth.js` via CDN) e extração de imagens.
     - PDF: extração de texto estruturado.
     - Áudio/Vídeo/PPTX: upload binário para o Firebase Storage (`catequese-icm.firebasestorage.app`) com obtenção da URL de download e criação do nó no Firestore.
   - Campo para edição prévia do Markdown e título antes da publicação.
   - Botão para acionar extração de referências automática já integrado ao fluxo de upload.
