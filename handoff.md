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
| `knowledge-base.js` | Módulo cliente da Wiki: gerenciamento da árvore, dados semente, navegação, filtros e Markdown. |
| `knowledge-base.css` | Folha de estilos da Wiki: layout Confluence, tipografia `.wiki-prose`, breadcrumbs e árvore. |
| `index.html` | SPA principal do site (contém a aplicação, estilos, layout e abas). |
| `firebase-config.js` | Configurações do Firebase, RBAC (roles e permissões), encriptação e chaves. |
| `firestore.rules` | Regras de segurança do Cloud Firestore. |
| `firebase.json` | Configurações do Firebase Hosting e Firestore. |
| `roadmap.md` | Roteiro oficial de incrementos testáveis e seus status. |
| `scripts/` | Diretório de utilitários e scripts de automação. |
| `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1` | Pasta local de origem no Mac com o acervo original de pastas e materiais. |

---

## 📊 4. Estado Atual do Projeto

- **Fase**: Incremento 1 Concluído com sucesso.
- **Roadmap**: Roteiro com 6 incrementos testáveis (ver [roadmap.md](file:///Users/thiagocarvalho/Public/Catequese/roadmap.md)).
- **Último Incremento Concluído**: **Incremento 1** (01/10/2026) — Interface Confluence no SPA, nova aba no menu e gaveta mobile, layout com sidebar em árvore recolhível/expansível, busca dinâmica, pílulas de filtro por Etapa, breadcrumbs clicáveis, dashboard de pastas com cards e leitor de Markdown estilizado com dados semente e seção inferior de referências bíblicas/vaticanas.
- **Próximo Incremento a Executar**: **Incremento 2** (Persistência Firestore & Regras de Acesso: serviço `knowledge-service.js`, coleção `knowledge_nodes`, cache offline e regras RBAC no `firestore.rules`).

---

## 🧪 5. Como Testar o Incremento 1

1. Abra o arquivo `index.html` no navegador (ou via servidor estático).
2. Clique no menu lateral (ou no card "Base de Conhecimento" na Página Inicial).
3. Verifique a nova aba **"Base de Conhecimento"**:
   - A árvore à esquerda exibe pastas com chevrons (expansíveis/recolhíveis).
   - O campo de busca interna filtra nós instantaneamente.
   - As pílulas de Etapa ("Todas", "Pré-Eucaristia", "Eucaristia I", etc.) filtram a árvore e as pastas.
   - Clicar em uma pasta exibe o dashboard com os cards dos itens filhos.
   - Clicar no documento *"Guia do Catequista 2026"* ou *"Encontro 01: Quem é Deus"* abre o leitor Markdown estilizado com tipografia do Santuário e os cards de referências do Vaticano e Bíblia no rodapé.
   - Clicar em itens de áudio, vídeo ou PPTX exibe seus respectivos visualizadores preliminares.

---

## 🎯 6. Instruções para o Incremento 2 (Persistência Firestore)

1. Criar o serviço `knowledge-service.js` para escutar e sincronizar nós da coleção `knowledge_nodes` do Firestore.
2. Manter fallback seguro: se o Firestore estiver vazio ou offline, carrega a estrutura padrão já demonstrada no `knowledge-base.js`.
3. Ajustar `firestore.rules` respeitando rigorosamente a governança de deploy (sempre merge construtivo, sem apagar coleções existentes).
4. Assegurar que qualquer catequista autenticado possa ler; criação e edição restritas a Coordenadores e Master Admin.
