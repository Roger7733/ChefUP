export type PassoAula = {
  categoria: string;        // ex: "PREPARAR", "CORTAR"
  titulo: string;           // ex: "Ferva a água com sal"
  instrucao: string;        // o texto explicativo do passo
  tempoSegundos?: number;   // opcional: timer sugerido
  checklist: string[];      // itens pra conferir
};

export type ConteudoFase = {
  descricao: string;
  tempoMin: number;
  dificuldade: string;      // "Iniciante" | "Intermediário" | "Avançado"
  ingredientes: { nome: string; quantidade: string }[];
  passos: PassoAula[];
};

export const CONTEUDO_FASES: Record<string, ConteudoFase> = {
  'italiana-1': {
    descricao:
      'A base de tudo na cozinha italiana. Aprenda a cozinhar a massa no ponto "al dente" — firme por dentro, cozida por igual.',
    tempoMin: 15,
    dificuldade: 'Iniciante',
    ingredientes: [
      { nome: 'Massa (espaguete)', quantidade: '200 g' },
      { nome: 'Água', quantidade: '2 litros' },
      { nome: 'Sal', quantidade: '1 col. de sopa' },
    ],
    passos: [
      {
        categoria: 'PREPARAR',
        titulo: 'Ferva a água com sal',
        instrucao:
          'Use bastante água — cerca de 1 litro para cada 100 g de massa. Quando ferver, adicione o sal: a água deve ficar saborosa, como "água do mar".',
        tempoSegundos: 600,
        checklist: ['Panela grande', 'Água fervendo', 'Sal adicionado'],
      },
      {
        categoria: 'COZINHAR',
        titulo: 'Cozinhe a massa',
        instrucao:
          'Adicione a massa e mexa nos primeiros segundos para não grudar. Cozinhe pelo tempo da embalagem MENOS 1 minuto.',
        tempoSegundos: 480,
        checklist: ['Massa na água', 'Mexeu no início'],
      },
      {
        categoria: 'TESTAR',
        titulo: 'Teste o ponto al dente',
        instrucao:
          'Prove um pedaço: deve estar firme no centro, mas não cru. Escorra imediatamente e guarde um pouco da água do cozimento (serve para molhos).',
        checklist: ['Testou o ponto', 'Escorreu a massa', 'Guardou um pouco da água'],
      },
    ],
  },
    'italiana-2': {
    descricao:
      'Sua primeira receita completa! Você vai usar a massa que aprendeu a cozinhar e juntar com um refogado simples de alho no azeite. Um clássico que todo cozinheiro precisa saber.',
    tempoMin: 20,
    dificuldade: 'Iniciante',
    ingredientes: [
      { nome: 'Espaguete', quantidade: '200 g' },
      { nome: 'Alho', quantidade: '4 dentes' },
      { nome: 'Azeite de oliva', quantidade: '4 colheres de sopa' },
      { nome: 'Sal', quantidade: 'a gosto' },
      { nome: 'Salsinha picada', quantidade: 'a gosto (opcional)' },
    ],
    passos: [
      {
        categoria: 'Preparo',
        titulo: 'Fatie o alho',
        instrucao:
          'Descasque os dentes de alho e corte em fatias bem finas. Quanto mais fino, mais rápido e por igual ele doura.',
        checklist: ['Alho descascado', 'Fatias finas e parecidas no tamanho'],
      },
      {
        categoria: 'Cozimento',
        titulo: 'Cozinhe a massa al dente',
        instrucao:
          'Ferva bastante água com sal, junte o espaguete e cozinhe até ficar al dente (macio por fora, firme no centro). Antes de escorrer, guarde meia xícara da água do cozimento.',
        tempoSegundos: 600,
        checklist: ['Água fervendo com sal', 'Guardei um pouco da água da massa', 'Massa al dente, escorrida'],
      },
      {
        categoria: 'Refogado',
        titulo: 'Doure o alho no azeite',
        instrucao:
          'Em fogo baixo, aqueça o azeite e adicione o alho. Mexa até ficar levemente dourado — cuidado para não queimar, senão amarga. Desligue assim que pegar cor.',
        tempoSegundos: 120,
        checklist: ['Fogo baixo', 'Alho dourado (não queimado)'],
      },
      {
        categoria: 'Montagem',
        titulo: 'Junte tudo',
        instrucao:
          'Misture a massa escorrida no azeite com alho. Se precisar soltar, use um pouco da água que você guardou. Finalize com salsinha e sirva.',
        checklist: ['Massa misturada no alho e óleo', 'Ajustei o sal'],
      },
    ],
  },
  'italiana-3': {
    descricao:
      'Hora de aprender uma técnica de faca. O corte de cebola em cubos pequenos aparece em quase toda receita salgada — e feito do jeito certo é mais seguro e mais rápido.',
    tempoMin: 10,
    dificuldade: 'Iniciante',
    ingredientes: [{ nome: 'Cebola', quantidade: '1 unidade' }],
    passos: [
      {
        categoria: 'Segurança',
        titulo: 'Posição das mãos',
        instrucao:
          'Use uma faca bem afiada sobre uma tábua firme. A mão que segura a cebola fica em formato de "garra", com as pontas dos dedos recolhidas para dentro, longe da lâmina.',
        checklist: ['Tábua firme (um pano embaixo ajuda)', 'Mão em garra, dedos recolhidos'],
      },
      {
        categoria: 'Corte',
        titulo: 'Corte ao meio e descasque',
        instrucao:
          'Corte a cebola ao meio passando pela raiz. Descasque cada metade, mas NÃO corte a raiz fora — é ela que segura as camadas juntas enquanto você pica.',
        checklist: ['Cebola cortada ao meio', 'Casca removida, raiz preservada'],
      },
      {
        categoria: 'Corte',
        titulo: 'Cortes na horizontal e na vertical',
        instrucao:
          'Com a metade apoiada na tábua, faça cortes paralelos na horizontal (sem chegar na raiz) e depois cortes verticais bem juntinhos, ainda segurando pela raiz.',
        checklist: ['Cortes verticais próximos uns dos outros', 'Raiz ainda inteira'],
      },
      {
        categoria: 'Corte',
        titulo: 'Forme os cubinhos',
        instrucao:
          'Agora corte no sentido contrário e a cebola vai cair em cubinhos. Quanto mais próximos os cortes anteriores, menores e mais uniformes ficam os cubos.',
        checklist: ['Cubos pequenos e parecidos'],
      },
    ],
  },
  'italiana-4': {
    descricao:
      'Com o corte de cebola na mão, você vai fazer um molho de tomate do zero. É a base do macarrão ao sugo e da lasanha que vêm pela frente.',
    tempoMin: 30,
    dificuldade: 'Intermediário',
    ingredientes: [
      { nome: 'Tomate maduro', quantidade: '6 unidades (ou 1 lata de tomate pelado)' },
      { nome: 'Cebola', quantidade: '1 unidade' },
      { nome: 'Alho', quantidade: '2 dentes' },
      { nome: 'Azeite de oliva', quantidade: '3 colheres de sopa' },
      { nome: 'Sal', quantidade: 'a gosto' },
      { nome: 'Açúcar', quantidade: '1 pitada' },
      { nome: 'Manjericão', quantidade: 'algumas folhas' },
    ],
    passos: [
      {
        categoria: 'Preparo',
        titulo: 'Pique cebola e alho',
        instrucao:
          'Use a técnica que você aprendeu para picar a cebola em cubinhos. Fatie o alho fininho. Se usar tomate fresco, corte em pedaços pequenos.',
        checklist: ['Cebola em cubos', 'Alho fatiado', 'Tomate picado'],
      },
      {
        categoria: 'Refogado',
        titulo: 'Refogue a base',
        instrucao:
          'Aqueça o azeite, junte a cebola e mexa até ficar transparente. Adicione o alho e refogue mais alguns segundos, sem deixar queimar.',
        tempoSegundos: 180,
        checklist: ['Cebola transparente', 'Alho perfumado'],
      },
      {
        categoria: 'Cozimento',
        titulo: 'Cozinhe o molho',
        instrucao:
          'Junte o tomate, tempere com sal e uma pitada de açúcar (equilibra a acidez). Cozinhe em fogo baixo, mexendo de vez em quando, até encorpar.',
        tempoSegundos: 900,
        checklist: ['Fogo baixo', 'Molho encorpado, não aguado', 'Sal acertado'],
      },
      {
        categoria: 'Finalização',
        titulo: 'Finalize com manjericão',
        instrucao:
          'Desligue o fogo e misture as folhas de manjericão rasgadas. O calor do molho solta o aroma sem murchar demais as folhas.',
        checklist: ['Manjericão incorporado'],
      },
    ],
  },
  'italiana-5': {
    descricao:
      'Agora é só juntar as peças: a massa al dente da fase 1 com o molho de tomate da fase 4. O resultado é um macarrão ao sugo de verdade, feito por você do começo ao fim.',
    tempoMin: 20,
    dificuldade: 'Iniciante',
    ingredientes: [
      { nome: 'Espaguete', quantidade: '200 g' },
      { nome: 'Molho de tomate', quantidade: '1 porção (o que você fez na fase anterior)' },
      { nome: 'Sal', quantidade: 'a gosto' },
      { nome: 'Queijo parmesão ralado', quantidade: 'a gosto' },
    ],
    passos: [
      {
        categoria: 'Cozimento',
        titulo: 'Cozinhe a massa al dente',
        instrucao:
          'Ferva água com sal e cozinhe o espaguete até o ponto al dente. Guarde um pouco da água antes de escorrer.',
        tempoSegundos: 600,
        checklist: ['Massa al dente', 'Guardei um pouco da água'],
      },
      {
        categoria: 'Cozimento',
        titulo: 'Aqueça o molho',
        instrucao:
          'Em uma panela larga, aqueça o molho de tomate em fogo baixo. Se estiver muito grosso, adicione um pouco da água da massa.',
        tempoSegundos: 120,
        checklist: ['Molho quente'],
      },
      {
        categoria: 'Montagem',
        titulo: 'Misture massa e molho na panela',
        instrucao:
          'Junte a massa escorrida direto no molho e misture em fogo baixo por um minuto. Isso faz o molho "grudar" na massa, em vez de ficar só por cima.',
        tempoSegundos: 60,
        checklist: ['Massa envolvida pelo molho'],
      },
      {
        categoria: 'Finalização',
        titulo: 'Sirva com parmesão',
        instrucao: 'Sirva quente e finalize com queijo parmesão ralado por cima.',
        checklist: ['Prato montado'],
      },
    ],
  },
  'italiana-6': {
    descricao:
      'O soffritto é a base aromática da cozinha italiana: cebola, cenoura e salsão refogados devagar. É o segredo de sabor de molhos encorpados como o da bolonhesa.',
    tempoMin: 15,
    dificuldade: 'Intermediário',
    ingredientes: [
      { nome: 'Cebola', quantidade: '1 unidade' },
      { nome: 'Cenoura', quantidade: '1 unidade' },
      { nome: 'Salsão (aipo)', quantidade: '1 talo' },
      { nome: 'Azeite de oliva', quantidade: '3 colheres de sopa' },
    ],
    passos: [
      {
        categoria: 'Corte',
        titulo: 'Pique os três em cubinhos',
        instrucao:
          'Use a técnica de corte que você já aprendeu para picar cebola, cenoura e salsão em cubinhos bem pequenos e parecidos. Tamanho igual = cozimento por igual.',
        checklist: ['Cebola em cubos', 'Cenoura em cubos', 'Salsão em cubos'],
      },
      {
        categoria: 'Refogado',
        titulo: 'Comece pela cebola',
        instrucao:
          'Aqueça o azeite em fogo baixo e junte a cebola primeiro. Ela precisa amolecer e ficar transparente antes dos outros legumes.',
        tempoSegundos: 180,
        checklist: ['Cebola transparente'],
      },
      {
        categoria: 'Refogado',
        titulo: 'Junte cenoura e salsão',
        instrucao:
          'Adicione a cenoura e o salsão e refogue devagar, mexendo de vez em quando, até tudo ficar macio e perfumado. Não deixe dourar demais — soffritto é suave.',
        tempoSegundos: 300,
        checklist: ['Legumes macios', 'Cheiro perfumado, sem queimar'],
      },
    ],
  },
  'italiana-7': {
    descricao:
      'A receita final do mundo italiano! Aqui você junta tudo: o molho de tomate, o soffritto e o cozimento da massa viram uma lasanha à bolonhesa em camadas. É o seu exame de mestre.',
    tempoMin: 60,
    dificuldade: 'Avançado',
    ingredientes: [
      { nome: 'Massa de lasanha', quantidade: '1 pacote' },
      { nome: 'Carne moída', quantidade: '500 g' },
      { nome: 'Soffritto (cebola, cenoura, salsão)', quantidade: '1 porção' },
      { nome: 'Molho de tomate', quantidade: '1 porção' },
      { nome: 'Molho branco (bechamel)', quantidade: '1 porção' },
      { nome: 'Queijo mussarela ralado', quantidade: '300 g' },
      { nome: 'Queijo parmesão ralado', quantidade: 'a gosto' },
    ],
    passos: [
      {
        categoria: 'Refogado',
        titulo: 'Faça o molho bolonhesa',
        instrucao:
          'Refogue a carne moída junto com o soffritto até a carne perder a cor rosada. Junte o molho de tomate e cozinhe em fogo baixo para apurar o sabor.',
        tempoSegundos: 900,
        checklist: ['Carne bem solta e dourada', 'Molho encorpado'],
      },
      {
        categoria: 'Preparo',
        titulo: 'Prepare a massa',
        instrucao:
          'Se a sua massa precisar de pré-cozimento, cozinhe rapidamente em água com sal. Se for do tipo "direto ao forno", pode usar crua — só garanta bastante molho para hidratar.',
        checklist: ['Massa pronta para montar'],
      },
      {
        categoria: 'Montagem',
        titulo: 'Monte as camadas',
        instrucao:
          'Num refratário, alterne: um pouco de molho no fundo, massa, bolonhesa, molho branco e queijo. Repita as camadas e termine com molho branco e bastante queijo por cima.',
        checklist: ['Fundo com molho (massa não gruda)', 'Camadas alternadas', 'Queijo por cima'],
      },
      {
        categoria: 'Cozimento',
        titulo: 'Asse até gratinar',
        instrucao:
          'Leve ao forno pré-aquecido até borbulhar e o queijo ficar dourado. Deixe descansar alguns minutos antes de cortar, para as camadas firmarem.',
        tempoSegundos: 1800,
        checklist: ['Queijo dourado e borbulhando', 'Descansou antes de cortar'],
      },
    ],
  },
};