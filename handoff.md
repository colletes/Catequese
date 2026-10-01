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

- **Fase**: Incremento 2 Concluído com sucesso.
- **Roadmap**: Roteiro com 6 incrementos testáveis (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 2** (01/10/2026) — Persistência no Cloud Firestore (`knowledge_nodes`), serviço `knowledge-service.js`, cache offline local, atualização em tempo real (`onSnapshot`), regra de segurança no `firestore.rules` (leitura para catequistas autenticados, escrita para coordenação/admin) e botão de inicialização com merge construtivo.
- **Próximo Incremento a Executar**: **Incremento 3** (Visualizador Multimídia e Player Integrado: player nativo de áudio com scrubber e velocidade, player de vídeo responsivo, preview completo de apresentações PPTX e modal lightbox para imagens dos markdowns).

---

## 🧪 5. Como Testar o Incremento 2

1. Abra o site e faça login com seu e-mail pastoral ou Google.
2. Acesse a aba **Base de Conhecimento**.
3. Observe o badge no cabeçalho da Wiki:
   - Se conectado ao Firestore, exibe `☁️ Nuvem Firestore (X itens)` ou `☁️ Firestore Vazio`.
   - Se offline ou sem conexão, exibe `💾 Cache Local (X itens)`.
4. Se o Firestore estiver vazio e você for Master Admin (`colletes@gmail.com`) ou Coordenação (`lorenammoraes@gmail.com`), um banner dourado ou o botão `☁️ Sincronizar Firestore` permite enviar o acervo inicial com merge construtivo.
5. Ao sincronizar, verifique que os dados são salvos na coleção `knowledge_nodes` do Firestore e refletidos em tempo real em todas as sessões abertas.

---

## 🎯 6. Instruções para o Incremento 3 (Visualizador Multimídia)

1. Aprimorar a experiência de execução de arquivos multimídia no visualizador:
   - **Áudio**: reprodutor customizado com controle de velocidade (1x, 1.25x, 1.5x), barra de progresso interativa e download.
   - **Vídeo**: reprodutor responsivo com suporte a fullscreen e miniatura de capa.
   - **PPTX**: visualizador incorporado via iframe do Microsoft Office Online Viewer com link alternativo para download.
   - **Imagens**: lightbox modal ao clicar em qualquer imagem dentro de um documento Markdown para ampliação em alta resolução.
