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

- **Fase**: Incremento 3 Concluído com sucesso.
- **Roadmap**: Roteiro com 6 incrementos testáveis (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 3** (01/10/2026) — Visualizador Multimídia e Player Integrado: player customizado de áudio (play/pause, seek -10s/+10s, scrubber interativo, tempo decorrido, controle de velocidade 1x/1.25x/1.5x/2x, mute e download), player de vídeo responsivo com tela cheia e velocidades, visualizador de PPTX dual-provider (Microsoft Office Online & Google Docs Viewer com alternador e fullscreen) e modal lightbox para ampliação de imagens nos markdowns.
- **Próximo Incremento a Executar**: **Incremento 4** (Seção de Referências & Motor Gemini: componente de rodapé enriquecido nos documentos com links automáticos para Vatican.va, Bíblia Online, CIC e Google Livros, além de função client-side integrada com a API Gemini para extração automática com conferência visual antes de salvar).

---

## 🧪 5. Como Testar o Incremento 3

1. Abra a **Base de Conhecimento** no site.
2. Na árvore lateral ou nos cards de pasta, teste os diferentes tipos de mídia:
   - **Áudio**: abra `Cântico das Criaturas (São Francisco de Assis)` na pasta *Eucaristia I > Módulo 1*. Teste os botões Play/Pause, avançar/retroceder 10s, mudar a velocidade para 1.25x ou 1.5x, arrastar o scrubber e o botão de download.
   - **Vídeo**: abra `Vídeo: A História dos Sacramentos da Iniciação Cristã` na pasta *Crisma Adultos*. Teste o player de vídeo, botão de tela cheia, controle de velocidade e download.
   - **Apresentação PPTX**: abra `Apresentação: O Fogo de Pentecostes` na pasta *Crisma Jovem*. Teste a renderização no Office Viewer, o botão "Alternar Visualizador" (Google Docs Viewer) e o botão "Tela Cheia".
   - **Imagens e Lightbox**: abra qualquer documento Markdown que possua imagem; clique na imagem para abrir o Lightbox ampliado com fundo escuro; feche clicando fora, no botão ✕ ou pressionando `Esc`.

---

## 🎯 6. Instruções para o Incremento 4 (Referências & Motor Gemini)

1. Implementar o motor de extração inteligente via **Google Gemini**:
   - Criar modal ou campo de configuração da API Key do Gemini no painel administrativo do site (armazenado com segurança no localStorage/Firestore).
   - Criar rotina client-side que envia o texto do documento para a API do Gemini com prompt estruturado para reconhecer:
     - Livro e versículos bíblicos (gerando link para `bibliaonline.com.br` ou Vaticano).
     - Parágrafos do Catecismo da Igreja Católica (CIC § ... com link direto).
     - Documentos, encíclicas e concílios do Vaticano (links para `vatican.va`).
     - Títulos de livros e autores recomendados (links para `google.com/search?tbm=bks&q=...`).
2. Permitir revisão visual das referências detectadas antes da publicação no documento.
