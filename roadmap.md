# 🗺️ Roadmap de Implementação: Base de Conhecimento (Wiki da Catequese)

Este documento registra a quebra do projeto em **incrementos testáveis e de alto valor de entrega**. Cada incremento deve ser finalizado com verificação prática antes de avançar para o próximo.

---

## 📌 Status Geral dos Incrementos

| Incremento | Descrição | Status | Data de Conclusão |
| :---: | :--- | :---: | :---: |
| **Inc 1** | **Interface Confluence no SPA**: Nova aba, sidebar em árvore, leitor de Markdown com estilo visual do site e dados semente | 🟢 Concluído | 01/10/2026 |
| **Inc 2** | **Persistência Firestore & Regras de Acesso**: Serviço `knowledge-service.js`, schema de nós, cache e regras RBAC | 🟢 Concluído | 01/10/2026 |
| **Inc 3** | **Visualizador Multimídia**: Players embutidos de Áudio e Vídeo, visualizador de PPTX e lightbox de imagens | 🟡 Próximo (Em foco) | — |
| **Inc 4** | **Seção de Referências & Motor Gemini**: Identificação de citações bíblicas, CIC, Vaticano.va e Google Livros com revisão | ⚪ Aguardando Inc 3 | — |
| **Inc 5** | **Painel Web de Upload & Gestão**: Modal de upload (PDF/DOCX/mídias), conversão cliente e criação de pastas para Coordenação | ⚪ Aguardando Inc 4 | — |
| **Inc 6** | **Assistente Local do OneDrive**: Script Python com interface visual local para importação em lote da pasta `Catequese 1` | ⚪ Aguardando Inc 5 | — |

---

## 📋 Detalhamento dos Incrementos

### 🔹 Incremento 1: Interface Confluence no SPA (Navegação & Leitor)
- **Objetivo**: Disponibilizar imediatamente a experiência de usuário da Base de Conhecimento dentro do site existente.
- **Entregáveis**:
  - Novo item de menu "Base de Conhecimento" no cabeçalho do site e gaveta mobile.
  - Layout Confluence responsivo com:
    - Sidebar retrátil contendo árvore hierárquica de pastas e documentos com ícones por tipo.
    - Campo de busca instantânea filtrando a árvore em tempo real.
    - Filtro rápido por Etapa (Geral, Pré-Eucaristia, Eucaristia I, Crisma, etc.).
    - Barra de navegação com breadcrumbs (ex: `Base de Conhecimento > Eucaristia > Encontros > Encontro 01`).
    - Visão de pasta (grid/lista de pastas e arquivos filhos).
    - Visualizador de documento Markdown estilizado com a tipografia do site (Questrial, Nunito, cores esmeralda/dourado e tabelas responsivas).
  - Carga de dados inicial (mock/seed) estruturada com temas catequéticos reais para demonstração imediata.
- **Critérios de Aceite**:
  1. O usuário clica na aba "Base de Conhecimento" e a tela carrega sem erros de console.
  2. A sidebar permite expandir e recolher pastas.
  3. A busca filtra itens na árvore dinamicamente.
  4. Clicar em um documento renderiza o Markdown com títulos, listas, destaques e imagens responsivas.

---

### 🔹 Incremento 2: Persistência Firestore & Regras de Acesso (RBAC)
- **Objetivo**: Conectar a árvore de materiais ao Firestore oficial e proteger a leitura/escrita conforme as regras de negócio.
- **Entregáveis**:
  - Criação do serviço `knowledge-service.js` para operações de leitura da árvore (`knowledge_nodes`).
  - Sincronização em tempo real (onSnapshot com fallback offline).
  - Atualização do arquivo `firestore.rules` (conforme governança de deploy, sem sobrescrita destrutiva):
    - Leitura: liberada para todos os usuários autenticados.
    - Criação/Edição/Exclusão: restrita a perfis `master_admin`, `coord_geral`, `vice_coord_geral` e `coord_etapa`.
- **Critérios de Aceite**:
  1. Os nós da base de conhecimento são lidos diretamente do Firestore.
  2. Usuários não autenticados recebem aviso convidando ao login.
  3. Catequistas conseguem ler qualquer nó; botões de edição só aparecem para coordenadores/admin.

---

### 🔹 Incremento 3: Visualizador Multimídia e Player Integrado
- **Objetivo**: Permitir a execução de mídias de formação e estudo sem sair da plataforma.
- **Entregáveis**:
  - Reprodutor de áudio nativo integrado na área de conteúdo (com controle de velocidade, scrubber e download).
  - Reprodutor de vídeo responsivo compatível com MP4/WebM.
  - Visualizador de apresentações PPTX utilizando Microsoft Office Online Viewer embutido, com botão alternativo de download.
  - Modal/Lightbox para ampliação de imagens contidas nos documentos.
- **Critérios de Aceite**:
  1. Clicar em um item de áudio abre o player e permite reprodução imediata.
  2. Clicar em um item de vídeo abre o player responsivo com tela cheia.
  3. Clicar em um item PPTX renderiza a prévia da apresentação no iframe do Office Viewer.

---

### 🔹 Incremento 4: Seção de Referências & Motor Gemini
- **Objetivo**: Enriquecer documentos com fontes oficiais da Igreja e links para consulta externa.
- **Entregáveis**:
  - Componente de rodapé "Fontes e Referências Citadas" nos documentos:
    - Passagens Bíblicas com links formatados (Bíblia Online / Vaticano).
    - Catecismo da Igreja Católica (CIC) com link para os parágrafos no site do Vaticano.
    - Encíclicas, Concílio Vaticano II e Exortações com links para `vatican.va`.
    - Livros citados com link de busca no Google Livros.
  - Função client-side para chamar a API do Gemini (usando chave configurável no painel administrativo) para analisar textos e extrair referências estruturadas em JSON.
- **Critérios de Aceite**:
  1. Documentos exibem a seção de referências com cards estilizados e ícones categorizados.
  2. Os links abrem diretamente nas fontes corretas em nova aba.
  3. No modo de criação/edição, o botão "Detectar Referências via IA" preenche a lista para conferência visual.

---

### 🔹 Incremento 5: Painel Web de Upload & Gestão no Site
- **Objetivo**: Dar autonomia à coordenação para adicionar materiais diretamente pelo navegador.
- **Entregáveis**:
  - Botão flutuante ou na sidebar "+ Novo Material" e "+ Nova Pasta" (visível apenas para Coordenadores/Admin).
  - Modal de upload com suporte a arrastar e soltar (drag & drop) para PDF, DOCX, PPTX, áudios e vídeos.
  - Conversor DOCX/PDF no navegador com prévia do Markdown gerado.
  - Integração com o Firebase Storage para upload das mídias e imagens extraídas.
- **Critérios de Aceite**:
  1. Um coordenador autenticado consegue criar uma nova pasta.
  2. O coordenador pode subir um arquivo DOCX/PDF, ver a conversão em tempo real e confirmar a publicação no Firestore.

---

### 🔹 Incremento 6: Assistente Local de Ingestão em Lote (OneDrive)
- **Objetivo**: Viabilizar a importação rápida e seletiva de toda a biblioteca existente no Mac.
- **Entregáveis**:
  - Script Python `scripts/knowledge_importer.py` com servidor web local (`http://localhost:8080`).
  - Interface visual em árvore listando o conteúdo de `/Users/thiagocarvalho/Library/CloudStorage/OneDrive-Pessoal/Catequese 1`.
  - Checkboxes para seleção seletiva de pastas e arquivos.
  - Processamento em lote com extração de imagens, conversão para Markdown, envio para Firebase Storage e Firestore com merge construtivo.
- **Critérios de Aceite**:
  1. O usuário roda o script, abre a página local e visualiza a estrutura de pastas do OneDrive.
  2. Marca pastas de interesse e clica em "Importar Selecionados".
  3. Os arquivos selecionados aparecem imediatamente na Base de Conhecimento do site online.
