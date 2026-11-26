/* ==========================================================
   RJ SPORTS — Catálogo (dados provisórios)
   Enquanto o backend não existe, os produtos vivem aqui.
   Mais tarde esta lista será obtida da API (/api/produtos).
   ========================================================== */

window.RJS = window.RJS || {};

RJS.categorias = [
  { id: "futebol", nome: "Futebol", descricao: "Camisolas, chuteiras e bolas" },
  { id: "corrida", nome: "Corrida", descricao: "Ténis e roupa técnica" },
  { id: "ginasio", nome: "Ginásio", descricao: "Treino e musculação" },
  { id: "acessorios", nome: "Acessórios", descricao: "Mochilas, garrafas e mais" }
];

/* Para quem é o produto (filtro "Para") */
RJS.publicos = [
  { id: "homem", nome: "Homem", descricao: "Equipamento para treinar e jogar" },
  { id: "mulher", nome: "Mulher", descricao: "Conforto e estilo em movimento" },
  { id: "crianca", nome: "Criança", descricao: "Para os mais novos brilharem" }
];

/* Faixas de idade (só para produtos de criança) */
RJS.idades = [
  { id: "3-5", nome: "3–5 anos" },
  { id: "6-8", nome: "6–8 anos" },
  { id: "9-12", nome: "9–12 anos" },
  { id: "13-16", nome: "13–16 anos" }
];

/*
  Campos de cada produto:
  - id: identificador único (também usado no nome da imagem)
  - preco: preço de venda em meticais
  - precoAntigo: preço riscado (opcional, para promoções)
  - imagem: caminho em assets/images/produtos/ (se não existir, aparece um marcador)
  - tamanhos: lista de tamanhos (vazio = sem tamanho)
  - publico: para quem é — "homem", "mulher" e/ou "crianca"
  - idades: faixas de idade (só produtos de criança) — ver RJS.idades
  - destaque / novo: controlam onde o produto aparece na página inicial
*/
RJS.produtos = [
  {
    id: "camisola-futebol-pro",
    nome: "Camisola de Futebol Pro",
    categoria: "futebol",
    publico: ["homem", "mulher"],
    preco: 1850,
    precoAntigo: 2300,
    imagem: "assets/images/produtos/camisola-futebol-pro.jpg",
    tamanhos: ["S", "M", "L", "XL", "XXL"],
    destaque: true,
    novo: false,
    descricao: "Camisola leve em tecido respirável, ideal para jogos e treinos."
  },
  {
    id: "chuteiras-velocidade",
    nome: "Chuteiras Velocidade FG",
    categoria: "futebol",
    publico: ["homem"],
    preco: 4500,
    imagem: "assets/images/produtos/chuteiras-velocidade.jpg",
    tamanhos: ["39", "40", "41", "42", "43", "44"],
    destaque: true,
    novo: true,
    descricao: "Chuteiras para relva natural, com sola de pitões para máxima tração."
  },
  {
    id: "tenis-corrida-air",
    nome: "Ténis de Corrida Air Run",
    categoria: "corrida",
    publico: ["homem", "mulher"],
    preco: 3900,
    imagem: "assets/images/produtos/tenis-corrida-air.jpg",
    tamanhos: ["38", "39", "40", "41", "42", "43", "44"],
    destaque: true,
    novo: true,
    descricao: "Amortecimento macio e malha respirável para corridas do dia a dia."
  },
  {
    id: "calcoes-treino",
    nome: "Calções de Treino Dry",
    categoria: "ginasio",
    publico: ["homem"],
    preco: 950,
    imagem: "assets/images/produtos/calcoes-treino.jpg",
    tamanhos: ["S", "M", "L", "XL"],
    destaque: true,
    novo: false,
    descricao: "Calções de secagem rápida com bolsos laterais."
  },
  {
    id: "bola-futebol-match",
    nome: "Bola de Futebol Match",
    categoria: "futebol",
    publico: ["homem", "mulher", "crianca"],
    preco: 1200,
    precoAntigo: 1500,
    imagem: "assets/images/produtos/bola-futebol-match.jpg",
    tamanhos: [],
    destaque: false,
    novo: true,
    descricao: "Bola tamanho 5, costurada, para relva e pelado."
  },
  {
    id: "mochila-desporto",
    nome: "Mochila Desportiva 30L",
    categoria: "acessorios",
    publico: ["homem", "mulher", "crianca"],
    preco: 1600,
    imagem: "assets/images/produtos/mochila-desporto.jpg",
    tamanhos: [],
    destaque: false,
    novo: true,
    descricao: "Compartimento para calçado e bolso acolchoado para portátil."
  },
  {
    id: "luvas-ginasio",
    nome: "Luvas de Ginásio Grip",
    categoria: "ginasio",
    publico: ["homem", "mulher"],
    preco: 600,
    imagem: "assets/images/produtos/luvas-ginasio.jpg",
    tamanhos: ["S", "M", "L"],
    destaque: false,
    novo: true,
    descricao: "Proteção das mãos e melhor aderência no levantamento de pesos."
  },
  {
    id: "garrafa-termica",
    nome: "Garrafa Térmica 750ml",
    categoria: "acessorios",
    publico: ["homem", "mulher", "crianca"],
    preco: 450,
    imagem: "assets/images/produtos/garrafa-termica.jpg",
    tamanhos: [],
    destaque: true,
    novo: false,
    descricao: "Mantém a água fria até 24 horas. Sem BPA."
  },
  {
    id: "leggings-treino-mulher",
    nome: "Leggings de Treino Flex",
    categoria: "ginasio",
    publico: ["mulher"],
    preco: 1100,
    imagem: "assets/images/produtos/leggings-treino-mulher.jpg",
    tamanhos: ["XS", "S", "M", "L", "XL"],
    destaque: true,
    novo: true,
    descricao: "Cintura alta e tecido elástico que não fica transparente. Ideal para ginásio e ioga."
  },
  {
    id: "top-desportivo-mulher",
    nome: "Top Desportivo Suporte Médio",
    categoria: "ginasio",
    publico: ["mulher"],
    preco: 850,
    precoAntigo: 1050,
    imagem: "assets/images/produtos/top-desportivo-mulher.jpg",
    tamanhos: ["XS", "S", "M", "L"],
    destaque: false,
    novo: true,
    descricao: "Suporte médio com alças cruzadas e almofadas removíveis."
  },
  {
    id: "kit-futebol-infantil",
    nome: "Kit de Futebol Infantil",
    categoria: "futebol",
    publico: ["crianca"],
    idades: ["3-5", "6-8", "9-12"],
    preco: 1450,
    imagem: "assets/images/produtos/kit-futebol-infantil.jpg",
    tamanhos: ["4A", "6A", "8A", "10A", "12A"],
    destaque: true,
    novo: true,
    descricao: "Camisola e calções para os pequenos craques. Tecido leve e fácil de lavar."
  },
  {
    id: "chuteiras-junior",
    nome: "Chuteiras Júnior Pro",
    categoria: "futebol",
    publico: ["crianca"],
    idades: ["6-8", "9-12", "13-16"],
    preco: 2600,
    imagem: "assets/images/produtos/chuteiras-junior.jpg",
    tamanhos: ["30", "31", "32", "33", "34", "35", "36", "37", "38"],
    destaque: false,
    novo: true,
    descricao: "Chuteiras leves com pitões curtos, para relva natural e sintética."
  },
  {
    id: "tenis-infantil-sprint",
    nome: "Ténis Infantil Sprint",
    categoria: "corrida",
    publico: ["crianca"],
    idades: ["3-5", "6-8", "9-12"],
    preco: 1900,
    imagem: "assets/images/produtos/tenis-infantil-sprint.jpg",
    tamanhos: ["26", "27", "28", "29", "30", "31", "32", "33", "34", "35"],
    destaque: false,
    novo: false,
    descricao: "Fecho de velcro para calçar sozinho e sola flexível para correr e saltar."
  }
];

/* ==========================================================
   FOTOS PROVISÓRIAS DA INTERNET (Unsplash, licença gratuita)
   Servem só para ilustrar o site. Quando tiver as fotos reais,
   ponha USAR_FOTOS_INTERNET = false e coloque os ficheiros nos
   caminhos indicados em "imagem" (assets/images/...).
   ========================================================== */
var USAR_FOTOS_INTERNET = true;

/** Monta o endereço de uma foto do Unsplash já recortada no tamanho certo */
RJS.fotoNet = function (idFoto, largura, altura) {
  return "https://images.unsplash.com/" + idFoto +
    "?auto=format&fit=crop&w=" + largura + "&h=" + altura + "&q=75";
};

var FOTOS_PRODUTOS = {
  "camisola-futebol-pro": "photo-1552066379-e7bfd22155c5",
  "chuteiras-velocidade": "photo-1511886929837-354d827aae26",
  "tenis-corrida-air": "photo-1571008887538-b36bb32f4571",
  "calcoes-treino": "photo-1640943136566-3edeb13e3d3b",
  "bola-futebol-match": "photo-1579952363873-27f3bade9f55",
  "mochila-desporto": "photo-1553062407-98eeb64c6a62",
  "luvas-ginasio": "photo-1557127972-1c446ea89ea5",
  "garrafa-termica": "photo-1602143407151-7111542de6e8",
  "leggings-treino-mulher": "photo-1599552683573-9dc48255fe85",
  "top-desportivo-mulher": "photo-1606902965551-dce093cda6e7",
  "kit-futebol-infantil": "photo-1622659097972-68f1d8c1829f",
  "chuteiras-junior": "photo-1766247732021-498b394f4e33",
  "tenis-infantil-sprint": "photo-1678192568478-9488ee55def6"
};

var FOTOS_PUBLICOS = {
  homem: "photo-1560073742-bc295f81c3c0",
  mulher: "photo-1480179087180-d9f0ec044897",
  crianca: "photo-1622659097509-4d56de14539e"
};

var FOTOS_CATEGORIAS = {
  futebol: "photo-1574629810360-7efbbe195018",
  corrida: "photo-1590333748338-d629e4564ad9",
  ginasio: "photo-1517836357463-d25dfeac3438",
  acessorios: "photo-1509762774605-f07235a08f1f"
};

/* Imagens de banners e categorias usadas nas páginas */
RJS.imagens = {
  hero: "assets/images/banners/hero.jpg",
  /* Slide do topo da página inicial. Cada slide:
     - src: imagem grande (computador); srcMovel: versão mais leve (telemóvel)
     - espelhar: vira a foto na horizontal
     - posicao / posicaoMovel: enquadramento (CSS object-position) */
  heroSlides: [
    { src: "assets/images/banners/hero.jpg" }
  ],
  corrida: "assets/images/banners/corrida.jpg",
  sobre: "assets/images/banners/sobre.jpg",
  categorias: {},
  publicos: {}
};
RJS.categorias.forEach(function (c) {
  RJS.imagens.categorias[c.id] = "assets/images/categorias/" + c.id + ".jpg";
});
RJS.publicos.forEach(function (p) {
  RJS.imagens.publicos[p.id] = "assets/images/categorias/" + p.id + ".jpg";
});

if (USAR_FOTOS_INTERNET) {
  RJS.produtos.forEach(function (p) {
    if (FOTOS_PRODUTOS[p.id]) p.imagem = RJS.fotoNet(FOTOS_PRODUTOS[p.id], 800, 1000);
  });
  // Fotos de alta resolução para o slide do topo (todas com mais de 3400 px de origem)
  var slide = function (id, extra) {
    return Object.assign({
      src: RJS.fotoNet(id, 2400, 1500),
      srcMovel: RJS.fotoNet(id, 900, 1400)
    }, extra || {});
  };
  RJS.imagens.heroSlides = [
    // futebol: remate em grande plano, nítido
    slide("photo-1508087625439-de3978963553", { posicao: "center 60%", posicaoMovel: "70% center" }),
    // ioga (mulher): silhueta ao pôr do sol
    slide("photo-1544367567-0f2fcb009e0b", { posicao: "center 55%", posicaoMovel: "60% center" }),
    // ginásio: atleta com haltere num ginásio escuro (espelhado para ficar à direita)
    slide("photo-1641337221253-fdc7237f6b61", { espelhar: true, posicao: "center 35%", posicaoMovel: "30% center" }),
    // corrida (mulher): ao pôr do sol (espelhada para ficar à direita)
    slide("photo-1603455778956-d71832eafa4e", { espelhar: true, posicao: "center 50%", posicaoMovel: "35% center" }),
    // calistenia: elevações na barra, de costas, ginásio escuro
    slide("photo-1677165733273-dcc3724c00e8", { posicao: "center 25%", posicaoMovel: "55% center" }),
    // ginásio (mulher): agachamento com barra
    slide("photo-1541534741688-6078c6bfb5c5", { posicao: "center 30%", posicaoMovel: "55% center" }),
    // corrida: velocista na partida, pista vermelha
    slide("photo-1461896836934-ffe607ba8211", { posicao: "center 60%", posicaoMovel: "60% center" }),
    // futebol: lance com bola, relva
    slide("photo-1624280157150-4d1ed8632989", { posicao: "center 70%", posicaoMovel: "65% center" })
  ];
  RJS.imagens.hero = RJS.imagens.heroSlides[0].src;
  RJS.imagens.corrida = RJS.fotoNet("photo-1552674605-db6ffd4facb5", 1200, 1000);
  RJS.imagens.sobre = RJS.fotoNet("photo-1574629810360-7efbbe195018", 900, 1100);
  Object.keys(FOTOS_CATEGORIAS).forEach(function (id) {
    RJS.imagens.categorias[id] = RJS.fotoNet(FOTOS_CATEGORIAS[id], 700, 940);
  });
  Object.keys(FOTOS_PUBLICOS).forEach(function (id) {
    RJS.imagens.publicos[id] = RJS.fotoNet(FOTOS_PUBLICOS[id], 900, 1100);
  });
}

/* ==========================================================
   ORIGEM DOS DADOS
   1) Com o servidor (backend) a correr, /api/catalogo.js define
      window.RJS_DADOS com o catálogo da base de dados → é esse
      que vale (RJS.modoApi = true).
   2) Sem servidor, se o painel (admin/) já foi usado neste
      navegador, valem os produtos guardados lá.
   3) Caso contrário, vale o catálogo de origem acima.
   ========================================================== */
RJS.produtosBase = RJS.produtos.slice();
RJS.categoriasBase = RJS.categorias.slice();
RJS.modoApi = !!(window.RJS_DADOS && Array.isArray(window.RJS_DADOS.produtos));

if (RJS.modoApi) {
  RJS.produtos = window.RJS_DADOS.produtos;
  if (window.RJS_DADOS.categorias && window.RJS_DADOS.categorias.length) RJS.categorias = window.RJS_DADOS.categorias;
  RJS.lojaAdmin = window.RJS_DADOS.loja || {};
} else try {
  var dadosAdmin = JSON.parse(localStorage.getItem("rjs_admin_db") || "null");
  if (dadosAdmin && Array.isArray(dadosAdmin.produtos)) {
    RJS.produtos = dadosAdmin.produtos.filter(function (p) { return p.ativo !== false; });
  }
  if (dadosAdmin && Array.isArray(dadosAdmin.categorias) && dadosAdmin.categorias.length) {
    RJS.categorias = dadosAdmin.categorias;
  }
  RJS.lojaAdmin = (dadosAdmin && dadosAdmin.loja) || {};
} catch (erro) {
  RJS.lojaAdmin = {};
}

/* ---------- Pedidos à API (só com o servidor a correr) ---------- */
RJS.api = function (caminho, opcoes) {
  opcoes = opcoes || {};
  return fetch("/api" + caminho, {
    method: opcoes.metodo || "GET",
    headers: opcoes.corpo ? { "Content-Type": "application/json" } : undefined,
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    credentials: "same-origin"
  }).then(function (resposta) {
    if (resposta.status === 204) return null;
    return resposta.json().catch(function () { return {}; }).then(function (dados) {
      if (!resposta.ok) {
        var erro = new Error((dados && dados.erro) || "Não foi possível contactar o servidor.");
        erro.estado = resposta.status;
        erro.detalhes = dados && dados.detalhes;
        throw erro;
      }
      return dados;
    });
  }, function () {
    throw new Error("Sem ligação ao servidor. Verifique a internet e tente novamente.");
  });
};

/* ---------- Utilitários do catálogo ---------- */

/** Formata um valor em meticais: 1850 -> "1.850,00 MT" */
RJS.formatarPreco = function (valor) {
  var numero = Number(valor || 0).toFixed(2).split(".");
  var inteiro = numero[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return inteiro + "," + numero[1] + " MT";
};

RJS.obterProduto = function (id) {
  return RJS.produtos.find(function (p) { return p.id === id; }) || null;
};

RJS.obterPublico = function (id) {
  return RJS.publicos.find(function (p) { return p.id === id; }) || null;
};

RJS.obterIdade = function (id) {
  return RJS.idades.find(function (i) { return i.id === id; }) || null;
};

RJS.obterCategoria = function (id) {
  return RJS.categorias.find(function (c) { return c.id === id; }) || null;
};

RJS.escapar = function (texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/** Iniciais usadas no marcador quando a imagem ainda não existe */
RJS.iniciais = function (nome) {
  return String(nome).split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join("");
};
