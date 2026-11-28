/* ==========================================================
   RJ SPORTS — Admin: base comum a todas as páginas
   - Dados do painel (guardados neste navegador até haver backend)
   - Menu lateral e barra de topo
   - Utilitários: formatos, avisos, janelas, tabelas, CSV
   Carregar depois de: js/produtos.js, js/main.js, js/admin/auth.js
   ========================================================== */

window.RJSA = window.RJSA || {};

(function () {
  var e = RJS.escapar;

  /* ==========================================================
     ÍCONES
     ========================================================== */
  var I = function (d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + ">" + d + "</svg>";
  };
  RJSA.icones = {
    dashboard: I('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'),
    produtos: I('<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    categorias: I('<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>'),
    encomendas: I('<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
    clientes: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
    fornecedores: I('<path d="M3 21V9l6-4v4l6-4v4l6-4v16H3Z"/><path d="M8 17h2M14 17h2"/>'),
    entregas: I('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/>'),
    campanhas: I('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>'),
    financeiro: I('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>'),
    relatorios: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    configuracoes: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    loja: I('<path d="M3 9 5 4h14l2 5M3 9h18v11H3zM3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>'),
    sair: I('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>'),
    menu: I('<path d="M3 7h18M3 12h18M3 17h18"/>'),
    mais: I('<path d="M12 5v14M5 12h14"/>'),
    editar: I('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    apagar: I('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>'),
    duplicar: I('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
    ver: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    pesquisa: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    descarregar: I('<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'),
    carregar: I('<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>'),
    imprimir: I('<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z"/>'),
    fechar: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    aviso: I('<path d="M12 3 2 21h20L12 3ZM12 10v4M12 18v.01"/>'),
    info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'),
    voltar: I('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    telefone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'),
    caixa: I('<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>'),
    tendencia: I('<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>'),
    relogio: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2Z"/></svg>'
  };
  var ic = RJSA.icones;

  /* ==========================================================
     DADOS
     ========================================================== */
  var CHAVE_DB = "rjs_admin_db";
  RJSA.ESTADOS = ["Recebida", "Confirmada", "Enviada", "Entregue", "Cancelada"];
  RJSA.PROVINCIAS = ["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica",
    "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

  // gerador de números previsível (os dados de exemplo saem sempre iguais)
  function aleatorio(semente) {
    return function () {
      semente = (semente * 16807) % 2147483647;
      return (semente - 1) / 2147483646;
    };
  }

  function semear() {
    var rnd = aleatorio(20261126);
    var escolher = function (lista) { return lista[Math.floor(rnd() * lista.length)]; };

    var fornecedores = [
      { id: "forn-1", nome: "Fornecedor Maputo (exemplo)", contacto: "Responsável comercial", telefone: "", email: "", cidade: "Maputo", prazo: "1–2 dias", notas: "Dados de exemplo — substitua pelo fornecedor real.", exemplo: true },
      { id: "forn-2", nome: "Fornecedor Internacional (exemplo)", contacto: "Loja online", telefone: "", email: "", cidade: "Joanesburgo", prazo: "5–7 dias", notas: "Dados de exemplo — substitua pelo fornecedor real.", exemplo: true }
    ];

    var produtos = (RJS.produtosBase || RJS.produtos).map(function (p, i) {
      return Object.assign({}, p, {
        sku: "RJS-" + String(i + 1).padStart(3, "0"),
        custo: Math.round((p.preco * 0.55) / 10) * 10,
        stock: [12, 8, 15, 20, 3, 6, 25, 30, 10, 7, 9, 2, 5][i % 13],
        fornecedorId: i % 3 === 2 ? "forn-2" : "forn-1",
        ativo: true
      });
    });

    var categorias = (RJS.categoriasBase || RJS.categorias).map(function (c) { return Object.assign({}, c); });

    var nomes = ["Cliente Exemplo 01", "Cliente Exemplo 02", "Cliente Exemplo 03", "Cliente Exemplo 04", "Cliente Exemplo 05",
      "Cliente Exemplo 06", "Cliente Exemplo 07", "Cliente Exemplo 08", "Cliente Exemplo 09", "Cliente Exemplo 10"];
    var pagamentos = ["Numerário", "M-Pesa", "e-Mola"];
    var encomendas = [];
    var agora = Date.now();

    for (var n = 0; n < 26; n++) {
      var diasAtras = Math.floor(rnd() * 30);
      var data = new Date(agora - diasAtras * 86400000 - Math.floor(rnd() * 36000000));
      var idx = Math.floor(rnd() * nomes.length);
      var itens = [];
      var qtdItens = 1 + Math.floor(rnd() * 2);
      for (var k = 0; k < qtdItens; k++) {
        var p = escolher(produtos);
        var qtd = 1 + Math.floor(rnd() * 2);
        itens.push({
          id: p.id, nome: p.nome,
          tamanho: p.tamanhos && p.tamanhos.length ? escolher(p.tamanhos) : "",
          quantidade: qtd, preco: p.preco, custo: p.custo, subtotal: p.preco * qtd
        });
      }
      // encomendas mais antigas tendem a estar entregues
      var estado = diasAtras > 10 ? (rnd() < 0.85 ? "Entregue" : "Cancelada")
        : diasAtras > 4 ? escolher(["Enviada", "Entregue", "Confirmada"])
        : escolher(["Recebida", "Recebida", "Confirmada", "Enviada"]);
      var provincia = escolher(["Maputo Cidade", "Maputo Cidade", "Maputo Província", "Gaza", "Sofala", "Nampula", "Inhambane"]);
      var numero = "RJS-" + String(100000 + Math.floor(rnd() * 899999));
      var historico = [{ estado: "Recebida", data: data.toISOString(), nota: "" }];
      var passo = RJSA.ESTADOS.indexOf(estado);
      if (estado === "Cancelada") {
        historico.push({ estado: "Cancelada", data: new Date(data.getTime() + 3600000 * 5).toISOString(), nota: "Cliente desistiu (exemplo)" });
      } else {
        for (var s = 1; s <= passo; s++) {
          historico.push({ estado: RJSA.ESTADOS[s], data: new Date(data.getTime() + s * 3600000 * 20).toISOString(), nota: "" });
        }
      }
      encomendas.push({
        numero: numero,
        data: data.toISOString(),
        estado: estado,
        cliente: {
          nome: nomes[idx],
          telefone: "+258 84 000 00" + String(idx + 10),
          telefone2: "",
          provincia: provincia,
          cidade: provincia.indexOf("Maputo") === 0 ? "Maputo" : provincia,
          bairro: "Bairro (exemplo)",
          endereco: "Morada de exemplo",
          observacoes: ""
        },
        pagamento: escolher(pagamentos),
        itens: itens,
        total: itens.reduce(function (s2, i2) { return s2 + i2.subtotal; }, 0),
        taxaEntrega: estado === "Recebida" ? null : escolher([150, 200, 250, 400]),
        pedidoFornecedor: passo >= 1 && estado !== "Cancelada",
        notas: "",
        historico: historico,
        exemplo: true
      });
    }
    encomendas.sort(function (a, b) { return b.data.localeCompare(a.data); });

    var mes = new Date().toISOString().slice(0, 7);
    return {
      versao: 1,
      criadoEm: new Date().toISOString(),
      produtos: produtos,
      categorias: categorias,
      fornecedores: fornecedores,
      encomendas: encomendas,
      zonas: RJSA.PROVINCIAS.map(function (p, i) {
        return { id: "zona-" + (i + 1), provincia: p, taxa: null, prazo: "", ativa: true };
      }),
      campanhas: [
        { id: "camp-1", nome: "Black Friday (exemplo)", codigo: "BLACK10", tipo: "percentagem", valor: 10, inicio: "", fim: "", ativa: false, exemplo: true }
      ],
      despesas: [
        { id: "desp-1", data: mes + "-05", descricao: "Publicidade no Facebook (exemplo)", categoria: "Marketing", valor: 1500, exemplo: true },
        { id: "desp-2", data: mes + "-12", descricao: "Embalagens (exemplo)", categoria: "Operação", valor: 800, exemplo: true }
      ],
      loja: {}
    };
  }

  var db = null;
  var API = !!window.RJSA_API;
  RJSA.modoApi = API;

  /* ----------------------------------------------------------
     SINCRONIZAÇÃO COM O SERVIDOR
     As páginas alteram o objeto "db" e chamam RJSA.db.guardar().
     Com servidor, guardar() compara com a última versão gravada
     e envia só o que mudou (criar / atualizar / apagar).
     ---------------------------------------------------------- */
  var COLECOES = [
    { nome: "categorias", chave: "id", url: "/admin/categorias" },
    { nome: "fornecedores", chave: "id", url: "/admin/fornecedores" },
    { nome: "zonas", chave: "id", url: "/admin/zonas" },
    { nome: "campanhas", chave: "id", url: "/admin/campanhas" },
    { nome: "despesas", chave: "id", url: "/admin/despesas" },
    { nome: "produtos", chave: "id", url: "/admin/produtos" },
    { nome: "encomendas", chave: "numero", url: "/admin/encomendas", semCriar: true }
  ];
  // ordem para apagar: primeiro o que depende dos outros
  var ORDEM_APAGAR = ["encomendas", "produtos", "despesas", "campanhas", "zonas", "fornecedores", "categorias"];

  var gravado = {}; // { colecao: { chave: json } } — última versão aceite pelo servidor
  var filaGravacao = Promise.resolve(true);

  function fotografarColecao(nome) {
    var mapa = {};
    var col = COLECOES.filter(function (c) { return c.nome === nome; })[0];
    (db[nome] || []).forEach(function (x) { mapa[x[col.chave]] = JSON.stringify(x); });
    return mapa;
  }

  function fotografarTudo() {
    COLECOES.forEach(function (c) { gravado[c.nome] = fotografarColecao(c.nome); });
    gravado.loja = JSON.stringify(db.loja || {});
  }

  function sincronizar() {
    var operacoes = [];

    COLECOES.forEach(function (col) {
      var atual = fotografarColecao(col.nome);
      var antes = gravado[col.nome] || {};
      Object.keys(atual).forEach(function (k) {
        if (antes[k] === atual[k]) return;
        if (!(k in antes) && col.semCriar) return;
        operacoes.push({
          colecao: col.nome, chave: k, json: atual[k],
          metodo: k in antes ? "PUT" : "POST",
          url: col.url + (k in antes ? "/" + encodeURIComponent(k) : "")
        });
      });
    });

    if (JSON.stringify(db.loja || {}) !== gravado.loja) {
      operacoes.push({ colecao: "loja", metodo: "PUT", url: "/admin/loja", json: JSON.stringify(db.loja || {}) });
    }

    ORDEM_APAGAR.forEach(function (nome) {
      var col = COLECOES.filter(function (c) { return c.nome === nome; })[0];
      var atual = fotografarColecao(nome);
      Object.keys(gravado[nome] || {}).forEach(function (k) {
        if (!(k in atual)) operacoes.push({ colecao: nome, chave: k, metodo: "DELETE", url: col.url + "/" + encodeURIComponent(k) });
      });
    });

    if (!operacoes.length) return Promise.resolve(true);

    var ok = true;
    return operacoes.reduce(function (cadeia, op) {
      return cadeia.then(function () {
        return RJS.api(op.url, { metodo: op.metodo, corpo: op.json ? JSON.parse(op.json) : undefined })
          .then(function () {
            if (op.colecao === "loja") gravado.loja = op.json;
            else if (op.metodo === "DELETE") delete gravado[op.colecao][op.chave];
            else gravado[op.colecao][op.chave] = op.json;
          })
          .catch(function (erro) {
            ok = false;
            if (erro.estado === 401) {
              RJSA.aviso("A sessão terminou. Entre novamente para guardar.", "erro");
              setTimeout(function () { location.href = "login.html"; }, 1500);
              return;
            }
            RJSA.aviso("Não foi guardado: " + erro.message, "erro");
          });
      });
    }, Promise.resolve()).then(function () { return ok; });
  }

  RJSA.db = {
    obter: function () {
      if (db) return db;

      if (API) {
        // dados vindos de /api/admin/dados.js (já com sessão verificada)
        db = (window.RJSA_DADOS && window.RJSA_DADOS.db) || {
          versao: 1, produtos: [], categorias: [], fornecedores: [], encomendas: [],
          zonas: [], campanhas: [], despesas: [], loja: {}
        };
        fotografarTudo();
        return db;
      }

      try {
        db = JSON.parse(localStorage.getItem(CHAVE_DB) || "null");
      } catch (err) {
        db = null;
      }
      if (!db || !db.versao) {
        db = semear();
        RJSA.db.guardar();
      }
      importarEncomendasLoja();
      return db;
    },

    /** Grava as alterações. Devolve uma Promise<boolean> (true = tudo gravado) */
    guardar: function () {
      if (API) {
        filaGravacao = filaGravacao.then(sincronizar, sincronizar);
        return filaGravacao;
      }
      try {
        localStorage.setItem(CHAVE_DB, JSON.stringify(db));
        return Promise.resolve(true);
      } catch (err) {
        RJSA.aviso("Não foi possível guardar: o armazenamento do navegador está cheio.", "erro");
        return Promise.resolve(false);
      }
    },

    repor: function () {
      if (API) return Promise.resolve(false);
      db = semear();
      return RJSA.db.guardar();
    },

    /** Substitui todos os dados (cópia de segurança) */
    substituir: function (novo) {
      if (API) {
        return RJS.api("/admin/importar", { metodo: "POST", corpo: novo })
          .then(function () { return true; })
          .catch(function (erro) {
            RJSA.aviso("Não foi possível repor: " + erro.message, "erro");
            return false;
          });
      }
      db = novo;
      return RJSA.db.guardar();
    }
  };

  /** Encomendas feitas na loja neste navegador entram no painel */
  function importarEncomendasLoja() {
    var daLoja;
    try {
      daLoja = JSON.parse(localStorage.getItem("rjs_encomendas") || "[]");
    } catch (err) {
      daLoja = [];
    }
    var existentes = {};
    db.encomendas.forEach(function (x) { existentes[x.numero] = true; });
    var novas = 0;
    daLoja.forEach(function (enc) {
      if (existentes[enc.numero]) return;
      var copia = JSON.parse(JSON.stringify(enc));
      copia.itens.forEach(function (it) {
        var p = db.produtos.filter(function (x) { return x.id === it.id; })[0];
        it.custo = p ? p.custo : null;
      });
      copia.taxaEntrega = null;
      copia.pedidoFornecedor = false;
      copia.notas = "";
      copia.historico = [{ estado: copia.estado || "Recebida", data: copia.data, nota: "Encomenda feita no site" }];
      db.encomendas.unshift(copia);
      novas++;
    });
    if (novas) {
      db.encomendas.sort(function (a, b) { return b.data.localeCompare(a.data); });
      RJSA.db.guardar();
    }
  }

  /** Atualiza o estado na cópia que a página "Acompanhar encomenda" lê */
  RJSA.sincronizarEstadoLoja = function (enc) {
    try {
      var lista = JSON.parse(localStorage.getItem("rjs_encomendas") || "[]");
      var mudou = false;
      lista.forEach(function (x) {
        if (x.numero === enc.numero) {
          x.estado = enc.estado;
          mudou = true;
        }
      });
      if (mudou) localStorage.setItem("rjs_encomendas", JSON.stringify(lista));
    } catch (err) {
      /* ignora */
    }
  };

  /* ==========================================================
     FORMATOS E UTILITÁRIOS
     ========================================================== */
  RJSA.e = e;
  RJSA.preco = function (v) { return RJS.formatarPreco(v || 0); };

  RJSA.data = function (iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  };

  RJSA.dataHora = function (iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) + ", " +
      d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  };

  RJSA.uid = function (prefixo) {
    return (prefixo || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  RJSA.slug = function (texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  /** Caminho de imagem visto a partir da pasta admin/ */
  RJSA.img = function (src) {
    if (!src) return "";
    return /^(https?:|data:|\/|\.\.\/)/.test(src) ? src : "../" + src;
  };

  /** Miniatura de produto para tabelas */
  RJSA.miniatura = function (p) {
    return p && p.imagem
      ? '<img src="' + e(RJSA.img(p.imagem)) + '" alt="" loading="lazy" data-falha="esconder">'
      : '<span class="produto-celula__marcador"></span>';
  };

  RJSA.parametro = function (nome) {
    return new URLSearchParams(location.search).get(nome);
  };

  RJSA.estado = function (estado) {
    return '<span class="estado estado--' + RJSA.slug(estado) + '">' + e(estado) + "</span>";
  };

  RJSA.custoEncomenda = function (enc) {
    return (enc.itens || []).reduce(function (s, i) { return s + (Number(i.custo) || 0) * i.quantidade; }, 0);
  };

  RJSA.linkWhatsapp = function (telefone, texto) {
    var digitos = String(telefone || "").replace(/\D/g, "");
    if (digitos.length === 9) digitos = "258" + digitos;
    return "https://wa.me/" + digitos + (texto ? "?text=" + encodeURIComponent(texto) : "");
  };

  RJSA.descarregar = function (conteudo, nome, tipo) {
    var blob = new Blob([conteudo], { type: tipo || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /** Exporta linhas para CSV (abre bem no Excel com acentos) */
  RJSA.csv = function (cabecalho, linhas, nome) {
    var esc = function (v) {
      var t = v == null ? "" : String(v);
      return /[";\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    var texto = [cabecalho].concat(linhas).map(function (l) { return l.map(esc).join(";"); }).join("\r\n");
    RJSA.descarregar("﻿" + texto, nome, "text/csv;charset=utf-8");
  };

  /* ---------- Aviso rápido ---------- */
  var temporizadorAviso;
  RJSA.aviso = function (mensagem, tipo) {
    var el = document.querySelector(".aviso-adm");
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "aviso-adm" + (tipo === "erro" ? " aviso-adm--erro" : "");
    el.setAttribute("role", "status");
    el.textContent = mensagem;
    document.body.appendChild(el);
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { el.remove(); }, 3000);
  };

  /* ---------- Janelas ---------- */
  function abrirJanela(html, classe) {
    var fundo = document.createElement("div");
    fundo.className = "janela-fundo";
    fundo.innerHTML = '<div class="janela ' + (classe || "") + '" role="dialog" aria-modal="true">' + html + "</div>";
    document.body.appendChild(fundo);
    document.body.style.overflow = "hidden";
    return fundo;
  }

  function fecharJanela(fundo) {
    fundo.remove();
    if (!document.querySelector(".janela-fundo")) document.body.style.overflow = "";
  }

  /** Pergunta de confirmação. Devolve uma Promise<boolean> */
  RJSA.confirmar = function (opcoes) {
    return new Promise(function (resolver) {
      var fundo = abrirJanela(
        '<div class="janela__topo"><h2>' + e(opcoes.titulo || "Confirmar") + "</h2></div>" +
        '<div class="janela__corpo"><p>' + e(opcoes.texto || "") + "</p></div>" +
        '<div class="janela__rodape">' +
        '<button class="btn-adm" data-r="nao">Cancelar</button>' +
        '<button class="btn-adm ' + (opcoes.perigo ? "btn-adm--perigo" : "btn-adm--primario") + '" data-r="sim">' + e(opcoes.botao || "Confirmar") + "</button>" +
        "</div>", "janela--pequena");
      fundo.querySelector('[data-r="sim"]').focus();
      function terminar(valor) {
        fecharJanela(fundo);
        document.removeEventListener("keydown", tecla);
        resolver(valor);
      }
      function tecla(ev) { if (ev.key === "Escape") terminar(false); }
      document.addEventListener("keydown", tecla);
      fundo.addEventListener("click", function (ev) {
        if (ev.target === fundo) return terminar(false);
        var b = ev.target.closest("[data-r]");
        if (b) terminar(b.getAttribute("data-r") === "sim");
      });
    });
  };

  /**
   * Formulário numa janela.
   * campos: [{ id, rotulo, tipo: text|number|email|tel|date|select|textarea|interruptor,
   *           opcoes: [..] ou [{valor, texto}], obrigatorio, ajuda, inteiro, sufixo, min, passo }]
   * Devolve Promise<objeto | null>
   */
  RJSA.janelaFormulario = function (opcoes) {
    var valores = opcoes.valores || {};
    var campos = opcoes.campos.map(function (c) {
      var v = valores[c.id] == null ? (c.padrao == null ? "" : c.padrao) : valores[c.id];
      var nome = ' id="jf-' + c.id + '" name="' + c.id + '"';
      var controlo;
      if (c.tipo === "select") {
        controlo = "<select" + nome + ">" + c.opcoes.map(function (o) {
          var val = typeof o === "object" ? o.valor : o;
          var txt = typeof o === "object" ? o.texto : o;
          return '<option value="' + e(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + e(txt) + "</option>";
        }).join("") + "</select>";
      } else if (c.tipo === "textarea") {
        controlo = "<textarea" + nome + ">" + e(v) + "</textarea>";
      } else if (c.tipo === "interruptor") {
        return '<div class="campo' + (c.inteiro ? " campo--inteiro" : "") + '"><label class="interruptor"><input type="checkbox"' + nome +
          (v ? " checked" : "") + '><span class="interruptor__trilho"></span>' + e(c.rotulo) + "</label></div>";
      } else {
        controlo = '<input type="' + (c.tipo || "text") + '"' + nome + ' value="' + e(v) + '"' +
          (c.min != null ? ' min="' + c.min + '"' : "") + (c.passo ? ' step="' + c.passo + '"' : "") +
          (c.placeholder ? ' placeholder="' + e(c.placeholder) + '"' : "") + ">";
        if (c.sufixo) controlo = '<div class="campo-prefixo">' + controlo + "<span>" + e(c.sufixo) + "</span></div>";
      }
      return (
        '<div class="campo' + (c.inteiro ? " campo--inteiro" : "") + '" data-campo="' + c.id + '">' +
        '<label for="jf-' + c.id + '">' + e(c.rotulo) + (c.obrigatorio ? "" : ' <span style="font-weight:400;color:var(--admin-texto-suave)">(opcional)</span>') + "</label>" +
        controlo +
        (c.ajuda ? '<span class="campo__ajuda">' + e(c.ajuda) + "</span>" : "") +
        '<span class="campo__erro">' + e(c.erro || "Preencha este campo.") + "</span></div>"
      );
    }).join("");

    return new Promise(function (resolver) {
      var fundo = abrirJanela(
        '<form novalidate>' +
        '<div class="janela__topo"><h2>' + e(opcoes.titulo) + '</h2><button type="button" class="btn-icone" data-fechar aria-label="Fechar">' + ic.fechar + "</button></div>" +
        '<div class="janela__corpo form-admin"><div class="grelha-campos">' + campos + "</div></div>" +
        '<div class="janela__rodape"><button type="button" class="btn-adm" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn-adm btn-adm--primario">' + e(opcoes.botao || "Guardar") + "</button></div>" +
        "</form>");
      var form = fundo.querySelector("form");
      var primeiro = form.querySelector("input:not([type=checkbox]), select, textarea");
      if (primeiro) primeiro.focus();

      function terminar(valor) {
        fecharJanela(fundo);
        document.removeEventListener("keydown", tecla);
        resolver(valor);
      }
      function tecla(ev) { if (ev.key === "Escape") terminar(null); }
      document.addEventListener("keydown", tecla);

      fundo.addEventListener("click", function (ev) {
        if (ev.target === fundo || ev.target.closest("[data-fechar]")) terminar(null);
      });
      form.addEventListener("input", function (ev) {
        var b = ev.target.closest(".campo.invalido");
        if (b) b.classList.remove("invalido");
      });
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var resultado = {};
        var ok = true;
        opcoes.campos.forEach(function (c) {
          var el = form.elements[c.id];
          var v;
          if (c.tipo === "interruptor") v = el.checked;
          else if (c.tipo === "number") v = el.value === "" ? null : Number(el.value);
          else v = el.value.trim();
          resultado[c.id] = v;
          var vazio = v === "" || v === null;
          var invalido = c.obrigatorio && vazio;
          if (!invalido && c.validar) invalido = c.validar(v, resultado) === false;
          if (invalido) {
            ok = false;
            var bloco = form.querySelector('[data-campo="' + c.id + '"]');
            if (bloco) bloco.classList.add("invalido");
          }
        });
        if (ok) terminar(resultado);
      });
    });
  };

  /* ==========================================================
     LISTA GENÉRICA (criar / editar / apagar)
     Usada em categorias, fornecedores, campanhas, zonas, despesas
     ========================================================== */
  RJSA.crud = function (cfg) {
    var dados = RJSA.db.obter();
    var alvo = cfg.alvo;
    var pesquisa = "";

    function lista() {
      var itens = dados[cfg.colecao];
      if (pesquisa && cfg.pesquisar) {
        var t = RJSA.slug(pesquisa);
        itens = itens.filter(function (x) { return RJSA.slug(cfg.pesquisar(x)).indexOf(t) > -1; });
      }
      return cfg.ordenar ? itens.slice().sort(cfg.ordenar) : itens;
    }

    function desenhar() {
      var itens = lista();
      var linhas = itens.map(function (x) {
        return "<tr>" + cfg.colunas.map(function (c) {
          return '<td class="' + (c.classe || "") + '">' + c.valor(x) + "</td>";
        }).join("") +
          '<td class="acoes">' +
          '<button class="btn-icone" data-editar="' + e(x.id) + '" aria-label="Editar">' + ic.editar + "</button>" +
          '<button class="btn-icone btn-icone--perigo" data-apagar="' + e(x.id) + '" aria-label="Apagar">' + ic.apagar + "</button>" +
          "</td></tr>";
      }).join("");

      alvo.innerHTML =
        (cfg.antes ? cfg.antes() : "") +
        '<div class="ferramentas">' +
        (cfg.pesquisar ? '<label class="ferramentas__pesquisa">' + ic.pesquisa + '<input type="search" placeholder="Pesquisar…" value="' + e(pesquisa) + '" data-pesquisa></label>' : "") +
        '<div class="ferramentas__direita">' + (cfg.botoesExtra || "") +
        '<button class="btn-adm btn-adm--primario" data-novo>' + ic.mais + " " + e(cfg.novoRotulo || "Adicionar") + "</button></div>" +
        "</div>" +
        '<div class="cartao"><div class="tabela-caixa"><table class="tabela"><thead><tr>' +
        cfg.colunas.map(function (c) { return '<th class="' + (c.classe || "") + '">' + e(c.rotulo) + "</th>"; }).join("") +
        '<th class="acoes"></th></tr></thead><tbody>' +
        (linhas || '<tr><td colspan="' + (cfg.colunas.length + 1) + '" class="vazio-tabela">' + e(cfg.vazio || "Ainda não há registos.") + "</td></tr>") +
        "</tbody></table></div></div>" +
        (cfg.depois ? cfg.depois() : "");

      var campoPesquisa = alvo.querySelector("[data-pesquisa]");
      if (campoPesquisa && document.activeElement === document.body && pesquisa) campoPesquisa.focus();
    }

    function editar(item) {
      RJSA.janelaFormulario({
        titulo: item ? cfg.tituloEditar || "Editar" : cfg.tituloNovo || "Adicionar",
        campos: cfg.campos,
        valores: item || {}
      }).then(function (r) {
        if (!r) return;
        if (cfg.antesGuardar && cfg.antesGuardar(r, item) === false) return;
        if (item) {
          Object.assign(item, r);
          delete item.exemplo;
        } else {
          r.id = cfg.gerarId ? cfg.gerarId(r) : RJSA.uid(cfg.prefixo || cfg.colecao);
          dados[cfg.colecao].push(r);
        }
        RJSA.db.guardar();
        RJSA.aviso(item ? "Alterações guardadas." : "Adicionado com sucesso.");
        desenhar();
        if (cfg.aoMudar) cfg.aoMudar();
      });
    }

    alvo.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-novo]")) return editar(null);
      var be = ev.target.closest("[data-editar]");
      if (be) {
        return editar(dados[cfg.colecao].filter(function (x) { return x.id === be.getAttribute("data-editar"); })[0]);
      }
      var ba = ev.target.closest("[data-apagar]");
      if (ba) {
        var item = dados[cfg.colecao].filter(function (x) { return x.id === ba.getAttribute("data-apagar"); })[0];
        if (cfg.podeApagar) {
          var motivo = cfg.podeApagar(item);
          if (motivo !== true) {
            RJSA.aviso(motivo, "erro");
            return;
          }
        }
        RJSA.confirmar({ titulo: "Apagar", texto: "Tem a certeza que quer apagar \"" + (cfg.nome ? cfg.nome(item) : item.id) + "\"? Esta ação não pode ser desfeita.", botao: "Apagar", perigo: true })
          .then(function (sim) {
            if (!sim) return;
            dados[cfg.colecao] = dados[cfg.colecao].filter(function (x) { return x !== item; });
            RJSA.db.guardar();
            RJSA.aviso("Apagado.");
            desenhar();
            if (cfg.aoMudar) cfg.aoMudar();
          });
      }
    });

    alvo.addEventListener("input", function (ev) {
      if (ev.target.matches("[data-pesquisa]")) {
        pesquisa = ev.target.value;
        var pos = ev.target.selectionStart;
        desenhar();
        var novo = alvo.querySelector("[data-pesquisa]");
        novo.focus();
        novo.setSelectionRange(pos, pos);
      }
    });

    desenhar();
    return { desenhar: desenhar };
  };

  /* ==========================================================
     ESTRUTURA DA PÁGINA (menu lateral + topo)
     ========================================================== */
  var MENU = [
    { grupo: "Geral" },
    { id: "dashboard", texto: "Painel", href: "dashboard.html" },
    { grupo: "Vendas" },
    { id: "encomendas", texto: "Encomendas", href: "encomendas.html", contador: true },
    { id: "clientes", texto: "Clientes", href: "clientes.html" },
    { id: "entregas", texto: "Entregas", href: "entregas.html" },
    { grupo: "Catálogo" },
    { id: "produtos", texto: "Produtos", href: "produtos.html" },
    { id: "categorias", texto: "Categorias", href: "categorias.html" },
    { id: "fornecedores", texto: "Fornecedores", href: "fornecedores.html" },
    { id: "campanhas", texto: "Campanhas", href: "campanhas.html" },
    { grupo: "Gestão" },
    { id: "financeiro", texto: "Financeiro", href: "financeiro.html" },
    { id: "relatorios", texto: "Relatórios", href: "relatorios.html" },
    { id: "configuracoes", texto: "Configurações", href: "configuracoes.html" }
  ];

  /**
   * Monta o painel e devolve o elemento onde a página desenha o conteúdo.
   * opcoes: { pagina, titulo, acoes (html dos botões do topo) }
   */
  RJSA.montar = function (opcoes) {
    if (!RJSA.auth.exigir()) return null;
    var dados = RJSA.db.obter();
    var sessao = RJSA.auth.sessao();
    var porConfirmar = dados.encomendas.filter(function (x) { return x.estado === "Recebida"; }).length;

    var menu = MENU.map(function (m) {
      if (m.grupo) return '<div class="admin-menu__grupo">' + m.grupo + "</div>";
      return '<a href="' + m.href + '"' + (m.id === opcoes.pagina ? ' aria-current="page"' : "") + ">" +
        ic[m.id] + "<span>" + m.texto + "</span>" +
        (m.contador && porConfirmar ? '<span class="admin-menu__contador" title="Por confirmar">' + porConfirmar + "</span>" : "") +
        "</a>";
    }).join("");

    document.title = opcoes.titulo + " — Painel RJ Sports";
    document.body.classList.add("admin");
    document.body.innerHTML =
      '<aside class="admin-lateral" aria-label="Menu do painel">' +
      '  <div class="admin-lateral__marca"><span class="logotipo">R<span>J.</span>Sports</span><small>Admin</small></div>' +
      '  <nav class="admin-menu">' + menu + "</nav>" +
      '  <div class="admin-lateral__rodape"><a href="../index.html" target="_blank" rel="noopener">Ver a loja ↗</a></div>' +
      "</aside>" +
      '<div class="admin-sobreposicao" data-fechar-menu></div>' +
      '<div class="admin-principal">' +
      '  <header class="admin-topo">' +
      '    <button class="btn-icone admin-topo__menu" data-abrir-menu aria-label="Abrir menu">' + ic.menu + "</button>" +
      "    <h1>" + e(opcoes.titulo) + "</h1>" +
      '    <div class="admin-topo__acoes">' + (opcoes.acoes || "") +
      '      <div class="admin-utilizador"><div class="admin-utilizador__avatar" aria-hidden="true">' + e((sessao.nome || "A").charAt(0).toUpperCase()) + "</div>" +
      "        <span>" + e(sessao.nome) + "</span>" +
      '        <button class="btn-icone" data-sair aria-label="Sair" title="Sair">' + ic.sair + "</button></div>" +
      "    </div>" +
      "  </header>" +
      '  <main class="admin-conteudo" id="conteudo"></main>' +
      "</div>";

    document.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-abrir-menu]")) document.body.classList.add("menu-aberto");
      if (ev.target.closest("[data-fechar-menu]")) document.body.classList.remove("menu-aberto");
      if (ev.target.closest("[data-sair]")) RJSA.auth.sair();
    });

    // mensagem deixada pela página anterior (ex.: "Produto guardado")
    try {
      var flash = sessionStorage.getItem("rjs_admin_flash");
      if (flash) {
        sessionStorage.removeItem("rjs_admin_flash");
        setTimeout(function () { RJSA.aviso(flash); }, 50);
      }
    } catch (err) { /* ignora */ }

    return document.getElementById("conteudo");
  };

  /** Mostra uma mensagem na próxima página que abrir */
  RJSA.flash = function (mensagem) {
    try { sessionStorage.setItem("rjs_admin_flash", mensagem); } catch (err) { /* ignora */ }
  };

  /** Aviso no topo enquanto se usa a palavra-passe inicial ou dados de exemplo */
  RJSA.avisosGerais = function () {
    var html = "";
    var dados = RJSA.db.obter();
    var temExemplos = dados.encomendas.some(function (x) { return x.exemplo; });
    if (temExemplos) {
      html += '<div class="alerta alerta--info">' + ic.info + "<div><strong>Está a ver dados de exemplo</strong>" +
        'As encomendas, fornecedores e despesas marcados como “exemplo” servem só para ver o painel a funcionar. Pode apagá-los em <a href="configuracoes.html#dados">Configurações</a>.</div></div>';
    }
    return RJSA.auth.conta().then(function (c) {
      if (c.inicial) {
        html = '<div class="alerta">' + ic.aviso + "<div><strong>Mude a palavra-passe inicial</strong>" +
          'Ainda está a usar a palavra-passe de origem. <a href="configuracoes.html#conta">Altere-a agora</a>.</div></div>' + html;
      }
      return html;
    });
  };
})();
