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
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/sao-mateus/28/'
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
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/genesis/1/'
        },
        {
          type: 'biblia',
          citation: 'Sl 8, 4-10',
          description: 'Salmo da Criação: "A majestade de Deus e a grandeza do homem"',
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/salmos/8/'
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
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/ii-timoteo/3/'
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
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/isaias/11/'
        },
        {
          type: 'biblia',
          citation: '1Cor 12, 4-11',
          description: 'A diversidade de dons espirituais e o mesmo Espírito',
          url: 'https://www.bibliacatolica.com.br/biblia-ave-maria/i-corintios/12/'
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
      mediaUrl: '/acervo/apresentacoes/a-biblia.pptx',
      pdfUrl: '/acervo/apresentacoes/a-biblia.pdf',
      fileSizeBytes: 7208895,
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

  // ==========================================================================
  // 2. ESTADO DA BASE DE CONHECIMENTO
  // ==========================================================================
  window.WikiKB = {
    nodes: [],
    activeNodeId: null,
    activeEtapaFilter: 'all',
    searchQuery: '',
    expandedFolders: new Set(),
    selectedNodeIds: new Set(),
    sidebarCollapsedMobile: false,
    cloudConnected: false,
    isFirestoreEmpty: true,
    isSyncing: false,
    hasInitializedListener: false,
    // Funções utilitárias de resolução determinística de arquivos web
    toSafeSlug: function (str) {
      if (!str) return '';
      return str
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9_\s-]/g, '')
        .trim()
        .replace(/[-\s]+/g, '-');
    },

    cleanWebUrl: function (url) {
      if (!url || typeof url !== 'string' || url.startsWith('file://')) return '';
      let trimmed = url.trim();
      if (trimmed && !trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        trimmed = '/' + trimmed;
      }
      return trimmed;
    },

    resolveDocPdfUrl: function (docNode) {
      if (!docNode) return '';
      const ext = (docNode.extension || '').toLowerCase();
      const isPpt = ext === 'pptx' || ext === 'ppt' || docNode.type === 'presentation' || (docNode.mimeType && docNode.mimeType.includes('presentation'));
      if (isPpt) {
        return this.resolvePresentationUrls(docNode).pptPdfUrl;
      }
      const baseSlug = this.toSafeSlug(docNode.fileName ? docNode.fileName.replace(/\.pdf$/i, '') : docNode.title);
      // Sempre prioriza o slug ASCII seguro garantido no hosting
      let url = (baseSlug ? `/acervo/documentos/${baseSlug}.pdf` : '') || this.cleanWebUrl(docNode.pdfUrl) || this.cleanWebUrl(docNode.mediaUrl);
      return url;
    },

    resolvePresentationUrls: function (mediaNode) {
      if (!mediaNode) return { pptPdfUrl: '', pptDownloadUrl: '', baseSlug: '', ext: 'pptx' };
      const baseSlug = this.toSafeSlug(mediaNode.fileName ? mediaNode.fileName.replace(/\.(pptx|ppt)$/i, '') : mediaNode.title);
      const ext = (mediaNode.extension || (mediaNode.fileName && mediaNode.fileName.toLowerCase().endsWith('.ppt') ? 'ppt' : 'pptx')).toLowerCase();

      // Sempre prioriza o slug ASCII seguro garantido no hosting
      let pptPdfUrl = (baseSlug ? `/acervo/apresentacoes/${baseSlug}.pdf` : '') || this.cleanWebUrl(mediaNode.pdfUrl);
      let pptDownloadUrl = (baseSlug ? `/acervo/apresentacoes/${baseSlug}.${ext}` : '') || this.cleanWebUrl(mediaNode.mediaUrl);

      return { pptPdfUrl, pptDownloadUrl, baseSlug, ext };
    },

    // Inicialização do módulo
    init: function () {
      console.log('📚 WikiKB: Inicializando Base de Conhecimento...');
      
      let hasValidCache = false;
      if (window.KnowledgeService && typeof window.KnowledgeService.getLocalCache === 'function') {
        const cached = window.KnowledgeService.getLocalCache();
        if (cached && Array.isArray(cached) && cached.length > 20) {
          this.nodes = cached;
          hasValidCache = true;
        }
      }

      if (!hasValidCache) {
        this.nodes = JSON.parse(JSON.stringify(INITIAL_WIKI_NODES));
        if (window.KnowledgeService && typeof window.KnowledgeService.fetchStaticAcervoSeed === 'function') {
          window.KnowledgeService.fetchStaticAcervoSeed().then(loadedNodes => {
            if (loadedNodes && loadedNodes.length > this.nodes.length) {
              console.log(`📦 WikiKB: Acervo completo carregado via semente estática (${loadedNodes.length} itens).`);
              this.nodes = loadedNodes;
              this.renderTree();
              if (this.activeNodeId) this.selectNode(this.activeNodeId);
            }
          });
        }
      }

      this.activeNodeId = 'dir-geral';
      this.expandedFolders = new Set(['dir-geral', 'dir-eucaristia-1', 'dir-euc1-mod1', 'dir-crisma-jovem', 'dir-crisma-adultos']);

      this.renderTree();
      this.selectNode(this.activeNodeId);
      this.setupEventListeners();
      this.setupCloudSync();
      this.updateAdminActionsVisibility();
    },

    updateAdminActionsVisibility: function () {
      const isMaster = window.KnowledgeService && typeof window.KnowledgeService.isMasterAdmin === 'function' ? window.KnowledgeService.isMasterAdmin() : false;
      const isCoordOrAdmin = window.KnowledgeService && typeof window.KnowledgeService.isCoordOrAdmin === 'function' ? window.KnowledgeService.isCoordOrAdmin() : isMaster;

      // Botão antigo de seed estático fica oculto para não reinjetar samples
      const btnSync = document.getElementById('btn-wiki-sync-seed');
      if (btnSync) btnSync.classList.add('hidden');

      // Botão de Restaurar Acervo Padrão: MASTER ADMIN & COORDENAÇÃO GERAL
      const btnRestoreDefault = document.getElementById('btn-wiki-restore-default');
      if (btnRestoreDefault) {
        if (isCoordOrAdmin) btnRestoreDefault.classList.remove('hidden');
        else btnRestoreDefault.classList.add('hidden');
      }

      // Botão de Limpeza do Acervo Sample: MASTER ADMIN & COORDENAÇÃO GERAL
      const btnClear = document.getElementById('btn-wiki-clear-sample');
      if (btnClear) {
        if (isCoordOrAdmin) btnClear.classList.remove('hidden');
        else btnClear.classList.add('hidden');
      }

      // Importação de arquivo de carga em lote: EXCLUSIVO MASTER ADMIN
      const btnImportSeed = document.getElementById('btn-wiki-import-seed');
      if (btnImportSeed) {
        if (isMaster) btnImportSeed.classList.remove('hidden');
        else btnImportSeed.classList.add('hidden');
      }

      // Sincronizar Cache Local na Nuvem: visível para Coord/Admin se houver itens locais e Firestore vazio/desconectado
      const btnSyncCloud = document.getElementById('btn-wiki-sync-cache-to-cloud');
      if (btnSyncCloud) {
        if (isCoordOrAdmin && this.nodes && this.nodes.length > 0 && (!this.cloudConnected || this.isFirestoreEmpty)) {
          btnSyncCloud.classList.remove('hidden');
        } else {
          btnSyncCloud.classList.add('hidden');
        }
      }
    },

    // ========================================================================
    // SELEÇÃO MÚLTIPLA E AÇÕES EM LOTE (MOVER E EXCLUIR VÁRIOS ITENS)
    // ========================================================================
    toggleSelectNode: function (nodeId, isChecked, event) {
      if (event) event.stopPropagation();
      if (isChecked) {
        this.selectedNodeIds.add(nodeId);
      } else {
        this.selectedNodeIds.delete(nodeId);
      }
      this.updateSelectionToolbar();
      this.updateCardSelectionVisuals();
    },

    toggleSelectAllInFolder: function (isChecked) {
      const folderId = this.activeNodeId;
      const children = this.getChildren(folderId);
      children.forEach(c => {
        if (isChecked) this.selectedNodeIds.add(c.id);
        else this.selectedNodeIds.delete(c.id);
      });
      this.updateSelectionToolbar();
      this.updateCardSelectionVisuals();
    },

    clearSelection: function () {
      this.selectedNodeIds.clear();
      this.updateSelectionToolbar();
      this.updateCardSelectionVisuals();
    },

    updateCardSelectionVisuals: function () {
      document.querySelectorAll('.wiki-card-checkbox').forEach(cb => {
        const id = cb.getAttribute('data-node-id');
        const isSel = this.selectedNodeIds.has(id);
        cb.checked = isSel;
        const card = document.getElementById('wiki-card-' + id);
        if (card) {
          if (isSel) {
            card.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50/50');
          } else {
            card.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50/50');
          }
        }
      });
      const masterCb = document.getElementById('wiki-select-all-checkbox');
      if (masterCb) {
        const children = this.getChildren(this.activeNodeId);
        const allChecked = children.length > 0 && children.every(c => this.selectedNodeIds.has(c.id));
        masterCb.checked = allChecked;
      }
    },

    updateSelectionToolbar: function () {
      let toolbar = document.getElementById('wiki-selection-toolbar');
      const count = this.selectedNodeIds.size;

      if (count === 0) {
        if (toolbar) toolbar.classList.add('hidden');
        return;
      }

      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'wiki-selection-toolbar';
        toolbar.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200';
        document.body.appendChild(toolbar);
      }

      toolbar.innerHTML = `
        <div class="flex items-center gap-2 pr-2 border-r border-slate-700 text-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-bold text-emerald-300">${count}</span>
          <span class="text-slate-300">${count === 1 ? 'item selecionado' : 'itens selecionados'}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick="window.WikiKB.openBatchMoveModal()"
            class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Mover os itens selecionados para outra pasta"
          >
            <span>📦</span> <span>Mover (${count})</span>
          </button>
          <button
            type="button"
            onclick="window.WikiKB.promptDeleteSelectedNodes()"
            class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Excluir os itens selecionados da Base de Conhecimento"
          >
            <span>🗑️</span> <span>Excluir (${count})</span>
          </button>
          <button
            type="button"
            onclick="window.WikiKB.clearSelection()"
            class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Desmarcar seleção"
          >
            ✕ Desmarcar
          </button>
        </div>
      `;

      toolbar.classList.remove('hidden');
    },

    // Exclusão em lote dos nós selecionados
    promptDeleteSelectedNodes: async function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem excluir itens da Base de Conhecimento.');
        return;
      }

      const count = this.selectedNodeIds.size;
      if (count === 0) return;

      const proceed = confirm(
        `⚠️ EXCLUIR MÚLTIPLOS ITENS\n\n` +
        `Deseja realmente excluir os ${count} itens selecionados?\n\n` +
        `• Todas as subpastas e materiais contidos nas pastas selecionadas também serão excluídos.\n` +
        `• Esta ação não pode ser desfeita.`
      );
      if (!proceed) return;

      const selectedIds = Array.from(this.selectedNodeIds);
      const previousNodes = [...this.nodes];

      // 1. Atualização Otimista Imediata na UI
      const removedIds = new Set();
      const collect = (pId) => {
        removedIds.add(pId);
        this.nodes.filter(n => n.parentId === pId).forEach(c => collect(c.id));
      };
      selectedIds.forEach(id => {
        const n = this.getNode(id);
        if (n && n.type === 'folder') collect(id);
        else removedIds.add(id);
      });

      this.nodes = this.nodes.filter(n => !removedIds.has(n.id));
      this.selectedNodeIds.clear();

      if (this.activeNodeId && removedIds.has(this.activeNodeId)) {
        this.activeNodeId = null;
      }

      if (window.KnowledgeService.saveLocalCache) {
        window.KnowledgeService.saveLocalCache(this.nodes);
      }

      this.renderTree();
      this.selectNode(this.activeNodeId);
      this.updateSelectionToolbar();

      // 2. Sincronização em segundo plano no Firestore
      try {
        const totalDeleted = await window.KnowledgeService.deleteNodesBatch(selectedIds, previousNodes);
        console.log(`✅ Lote excluído no Firestore com sucesso (${totalDeleted} registros).`);
      } catch (err) {
        console.warn('Aviso ao sincronizar exclusão em lote no Firestore:', err);
      }
    },

    // Modal de movimentação em lote
    openBatchMoveModal: function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito ao Master Admin e à Coordenação Geral.');
        return;
      }
      const count = this.selectedNodeIds.size;
      if (count === 0) return;

      const selectedIds = Array.from(this.selectedNodeIds);
      const selectedNodes = selectedIds.map(id => this.getNode(id)).filter(Boolean);

      // Pastas proibidas como destino: os próprios itens selecionados e seus descendentes
      const forbiddenIds = new Set(selectedIds);
      selectedNodes.filter(n => n.type === 'folder').forEach(f => {
        const collect = (pId) => {
          forbiddenIds.add(pId);
          this.nodes.filter(n => n.parentId === pId).forEach(c => collect(c.id));
        };
        collect(f.id);
      });

      // Pastas disponíveis
      const availableFolders = this.nodes.filter(n => n.type === 'folder' && !forbiddenIds.has(n.id));
      const getFolderPath = (folderId) => {
        const ancestors = this.getAncestors(folderId);
        return ancestors.map(a => a.title).join(' / ');
      };
      availableFolders.sort((a, b) => getFolderPath(a.id).localeCompare(getFolderPath(b.id)));

      let folderOptions = `<option value="">🏛️ Raiz da Base de Conhecimento (Nível Principal)</option>`;
      availableFolders.forEach(f => {
        const path = getFolderPath(f.id);
        folderOptions += `<option value="${f.id}">📁 ${path}</option>`;
      });

      let modal = document.getElementById('modal-wiki-batch-move');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-batch-move';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200';
        document.body.appendChild(modal);
      }

      const foldersCount = selectedNodes.filter(n => n.type === 'folder').length;
      const filesCount = selectedNodes.length - foldersCount;

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📦</span>
              <div>
                <h3 class="text-base font-bold font-heading text-white">Mover ${count} Itens em Lote</h3>
                <p class="text-[11px] text-amber-300">Escolha a pasta de destino para todos os itens selecionados</p>
              </div>
            </div>
            <button
              type="button"
              onclick="window.WikiKB.closeBatchMoveModal()"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <form id="form-wiki-batch-move" onsubmit="window.WikiKB.executeBatchMove(event)" class="p-6 space-y-4 text-xs sm:text-sm">
            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>Itens selecionados:</span>
              <span class="font-bold">${foldersCount > 0 ? `📁 ${foldersCount} pasta(s) • ` : ''}📄 ${filesCount} arquivo(s) (Total: ${count})</span>
            </div>

            <div>
              <label for="select-wiki-batch-move-dest" class="block font-bold text-slate-700 mb-1 text-xs">
                Nova Pasta de Destino *
              </label>
              <select
                id="select-wiki-batch-move-dest"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-800 text-xs bg-white font-medium shadow-2xs"
              >
                ${folderOptions}
              </select>
              <p class="text-[11px] text-slate-400 mt-1">
                Pastas selecionadas e suas subpastas foram ocultadas para evitar dependências circulares.
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onclick="window.WikiKB.closeBatchMoveModal()"
                class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-wiki-batch-move-confirm"
                class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>📦</span> <span>Mover ${count} Itens</span>
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.remove('hidden');
    },

    closeBatchMoveModal: function () {
      const modal = document.getElementById('modal-wiki-batch-move');
      if (modal) modal.classList.add('hidden');
    },

    executeBatchMove: async function (e) {
      if (e && e.preventDefault) e.preventDefault();
      const select = document.getElementById('select-wiki-batch-move-dest');
      const submitBtn = document.getElementById('btn-wiki-batch-move-confirm');
      if (!select) return;

      const newParentId = select.value.trim() || null;
      const selectedIds = Array.from(this.selectedNodeIds);
      if (selectedIds.length === 0) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> <span>Movendo em lote...</span>';
      }

      // 1. Atualização Otimista Imediata na UI
      selectedIds.forEach(id => {
        const node = this.getNode(id);
        if (node) {
          node.parentId = newParentId;
          node.updatedAt = new Date().toISOString();
        }
      });

      this.selectedNodeIds.clear();

      if (window.KnowledgeService.saveLocalCache) {
        window.KnowledgeService.saveLocalCache(this.nodes);
      }

      if (newParentId) {
        this.expandedFolders.add(newParentId);
        let p = newParentId;
        while (p) {
          this.expandedFolders.add(p);
          const pNode = this.getNode(p);
          p = pNode ? pNode.parentId : null;
        }
      }

      this.closeBatchMoveModal();
      this.renderTree();
      this.selectNode(newParentId || this.activeNodeId);
      this.updateSelectionToolbar();

      // 2. Sincronização em segundo plano no Firestore
      try {
        await window.KnowledgeService.moveNodesBatch(selectedIds, newParentId, this.nodes);
        console.log(`✅ ${selectedIds.length} itens movidos com sucesso no Firestore!`);
      } catch (err) {
        console.warn('Aviso ao sincronizar movimentação em lote:', err);
      }
    },

    // Ação de exclusão individual otimista (Master Admin e Coordenação Geral)
    promptDeleteNode: async function (nodeId, nodeType) {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem excluir itens da Base de Conhecimento.');
        return;
      }

      const node = this.getNode(nodeId);
      if (!node) {
        alert('Item não encontrado na memória.');
        return;
      }

      const isFolder = node.type === 'folder' || nodeType === 'folder';
      const typeLabel = isFolder ? 'a pasta' : 'o arquivo';

      const msg = isFolder
        ? `⚠️ EXCLUIR PASTA\n\nDeseja realmente excluir ${typeLabel} "${node.title}"?\n\n• Todas as subpastas e materiais dentro dela também serão removidos do Firestore com segurança.\n• Esta ação não pode ser desfeita.`
        : `⚠️ EXCLUIR ARQUIVO\n\nDeseja realmente excluir ${typeLabel} "${node.title}" do Firestore?\n\n• Esta ação não pode ser desfeita.`;

      const proceed = confirm(msg);
      if (!proceed) return;

      // 1. Atualização Otimista Imediata na UI (remove na hora para o usuário ver)
      const previousNodes = [...this.nodes];
      const removedIds = new Set();
      if (isFolder) {
        const collectDescendants = (pId) => {
          removedIds.add(pId);
          this.nodes.filter(n => n.parentId === pId).forEach(child => collectDescendants(child.id));
        };
        collectDescendants(nodeId);
        this.nodes = this.nodes.filter(n => !removedIds.has(n.id));
      } else {
        removedIds.add(nodeId);
        this.nodes = this.nodes.filter(n => n.id !== nodeId);
      }

      // Se o nó excluído era o ativo, volta para a pasta pai ou raiz
      if (this.activeNodeId === nodeId || removedIds.has(this.activeNodeId)) {
        this.activeNodeId = node.parentId || null;
      }

      this.selectedNodeIds.delete(nodeId);
      removedIds.forEach(id => this.selectedNodeIds.delete(id));

      if (window.KnowledgeService.saveLocalCache) {
        window.KnowledgeService.saveLocalCache(this.nodes);
      }

      this.renderTree();
      this.selectNode(this.activeNodeId);
      this.updateSelectionToolbar();

      // 2. Sincronização em segundo plano com o Firestore
      try {
        let deletedCount = 1;
        if (isFolder) {
          deletedCount = await window.KnowledgeService.deleteNodeCascade(nodeId, previousNodes);
        } else {
          await window.KnowledgeService.deleteNode(nodeId);
        }
        console.log(`✅ Item excluído do Firestore com sucesso (${deletedCount} registros).`);
      } catch (err) {
        console.warn('Aviso: Falha ao sincronizar exclusão com o Firestore:', err);
      }
    },

    // Modal interativo de movimentação de pastas e arquivos (Master Admin e Coordenação Geral)
    openMoveModal: function (nodeId) {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito: apenas o Master Admin e a Coordenação Geral podem mover pastas e arquivos.');
        return;
      }

      const node = this.getNode(nodeId);
      if (!node) return;

      const isFolder = node.type === 'folder';
      const itemTypeLabel = isFolder ? 'Pasta' : (node.type === 'presentation' ? 'Apresentação' : (node.type === 'media' ? 'Mídia' : 'Documento'));

      // Nós proibidos como destino:
      // Se for pasta, ela não pode ser movida para dentro dela mesma nem para nenhum de seus descendentes
      const forbiddenIds = new Set();
      if (isFolder) {
        const collectDescendants = (pId) => {
          forbiddenIds.add(pId);
          this.nodes.filter(n => n.parentId === pId).forEach(child => collectDescendants(child.id));
        };
        collectDescendants(nodeId);
      } else {
        forbiddenIds.add(nodeId);
      }

      // Localização atual do item
      let currentParentTitle = '🏛️ Raiz da Base de Conhecimento';
      if (node.parentId) {
        const pNode = this.getNode(node.parentId);
        if (pNode) currentParentTitle = `📁 ${pNode.title}`;
      }

      // Pastas disponíveis
      const availableFolders = this.nodes.filter(n => n.type === 'folder' && !forbiddenIds.has(n.id));

      // Ordena alfabeticamente pelo caminho completo
      const getFolderPath = (folderId) => {
        const ancestors = this.getAncestors(folderId);
        return ancestors.map(a => a.title).join(' / ');
      };

      availableFolders.sort((a, b) => getFolderPath(a.id).localeCompare(getFolderPath(b.id)));

      let folderOptions = `<option value="" ${!node.parentId ? 'selected' : ''}>🏛️ Raiz da Base de Conhecimento (Nível Principal)</option>`;
      availableFolders.forEach(f => {
        const isCurrent = (node.parentId === f.id);
        const path = getFolderPath(f.id);
        folderOptions += `<option value="${f.id}" ${isCurrent ? 'selected' : ''}>📁 ${path}${isCurrent ? ' (Local atual)' : ''}</option>`;
      });

      let modal = document.getElementById('modal-wiki-move-node');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-wiki-move-node';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200';
        document.body.appendChild(modal);
      }

      const icon = this.getNodeIcon(node, false);

      modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📦</span>
              <div>
                <h3 class="text-base font-bold font-heading text-white">Mover ${itemTypeLabel}</h3>
                <p class="text-[11px] text-amber-300">Altere a pasta onde este item está localizado</p>
              </div>
            </div>
            <button
              type="button"
              onclick="window.WikiKB.closeMoveModal()"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >✕</button>
          </div>

          <form id="form-wiki-move-node" onsubmit="window.WikiKB.executeMoveNode(event, '${node.id}')" class="p-6 space-y-4 text-xs sm:text-sm">
            <!-- Card de Identificação do Item -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                ${icon}
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">${itemTypeLabel}</span>
                <h4 class="font-bold text-slate-900 truncate text-sm">${node.title}</h4>
                <p class="text-xs text-slate-500 mt-0.5 truncate">
                  <span class="font-semibold text-slate-600">Local atual:</span> ${currentParentTitle}
                </p>
              </div>
            </div>

            <!-- Seleção da Pasta Destino -->
            <div>
              <label for="select-wiki-move-dest" class="block font-bold text-slate-700 mb-1 text-xs">
                Nova Pasta de Destino *
              </label>
              <select
                id="select-wiki-move-dest"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-800 text-xs bg-white font-medium shadow-2xs"
              >
                ${folderOptions}
              </select>
              <p class="text-[11px] text-slate-400 mt-1">
                ${isFolder ? '⚠️ Subpastas desta pasta foram ocultadas para evitar dependências circulares.' : 'Selecione a pasta de destino ou a Raiz principal.'}
              </p>
            </div>

            <!-- Botões de Ação -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onclick="window.WikiKB.closeMoveModal()"
                class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-wiki-move-confirm"
                class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>📦</span> <span>Mover Agora</span>
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.remove('hidden');
    },

    closeMoveModal: function () {
      const modal = document.getElementById('modal-wiki-move-node');
      if (modal) modal.classList.add('hidden');
    },

    executeMoveNode: async function (e, nodeId) {
      if (e && e.preventDefault) e.preventDefault();

      const select = document.getElementById('select-wiki-move-dest');
      const submitBtn = document.getElementById('btn-wiki-move-confirm');
      if (!select) return;

      const newParentId = select.value.trim() || null;
      const node = this.getNode(nodeId);
      if (!node) return;

      if ((node.parentId || null) === newParentId) {
        alert('O item já está localizado na pasta selecionada.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> <span>Movendo...</span>';
      }

      try {
        await window.KnowledgeService.moveNode(nodeId, newParentId, this.nodes);

        // Atualiza na memória local
        node.parentId = newParentId;
        node.updatedAt = new Date().toISOString();

        if (window.KnowledgeService.saveLocalCache) {
          window.KnowledgeService.saveLocalCache(this.nodes);
        }

        // Se moveu para uma pasta, expande a pasta de destino na árvore lateral
        if (newParentId) {
          this.expandedFolders.add(newParentId);
          let p = newParentId;
          while (p) {
            this.expandedFolders.add(p);
            const pNode = this.getNode(p);
            p = pNode ? pNode.parentId : null;
          }
        }

        this.closeMoveModal();
        this.renderTree();
        this.selectNode(nodeId);

        alert(`✅ "${node.title}" foi movido com sucesso!`);
      } catch (err) {
        console.error('Erro ao mover item:', err);
        alert('❌ Falha ao mover: ' + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>📦</span> <span>Mover Agora</span>';
        }
      }
    },

    // Limpeza completa do acervo sample (Master Admin e Coordenação Geral)
    promptClearAcervo: async function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito ao Master Admin e à Coordenação Geral.');
        return;
      }

      const proceed = confirm(
        '⚠️ LIMPAR BASE DE CONHECIMENTO\n\n' +
        'Deseja remover todos os arquivos e pastas da Base de Conhecimento do Firestore?\n\n' +
        '• Isso deixará a base 100% limpa para receber a nova carga do OneDrive.\n' +
        '• Esta ação é exclusiva do Master Admin e da Coordenação Geral.'
      );
      if (!proceed) return;

      try {
        const deletedCount = await window.KnowledgeService.clearKnowledgeNodes(false);
        this.nodes = [];
        this.activeNodeId = null;
        if (window.KnowledgeService.saveLocalCache) {
          window.KnowledgeService.saveLocalCache([]);
        }
        this.renderTree();
        this.renderFolderDashboard(null);
        alert(`✅ Base de conhecimento limpa com sucesso (${deletedCount} registros removidos)!\n\nAgora você pode usar o botão "📥 Importar Acervo (JSON)" para carregar os arquivos oficiais do OneDrive.`);
      } catch (err) {
        console.error('Erro ao limpar acervo:', err);
        alert('❌ Falha ao limpar acervo: ' + err.message);
      }
    },

    // Restaurar acervo padrão oficial (15 pastas e materiais essenciais)
    promptRestoreDefaultNodes: async function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito ao Master Admin e à Coordenação Geral.');
        return;
      }

      const proceed = confirm(
        '🌱 RESTAURAR PASTAS E MATERIAIS PADRÃO\n\n' +
        'Deseja limpar a base atual e restabelecer as 15 pastas e documentos oficiais da Catequese?\n\n' +
        '• Inclui: Diretrizes Gerais, Eucaristia I, Crisma Jovem e Crisma Adultos com textos formatados e citações do Vaticano;\n' +
        '• Sincroniza diretamente com o Cloud Firestore na nuvem.'
      );
      if (!proceed) return;

      try {
        if (window.KnowledgeService.clearKnowledgeNodes) {
          await window.KnowledgeService.clearKnowledgeNodes(false);
        }
        const defaultNodes = JSON.parse(JSON.stringify(INITIAL_WIKI_NODES));
        if (window.KnowledgeService.seedToFirestore) {
          await window.KnowledgeService.seedToFirestore(defaultNodes);
        }
        this.nodes = defaultNodes;
        this.activeNodeId = 'dir-geral';
        this.expandedFolders = new Set(['dir-geral', 'dir-eucaristia-1', 'dir-euc1-mod1', 'dir-crisma-jovem', 'dir-crisma-adultos']);
        if (window.KnowledgeService.saveLocalCache) {
          window.KnowledgeService.saveLocalCache(this.nodes);
        }
        this.updateCloudStatusBadge('cloud', this.nodes.length);
        this.renderTree();
        this.selectNode('dir-geral');
        alert(`✅ Base de conhecimento restaurada com sucesso com as ${defaultNodes.length} pastas e materiais padrão!`);
      } catch (err) {
        console.error('Erro ao restaurar base padrão:', err);
        alert('❌ Falha ao restaurar padrão: ' + err.message);
      }
    },

    setupCloudSync: function (force = false) {
      if (this.hasInitializedListener && !force) return;
      if (!window.KnowledgeService || typeof window.KnowledgeService.listenNodes !== 'function') return;

      this.updateCloudStatusBadge('connecting');

      window.KnowledgeService.listenNodes(
        (remoteNodes, isOnline, isFirestoreEmpty) => {
          this.hasInitializedListener = true;
          this.cloudConnected = isOnline;
          this.isFirestoreEmpty = !!isFirestoreEmpty;

          if (isOnline && remoteNodes && remoteNodes.length > 0) {
            this.nodes = remoteNodes;
            this.updateCloudStatusBadge('cloud', remoteNodes.length);
          } else if (isOnline && isFirestoreEmpty) {
            console.log('🌱 WikiKB: Firestore vazio detectado. Semeando acervo padrão oficial...');
            const defaultNodes = JSON.parse(JSON.stringify(INITIAL_WIKI_NODES));
            this.nodes = defaultNodes;
            this.activeNodeId = 'dir-geral';
            this.expandedFolders = new Set(['dir-geral', 'dir-eucaristia-1', 'dir-euc1-mod1', 'dir-crisma-jovem', 'dir-crisma-adultos']);
            if (window.KnowledgeService && window.KnowledgeService.seedToFirestore && window.KnowledgeService.canEdit()) {
              window.KnowledgeService.seedToFirestore(defaultNodes).catch(e => console.warn(e));
            }
            if (window.KnowledgeService && window.KnowledgeService.saveLocalCache) {
              window.KnowledgeService.saveLocalCache(defaultNodes);
            }
            this.updateCloudStatusBadge('cloud', defaultNodes.length);
          } else {
            if (remoteNodes && remoteNodes.length > 0) {
              this.nodes = remoteNodes;
            }
            this.updateCloudStatusBadge('offline', this.nodes.length);
          }

          this.updateAdminActionsVisibility();
          this.renderTree();

          // Garante re-renderização suave da tela ativa
          const current = this.getNode(this.activeNodeId);
          if (current) {
            this.selectNode(this.activeNodeId);
          } else {
            this.selectNode(this.nodes.length > 0 ? this.nodes[0].id : null);
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

      const totalItems = count !== undefined ? count : this.nodes.length;

      if (status === 'cloud') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Nuvem Firestore (${totalItems} itens)</span>`;
      } else if (status === 'empty-with-local') {
        badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 shadow-2xs';
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span><span>Local pronto para Nuvem (${totalItems} itens)</span>`;
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
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span>Cache Local (${totalItems} itens)</span>`;
      }
    },

    // Enviar acervo local diretamente para o Cloud Firestore
    uploadLocalCacheToFirestore: async function () {
      if (!window.KnowledgeService || !window.KnowledgeService.isCoordOrAdmin()) {
        alert('Acesso restrito ao Master Admin e à Coordenação Geral.');
        return;
      }
      if (!this.nodes || !this.nodes.length) {
        alert('Nenhum material encontrado no cache local para sincronizar.');
        return;
      }

      const proceed = confirm(
        `☁️ SINCRONIZAR ACERVO COM O CLOUD FIRESTORE\n\n` +
        `Deseja enviar os ${this.nodes.length} itens do seu cache local para o banco de dados na nuvem?\n\n` +
        `• Sincroniza todas as pastas e documentos com merge construtivo seguro no Firestore.\n` +
        `• Todos os catequistas terão acesso imediato aos materiais.\n\n` +
        `Deseja iniciar agora?`
      );
      if (!proceed) return;

      const btn = document.getElementById('btn-wiki-sync-cache-to-cloud');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> <span>Sincronizando Nuvem...</span>';
      }

      this.updateCloudStatusBadge('syncing', this.nodes.length);

      try {
        await window.KnowledgeService.importNodesBatch(this.nodes);
        this.updateCloudStatusBadge('cloud', this.nodes.length);
        this.isFirestoreEmpty = false;
        alert(`🎉 Sucesso! ${this.nodes.length} materiais foram sincronizados com o Cloud Firestore na nuvem!`);
        this.updateAdminActionsVisibility();
        this.renderTree();
      } catch (err) {
        console.error('Erro na sincronização:', err);
        alert('❌ Não foi possível sincronizar com o Firestore:\n' + err.message);
        this.updateCloudStatusBadge('empty-with-local', this.nodes.length);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>☁️</span> <span>Sincronizar na Nuvem</span>';
        }
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
      if (!id) return null;
      return this.nodes.find(n => n && n.id === id);
    },

    // Retorna filhos imediatos de um nó (trata nulos, vazios e órfãos como nós de raiz)
    getChildren: function (parentId) {
      const isLookingForRoot = (parentId === null || parentId === undefined || parentId === '');
      return this.nodes
        .filter(n => {
          if (!n || !n.id) return false;
          if (isLookingForRoot) {
            // É raiz se não tem parentId (null, undefined, vazio '')
            if (n.parentId === null || n.parentId === undefined || n.parentId === '') return true;
            // OU se o parentId aponta para um nó que não existe mais na lista (nó órfão)
            return !this.nodes.some(p => p && p.id === n.parentId);
          }
          return n.parentId === parentId;
        })
        .sort((a, b) => (a.order || 99) - (b.order || 99) || (a.title || '').localeCompare(b.title || ''));
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
      this.cleanupPdfViewer();
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

      // Em telas mobile, fecha a gaveta lateral ao selecionar qualquer item (pasta ou arquivo)
      if (window.innerWidth < 768) {
        this.toggleMobileSidebar(false);
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
      const isCoordOrAdmin = window.KnowledgeService && typeof window.KnowledgeService.isCoordOrAdmin === 'function' ? window.KnowledgeService.isCoordOrAdmin() : false;
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
        const isMaster = window.KnowledgeService && window.KnowledgeService.isMasterAdmin();
        childCardsHtml = `
          <div class="col-span-full py-12 px-4 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <span class="text-4xl block mb-2">📭</span>
            <p class="text-base font-bold text-slate-800 font-heading">O acervo está vazio no momento.</p>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              ${isRoot ? 'Nenhum material carregado ainda. O Master Admin pode carregar todo o acervo do OneDrive com 1 clique.' : 'Esta pasta ainda não possui subpastas ou documentos anexados.'}
            </p>
            ${isRoot && isMaster ? `
              <div class="mt-4">
                <button
                  type="button"
                  onclick="window.KnowledgeUploadPanel && window.KnowledgeUploadPanel.openImportSeedModal()"
                  class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>📥</span> <span>Importar Acervo do OneDrive (JSON)</span>
                </button>
              </div>
            ` : ''}
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

          const isSelected = this.selectedNodeIds.has(c.id);
          const cardBorder = isSelected
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40'
            : 'border-slate-200/90 ' + borderHoverColor;

          return `
            <div
              id="wiki-card-${c.id}"
              onclick="window.WikiKB.selectNode('${c.id}')"
              class="group bg-white hover:bg-slate-50/80 p-5 rounded-2xl border ${cardBorder} shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-2.5">
                    ${isCoordOrAdmin ? `
                      <input
                        type="checkbox"
                        data-node-id="${c.id}"
                        class="wiki-card-checkbox w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                        onclick="event.stopPropagation()"
                        onchange="window.WikiKB.toggleSelectNode('${c.id}', this.checked, event)"
                        ${isSelected ? 'checked' : ''}
                        title="Selecionar para mover ou excluir em lote"
                      />
                    ` : ''}
                    <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center text-xl shadow-2xs">
                      ${icon}
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}">
                      ${typeLabel}
                    </span>
                    ${isCoordOrAdmin ? `
                      <button
                        type="button"
                        onclick="event.stopPropagation(); window.WikiKB.openMoveModal('${c.id}')"
                        class="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        title="Mover ${isFld ? 'pasta' : 'arquivo'}"
                      >
                        📦
                      </button>
                      <button
                        type="button"
                        onclick="event.stopPropagation(); window.WikiKB.promptDeleteNode('${c.id}', '${c.type}')"
                        class="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Excluir ${isFld ? 'pasta' : 'arquivo'}"
                      >
                        🗑️
                      </button>
                    ` : ''}
                  </div>
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

      viewer.innerHTML = `
        <div class="space-y-6 animate-in fade-in duration-200">
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

                <div class="flex items-center gap-2 flex-wrap">
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
                  ${folderNode && isCoordOrAdmin ? `
                    <button
                      type="button"
                      onclick="window.WikiKB.openMoveModal('${folderNode.id}')"
                      class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Mover esta pasta para outro local"
                    >
                      <span>📦</span> <span>Mover Pasta</span>
                    </button>
                    <button
                      type="button"
                      onclick="window.WikiKB.promptDeleteNode('${folderNode.id}', 'folder')"
                      class="px-3 py-1.5 rounded-xl bg-red-900/70 hover:bg-red-800 text-red-200 border border-red-700/60 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Excluir esta pasta e seus conteúdos do acervo"
                    >
                      <span>🗑️</span> <span>Excluir Pasta</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Conteúdo da Pasta (Grid de Cards) -->
          <div>
            <div class="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Itens nesta pasta (${children.length})
              </h3>
              ${isCoordOrAdmin && children.length > 0 ? `
                <div class="flex items-center gap-2">
                  <label class="inline-flex items-center gap-2 text-xs text-slate-600 font-bold cursor-pointer select-none hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition">
                    <input
                      type="checkbox"
                      id="wiki-select-all-checkbox"
                      onchange="window.WikiKB.toggleSelectAllInFolder(this.checked)"
                      class="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      ${children.length > 0 && children.every(c => this.selectedNodeIds.has(c.id)) ? 'checked' : ''}
                    />
                    <span>Selecionar todos (${children.length})</span>
                  </label>
                </div>
              ` : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${childCardsHtml}
            </div>
          </div>
        </div>
      `;

      setTimeout(() => this.updateSelectionToolbar(), 10);
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
      const isCoordOrAdmin = window.KnowledgeService && typeof window.KnowledgeService.isCoordOrAdmin === 'function' ? window.KnowledgeService.isCoordOrAdmin() : false;

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

      // Visualizador dedicado de PDF no topo do artigo
      const isPdfDoc = docNode.isPdf || docNode.extension === 'pdf' || (docNode.fileName && docNode.fileName.toLowerCase().endsWith('.pdf')) || (docNode.pdfUrl && docNode.pdfUrl.toLowerCase().includes('.pdf')) || (docNode.mediaUrl && docNode.mediaUrl.toLowerCase().includes('.pdf'));
      const pdfTopViewerHtml = isPdfDoc ? this.renderPdfViewerHtml(docNode) : '';

      // Visualizador dedicado de Slides se houver apresentação associada
      const isSlideDeck = docNode.slides && Array.isArray(docNode.slides) && docNode.slides.length > 0;
      const slideTopViewerHtml = isSlideDeck ? this.renderSlideViewerHtml(docNode) : '';

      viewer.innerHTML = `
        <article class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
          
          <!-- Cabeçalho Oficial Paroquial (visível apenas na impressão - 1ª página) -->
          <div class="wiki-print-header">
            <div class="wiki-print-header-top">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 26pt;">⛪</span>
                <div>
                  <div style="font-size: 14pt; font-weight: 800; color: #064e3b; text-transform: uppercase; letter-spacing: 0.04em;">
                    Santuário Imaculado Coração de Maria
                  </div>
                  <div style="font-size: 9.5pt; color: #475569; font-weight: 600;">
                    Pastoral da Catequese • Arquidiocese de São Paulo
                  </div>
                </div>
              </div>
              <div style="text-align: right; font-size: 9pt; color: #334155; font-weight: 700;">
                <span style="background: #ecfdf5; color: #065f46; padding: 3px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                  ${docNode.etapa || 'Crisma Adultos'}
                </span>
                <div style="margin-top: 4px; font-size: 8.5pt; color: #64748b;">Ano Catequético 2026</div>
              </div>
            </div>
            <h1 class="wiki-print-title">${docNode.title}</h1>
            <p class="wiki-print-subtitle">Material oficial de formação catequética • Atualizado em ${updatedStr}</p>
          </div>

          <!-- Topo do Artigo na Interface Web -->
          <div class="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white no-print">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">📄</span>
                ${etapaBadge}
                <span class="text-xs text-slate-500 font-medium">
                  • ⏱️ ${readMinutes} min de leitura
                </span>
                ${isPdfDoc ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">PDF Integrado</span>' : ''}
                ${isSlideDeck ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">Slide Viewer</span>' : ''}
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
                  onclick="window.WikiKB.printDocument('${docNode.id}')"
                  class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Imprimir documento em formato oficial A4 da Paróquia"
                >
                  <span>🖨️</span> <span>Imprimir A4</span>
                </button>
                ${isCoordOrAdmin ? `
                  <button
                    type="button"
                    onclick="window.WikiKB.openMoveModal('${docNode.id}')"
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Mover este documento para outra pasta"
                  >
                    <span>📦</span> <span>Mover</span>
                  </button>
                  <button
                    type="button"
                    onclick="window.WikiKB.promptDeleteNode('${docNode.id}', 'document')"
                    class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Excluir este documento da Base de Conhecimento"
                  >
                    <span>🗑️</span> <span>Excluir</span>
                  </button>
                ` : ''}
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

          <!-- Área de Visualizadores Especiais (PDF no Topo ou Slides) -->
          <div class="px-6 sm:px-10 pt-6 no-print">
            ${pdfTopViewerHtml}
            ${slideTopViewerHtml}
          </div>

          <!-- Corpo do Conteúdo / Markdown Estilizado -->
          <div class="p-6 sm:p-10 wiki-prose leading-relaxed">
            ${isPdfDoc ? '<div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Camada de Texto Estruturado & Referências:</div>' : ''}
            ${htmlBody}
          </div>

          <!-- Rodapé Oficial Paroquial (visível apenas na impressão) -->
          <div class="wiki-print-footer">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>Santuário Imaculado Coração de Maria</strong> — Pastoral da Catequese
                <span style="margin: 0 4px;">•</span> catequese@santuarioicm.org.br
              </div>
              <div style="font-weight: 700;">
                Etapa: ${docNode.etapa || 'Crisma Adultos'}
              </div>
            </div>
          </div>

          <!-- Seção Inferior: Fontes Oficiais e Referências -->
          ${this.buildReferencesSectionHtml(docNode.references, docNode)}
        </article>
      `;

      // Inicializa Slide Viewer interativo se houver
      if (isSlideDeck) {
        setTimeout(() => this.initSlideViewer(docNode.slides), 50);
      }

      // Inicializa Leitor de PDF Universal (PDF.js) se for documento PDF
      if (isPdfDoc) {
        setTimeout(() => this.initPdfViewer(docNode), 60);
      }

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
      const isCoordOrAdmin = window.KnowledgeService && typeof window.KnowledgeService.isCoordOrAdmin === 'function' ? window.KnowledgeService.isCoordOrAdmin() : false;

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
      // --- VISUALIZADOR DE APRESENTAÇÃO DE SLIDES NA ÍNTEGRA ---
      else if (isPpt) {
        const { pptPdfUrl, pptDownloadUrl } = this.resolvePresentationUrls(mediaNode);
        const hasSlidesOutline = mediaNode.slides && mediaNode.slides.length > 0;

        playerHtml = `
          <div class="space-y-4">
            <!-- Palco de Visualização Universal da Apresentação com PDF.js -->
            ${this.renderPdfViewerHtml(mediaNode)}

            <!-- Roteiro e Notas Pedagógicas (Gaveta Opcional) -->
            ${hasSlidesOutline ? `
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white space-y-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 class="font-bold text-xs uppercase tracking-wider text-purple-400 font-heading flex items-center gap-1.5">
                    <span>💡</span> <span>Roteiro Pedagógico & Notas do Catequista (${mediaNode.slides.length} slides)</span>
                  </h4>
                  <button
                    type="button"
                    onclick="document.getElementById('wiki-ppt-outline-container')?.classList.toggle('hidden')"
                    class="text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    Alternar Detalhes
                  </button>
                </div>
                <div id="wiki-ppt-outline-container" class="space-y-3 max-h-96 overflow-y-auto pr-2 text-xs">
                  ${mediaNode.slides.map(s => `
                    <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <strong class="text-amber-400 text-xs block mb-1">Slide ${s.slideNumber}: ${s.title}</strong>
                      ${s.bullets && s.bullets.length ? `<ul class="list-disc list-inside text-slate-300 space-y-0.5">${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
                      ${s.notes ? `<p class="mt-2 text-amber-200/90 bg-amber-950/30 p-2 rounded-lg border border-amber-900/30"><strong>Nota:</strong> ${s.notes}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2 gap-2">
              <span>💡 Dica: No celular, toque nos botões ◀ / ▶ ou amplie com ＋ / － para visualizar cada slide em alta definição.</span>
              ${pptPdfUrl ? `
                <a href="${pptPdfUrl}" target="_blank" class="font-bold text-purple-700 hover:underline">
                  Abrir apresentação em tela cheia / nova aba ↗
                </a>
              ` : ''}
            </div>
          </div>
        `;
      }

      const finalDownloadUrl = isPpt
        ? this.resolvePresentationUrls(mediaNode).pptDownloadUrl
        : this.cleanWebUrl(mediaNode.mediaUrl);

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
              ${finalDownloadUrl ? `
                <a
                  href="${finalDownloadUrl}"
                  target="_blank"
                  download
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>📥</span> <span>Baixar Arquivo</span>
                </a>
              ` : ''}
              ${isCoordOrAdmin ? `
                <button
                  type="button"
                  onclick="window.WikiKB.openMoveModal('${mediaNode.id}')"
                  class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Mover este arquivo para outra pasta"
                >
                  <span>📦</span> <span>Mover</span>
                </button>
                <button
                  type="button"
                  onclick="window.WikiKB.promptDeleteNode('${mediaNode.id}', '${mediaNode.type}')"
                  class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Excluir este arquivo da Base de Conhecimento"
                >
                  <span>🗑️</span> <span>Excluir</span>
                </button>
              ` : ''}
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

      // Inicializa player customizado conforme o tipo de mídia
      if (isAudio) {
        setTimeout(() => this.initCustomAudioPlayer(), 50);
      } else if (isPpt) {
        setTimeout(() => this.initPdfViewer(mediaNode), 60);
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

    // ========================================================================
    // 9. LEITOR DEDICADO DE PDF E VISUALIZADOR DE SLIDES (ALTA FIDELIDADE)
    // ========================================================================
    pdfViewerState: {
      pdfDoc: null,
      pageNum: 1,
      numPages: 0,
      scale: 1.0,
      isRendering: false,
      pageNumPending: null,
      currentRenderTask: null,
      currentDocNode: null
    },

    cleanupPdfViewer: function () {
      if (this.pdfViewerState.currentRenderTask) {
        try {
          this.pdfViewerState.currentRenderTask.cancel();
        } catch (e) {}
        this.pdfViewerState.currentRenderTask = null;
      }
      this.pdfViewerState.pdfDoc = null;
      this.pdfViewerState.isRendering = false;
      this.pdfViewerState.pageNumPending = null;
      this.pdfViewerState.currentDocNode = null;
    },

    renderPdfViewerHtml: function (docNode) {
      const ext = (docNode.extension || '').toLowerCase();
      const isPpt = ext === 'pptx' || ext === 'ppt' || docNode.type === 'presentation' || (docNode.mimeType && docNode.mimeType.includes('presentation'));
      const pdfUrl = this.resolveDocPdfUrl(docNode);
      const pageCountStr = docNode.pageCount ? ` (${docNode.pageCount} ${isPpt ? 'slides' : 'páginas'})` : '';
      const isCloudOrWebUrl = !!pdfUrl;
      const { pptDownloadUrl } = isPpt ? this.resolvePresentationUrls(docNode) : { pptDownloadUrl: '' };

      if (!isCloudOrWebUrl) {
        // Fallback elegante quando o binário original ainda não foi disponibilizado na nuvem
        return `
          <div class="wiki-pdf-viewer mb-6 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden p-5 sm:p-8">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-400 shrink-0">
                ${isPpt ? '📽️' : '📕'}
              </div>
              <div class="flex-1 text-center sm:text-left space-y-2">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 class="font-bold text-sm text-slate-100 font-heading">
                    ${isPpt ? 'Apresentação de Slides Original' : 'Leitor de PDF Original'} ${pageCountStr}
                  </h4>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                    ⏳ Sincronização em Nuvem Pendente
                  </span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  O arquivo original (<strong class="text-slate-300">${docNode.fileName || docNode.title}.${ext || (isPpt ? 'pptx' : 'pdf')}</strong>) está catalogado no acervo e aguarda upload na nuvem.
                  Todo o conteúdo e estrutura pedagógica já estão disponíveis para leitura e consulta logo abaixo.
                </p>
                <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onclick="document.querySelector('.wiki-prose, #wiki-ppt-outline-container')?.scrollIntoView({ behavior: 'smooth' })"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>📖</span> <span>Consultar Conteúdo Abaixo</span>
                  </button>
                  <button
                    type="button"
                    onclick="window.print()"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🖨️</span> <span>Imprimir / Salvar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Visualizador interativo universal de PDF via PDF.js
      return `
        <div id="wiki-pdf-viewer-root" class="wiki-pdf-viewer mb-6">
          <div class="wiki-pdf-toolbar">
            <div class="flex items-center gap-2">
              <span class="text-base">${isPpt ? '📽️' : '📕'}</span>
              <span class="font-bold text-xs uppercase tracking-wider text-slate-200">
                ${isPpt ? 'Slides na Íntegra' : 'Leitor de PDF'}
              </span>
              <span id="wiki-pdf-page-badge" class="bg-slate-800 text-slate-300 text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-mono font-bold border border-slate-700">
                ${isPpt ? 'Slide' : 'Pág.'} <span id="wiki-pdf-current-page-num">1</span> de <span id="wiki-pdf-total-pages">${docNode.pageCount || '?'}</span>
              </span>
            </div>

            <!-- Controles de Navegação e Zoom -->
            <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
              <!-- Botão Anterior -->
              <button
                type="button"
                id="wiki-pdf-btn-prev"
                onclick="window.WikiKB.pdfPrevPage()"
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                title="${isPpt ? 'Slide Anterior' : 'Página Anterior'} (←)"
              >
                <span>◀</span> <span class="hidden sm:inline">Anterior</span>
              </button>

              <!-- Input de Página Direta -->
              <div class="flex items-center text-xs text-slate-400 gap-1 bg-slate-800/80 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-slate-700">
                <span class="hidden sm:inline">Ir:</span>
                <input
                  id="wiki-pdf-page-input"
                  type="number"
                  min="1"
                  max="${docNode.pageCount || 999}"
                  value="1"
                  onchange="window.WikiKB.pdfGoToPage(this.value)"
                  class="w-9 sm:w-10 text-center bg-slate-900 text-white font-mono rounded px-1 py-0.5 border border-slate-600 text-xs"
                />
              </div>

              <!-- Botão Próxima -->
              <button
                type="button"
                id="wiki-pdf-btn-next"
                onclick="window.WikiKB.pdfNextPage()"
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                title="${isPpt ? 'Próximo Slide' : 'Próxima Página'} (→)"
              >
                <span class="hidden sm:inline">Próxima</span> <span>▶</span>
              </button>

              <!-- Divisor -->
              <span class="text-slate-600 hidden sm:inline">|</span>

              <!-- Zoom Out -->
              <button
                type="button"
                onclick="window.WikiKB.pdfZoomOut()"
                class="px-2 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                title="Diminuir Zoom (-)"
              >
                <span>🔍－</span>
              </button>

              <!-- Zoom Label -->
              <span id="wiki-pdf-zoom-label" class="text-[11px] font-mono text-slate-300 w-9 sm:w-11 text-center">100%</span>

              <!-- Zoom In -->
              <button
                type="button"
                onclick="window.WikiKB.pdfZoomIn()"
                class="px-2 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                title="Aumentar Zoom (+)"
              >
                <span>🔍＋</span>
              </button>

              <!-- Ajustar Largura -->
              <button
                type="button"
                onclick="window.WikiKB.pdfFitWidth()"
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition hidden sm:inline-flex items-center gap-1 cursor-pointer"
                title="Ajustar à Largura"
              >
                <span>↔</span> <span>Ajustar</span>
              </button>

              <!-- Divisor -->
              <span class="text-slate-600 hidden md:inline">|</span>

              <!-- Ações -->
              <a
                href="${pdfUrl}"
                target="_blank"
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                title="Abrir em Nova Aba"
              >
                <span>↗</span> <span class="hidden md:inline">Nova Aba</span>
              </a>

              ${isPpt && pptDownloadUrl ? `
                <a
                  href="${pptDownloadUrl}"
                  download
                  class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  title="Baixar arquivo original editável (.${(docNode.extension || 'PPTX').toUpperCase()})"
                >
                  <span>📥</span> <span class="hidden sm:inline">Baixar .${(docNode.extension || 'PPTX').toUpperCase()}</span>
                </a>
              ` : ''}

              <a
                href="${pdfUrl}"
                download
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                title="${isPpt ? 'Baixar Apresentação em PDF' : 'Baixar PDF Original'}"
              >
                <span>📥</span> <span class="hidden md:inline">${isPpt ? 'Baixar PDF' : 'Baixar'}</span>
              </a>

              <button
                type="button"
                onclick="window.WikiKB.togglePdfFullscreen()"
                class="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Tela Cheia"
              >
                <span>⛶</span>
              </button>
            </div>
          </div>

          <!-- Palco de Renderização Canvas do PDF.js -->
          <div id="wiki-pdf-canvas-container" class="wiki-pdf-canvas-container min-h-[300px] sm:min-h-[420px] max-h-[720px] overflow-auto flex flex-col items-center justify-start p-2 sm:p-4 bg-slate-900 relative">
            <div id="wiki-pdf-spinner" class="my-auto py-12 flex flex-col items-center justify-center text-slate-300 space-y-3">
              <div class="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-semibold">${isPpt ? 'Carregando slides...' : 'Carregando visualizador de PDF...'}</p>
            </div>
            <canvas id="wiki-pdf-canvas" class="wiki-pdf-canvas hidden"></canvas>
          </div>
        </div>
      `;
    },

    initPdfViewer: async function (docNode) {
      this.cleanupPdfViewer();

      const container = document.getElementById('wiki-pdf-canvas-container');
      const canvas = document.getElementById('wiki-pdf-canvas');
      if (!container || !canvas) return;

      const pdfUrl = this.resolveDocPdfUrl(docNode);
      if (!pdfUrl) {
        return; // Fallback já exibido no template
      }

      this.pdfViewerState.currentDocNode = docNode;
      this.pdfViewerState.pageNum = 1;

      if (typeof pdfjsLib === 'undefined') {
        container.innerHTML = `
          <div class="py-12 px-6 text-center text-slate-300 space-y-3">
            <span class="text-3xl">⚠️</span>
            <p class="text-sm font-bold text-slate-200">Biblioteca PDF.js não disponível.</p>
            <p class="text-xs text-slate-400">Você pode abrir o arquivo diretamente no navegador pelo botão acima.</p>
          </div>
        `;
        return;
      }

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true
        });

        const pdfDoc = await loadingTask.promise;
        this.pdfViewerState.pdfDoc = pdfDoc;
        this.pdfViewerState.numPages = pdfDoc.numPages;

        const totalEl = document.getElementById('wiki-pdf-total-pages');
        if (totalEl) totalEl.textContent = pdfDoc.numPages;

        const pageInput = document.getElementById('wiki-pdf-page-input');
        if (pageInput) {
          pageInput.max = pdfDoc.numPages;
          pageInput.value = 1;
        }

        // Ajusta largura inicial automaticamente
        await this.pdfFitWidth(false);
      } catch (err) {
        console.warn('Erro ao carregar PDF via PDF.js:', err);
        container.innerHTML = `
          <div class="py-12 px-6 flex flex-col items-center justify-center text-slate-300 space-y-3 text-center">
            <span class="text-3xl">⚠️</span>
            <p class="text-sm font-bold text-slate-100">Não foi possível carregar a prévia do PDF.</p>
            <p class="text-xs text-slate-400 max-w-md">O documento pode estar temporariamente inacessível na nuvem ou requer conexão direta.</p>
            <div class="flex items-center gap-2 pt-2">
              <a href="${pdfUrl}" target="_blank" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition">
                Abrir Separado ↗
              </a>
              <button type="button" onclick="window.WikiKB.initPdfViewer(window.WikiKB.pdfViewerState.currentDocNode)" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition">
                Tentar Novamente 🔄
              </button>
            </div>
          </div>
        `;
      }
    },

    renderPdfPage: async function (num) {
      const state = this.pdfViewerState;
      if (!state.pdfDoc) return;
      if (num < 1) num = 1;
      if (num > state.numPages) num = state.numPages;
      state.pageNum = num;

      const pageInput = document.getElementById('wiki-pdf-page-input');
      if (pageInput) pageInput.value = num;

      const curBadge = document.getElementById('wiki-pdf-current-page-num');
      if (curBadge) curBadge.textContent = num;

      const prevBtn = document.getElementById('wiki-pdf-btn-prev');
      const nextBtn = document.getElementById('wiki-pdf-btn-next');
      if (prevBtn) prevBtn.disabled = (num <= 1);
      if (nextBtn) nextBtn.disabled = (num >= state.numPages);

      const zoomLabel = document.getElementById('wiki-pdf-zoom-label');
      if (zoomLabel) zoomLabel.textContent = `${Math.round(state.scale * 100)}%`;

      if (state.isRendering) {
        state.pageNumPending = num;
        return;
      }
      state.isRendering = true;

      const canvas = document.getElementById('wiki-pdf-canvas');
      const spinner = document.getElementById('wiki-pdf-spinner');
      if (!canvas) {
        state.isRendering = false;
        return;
      }

      try {
        const page = await state.pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: state.scale });
        const ctx = canvas.getContext('2d');

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;

        const renderContext = {
          canvasContext: ctx,
          transform: transform,
          viewport: viewport
        };

        if (state.currentRenderTask) {
          try { state.currentRenderTask.cancel(); } catch (e) {}
        }

        state.currentRenderTask = page.render(renderContext);
        await state.currentRenderTask.promise;
        state.currentRenderTask = null;

        if (spinner) spinner.classList.add('hidden');
        canvas.classList.remove('hidden');
      } catch (err) {
        if (err && err.name === 'RenderingCancelledException') {
          // Cancelamento intencional ao avançar rapidamente
        } else {
          console.warn('Erro na renderização da página:', err);
        }
      } finally {
        state.isRendering = false;
        if (state.pageNumPending !== null) {
          const next = state.pageNumPending;
          state.pageNumPending = null;
          this.renderPdfPage(next);
        }
      }
    },

    pdfPrevPage: function () {
      if (this.pdfViewerState.pageNum <= 1) return;
      this.renderPdfPage(this.pdfViewerState.pageNum - 1);
    },

    pdfNextPage: function () {
      if (this.pdfViewerState.pageNum >= this.pdfViewerState.numPages) return;
      this.renderPdfPage(this.pdfViewerState.pageNum + 1);
    },

    pdfGoToPage: function (val) {
      const page = parseInt(val, 10);
      if (!isNaN(page)) {
        this.renderPdfPage(page);
      }
    },

    pdfZoomIn: function () {
      this.pdfViewerState.scale = Math.min(this.pdfViewerState.scale + 0.2, 3.0);
      this.renderPdfPage(this.pdfViewerState.pageNum);
    },

    pdfZoomOut: function () {
      this.pdfViewerState.scale = Math.max(this.pdfViewerState.scale - 0.2, 0.5);
      this.renderPdfPage(this.pdfViewerState.pageNum);
    },

    pdfFitWidth: async function (renderImmediately = true) {
      const state = this.pdfViewerState;
      if (!state.pdfDoc) return;
      const container = document.getElementById('wiki-pdf-canvas-container');
      if (!container) return;

      try {
        const page = await state.pdfDoc.getPage(state.pageNum || 1);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const pad = window.innerWidth < 640 ? 16 : 48;
        const availableWidth = Math.max((container.clientWidth || window.innerWidth) - pad, 200);
        state.scale = Math.min(Math.max(availableWidth / unscaledViewport.width, 0.2), 3.0);
        if (renderImmediately !== false) {
          this.renderPdfPage(state.pageNum || 1);
        } else {
          await this.renderPdfPage(state.pageNum || 1);
        }
      } catch (e) {
        state.scale = 1.0;
        this.renderPdfPage(state.pageNum || 1);
      }
    },

    togglePdfFullscreen: function () {
      const el = document.getElementById('wiki-pdf-viewer-root');
      if (!el) return;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    },

    // --- SLIDE VIEWER INTERATIVO PARA APRESENTAÇÕES ---
    activeSlidesList: [],
    activeSlideIndex: 0,
    slideKeyHandlerAttached: false,

    renderSlideViewerHtml: function (node) {
      const slides = node.slides || [];
      if (!slides.length) return '';

      const total = slides.length;
      const initialSlide = slides[0];
      const pptUrl = this.resolvePresentationUrls(node).pptDownloadUrl || this.cleanWebUrl(node.mediaUrl);

      const thumbsHtml = slides.map((s, idx) => `
        <div
          class="wiki-slide-thumb ${idx === 0 ? 'active' : ''}"
          id="wiki-slide-thumb-${idx}"
          onclick="window.WikiKB.goToSlide(${idx})"
          title="Slide ${idx + 1}: ${s.title || ''}"
        >
          <div class="font-bold text-[9px] text-slate-300">#${idx + 1}</div>
          <div class="truncate text-[8.5px] mt-0.5">${s.title || 'Slide'}</div>
        </div>
      `).join('');

      return `
        <div id="wiki-slide-viewer-box" class="wiki-slide-viewer mb-6">
          <!-- Barra Superior do Slide Viewer -->
          <div class="bg-slate-950 p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">📽️</span>
              <span class="font-bold text-xs uppercase tracking-wider text-purple-400 font-heading">
                Slide Viewer Interativo
              </span>
              <span id="wiki-slide-counter-badge" class="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                Slide 1 de ${total}
              </span>
            </div>

            <!-- Controles de Navegação -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="window.WikiKB.prevSlide()"
                id="wiki-slide-prev-btn"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
                title="Slide Anterior (←)"
              >
                <span>◀</span> <span class="hidden sm:inline">Anterior</span>
              </button>

              <button
                type="button"
                onclick="window.WikiKB.nextSlide()"
                id="wiki-slide-next-btn"
                class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
                title="Próximo Slide (→)"
              >
                <span class="hidden sm:inline">Próximo</span> <span>▶</span>
              </button>

              <button
                type="button"
                onclick="window.WikiKB.toggleSlideNotes()"
                id="wiki-slide-notes-toggle-btn"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Mostrar/Ocultar Notas do Catequista"
              >
                <span>💡</span> <span class="hidden sm:inline">Notas</span>
              </button>

              <button
                type="button"
                onclick="window.WikiKB.toggleSlideFullscreen()"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Modo Apresentação / Tela Cheia (F)"
              >
                <span>⛶</span>
              </button>

              ${pptUrl ? `
                <a
                  href="${pptUrl}"
                  download
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center gap-1"
                  title="Baixar arquivo de apresentação original"
                >
                  <span>📥</span>
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Palco do Slide Ativo -->
          <div id="wiki-slide-stage" class="wiki-slide-stage">
            <h2 id="wiki-slide-title" class="wiki-slide-card-title">
              ${initialSlide.title}
            </h2>
            <ul id="wiki-slide-bullets" class="wiki-slide-card-bullets">
              ${(initialSlide.bullets || []).map(b => `<li>${b}</li>`).join('') || '<li class="text-slate-400 italic">Slide visual / capa de apresentação</li>'}
            </ul>
          </div>

          <!-- Gaveta de Notas do Catequista (Opcional) -->
          <div id="wiki-slide-notes-drawer" class="wiki-slide-notes-drawer ${initialSlide.notes ? '' : 'hidden'}">
            <div class="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 font-heading">
              <span>💡</span> <span>Orientações para o Catequista:</span>
            </div>
            <p id="wiki-slide-notes-text" class="text-slate-300 leading-relaxed text-xs sm:text-sm">
              ${initialSlide.notes || 'Nenhuma orientação específica gravada para este slide.'}
            </p>
          </div>

          <!-- Barra de Miniaturas dos Slides -->
          <div class="wiki-slide-thumbnails">
            ${thumbsHtml}
          </div>

          <!-- Dica de Navegação -->
          <div class="bg-slate-950 px-4 py-1.5 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-900">
            <span>Dica: Use as teclas <strong>←</strong> e <strong>→</strong> do teclado para avançar ou voltar slides.</span>
            <span>Apresentação Pastoral ICM</span>
          </div>
        </div>
      `;
    },

    initSlideViewer: function (slides) {
      if (!slides || !slides.length) return;
      this.activeSlidesList = slides;
      this.activeSlideIndex = 0;
      this.updateSlideDisplay();

      // Anexa teclado uma única vez
      if (!this.slideKeyHandlerAttached) {
        this.slideKeyHandlerAttached = true;
        window.addEventListener('keydown', e => {
          const viewerBox = document.getElementById('wiki-slide-viewer-box');
          if (!viewerBox) return;

          if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            window.WikiKB.nextSlide();
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            window.WikiKB.prevSlide();
          } else if (e.key === 'f' && !e.target.matches('input, textarea')) {
            window.WikiKB.toggleSlideFullscreen();
          }
        });
      }
    },

    goToSlide: function (idx) {
      if (!this.activeSlidesList || idx < 0 || idx >= this.activeSlidesList.length) return;
      this.activeSlideIndex = idx;
      this.updateSlideDisplay();
    },

    nextSlide: function () {
      if (!this.activeSlidesList || this.activeSlideIndex >= this.activeSlidesList.length - 1) return;
      this.activeSlideIndex++;
      this.updateSlideDisplay();
    },

    prevSlide: function () {
      if (!this.activeSlidesList || this.activeSlideIndex <= 0) return;
      this.activeSlideIndex--;
      this.updateSlideDisplay();
    },

    updateSlideDisplay: function () {
      const slides = this.activeSlidesList;
      if (!slides || !slides.length) return;
      const cur = slides[this.activeSlideIndex];
      if (!cur) return;

      const titleEl = document.getElementById('wiki-slide-title');
      const bulletsEl = document.getElementById('wiki-slide-bullets');
      const badgeEl = document.getElementById('wiki-slide-counter-badge');
      const notesDrawer = document.getElementById('wiki-slide-notes-drawer');
      const notesText = document.getElementById('wiki-slide-notes-text');
      const prevBtn = document.getElementById('wiki-slide-prev-btn');
      const nextBtn = document.getElementById('wiki-slide-next-btn');

      if (titleEl) titleEl.textContent = cur.title || `Slide ${this.activeSlideIndex + 1}`;
      if (bulletsEl) {
        if (cur.bullets && cur.bullets.length) {
          bulletsEl.innerHTML = cur.bullets.map(b => `<li>${b}</li>`).join('');
        } else {
          bulletsEl.innerHTML = '<li class="text-slate-400 italic">Slide visual / tópico de abertura</li>';
        }
      }

      if (badgeEl) {
        badgeEl.textContent = `Slide ${this.activeSlideIndex + 1} de ${slides.length}`;
      }

      if (notesText && notesDrawer) {
        if (cur.notes && cur.notes.trim()) {
          notesText.textContent = cur.notes;
          notesDrawer.classList.remove('hidden');
        } else {
          notesText.textContent = 'Sem anotações complementares para este slide.';
        }
      }

      if (prevBtn) prevBtn.disabled = this.activeSlideIndex === 0;
      if (nextBtn) nextBtn.disabled = this.activeSlideIndex === slides.length - 1;

      // Atualiza miniatura ativa e rola para ela
      document.querySelectorAll('.wiki-slide-thumb').forEach((thumb, idx) => {
        if (idx === this.activeSlideIndex) {
          thumb.classList.add('active');
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('active');
        }
      });
    },

    toggleSlideNotes: function () {
      const notesDrawer = document.getElementById('wiki-slide-notes-drawer');
      if (notesDrawer) {
        notesDrawer.classList.toggle('hidden');
      }
    },

    toggleSlideFullscreen: function () {
      const box = document.getElementById('wiki-slide-viewer-box');
      if (!box) return;
      if (!document.fullscreenElement) {
        if (box.requestFullscreen) box.requestFullscreen();
        else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
        box.classList.add('wiki-slide-fullscreen');
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        box.classList.remove('wiki-slide-fullscreen');
      }
    },

    // --- IMPRESSÃO PROFISSIONAL A4 DA PARÓQUIA ---
    printDocument: function (docId) {
      document.body.classList.add('printing-wiki-doc');

      const cleanup = () => {
        document.body.classList.remove('printing-wiki-doc');
        window.removeEventListener('afterprint', cleanup);
      };

      window.addEventListener('afterprint', cleanup);

      // Pequeno timeout para permitir aplicação do CSS antes do diálogo de impressão nativo
      setTimeout(() => {
        window.print();
        // Fallback caso afterprint não dispare em navegadores antigos
        setTimeout(cleanup, 2500);
      }, 50);
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

          let targetUrl = ref.url || '#';
          if (ref.type === 'biblia' || (targetUrl && targetUrl.includes('bibliaonline.com.br'))) {
            if (window.GeminiReferenceExtractor && typeof window.GeminiReferenceExtractor.enrichAndDeduplicate === 'function') {
              const enriched = window.GeminiReferenceExtractor.enrichAndDeduplicate([ref]);
              if (enriched && enriched[0] && enriched[0].url) {
                targetUrl = enriched[0].url;
              }
            } else if (targetUrl.includes('bibliaonline.com.br')) {
              targetUrl = 'https://www.bibliacatolica.com.br/biblia-ave-maria/';
            }
          }

          return `
            <a
              href="${targetUrl}"
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
      const backdrop = document.getElementById('wiki-mobile-backdrop');
      if (!treeCol) return;

      const isOpening = typeof forceState === 'boolean'
        ? forceState
        : !treeCol.classList.contains('mobile-open');

      if (isOpening) {
        treeCol.classList.add('mobile-open');
        treeCol.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden-mobile-wiki');
      } else {
        treeCol.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden-mobile-wiki');
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

      // Redimensionamento de tela reajusta o zoom do PDF/Slides automaticamente
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (this.pdfViewerState && this.pdfViewerState.pdfDoc) {
            this.pdfFitWidth(true);
          }
        }, 200);
      });

      // Fecha o lightbox ou gaveta lateral com a tecla Esc
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.closeImageLightbox();
          this.toggleMobileSidebar(false);
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
