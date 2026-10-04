/**
 * PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
 * Módulo: Base de Conhecimento (Wiki Confluence)
 * Arquivo: knowledge-base.js
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CARGA SEMENTE INICIAL (MOCK DATA CATEQUÉTICO OFICIAL)
  // Estrutura hierárquica baseada nos temas reais do Santuário ICM
  // ==========================================================================
  const INITIAL_WIKI_NODES = [
    // --- DIRETRIZES GERAIS ---
    {
      id: 'dir-geral',
      parentId: null,
      path: [],
      title: 'Diretrizes e Orientações Gerais',
      type: 'folder',
      etapa: 'Geral',
      description: 'Normas pastorais, metodologia de acolhida, orações litúrgicas e cronograma oficial.',
      order: 1
    },
    {
      id: 'doc-guia-catequista',
      parentId: 'dir-geral',
      path: ['dir-geral'],
      title: 'Guia do Catequista 2026: Metodologia e Missão',
      type: 'document',
      extension: 'md',
      etapa: 'Geral',
      order: 1,
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-09-15T14:30:00Z',
      createdBy: { name: 'Coordenação Geral', email: 'lorenammoraes@gmail.com' },
      contentMarkdown: `# Guia Oficial do Catequista 2026
## Santuário Imaculado Coração de Maria — Brasília/DF

A missão do catequista não é apenas transmitir conteúdos doutrinais, mas **propiciar uma experiência viva e transformadora com a Pessoa de Jesus Cristo**.

---

### 1. Estrutura Padrão de um Encontro (1h30)

Cada encontro catequético deve seguir uma pedagogia do acolhimento e da oração, dividindo-se harmoniosamente em quatro tempos:

1. **Acolhida & Integração (15 min):** Recepção calorosa na porta da sala, oração inicial espontânea e dinâmica rápida de interação.
2. **Iluminação Bíblica (25 min):** Leitura orante da Palavra de Deus (*Lectio Divina* simplificada para a idade).
3. **Aprofundamento Catequético (30 min):** Diálogo construtivo sobre o tema da semana, exemplos práticos do cotidiano e síntese da fé.
4. **Oração Final & Compromisso da Semana (20 min):** Momento de recolhimento diante do altar da sala, preces pelos familiares e partilha do gesto concreto.

---

### 2. Cuidados com a Linguagem e Metodologia

> *"A catequese é um caminho de comunhão e amadurecimento na fé, onde o catequista é testemunha alegre do Evangelho."*  
> — **Diretório para a Catequese, n. 113**

* Utilize recursos visuais, mapas e dinâmicas condizentes com a faixa etária.
* Promova a participação de todos os catequizandos, acolhendo suas dúvidas com carinho e paciência.
* Mantenha a pontualidade rigorosa para respeitar o tempo das famílias.

---

### 3. Tabela de Etapas e Faixas Etárias da Paróquia

| Etapa | Faixa Etária | Horários de Encontro | Coordenador(a) |
| :--- | :---: | :--- | :--- |
| **Pré-Eucaristia** | 7 a 8 anos | Sábado 8h30 e Sábado 15h00 | Patrícia Guimarães |
| **Eucaristia I** | 9 a 10 anos | Sábado 8h30 | Marilian / Priscila |
| **Eucaristia II** | 10 a 11 anos | Sábado 8h30 | Marilian / Priscila |
| **Perseverança** | Até 13 anos | Sábado 8h30 e Sábado 15h00 | Andrés Unda |
| **Crisma Jovem** | 13 a 17 anos | Sábado 15h00 | Tiago Artur / Ricardo |
| **Crisma Adultos** | +18 anos | Segunda 20h00 e Quarta 16h00 | Daniel / Patrícia Gomes |
`,
      references: [
        {
          type: 'biblia',
          citation: 'Mt 28, 19-20',
          description: 'A Grande Comissão Missionária: "Ide e fazei discípulos de todas as nações..."',
          url: 'https://www.bibliaonline.com.br/nvi/mt/28/19-20'
        },
        {
          type: 'cic',
          citation: 'CIC § 4-9',
          description: 'A Catequese na Missão da Igreja e sua Tradição Viva',
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/prologo-cic_po.html'
        },
        {
          type: 'vaticano',
          citation: 'Exortação Apostólica Catechesi Tradendae',
          description: 'São João Paulo II sobre a catequese em nosso tempo',
          url: 'https://www.vatican.va/content/john-paul-ii/pt/apost_exhortations/documents/hf_jp-ii_exh_16101979_catechesi-tradendae.html'
        },
        {
          type: 'livro',
          citation: 'Diretório para a Catequese (Pontifício Conselho)',
          description: 'Diretrizes oficiais da Santa Sé para a nova evangelização',
          url: 'https://www.google.com/search?tbm=bks&q=Diretorio+para+a+Catequese+Pontificio+Conselho'
        }
      ]
    },
    {
      id: 'doc-oracao-liturgia',
      parentId: 'dir-geral',
      path: ['dir-geral'],
      title: 'Orações e Ritos Iniciais para os Encontros',
      type: 'document',
      extension: 'md',
      etapa: 'Geral',
      order: 2,
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
      createdBy: { name: 'Vice-Coordenação', email: 'andresprojetos@gmail.com' },
      contentMarkdown: `# Orações e Ritos Iniciais para os Encontros de Catequese

Iniciar cada encontro invocando o Espírito Santo cria o clima sagrado indispensável para a escuta da Palavra.

### 🕊️ Oração ao Espírito Santo
*Vinde, Espírito Santo, enchei os corações dos vossos fiéis e acendei neles o fogo do vosso amor.  
Enviai o vosso Espírito e tudo será criado, e renovareis a face da terra.*

**Oremos:** *Ó Deus, que instruístes os corações dos vossos fiéis com a luz do Espírito Santo, fazei que apreciemos retamente todas as coisas segundo o mesmo Espírito e gozemos sempre da sua consolação. Por Cristo, Senhor nosso. Amém.*

---

### 🌹 Oração ao Imaculado Coração de Maria (Padroeira do Santuário)
*Ó Coração Imaculado de Maria, repleto de bondade e amor, sede vós a nossa guia e luz no caminho da fé. Ensinai-nos a ouvir a Palavra de vosso Filho Jesus, guardá-la no coração e colocá-la em prática em nosso lar, na escola e na paróquia. Amém.*
`,
      references: [
        {
          type: 'cic',
          citation: 'CIC § 2673-2679',
          description: 'A Oração a Maria e a Comunhão dos Santos',
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/p4s1c2_po.html'
        }
      ]
    },

    // --- EUCARISTIA I ---
    {
      id: 'dir-eucaristia-1',
      parentId: null,
      path: [],
      title: 'Eucaristia I (9 a 10 anos)',
      type: 'folder',
      etapa: 'Eucaristia I',
      description: 'Módulos didáticos, encontros sobre a Criação, a Bíblia, a vida de Jesus e os Mandamentos.',
      order: 2
    },
    {
      id: 'dir-euc1-mod1',
      parentId: 'dir-eucaristia-1',
      path: ['dir-eucaristia-1'],
      title: 'Módulo 1: Deus Criador e a Aliança de Amor',
      type: 'folder',
      etapa: 'Eucaristia I',
      description: 'A criação do mundo, a dignidade dos filhos de Deus e a história da Salvação.',
      order: 1
    },
    {
      id: 'doc-euc1-enc1',
      parentId: 'dir-euc1-mod1',
      path: ['dir-eucaristia-1', 'dir-euc1-mod1'],
      title: 'Encontro 01: Quem é Deus e a Criação do Mundo',
      type: 'document',
      extension: 'md',
      etapa: 'Eucaristia I',
      order: 1,
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-09-10T16:00:00Z',
      createdBy: { name: 'Marilian & Priscila Ayres', email: 'eucaristia@icm.org' },
      contentMarkdown: `# Encontro 01: Quem é Deus e a Criação do Mundo
**Etapa:** Eucaristia I • Crianças de 9 a 10 anos

### 🎯 Objetivo do Encontro
Descobrir que Deus é Pai, Criador de todo o Universo, e que Ele criou o ser humano por puro amor para viver em amizade com a natureza e os irmãos.

---

### 📖 Iluminação Bíblica
> *"No princípio, Deus criou o céu e a terra... E Deus viu tudo o que havia feito, e era muito bom!"*  
> — **Gênesis 1, 1.31**

---

### 💬 Roteiro de Conversa com as Crianças
1. **Pergunta disparadora:** *"Quando você olha para o céu estrelado, para as árvores ou para o mar, o que você sente?"*
2. **Explicação:** Toda a beleza da natureza é um presente de amor de Deus para nós. Ele é o Pai bom que cuida de tudo com carinho.
3. **Cuidado com a Casa Comum:** O Papa Francisco na encíclica *Laudato Si'* nos ensina que a Terra é nossa casa e precisamos cuidar das plantas, dos animais e do desperdício de água.

---

### 🎨 Atividade Prática Proposta
Distribuir folhas para desenho onde cada catequizando desenha um elemento da criação pelo qual é mais grato (família, animais, sol, rios). No final, colar os desenhos em um mural coletivo na Sala de Catequese.
`,
      references: [
        {
          type: 'biblia',
          citation: 'Gn 1, 1-31',
          description: 'A narrativa da Criação e a bondade divina',
          url: 'https://www.bibliaonline.com.br/nvi/gn/1'
        },
        {
          type: 'biblia',
          citation: 'Sl 8, 4-10',
          description: 'Salmo da Criação: "A majestade de Deus e a grandeza do homem"',
          url: 'https://www.bibliaonline.com.br/nvi/sl/8'
        },
        {
          type: 'vaticano',
          citation: 'Encíclica Laudato Si’ (Papa Francisco)',
          description: 'Sobre o cuidado da casa comum e o valor sagrado da Criação',
          url: 'https://www.vatican.va/content/francesco/pt/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html'
        },
        {
          type: 'cic',
          citation: 'CIC § 279-301',
          description: 'A Criação: Obra da Santíssima Trindade',
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/p1s2c1p4_po.html'
        }
      ]
    },
    {
      id: 'doc-euc1-enc2',
      parentId: 'dir-euc1-mod1',
      path: ['dir-eucaristia-1', 'dir-euc1-mod1'],
      title: 'Encontro 02: A Bíblia — Carta de Deus para Nós',
      type: 'document',
      extension: 'md',
      etapa: 'Eucaristia I',
      order: 2,
      createdAt: '2026-03-08T09:00:00Z',
      updatedAt: '2026-09-12T11:00:00Z',
      createdBy: { name: 'Marilian', email: 'eucaristia@icm.org' },
      contentMarkdown: `# Encontro 02: A Bíblia — A Carta de Deus para Nós

### 🎯 Objetivo do Encontro
Ensinar as crianças a manusear a Bíblia, entender a divisão entre Antigo e Novo Testamento e localizar capítulos e versículos com facilidade.

### 📚 Curiosidades Bíblicas
* A palavra **Bíblia** vem do grego e significa *"conjunto de livros"*.
* São **73 livros** na Bíblia Católica (46 no Antigo Testamento e 27 no Novo Testamento).
* O centro de toda a Bíblia é **Jesus Cristo**, revelado nos quatro Santos Evangelhos: Mateus, Marcos, Lucas e João.

---

### 🔍 Como Localizar um Trecho:
Tomemos o exemplo: **Mt 5, 1-12**
- **Mt:** Livro de Mateus (abreviação oficial).
- **5:** Capítulo (número grande no texto).
- **, (vírgula):** Separa o capítulo dos versículos.
- **1-12:** Versículos do 1 até o 12.
`,
      references: [
        {
          type: 'biblia',
          citation: '2Tm 3, 16-17',
          description: '"Toda a Escritura é divinamente inspirada e proveitosa para ensinar..."',
          url: 'https://www.bibliaonline.com.br/nvi/2tm/3/16-17'
        },
        {
          type: 'vaticano',
          citation: 'Constituição Dogmática Dei Verbum (Vaticano II)',
          description: 'A Revelação Divina e a transmissão da Palavra de Deus',
          url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_po.html'
        }
      ]
    },
    {
      id: 'media-euc1-cantico',
      parentId: 'dir-euc1-mod1',
      path: ['dir-eucaristia-1', 'dir-euc1-mod1'],
      title: 'Cântico das Criaturas — São Francisco de Assis',
      type: 'media',
      extension: 'mp3',
      etapa: 'Eucaristia I',
      order: 3,
      createdAt: '2026-03-01T10:00:00Z',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      fileSizeBytes: 4200000,
      description: 'Áudio pastoral para cantar e orar com as crianças na Sala de Catequese ao falar sobre a Criação.'
    },

    // --- CRISMA JOVEM ---
    {
      id: 'dir-crisma-jovem',
      parentId: null,
      path: [],
      title: 'Crisma Jovem (13 a 17 anos)',
      type: 'folder',
      etapa: 'Crisma Jovem',
      description: 'Encontros de aprofundamento, os Dons do Espírito Santo, Doutrina Social e Projeto de Vida Cristã.',
      order: 3
    },
    {
      id: 'dir-crisma-dons',
      parentId: 'dir-crisma-jovem',
      path: ['dir-crisma-jovem'],
      title: 'Módulo: Os Dons do Espírito Santo',
      type: 'folder',
      etapa: 'Crisma Jovem',
      description: 'Os sete dons da Confirmação e sua aplicação nos desafios da juventude.',
      order: 1
    },
    {
      id: 'doc-crisma-sete-dons',
      parentId: 'dir-crisma-dons',
      path: ['dir-crisma-jovem', 'dir-crisma-dons'],
      title: 'Os 7 Dons do Espírito Santo na Vida Cotidiana',
      type: 'document',
      extension: 'md',
      etapa: 'Crisma Jovem',
      order: 1,
      createdAt: '2026-04-10T14:00:00Z',
      updatedAt: '2026-09-18T18:00:00Z',
      createdBy: { name: 'Tiago Artur & Ricardo', email: 'crisma.jovem@icm.org' },
      contentMarkdown: `# Os 7 Dons do Espírito Santo na Vida Cotidiana
**Pastoral da Crisma Jovem • Santuário ICM**

O Sacramento da Crisma confirma e aperfeiçoa a graça batismal, concedendo-nos a força do **Espírito Santo** para sermos verdadeiras testemunhas de Cristo no mundo.

---

### 🔥 Os 7 Dons Infusos da Graça:

1. **Sabedoria:** O dom de saborear as coisas de Deus e enxergar a vida com os olhos do Pai.
2. **Entendimento (ou Inteligência):** Ajuda a compreender as verdades profundas da fé e a mensagem de Jesus.
3. **Conselho:** Capacidade de discernir o caminho certo nos momentos de decisão moral e pressão social.
4. **Fortaleza:** Coragem sobrenatural para superar medos, rejeições e perseverar no bem.
5. **Ciência:** Compreensão do valor das criaturas em relação ao Criador.
6. **Piedade:** Filial confiança em Deus e compaixão sincera pelos irmãos mais necessitados.
7. **Temor de Deus:** Santo respeito pelo Criador, não por medo de castigo, mas por profundo amor de não ofender a quem tanto nos ama.

---

### 💡 Questões para Roda de Conversa:
* Em quais situações na escola ou nas redes sociais você já precisou do dom da **Fortaleza**?
* Como o dom do **Conselho** pode te ajudar na escolha da sua vocação e profissão?
`,
      references: [
        {
          type: 'biblia',
          citation: 'Is 11, 1-3',
          description: 'A profecia sobre os dons do Espírito de Javé sobre o Messias',
          url: 'https://www.bibliaonline.com.br/nvi/is/11/1-3'
        },
        {
          type: 'biblia',
          citation: '1Cor 12, 4-11',
          description: 'A diversidade de dons espirituais e o mesmo Espírito',
          url: 'https://www.bibliaonline.com.br/nvi/1co/12/4-11'
        },
        {
          type: 'cic',
          citation: 'CIC § 1285-1321',
          description: 'O Sacramento da Confirmação: Efeitos e Ministração',
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/p2s2c1a2_po.html'
        },
        {
          type: 'vaticano',
          citation: 'Exortação Christus Vivit (Papa Francisco)',
          description: 'Exortação apostólica aos jovens e a todo o povo de Deus',
          url: 'https://www.vatican.va/content/francesco/pt/apost_exhortations/documents/papa-francesco_esortazione-ap_20190325_christus-vivit.html'
        }
      ]
    },
    {
      id: 'pres-crisma-pentecostes',
      parentId: 'dir-crisma-dons',
      path: ['dir-crisma-jovem', 'dir-crisma-dons'],
      title: 'Apresentação: O Fogo de Pentecostes e a Missão Jovem',
      type: 'presentation',
      extension: 'pptx',
      etapa: 'Crisma Jovem',
      order: 2,
      createdAt: '2026-04-12T15:00:00Z',
      mediaUrl: 'https://imaculadocoracaodf.com.br/materiais/crisma_pentecostes_2026.pptx',
      fileSizeBytes: 8500000,
      description: 'Slides com ilustrações dinâmicas, passagens dos Atos dos Apóstolos e testemunhos juvenis.'
    },

    // --- CRISMA ADULTOS ---
    {
      id: 'dir-crisma-adultos',
      parentId: null,
      path: [],
      title: 'Crisma Adultos (+18 anos)',
      type: 'folder',
      etapa: 'Crisma Adultos',
      description: 'Formação madura sobre a fé católica, moral, sacramentos e a missão dos leigos na sociedade.',
      order: 4
    },
    {
      id: 'doc-adul-confirmacao',
      parentId: 'dir-crisma-adultos',
      path: ['dir-crisma-adultos'],
      title: 'O Sacramento da Confirmação e a Fé Madura',
      type: 'document',
      extension: 'md',
      etapa: 'Crisma Adultos',
      order: 1,
      createdAt: '2026-05-02T19:00:00Z',
      updatedAt: '2026-09-01T20:00:00Z',
      createdBy: { name: 'Daniel & Patrícia Gomes', email: 'crisma.adultos@icm.org' },
      contentMarkdown: `# O Sacramento da Confirmação e a Fé Madura
**Pastoral da Crisma de Adultos • Santuário ICM**

O adulto que procura a Crisma expressa um desejo consciente de ratificar as promessas que, no Batismo, foram assumidas pelos pais e padrinhos.

---

### 🕊️ Os Três Sacramentos da Iniciação Cristã
1. **Batismo:** Porta de entrada da vida na graça, perdão do pecado original e nascimento como filho de Deus.
2. **Confirmação:** Consolidação e selamento do Espírito Santo com o óleo santo do Crisma consagrado na Quinta-feira Santa.
3. **Eucaristia:** Banquete pascal, cume e fonte de toda a vida da Igreja.

---

### 🏛️ O Enraizamento no Concílio Vaticano II
Na Constituição Dogmática *Lumen Gentium*, os padres conciliares destacam:
> *"Pelo sacramento da Confirmação, os fiéis são vinculados mais perfeitamente à Igreja, enriquecidos com especial força do Espírito Santo, e deste modo ficam mais estritamente obrigados a difundir e defender a fé por palavras e obras como verdadeiras testemunhas de Cristo."*  
> — **Lumen Gentium, n. 11**
`,
      references: [
        {
          type: 'vaticano',
          citation: 'Constituição Dogmática Lumen Gentium',
          description: 'Concílio Vaticano II sobre a Igreja e a dignidade do Povo de Deus',
          url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19641121_lumen-gentium_po.html'
        },
        {
          type: 'cic',
          citation: 'CIC § 1285',
          description: 'A necessidade da Confirmação para o cumprimento da graça batismal',
          url: 'https://www.vatican.va/archive/cathechism_po/index_new/p2s2c1a2_po.html#1285'
        }
      ]
    },
    {
      id: 'media-adul-video-historia',
      parentId: 'dir-crisma-adultos',
      path: ['dir-crisma-adultos'],
      title: 'Vídeo: A História dos Sacramentos da Iniciação Cristã',
      type: 'media',
      extension: 'mp4',
      etapa: 'Crisma Adultos',
      order: 2,
      createdAt: '2026-05-15T20:30:00Z',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      fileSizeBytes: 15800000,
      description: 'Breve documentário sobre como os primeiros cristãos celebravam o Batismo, a Crisma e a Eucaristia.'
    }
  ];

  // ==========================================================================
  // 2. ESTADO DA BASE DE CONHECIMENTO
  // ==========================================================================
  window.WikiKB = {
    nodes: JSON.parse(JSON.stringify(INITIAL_WIKI_NODES)),
    activeNodeId: 'dir-geral',
    activeEtapaFilter: 'all',
    searchQuery: '',
    expandedFolders: new Set(['dir-geral', 'dir-eucaristia-1', 'dir-euc1-mod1', 'dir-crisma-jovem', 'dir-crisma-adultos']),
    sidebarCollapsedMobile: false,
    cloudConnected: false,
    isFirestoreEmpty: false,
    isSyncing: false,
    hasInitializedListener: false,

    // Inicialização do módulo
    init: function () {
      console.log('📚 WikiKB: Inicializando Base de Conhecimento...');
      
      // Carrega cache local se disponível
      if (window.KnowledgeService && typeof window.KnowledgeService.getLocalCache === 'function') {
        const cached = window.KnowledgeService.getLocalCache();
        if (cached && cached.length > 0) {
          this.nodes = cached;
        }
      }

      this.renderTree();
      this.selectNode(this.activeNodeId);
      this.setupEventListeners();
      this.setupCloudSync();
      this.updateAdminActionsVisibility();
    },

    updateAdminActionsVisibility: function () {
      const canEdit = window.KnowledgeService && typeof window.KnowledgeService.canEdit === 'function' ? window.KnowledgeService.canEdit() : false;
      const isMaster = window.KnowledgeService && typeof window.KnowledgeService.isMasterAdmin === 'function' ? window.KnowledgeService.isMasterAdmin() : false;

      const btnSync = document.getElementById('btn-wiki-sync-seed');
      if (btnSync) {
        if (canEdit) btnSync.classList.remove('hidden');
        else btnSync.classList.add('hidden');
      }

      // Importação de arquivo de carga em lote: EXCLUSIVO MASTER ADMIN
      const btnImportSeed = document.getElementById('btn-wiki-import-seed');
      if (btnImportSeed) {
        if (isMaster) btnImportSeed.classList.remove('hidden');
        else btnImportSeed.classList.add('hidden');
      }
    },

    setupCloudSync: function () {
      if (this.hasInitializedListener) return;
      if (!window.KnowledgeService || typeof window.KnowledgeService.listenNodes !== 'function') return;

      this.hasInitializedListener = true;
      this.updateCloudStatusBadge('connecting');

      window.KnowledgeService.listenNodes(
        (remoteNodes, isOnline, isFirestoreEmpty) => {
          this.cloudConnected = isOnline;
          this.isFirestoreEmpty = !!isFirestoreEmpty;

          if (isOnline && remoteNodes && remoteNodes.length > 0) {
            this.nodes = remoteNodes;
            this.updateCloudStatusBadge('cloud', remoteNodes.length);
          } else if (isOnline && isFirestoreEmpty) {
            this.updateCloudStatusBadge('empty', 0);
          } else {
            this.updateCloudStatusBadge('offline', this.nodes.length);
          }

          this.updateAdminActionsVisibility();
          this.renderTree();

          // Garante re-renderização suave da tela ativa
          const current = this.getNode(this.activeNodeId);
          if (current) {
            this.selectNode(this.activeNodeId);
          } else {
            this.selectNode('dir-geral');
          }
        },
        err => {
          this.cloudConnected = false;
          this.updateCloudStatusBadge('offline', this.nodes.length);
        }
      );
    },

    updateCloudStatusBadge: function (status, count) {
      const badge = document.getElementById('wiki-cloud-status-badge');
      if (!badge) return;

      if (status === 'cloud') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Nuvem Firestore (${count} itens)</span>`;
      } else if (status === 'empty') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Firestore Vazio</span>`;
      } else if (status === 'syncing') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span><span>Sincronizando Nuvem...</span>`;
      } else if (status === 'connecting') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span><span>Conectando Firestore...</span>`;
      } else {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span>Cache Local (${count || this.nodes.length} itens)</span>`;
      }
    },

    syncSeedToFirestore: async function () {
      if (!window.KnowledgeService || !window.KnowledgeService.canEdit()) {
        alert('Acesso restrito à Coordenação Geral e Master Admin para sincronizar a base no banco de dados.');
        return;
      }

      const proceed = confirm(
        '🌱 Sincronização do Acervo Oficial da Catequese\n\n' +
        'Deseja enviar a estrutura completa de pastas, diretrizes e encontros para o Cloud Firestore?\n\n' +
        '• Estratégia de Merge Construtivo: grava os registros preservando dados já existentes sem perda de informação.\n' +
        '• Total de nós semente: ' + INITIAL_WIKI_NODES.length + ' pastas e materiais.'
      );
      if (!proceed) return;

      try {
        this.isSyncing = true;
        this.updateCloudStatusBadge('syncing');
        await window.KnowledgeService.seedToFirestore(INITIAL_WIKI_NODES);
        alert('✅ Acervo da Catequese sincronizado com sucesso no Cloud Firestore!');
        this.isFirestoreEmpty = false;
      } catch (err) {
        console.error('Erro na sincronização:', err);
        alert('❌ Não foi possível sincronizar no momento:\n' + err.message);
        this.updateCloudStatusBadge('cloud', this.nodes.length);
      } finally {
        this.isSyncing = false;
      }
    },

    // Retorna nó por ID
    getNode: function (id) {
      return this.nodes.find(n => n.id === id);
    },

    // Retorna filhos imediatos de um nó
    getChildren: function (parentId) {
      return this.nodes
        .filter(n => n.parentId === parentId)
        .sort((a, b) => (a.order || 99) - (b.order || 99) || a.title.localeCompare(b.title));
    },

    // Retorna a trilha ancestral completa para breadcrumbs
    getAncestors: function (nodeId) {
      const trail = [];
      let curr = this.getNode(nodeId);
      while (curr) {
        trail.unshift(curr);
        curr = curr.parentId ? this.getNode(curr.parentId) : null;
      }
      return trail;
    },

    // ========================================================================
    // 3. SELEÇÃO E NAVEGAÇÃO DE NÓS
    // ========================================================================
    selectNode: function (nodeId) {
      const node = this.getNode(nodeId);
      if (!node) {
        // Fallback para raiz
        this.renderFolderDashboard(null);
        return;
      }

      this.activeNodeId = nodeId;

      // Garante que todos os pais do nó selecionado estejam expandidos
      let pId = node.parentId;
      while (pId) {
        this.expandedFolders.add(pId);
        const pNode = this.getNode(pId);
        pId = pNode ? pNode.parentId : null;
      }

      this.renderTree();
      this.renderBreadcrumbs(node);

      if (node.type === 'folder') {
        this.renderFolderDashboard(node);
      } else if (node.type === 'document') {
        this.renderDocumentViewer(node);
      } else {
        this.renderMediaViewer(node);
      }

      // Em telas mobile, recolhe suavemente a sidebar se selecionou um documento
      if (window.innerWidth < 768 && node.type !== 'folder') {
        const treeCol = document.getElementById('wiki-tree-column');
        if (treeCol && !treeCol.classList.contains('hidden')) {
          this.toggleMobileSidebar(false);
        }
      }
    },

    toggleFolder: function (folderId, event) {
      if (event) event.stopPropagation();
      if (this.expandedFolders.has(folderId)) {
        this.expandedFolders.delete(folderId);
      } else {
        this.expandedFolders.add(folderId);
      }
      this.renderTree();
    },

    expandAll: function () {
      this.nodes.filter(n => n.type === 'folder').forEach(f => this.expandedFolders.add(f.id));
      this.renderTree();
    },

    collapseAll: function () {
      this.expandedFolders.clear();
      this.renderTree();
    },

    setEtapaFilter: function (etapa) {
      this.activeEtapaFilter = etapa;
      // Atualiza botões visuais das pílulas
      document.querySelectorAll('.wiki-etapa-pill').forEach(btn => {
        if (btn.getAttribute('data-etapa') === etapa) {
          btn.className = 'wiki-etapa-pill px-3 py-1 rounded-full text-xs font-bold bg-[#064e3b] text-white shadow-xs border border-emerald-700 transition flex-shrink-0';
        } else {
          btn.className = 'wiki-etapa-pill px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs transition flex-shrink-0';
        }
      });
      this.renderTree();
      // Atualiza visualização atual se estiver em pasta
      const current = this.getNode(this.activeNodeId);
      if (current && current.type === 'folder') {
        this.renderFolderDashboard(current);
      }
    },

    handleSearch: function (query) {
      this.searchQuery = (query || '').trim().toLowerCase();
      const clearBtn = document.getElementById('wiki-search-clear-btn');
      if (clearBtn) {
        if (this.searchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }

      // Se houver busca ativa, expande automaticamente os nós encontrados
      if (this.searchQuery) {
        this.nodes.forEach(n => {
          const matchTitle = (n.title || '').toLowerCase().includes(this.searchQuery);
          const matchContent = (n.contentMarkdown || '').toLowerCase().includes(this.searchQuery);
          if (matchTitle || matchContent) {
            let p = n.parentId;
            while (p) {
              this.expandedFolders.add(p);
              const pNode = this.getNode(p);
              p = pNode ? pNode.parentId : null;
            }
          }
        });
      }

      this.renderTree();
    },

    clearSearch: function () {
      const input = document.getElementById('wiki-search-input');
      if (input) input.value = '';
      this.handleSearch('');
    },

    // ========================================================================
    // 4. RENDERIZAÇÃO DA ÁRVORE LATERAL (SIDEBAR TREE)
    // ========================================================================
    renderTree: function () {
      const container = document.getElementById('wiki-tree-container');
      if (!container) return;

      const rootNodes = this.getChildren(null);
      let html = '';

      if (rootNodes.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-400 text-xs">
            Nenhuma pasta ou documento encontrado.
          </div>
        `;
        return;
      }

      html = this.buildTreeHtml(null);
      container.innerHTML = html;
    },

    buildTreeHtml: function (parentId) {
      let children = this.getChildren(parentId);

      // Filtro por Etapa se ativo
      if (this.activeEtapaFilter !== 'all') {
        children = children.filter(c => {
          if (c.etapa === this.activeEtapaFilter || c.etapa === 'Geral') return true;
          // Se for pasta, checa se tem filhos da etapa selecionada
          if (c.type === 'folder') {
            return this.hasDescendantWithEtapa(c.id, this.activeEtapaFilter);
          }
          return false;
        });
      }

      // Filtro por Busca se ativa
      if (this.searchQuery) {
        children = children.filter(c => {
          const matchSelf = (c.title || '').toLowerCase().includes(this.searchQuery) ||
                            (c.contentMarkdown || '').toLowerCase().includes(this.searchQuery);
          if (matchSelf) return true;
          if (c.type === 'folder') {
            return this.hasDescendantMatchingSearch(c.id, this.searchQuery);
          }
          return false;
        });
      }

      if (children.length === 0) return '';

      let html = `<ul class="${parentId ? 'tree-children-container space-y-0.5 mt-0.5' : 'space-y-1'}">`;

      for (const node of children) {
        const isFolder = node.type === 'folder';
        const isExpanded = this.expandedFolders.has(node.id);
        const isActive = this.activeNodeId === node.id;
        const icon = this.getNodeIcon(node, isExpanded);

        const subChildren = isFolder ? this.getChildren(node.id) : [];
        const hasChildren = isFolder && subChildren.length > 0;

        let badgeHtml = '';
        if (node.etapa && node.etapa !== 'Geral') {
          badgeHtml = `<span class="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200/80 ml-auto flex-shrink-0">${node.etapa}</span>`;
        }

        html += `
          <li class="select-none">
            <div
              onclick="window.WikiKB.selectNode('${node.id}')"
              class="tree-node-item flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs transition border border-transparent ${isActive ? 'active-node' : 'text-slate-700'}"
              title="${node.title}"
            >
              ${isFolder ? `
                <button
                  type="button"
                  onclick="window.WikiKB.toggleFolder('${node.id}', event)"
                  class="w-5 h-5 flex items-center justify-center rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition tree-chevron ${isExpanded ? 'expanded' : ''}"
                  title="${isExpanded ? 'Recolher pasta' : 'Expandir pasta'}"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
              ` : `
                <span class="w-5 flex items-center justify-center text-slate-300 text-[10px]">•</span>
              `}

              <span class="text-sm flex-shrink-0">${icon}</span>

              <span class="tree-node-title truncate flex-1 font-medium ${isActive ? 'font-bold' : ''}">
                ${this.highlightMatch(node.title, this.searchQuery)}
              </span>

              ${badgeHtml}
            </div>

            ${isFolder && isExpanded && hasChildren ? this.buildTreeHtml(node.id) : ''}
          </li>
        `;
      }

      html += '</ul>';
      return html;
    },

    hasDescendantWithEtapa: function (folderId, etapa) {
      const children = this.getChildren(folderId);
      for (const c of children) {
        if (c.etapa === etapa || c.etapa === 'Geral') return true;
        if (c.type === 'folder' && this.hasDescendantWithEtapa(c.id, etapa)) return true;
      }
      return false;
    },

    hasDescendantMatchingSearch: function (folderId, q) {
      const children = this.getChildren(folderId);
      for (const c of children) {
        if ((c.title || '').toLowerCase().includes(q) || (c.contentMarkdown || '').toLowerCase().includes(q)) return true;
        if (c.type === 'folder' && this.hasDescendantMatchingSearch(c.id, q)) return true;
      }
      return false;
    },

    getNodeIcon: function (node, isExpanded) {
      if (node.type === 'folder') {
        return isExpanded ? '📂' : '📁';
      }
      if (node.type === 'presentation') return '📊';
      if (node.type === 'media') {
        if (node.extension === 'mp4' || node.extension === 'mov') return '🎬';
        return '🎵';
      }
      return '📄';
    },

    highlightMatch: function (text, query) {
      if (!query) return text;
      const idx = text.toLowerCase().indexOf(query);
      if (idx === -1) return text;
      return text.substring(0, idx) +
        `<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">` +
        text.substring(idx, idx + query.length) +
        `</mark>` +
        text.substring(idx + query.length);
    },

    // ========================================================================
    // 5. BREADCRUMBS
    // ========================================================================
    renderBreadcrumbs: function (node) {
      const container = document.getElementById('wiki-breadcrumbs-container');
      if (!container) return;

      const ancestors = this.getAncestors(node.id);
      let html = `
        <button
          onclick="window.WikiKB.selectNode(null)"
          class="hover:text-emerald-700 transition flex items-center gap-1 font-bold text-slate-700"
        >
          <span>🏛️</span>
          <span>Base de Conhecimento</span>
        </button>
      `;

      ancestors.forEach((anc, i) => {
        const isLast = i === ancestors.length - 1;
        html += `
          <span class="text-slate-300">/</span>
          ${isLast ? `
            <span class="font-bold text-slate-900 truncate max-w-[240px] sm:max-w-none" title="${anc.title}">
              ${anc.title}
            </span>
          ` : `
            <button
              onclick="window.WikiKB.selectNode('${anc.id}')"
              class="hover:text-emerald-700 transition truncate max-w-[140px] sm:max-w-none text-slate-600"
              title="${anc.title}"
            >
              ${anc.title}
            </button>
          `}
        `;
      });

      container.innerHTML = html;
    },

    // ========================================================================
    // 6. VISÃO DE PASTA (DASHBOARD COM CARDS DOS FILHOS)
    // ========================================================================
    renderFolderDashboard: function (folderNode) {
      const viewer = document.getElementById('wiki-content-viewer');
      if (!viewer) return;

      const isRoot = !folderNode;
      const folderId = folderNode ? folderNode.id : null;
      let children = this.getChildren(folderId);

      // Aplica filtros se ativos
      if (this.activeEtapaFilter !== 'all') {
        children = children.filter(c => c.etapa === this.activeEtapaFilter || c.etapa === 'Geral');
      }
      if (this.searchQuery) {
        children = children.filter(c =>
          (c.title || '').toLowerCase().includes(this.searchQuery) ||
          (c.contentMarkdown || '').toLowerCase().includes(this.searchQuery)
        );
      }

      const folderCount = children.filter(c => c.type === 'folder').length;
      const docCount = children.filter(c => c.type === 'document').length;
      const mediaCount = children.filter(c => c.type === 'media' || c.type === 'presentation').length;

      const title = folderNode ? folderNode.title : 'Acervo Geral da Pastoral da Catequese';
      const desc = folderNode ? (folderNode.description || 'Explore as subpastas e materiais de formação disponíveis.') : 'Navegue pelas pastas temáticas, roteiros de encontros, mídias e orientações oficiais.';
      const etapaBadge = folderNode && folderNode.etapa ? `
        <span class="bg-emerald-100 text-emerald-900 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-bold">
          Etapa: ${folderNode.etapa}
        </span>
      ` : '';

      let childCardsHtml = '';
      if (children.length === 0) {
        childCardsHtml = `
          <div class="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <span class="text-3xl block mb-2">📭</span>
            <p class="text-sm font-semibold text-slate-700">Esta pasta está vazia no momento.</p>
            <p class="text-xs text-slate-400 mt-1">Materiais adicionados pela Coordenação aparecerão aqui.</p>
          </div>
        `;
      } else {
        childCardsHtml = children.map(c => {
          const isFld = c.type === 'folder';
          const icon = this.getNodeIcon(c, false);
          let typeLabel = 'Documento';
          let borderHoverColor = 'hover:border-emerald-400';
          let badgeBg = 'bg-slate-100 text-slate-700';

          if (isFld) {
            typeLabel = 'Pasta';
            borderHoverColor = 'hover:border-amber-400';
            badgeBg = 'bg-amber-100 text-amber-900 border border-amber-200';
          } else if (c.type === 'presentation') {
            typeLabel = 'Apresentação (PPTX)';
            borderHoverColor = 'hover:border-orange-400';
            badgeBg = 'bg-orange-100 text-orange-900 border border-orange-200';
          } else if (c.type === 'media') {
            typeLabel = c.extension === 'mp4' ? 'Vídeo (MP4)' : 'Áudio (MP3)';
            borderHoverColor = 'hover:border-blue-400';
            badgeBg = 'bg-blue-100 text-blue-900 border border-blue-200';
          }

          const descSnippet = c.description || (c.contentMarkdown ? c.contentMarkdown.replace(/[#*`>]/g, '').substring(0, 110) + '...' : 'Sem descrição complementar.');

          return `
            <div
              onclick="window.WikiKB.selectNode('${c.id}')"
              class="group bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 ${borderHoverColor} shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center text-xl shadow-2xs">
                    ${icon}
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}">
                    ${typeLabel}
                  </span>
                </div>
                <h4 class="text-sm font-bold font-heading text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-1.5">
                  ${c.title}
                </h4>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  ${descSnippet}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">
                <span>${isFld ? 'Abrir pasta' : 'Visualizar item'}</span>
                <span class="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          `;
        }).join('');
      }

      const emptyFirestoreBanner = (this.isFirestoreEmpty && window.KnowledgeService && typeof window.KnowledgeService.canEdit === 'function' && window.KnowledgeService.canEdit()) ? `
        <div class="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-start gap-3">
            <span class="text-3xl flex-shrink-0">☁️</span>
            <div>
              <h4 class="text-xs sm:text-sm font-bold font-heading text-amber-950">Banco de Dados Conectado (Coleção Nova no Firestore)</h4>
              <p class="text-[11.5px] text-amber-900 mt-0.5 leading-relaxed">
                A coleção <code>knowledge_nodes</code> no Cloud Firestore está ativa e aguardando a sincronização inicial. Como membro da Coordenação, você pode publicar o acervo com um clique usando merge construtivo seguro.
              </p>
            </div>
          </div>
          <button
            onclick="window.WikiKB.syncSeedToFirestore()"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>🌱</span> <span>Inicializar Acervo em Nuvem</span>
          </button>
        </div>
      ` : '';

      viewer.innerHTML = `
        <div class="space-y-6 animate-in fade-in duration-200">
          ${emptyFirestoreBanner}
          <!-- Header do Folder -->
          <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden border border-emerald-500/20">
            <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
            <div class="relative z-10 max-w-3xl">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-[#d4a94f] text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span>📂</span> <span>Visão de Pasta</span>
                </span>
                ${etapaBadge}
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading mb-2">
                ${title}
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ${desc}
              </p>

              <!-- Mini Stats & Ações Rápidas da Pasta -->
              <div class="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="flex items-center gap-1.5">
                    <span class="text-amber-400 font-bold">${folderCount}</span> pastas
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1.5">
                    <span class="text-emerald-400 font-bold">${docCount}</span> documentos
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1.5">
                    <span class="text-blue-400 font-bold">${mediaCount}</span> arquivos de mídia
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick="window.KnowledgeUploadPanel && window.KnowledgeUploadPanel.openUploadMaterialModal('${folderId || ''}')"
                    class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Adicionar material dentro desta pasta"
                  >
                    <span>📤</span> <span>+ Material</span>
                  </button>
                  <button
                    type="button"
                    onclick="window.KnowledgeUploadPanel && window.KnowledgeUploadPanel.openCreateFolderModal('${folderId || ''}')"
                    class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Criar uma subpasta dentro desta pasta"
                  >
                    <span>📁</span> <span>+ Subpasta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Conteúdo da Pasta (Grid de Cards) -->
          <div>
            <div class="flex items-center justify-between mb-3 px-1">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Itens nesta pasta (${children.length})
              </h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${childCardsHtml}
            </div>
          </div>
        </div>
      `;
    },

    // ========================================================================
    // 7. LEITOR DE DOCUMENTO MARKDOWN
    // ========================================================================
    renderDocumentViewer: function (docNode) {
      const viewer = document.getElementById('wiki-content-viewer');
      if (!viewer) return;

      const etapaBadge = docNode.etapa ? `
        <span class="bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-heading">
          ${docNode.etapa}
        </span>
      ` : '';

      const updatedStr = docNode.updatedAt ? new Date(docNode.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '2026';
      const author = docNode.createdBy ? docNode.createdBy.name : 'Coordenação';

      // Parse do Markdown via Marked
      let htmlBody = '<p class="text-slate-400">Documento sem conteúdo.</p>';
      if (typeof marked !== 'undefined' && docNode.contentMarkdown) {
        htmlBody = marked.parse(docNode.contentMarkdown);
      } else if (docNode.contentMarkdown) {
        // Fallback básico se marked não estiver pronto
        htmlBody = `<div class="whitespace-pre-line text-sm">${docNode.contentMarkdown}</div>`;
      }

      // Estima tempo de leitura (200 palavras por minuto)
      const wordCount = (docNode.contentMarkdown || '').split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

      viewer.innerHTML = `
        <article class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <!-- Topo do Artigo -->
          <div class="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">📄</span>
                ${etapaBadge}
                <span class="text-xs text-slate-500 font-medium">
                  • ⏱️ ${readMinutes} min de leitura
                </span>
              </div>

              <!-- Ações do Documento -->
              <div class="flex items-center gap-2 no-print flex-wrap">
                <button
                  type="button"
                  onclick="window.GeminiReferenceExtractor && window.GeminiReferenceExtractor.openReviewModalForCurrentDoc(window.WikiKB.getNode('${docNode.id}'))"
                  class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Extrair referências teológicas (Bíblia, CIC, Vaticano) com Inteligência Artificial Gemini"
                >
                  <span>✨</span> <span>Extrair Referências (IA)</span>
                </button>
                <button
                  type="button"
                  onclick="window.KnowledgeUploadPanel && window.KnowledgeUploadPanel.openEditDocumentModal(window.WikiKB.getNode('${docNode.id}'))"
                  class="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Editar informações ou conteúdo deste documento"
                >
                  <span>✏️</span> <span>Editar</span>
                </button>
                <button
                  type="button"
                  onclick="window.WikiKB.copyLink('${docNode.id}')"
                  class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Copiar link direto para este documento"
                >
                  <span>🔗</span> <span>Copiar Link</span>
                </button>
                <button
                  type="button"
                  onclick="window.print()"
                  class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Imprimir documento formatado"
                >
                  <span>🖨️</span> <span>Imprimir</span>
                </button>
              </div>
            </div>

            <h1 class="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight mb-2">
              ${docNode.title}
            </h1>

            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Por: <strong class="text-slate-700">${author}</strong></span>
              <span>•</span>
              <span>Última atualização: <strong class="text-slate-700">${updatedStr}</strong></span>
            </div>
          </div>

          <!-- Corpo do Markdown Estilizado -->
          <div class="p-6 sm:p-10 wiki-prose leading-relaxed">
            ${htmlBody}
          </div>

          <!-- Seção Inferior: Fontes Oficiais e Referências -->
          ${this.buildReferencesSectionHtml(docNode.references, docNode)}
        </article>
      `;

      // Anexa evento de Lightbox em todas as imagens do Markdown
      setTimeout(() => {
        const imgs = viewer.querySelectorAll('.wiki-prose img');
        imgs.forEach(img => {
          img.addEventListener('click', () => {
            window.WikiKB.openImageLightbox(img.src, img.alt || img.title || docNode.title);
          });
        });
      }, 40);
    },

    // ========================================================================
    // 8. VISÃO DE MÍDIA E APRESENTAÇÕES (ÁUDIO, VÍDEO E PPTX - INCREMENTO 3)
    // ========================================================================
    renderMediaViewer: function (mediaNode) {
      const viewer = document.getElementById('wiki-content-viewer');
      if (!viewer) return;

      const isVideo = mediaNode.extension === 'mp4' || mediaNode.extension === 'mov';
      const isAudio = mediaNode.extension === 'mp3' || mediaNode.extension === 'wav' || mediaNode.extension === 'm4a';
      const isPpt = mediaNode.type === 'presentation' || mediaNode.extension === 'pptx' || mediaNode.extension === 'ppt';

      const fileSizeStr = mediaNode.fileSizeBytes
        ? (mediaNode.fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB'
        : '';

      const etapaBadge = mediaNode.etapa ? `
        <span class="bg-emerald-100 text-emerald-900 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-bold">
          ${mediaNode.etapa}
        </span>
      ` : '';

      let playerHtml = '';

      // --- PLAYER DE VÍDEO ---
      if (isVideo) {
        playerHtml = `
          <div class="space-y-4">
            <div class="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <video
                id="wiki-active-video"
                controls
                playsinline
                class="w-full max-h-[500px] object-contain"
                preload="metadata"
              >
                <source src="${mediaNode.mediaUrl}" type="video/mp4">
                Seu navegador não suporta a reprodução deste vídeo.
              </video>
            </div>

            <!-- Barra de Controles Complementares do Vídeo -->
            <div class="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Velocidade:</span>
                <div class="flex items-center gap-1">
                  <button onclick="window.WikiKB.setVideoPlaybackRate(1.0)" class="wiki-video-speed-btn wiki-speed-btn active" data-rate="1">1x</button>
                  <button onclick="window.WikiKB.setVideoPlaybackRate(1.25)" class="wiki-video-speed-btn wiki-speed-btn" data-rate="1.25">1.25x</button>
                  <button onclick="window.WikiKB.setVideoPlaybackRate(1.5)" class="wiki-video-speed-btn wiki-speed-btn" data-rate="1.5">1.5x</button>
                  <button onclick="window.WikiKB.setVideoPlaybackRate(2.0)" class="wiki-video-speed-btn wiki-speed-btn" data-rate="2">2x</button>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  onclick="window.WikiKB.toggleVideoFullscreen()"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Tela cheia"
                >
                  <span>⛶</span> <span>Tela Cheia</span>
                </button>
                <a
                  href="${mediaNode.mediaUrl}"
                  download
                  target="_blank"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>📥</span> <span>Baixar Vídeo</span>
                </a>
              </div>
            </div>
          </div>
        `;
      }
      // --- PLAYER DE ÁUDIO CUSTOMIZADO ---
      else if (isAudio) {
        playerHtml = `
          <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 space-y-6">
            <audio id="wiki-active-audio" src="${mediaNode.mediaUrl}" preload="metadata"></audio>

            <!-- Card Superior do Áudio -->
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                🎵
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Formação em Áudio
                </span>
                <h3 class="text-lg sm:text-xl font-bold font-heading text-white truncate mt-1">
                  ${mediaNode.title}
                </h3>
                <p class="text-xs text-slate-400 truncate mt-0.5">
                  Pastoral da Catequese • Santuário Imaculado Coração de Maria
                </p>
              </div>
            </div>

            <!-- Scrubber e Barra de Progresso Interativa -->
            <div class="space-y-1.5">
              <input
                type="range"
                id="wiki-audio-scrubber"
                min="0"
                max="100"
                value="0"
                step="0.1"
                class="wiki-audio-scrubber"
                title="Arraste para avançar ou retroceder no áudio"
              />
              <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span id="wiki-audio-cur-time">00:00</span>
                <span id="wiki-audio-dur-time">--:--</span>
              </div>
            </div>

            <!-- Painel de Controles: Play, Seek, Velocidade e Volume -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <!-- Botões Principais de Reprodução -->
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick="window.WikiKB.seekAudio(-10)"
                  class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition border border-slate-700 active:scale-95 cursor-pointer"
                  title="Voltar 10 segundos"
                >
                  -10s
                </button>

                <button
                  type="button"
                  id="wiki-audio-play-btn"
                  onclick="window.WikiKB.toggleAudioPlay()"
                  class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer font-heading"
                >
                  <span id="wiki-audio-play-icon">▶</span>
                  <span id="wiki-audio-play-label">Reproduzir</span>
                </button>

                <button
                  type="button"
                  onclick="window.WikiKB.seekAudio(10)"
                  class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition border border-slate-700 active:scale-95 cursor-pointer"
                  title="Avançar 10 segundos"
                >
                  +10s
                </button>
              </div>

              <!-- Controle de Velocidade -->
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-400 hidden sm:inline">Velocidade:</span>
                <button onclick="window.WikiKB.setAudioPlaybackRate(1.0)" class="wiki-audio-speed-btn wiki-speed-btn active" data-rate="1">1x</button>
                <button onclick="window.WikiKB.setAudioPlaybackRate(1.25)" class="wiki-audio-speed-btn wiki-speed-btn" data-rate="1.25">1.25x</button>
                <button onclick="window.WikiKB.setAudioPlaybackRate(1.5)" class="wiki-audio-speed-btn wiki-speed-btn" data-rate="1.5">1.5x</button>
                <button onclick="window.WikiKB.setAudioPlaybackRate(2.0)" class="wiki-audio-speed-btn wiki-speed-btn" data-rate="2">2x</button>
              </div>

              <!-- Mute & Download -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  id="wiki-audio-mute-btn"
                  onclick="window.WikiKB.toggleAudioMute()"
                  class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 cursor-pointer"
                  title="Silenciar / Ativar Som"
                >
                  🔊
                </button>
                <a
                  href="${mediaNode.mediaUrl}"
                  download
                  target="_blank"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shadow-2xs cursor-pointer"
                  title="Baixar MP3"
                >
                  <span>📥</span> <span>Baixar Áudio</span>
                </a>
              </div>
            </div>
          </div>
        `;
      }
      // --- VISUALIZADOR DE APRESENTAÇÃO PPTX ---
      else if (isPpt) {
        const encodedUrl = encodeURIComponent(mediaNode.mediaUrl);
        const officeEmbed = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

        playerHtml = `
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-2xl border border-slate-200 text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-700">Visualizador ativo:</span>
                <span id="wiki-ppt-provider-label" class="bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-slate-800">
                  Microsoft Office Online
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick="window.WikiKB.togglePptProvider('${mediaNode.mediaUrl}')"
                  class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Alternar entre Microsoft Office Viewer e Google Docs Viewer"
                >
                  <span>🔄</span> <span>Alternar Visualizador</span>
                </button>
                <button
                  type="button"
                  onclick="window.WikiKB.toggleIframeFullscreen('wiki-ppt-iframe')"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Tela cheia"
                >
                  <span>⛶</span> <span>Tela Cheia</span>
                </button>
              </div>
            </div>

            <!-- Container do Iframe -->
            <div id="wiki-ppt-container" class="w-full h-[580px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative">
              <iframe
                id="wiki-ppt-iframe"
                src="${officeEmbed}"
                class="w-full h-full border-0"
                title="Pré-visualização da Apresentação"
                allowfullscreen="true"
                loading="lazy"
              ></iframe>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 px-2">
              <span>Caso a prévia não carregue na sua rede, utilize o botão de download direto.</span>
              <a href="${mediaNode.mediaUrl}" download target="_blank" class="font-bold text-amber-700 hover:underline">
                Baixar arquivo original (${mediaNode.extension ? mediaNode.extension.toUpperCase() : 'PPTX'} ${fileSizeStr}) ↓
              </a>
            </div>
          </div>
        `;
      }

      viewer.innerHTML = `
        <article class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10.5px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-heading">
                  ${mediaNode.type === 'presentation' ? 'Apresentação de Slides' : (isVideo ? 'Vídeo Oficial' : 'Áudio Pastoral')}
                </span>
                ${etapaBadge}
                ${fileSizeStr ? `<span class="text-xs text-slate-400 font-medium">• ${fileSizeStr}</span>` : ''}
              </div>
              <h2 class="text-2xl font-bold font-heading text-slate-900">
                ${mediaNode.title}
              </h2>
            </div>

            <div class="flex items-center gap-2 no-print">
              <button
                onclick="window.WikiKB.copyLink('${mediaNode.id}')"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Copiar link"
              >
                <span>🔗</span> <span>Copiar Link</span>
              </button>
              <a
                href="${mediaNode.mediaUrl}"
                target="_blank"
                download
                class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>📥</span> <span>Baixar Arquivo</span>
              </a>
            </div>
          </div>

          ${playerHtml}

          ${mediaNode.description ? `
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1">
              <strong class="text-slate-900 font-heading block text-sm">Orientações do Material:</strong>
              <p>${mediaNode.description}</p>
            </div>
          ` : ''}
        </article>
      `;

      // Inicializa eventos do áudio customizado se for áudio
      if (isAudio) {
        setTimeout(() => this.initCustomAudioPlayer(), 50);
      }
    },

    // --- CONTROLES DE ÁUDIO CUSTOMIZADO ---
    initCustomAudioPlayer: function () {
      const audio = document.getElementById('wiki-active-audio');
      const scrubber = document.getElementById('wiki-audio-scrubber');
      const curTime = document.getElementById('wiki-audio-cur-time');
      const durTime = document.getElementById('wiki-audio-dur-time');
      if (!audio) return;

      const formatTime = sec => {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      };

      audio.addEventListener('loadedmetadata', () => {
        if (durTime) durTime.textContent = formatTime(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        if (curTime) curTime.textContent = formatTime(audio.currentTime);
        if (scrubber && audio.duration) {
          scrubber.value = (audio.currentTime / audio.duration) * 100;
        }
      });

      audio.addEventListener('ended', () => {
        const playBtn = document.getElementById('wiki-audio-play-label');
        const playIcon = document.getElementById('wiki-audio-play-icon');
        if (playBtn) playBtn.textContent = 'Reproduzir';
        if (playIcon) playIcon.textContent = '▶';
        if (scrubber) scrubber.value = 0;
      });

      if (scrubber) {
        scrubber.addEventListener('input', e => {
          if (audio.duration) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
          }
        });
      }
    },

    toggleAudioPlay: function () {
      const audio = document.getElementById('wiki-active-audio');
      const playBtn = document.getElementById('wiki-audio-play-label');
      const playIcon = document.getElementById('wiki-audio-play-icon');
      if (!audio) return;

      if (audio.paused) {
        audio.play().then(() => {
          if (playBtn) playBtn.textContent = 'Pausar';
          if (playIcon) playIcon.textContent = '⏸';
        }).catch(console.warn);
      } else {
        audio.pause();
        if (playBtn) playBtn.textContent = 'Reproduzir';
        if (playIcon) playIcon.textContent = '▶';
      }
    },

    seekAudio: function (seconds) {
      const audio = document.getElementById('wiki-active-audio');
      if (!audio) return;
      audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
    },

    setAudioPlaybackRate: function (rate) {
      const audio = document.getElementById('wiki-active-audio');
      if (audio) audio.playbackRate = rate;

      document.querySelectorAll('.wiki-audio-speed-btn').forEach(btn => {
        if (parseFloat(btn.getAttribute('data-rate')) === rate) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    toggleAudioMute: function () {
      const audio = document.getElementById('wiki-active-audio');
      const btn = document.getElementById('wiki-audio-mute-btn');
      if (!audio) return;
      audio.muted = !audio.muted;
      if (btn) btn.textContent = audio.muted ? '🔇' : '🔊';
    },

    // --- CONTROLES DE VÍDEO ---
    setVideoPlaybackRate: function (rate) {
      const video = document.getElementById('wiki-active-video');
      if (video) video.playbackRate = rate;

      document.querySelectorAll('.wiki-video-speed-btn').forEach(btn => {
        if (parseFloat(btn.getAttribute('data-rate')) === rate) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    toggleVideoFullscreen: function () {
      const video = document.getElementById('wiki-active-video');
      if (!video) return;
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    },

    // --- CONTROLES DE PPTX (DUAL-VIEWER & FULLSCREEN) ---
    currentPptProvider: 'office',
    togglePptProvider: function (fileUrl) {
      const iframe = document.getElementById('wiki-ppt-iframe');
      const label = document.getElementById('wiki-ppt-provider-label');
      if (!iframe) return;

      const encoded = encodeURIComponent(fileUrl);
      if (this.currentPptProvider === 'office') {
        this.currentPptProvider = 'google';
        iframe.src = `https://docs.google.com/viewer?url=${encoded}&embedded=true`;
        if (label) label.textContent = 'Google Docs Viewer';
      } else {
        this.currentPptProvider = 'office';
        iframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
        if (label) label.textContent = 'Microsoft Office Online';
      }
    },

    toggleIframeFullscreen: function (iframeId) {
      const el = document.getElementById(iframeId);
      if (!el) return;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    },

    // --- MODAL LIGHTBOX DE IMAGENS ---
    openImageLightbox: function (src, caption) {
      let lightbox = document.getElementById('wiki-image-lightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'wiki-image-lightbox';
        lightbox.className = 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-opacity duration-200';
        lightbox.innerHTML = `
          <button
            onclick="window.WikiKB.closeImageLightbox()"
            class="absolute top-5 right-5 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition border border-white/20 shadow-lg cursor-pointer"
            title="Fechar (Esc)"
          >
            ✕
          </button>
          <img id="wiki-lightbox-img-el" src="" alt="Ampliação" class="wiki-lightbox-img" />
          <p id="wiki-lightbox-caption" class="text-xs text-slate-300 mt-3 text-center max-w-2xl px-4"></p>
        `;
        lightbox.addEventListener('click', e => {
          if (e.target === lightbox || e.target.id === 'wiki-lightbox-img-el') {
            window.WikiKB.closeImageLightbox();
          }
        });
        document.body.appendChild(lightbox);
      }

      const imgEl = document.getElementById('wiki-lightbox-img-el');
      const capEl = document.getElementById('wiki-lightbox-caption');
      if (imgEl) imgEl.src = src;
      if (capEl) capEl.textContent = caption || '';

      lightbox.classList.remove('hidden');
    },

    closeImageLightbox: function () {
      const lightbox = document.getElementById('wiki-image-lightbox');
      if (lightbox) lightbox.classList.add('hidden');
    },

    // ========================================================================
    // 9. SEÇÃO INFERIOR: REFERÊNCIAS CITADAS, VATICANO E GOOGLE LIVROS
    // ========================================================================
    buildReferencesSectionHtml: function (references, docNode) {
      const hasRefs = references && references.length > 0;
      const docId = docNode ? docNode.id : '';

      let itemsHtml = '';
      if (hasRefs) {
        itemsHtml = references.map(ref => {
          let badge = '📖 Bíblia';
          let badgeClass = 'bg-blue-100 text-blue-900 border-blue-200';

          if (ref.type === 'cic') {
            badge = '🏛️ Catecismo (CIC)';
            badgeClass = 'bg-amber-100 text-amber-900 border-amber-200';
          } else if (ref.type === 'vaticano') {
            badge = '📜 Santa Sé / Vaticano';
            badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-200';
          } else if (ref.type === 'livro') {
            badge = '📚 Google Livros';
            badgeClass = 'bg-purple-100 text-purple-900 border-purple-200';
          }

          return `
            <a
              href="${ref.url}"
              target="_blank"
              rel="noopener noreferrer"
              class="wiki-ref-card block p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition text-left group"
            >
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}">
                  ${badge}
                </span>
                <span class="text-slate-400 group-hover:text-emerald-600 transition-colors text-xs font-bold">
                  ↗
                </span>
              </div>
              <h5 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors mb-1 font-heading">
                ${ref.citation}
              </h5>
              ${ref.description ? `
                <p class="text-[11px] text-slate-500 leading-normal line-clamp-2">
                  ${ref.description}
                </p>
              ` : ''}
            </a>
          `;
        }).join('');
      } else {
        itemsHtml = `
          <div class="col-span-full py-6 text-center text-slate-400 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200/80">
            <span class="text-2xl block mb-1">📜</span>
            <p class="text-xs font-semibold text-slate-600">Nenhuma citação externa cadastrada para este documento.</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Use o botão ao lado para escanear passagens da Bíblia e do Magistério com Inteligência Artificial.</p>
          </div>
        `;
      }

      return `
        <div class="p-6 sm:p-8 bg-[#fdfbf7] border-t border-amber-200/60 rounded-b-3xl mt-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏛️</span>
              <div>
                <h4 class="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                  Fontes &amp; Referências Citadas
                </h4>
                <p class="text-[11px] text-slate-500">
                  Documentação oficial do Vaticano, citações bíblicas e bibliografia recomendada.
                </p>
              </div>
            </div>
            ${docId ? `
              <button
                type="button"
                onclick="window.GeminiReferenceExtractor && window.GeminiReferenceExtractor.openReviewModalForCurrentDoc(window.WikiKB.getNode('${docId}'))"
                class="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition border border-amber-300 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Escanear e revisar referências com IA Gemini"
              >
                <span>✨</span> <span>Revisar Fontes com IA</span>
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
            ${itemsHtml}
          </div>
        </div>
      `;
    },

    // ========================================================================
    // 10. UTILITÁRIOS: COPIAR LINK & RESPONSIVIDADE
    // ========================================================================
    copyLink: function (nodeId) {
      const url = window.location.origin + window.location.pathname + '#wiki-' + nodeId;
      navigator.clipboard.writeText(url).then(() => {
        alert('✅ Link copiado para a área de transferência:\n' + url);
      }).catch(() => {
        prompt('Copie o link abaixo:', url);
      });
    },

    toggleMobileSidebar: function (forceState) {
      const treeCol = document.getElementById('wiki-tree-column');
      if (!treeCol) return;
      if (typeof forceState === 'boolean') {
        if (forceState) treeCol.classList.remove('hidden');
        else treeCol.classList.add('hidden');
      } else {
        treeCol.classList.toggle('hidden');
      }
    },

    setupEventListeners: function () {
      // Suporte a hash link inicial (ex: #wiki-doc-guia-catequista)
      const hash = window.location.hash;
      if (hash && hash.startsWith('#wiki-')) {
        const id = hash.replace('#wiki-', '');
        if (this.getNode(id)) {
          this.activeNodeId = id;
        }
      }

      // Fecha o lightbox de imagem com a tecla Esc
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.closeImageLightbox();
        }
      });
    }
  };

  // Auto-inicialização quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.WikiKB.init();
    });
  } else {
    window.WikiKB.init();
  }

})();
