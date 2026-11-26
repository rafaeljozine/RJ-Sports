/* ==========================================================
   RJ SPORTS — Página da loja: filtros, ordenação e pesquisa
   Lê da URL: ?q=pesquisa  ?c=categoria  ?p=homem|mulher|crianca
              ?i=6-8 (idades)  ?ordem=preco-asc
   ========================================================== */

(function () {
  var grelha = document.getElementById("grelha-loja");
  if (!grelha) return;

  var params = new URLSearchParams(location.search);
  var ORDEM_TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL"];

  var estado = {
    q: (params.get("q") || "").trim(),
    categorias: params.get("c") ? params.get("c").split(",") : [],
    publico: params.get("p") || "",
    idades: params.get("i") ? params.get("i").split(",") : [],
    tamanhos: [],
    min: null,
    max: null,
    promo: false,
    novo: false,
    ordem: params.get("ordem") || "destaque"
  };

  /* ---------- Utilitários ---------- */
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function emPromocao(p) {
    return p.precoAntigo && p.precoAntigo > p.preco;
  }

  function ordenarTamanhos(a, b) {
    // tamanhos de criança por idade (4A, 6A…) vêm primeiro
    var ka = /^\d+A$/.test(a), kb = /^\d+A$/.test(b);
    if (ka && kb) return parseInt(a, 10) - parseInt(b, 10);
    if (ka) return -1;
    if (kb) return 1;
    var ia = ORDEM_TAMANHOS.indexOf(a);
    var ib = ORDEM_TAMANHOS.indexOf(b);
    if (ia > -1 && ib > -1) return ia - ib;
    if (ia > -1) return -1;
    if (ib > -1) return 1;
    return Number(a) - Number(b);
  }

  function produtoPara(p, publico) {
    return (p.publico || []).indexOf(publico) > -1;
  }

  /* ---------- Montar as opções dos filtros ---------- */
  function montarPublicos() {
    var opcoes = [{ id: "", nome: "Todos", total: RJS.produtos.length }].concat(
      RJS.publicos.map(function (pb) {
        return { id: pb.id, nome: pb.nome, total: RJS.produtos.filter(function (p) { return produtoPara(p, pb.id); }).length };
      })
    );
    document.getElementById("filtro-publico").innerHTML = opcoes.map(function (o) {
      return (
        '<label class="opcao"><input type="radio" name="publico" value="' + o.id + '"> ' +
        o.nome + '<span class="opcao__contagem">' + o.total + "</span></label>"
      );
    }).join("");
  }

  function montarIdades() {
    document.getElementById("filtro-idades").innerHTML = RJS.idades.map(function (i) {
      var total = RJS.produtos.filter(function (p) { return (p.idades || []).indexOf(i.id) > -1; }).length;
      return (
        '<label class="opcao"><input type="checkbox" name="idade" value="' + i.id + '"> ' +
        i.nome + '<span class="opcao__contagem">' + total + "</span></label>"
      );
    }).join("");
  }

  function montarCategorias() {
    document.getElementById("filtro-categorias").innerHTML = RJS.categorias.map(function (c) {
      var total = RJS.produtos.filter(function (p) { return p.categoria === c.id; }).length;
      var marcado = estado.categorias.indexOf(c.id) > -1 ? " checked" : "";
      return (
        '<label class="opcao"><input type="checkbox" name="categoria" value="' + c.id + '"' + marcado + "> " +
        c.nome + '<span class="opcao__contagem">' + total + "</span></label>"
      );
    }).join("");
  }

  function montarTamanhos() {
    var todos = [];
    RJS.produtos.forEach(function (p) {
      (p.tamanhos || []).forEach(function (t) {
        if (todos.indexOf(t) === -1) todos.push(t);
      });
    });
    todos.sort(ordenarTamanhos);
    document.getElementById("filtro-tamanhos").innerHTML = todos.map(function (t) {
      return '<label class="chip-tamanho"><input type="checkbox" name="tamanho" value="' + t + '"><span>' + t + "</span></label>";
    }).join("");
  }

  function montarNotaPrecos() {
    var precos = RJS.produtos.map(function (p) { return p.preco; });
    document.getElementById("nota-precos").textContent =
      "Entre " + RJS.formatarPreco(Math.min.apply(null, precos)) + " e " + RJS.formatarPreco(Math.max.apply(null, precos));
  }

  /* ---------- Filtrar e ordenar ---------- */
  function resultados() {
    var termo = normalizar(estado.q);
    var lista = RJS.produtos.filter(function (p) {
      if (termo) {
        var categoria = RJS.obterCategoria(p.categoria);
        var publicos = (p.publico || []).map(function (id) { var x = RJS.obterPublico(id); return x ? x.nome : ""; }).join(" ");
        var texto = normalizar(p.nome + " " + (p.descricao || "") + " " + (categoria ? categoria.nome : "") + " " + publicos);
        if (texto.indexOf(termo) === -1) return false;
      }
      if (estado.categorias.length && estado.categorias.indexOf(p.categoria) === -1) return false;
      if (estado.publico && !produtoPara(p, estado.publico)) return false;
      if (estado.idades.length) {
        var temIdade = (p.idades || []).some(function (i) { return estado.idades.indexOf(i) > -1; });
        if (!temIdade) return false;
      }
      if (estado.tamanhos.length) {
        var temTamanho = (p.tamanhos || []).some(function (t) { return estado.tamanhos.indexOf(t) > -1; });
        if (!temTamanho) return false;
      }
      if (estado.min !== null && p.preco < estado.min) return false;
      if (estado.max !== null && p.preco > estado.max) return false;
      if (estado.promo && !emPromocao(p)) return false;
      if (estado.novo && !p.novo) return false;
      return true;
    });

    var ordenadores = {
      destaque: function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0); },
      novidades: function (a, b) { return (b.novo ? 1 : 0) - (a.novo ? 1 : 0); },
      "preco-asc": function (a, b) { return a.preco - b.preco; },
      "preco-desc": function (a, b) { return b.preco - a.preco; },
      nome: function (a, b) { return a.nome.localeCompare(b.nome, "pt"); }
    };
    return lista.slice().sort(ordenadores[estado.ordem] || ordenadores.destaque);
  }

  /* ---------- Desenhar ---------- */
  function chipsAtivos() {
    var chips = [];
    if (estado.q) chips.push({ tipo: "q", texto: "“" + estado.q + "”" });
    if (estado.publico) chips.push({ tipo: "publico", texto: RJS.obterPublico(estado.publico).nome });
    estado.idades.forEach(function (id) {
      var i = RJS.obterIdade(id);
      if (i) chips.push({ tipo: "idade", valor: id, texto: i.nome });
    });
    estado.categorias.forEach(function (id) {
      var c = RJS.obterCategoria(id);
      if (c) chips.push({ tipo: "categoria", valor: id, texto: c.nome });
    });
    estado.tamanhos.forEach(function (t) { chips.push({ tipo: "tamanho", valor: t, texto: "Tamanho " + t }); });
    if (estado.min !== null) chips.push({ tipo: "min", texto: "Desde " + RJS.formatarPreco(estado.min) });
    if (estado.max !== null) chips.push({ tipo: "max", texto: "Até " + RJS.formatarPreco(estado.max) });
    if (estado.promo) chips.push({ tipo: "promo", texto: "Em promoção" });
    if (estado.novo) chips.push({ tipo: "novo", texto: "Novidades" });
    return chips;
  }

  function desenhar() {
    var lista = resultados();
    var e = RJS.escapar;

    // Título conforme a pesquisa ou categoria
    var titulo = "Loja";
    if (estado.q) {
      titulo = "Resultados para “" + estado.q + "”";
    } else {
      var partes = [];
      if (estado.categorias.length === 1) partes.push(RJS.obterCategoria(estado.categorias[0]).nome);
      if (estado.publico) partes.push(RJS.obterPublico(estado.publico).nome);
      if (partes.length) titulo = partes.join(" · ");
    }
    document.getElementById("titulo-loja").textContent = titulo;
    document.title = titulo + " — RJ Sports";

    document.getElementById("contagem").textContent = lista.length === 1 ? "1 produto" : lista.length + " produtos";

    if (lista.length) {
      grelha.innerHTML = lista.map(RJS.cartaoProduto).join("");
      grelha.style.display = "";
    } else {
      grelha.innerHTML =
        '<div class="loja-vazia" style="grid-column:1/-1">' +
        "<h2>Nenhum produto encontrado</h2>" +
        "<p>Experimente remover alguns filtros ou pesquisar outra palavra.</p>" +
        '<button class="btn" data-limpar>Limpar filtros</button></div>';
    }

    var chips = chipsAtivos();
    document.getElementById("filtros-ativos").innerHTML = chips.length
      ? chips.map(function (c) {
          return '<button class="chip-ativo" data-remover="' + c.tipo + '" data-valor="' + e(c.valor || "") + '">' +
            e(c.texto) + ' <span aria-hidden="true">×</span><span class="visualmente-oculto">Remover</span></button>';
        }).join("") + '<button class="limpar-filtros" data-limpar>Limpar tudo</button>'
      : "";

    var num = document.getElementById("num-filtros");
    num.textContent = chips.length;
    num.hidden = chips.length === 0;

    document.getElementById("ver-resultados").textContent =
      "Ver " + (lista.length === 1 ? "1 produto" : lista.length + " produtos");

    marcarBotoesFiltro();
    atualizarUrl();
  }

  /* Mostra nos botões da barra quantas opções estão ativas */
  function marcarBotoesFiltro() {
    var contagens = {
      publico: estado.publico ? 1 : 0,
      idade: estado.idades.length,
      categoria: estado.categorias.length,
      preco: (estado.min !== null ? 1 : 0) + (estado.max !== null ? 1 : 0),
      tamanho: estado.tamanhos.length,
      ofertas: (estado.promo ? 1 : 0) + (estado.novo ? 1 : 0)
    };
    document.querySelectorAll("#filtros .filtro[data-grupo]").forEach(function (grupo) {
      var n = contagens[grupo.getAttribute("data-grupo")];
      var s = grupo.querySelector("summary");
      if (n) s.setAttribute("data-ativos", n);
      else s.removeAttribute("data-ativos");
    });

    // O filtro de idade só aparece para Criança
    var grupoIdade = document.getElementById("grupo-idade");
    grupoIdade.hidden = estado.publico !== "crianca";
    if (grupoIdade.hidden) grupoIdade.open = false;
  }

  /* Computador: só um menu aberto de cada vez; fecha ao clicar fora ou com Esc */
  function ligarMenusSuspensos() {
    var ecraPequeno = window.matchMedia("(max-width: 960px)");
    var menus = document.querySelectorAll("#filtros .filtro");

    function fecharTodos(exceto) {
      menus.forEach(function (m) { if (m !== exceto) m.open = false; });
    }

    // No painel do telemóvel os grupos começam abertos
    function ajustarAoEcra() {
      menus.forEach(function (m) { m.open = ecraPequeno.matches; });
    }
    ajustarAoEcra();
    ecraPequeno.addEventListener("change", ajustarAoEcra);

    menus.forEach(function (m) {
      m.addEventListener("toggle", function () {
        if (m.open && !ecraPequeno.matches) fecharTodos(m);
      });
    });

    document.addEventListener("click", function (ev) {
      if (ecraPequeno.matches) return;
      if (!ev.target.closest("#filtros .filtro")) fecharTodos(null);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !ecraPequeno.matches) fecharTodos(null);
    });
  }

  function atualizarUrl() {
    var p = new URLSearchParams();
    if (estado.q) p.set("q", estado.q);
    if (estado.categorias.length) p.set("c", estado.categorias.join(","));
    if (estado.publico) p.set("p", estado.publico);
    if (estado.idades.length) p.set("i", estado.idades.join(","));
    if (estado.ordem !== "destaque") p.set("ordem", estado.ordem);
    var query = p.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : ""));
  }

  /* Repõe os controlos do formulário de acordo com o estado */
  function sincronizarControlos() {
    document.querySelectorAll('input[name="categoria"]').forEach(function (i) {
      i.checked = estado.categorias.indexOf(i.value) > -1;
    });
    document.querySelectorAll('input[name="tamanho"]').forEach(function (i) {
      i.checked = estado.tamanhos.indexOf(i.value) > -1;
    });
    document.querySelectorAll('input[name="publico"]').forEach(function (i) {
      i.checked = i.value === estado.publico;
    });
    document.querySelectorAll('input[name="idade"]').forEach(function (i) {
      i.checked = estado.idades.indexOf(i.value) > -1;
    });
    document.getElementById("preco-min").value = estado.min !== null ? estado.min : "";
    document.getElementById("preco-max").value = estado.max !== null ? estado.max : "";
    document.getElementById("filtro-promo").checked = estado.promo;
    document.getElementById("filtro-novo").checked = estado.novo;
    document.getElementById("ordenar").value = estado.ordem;
  }

  function valoresMarcados(nome) {
    return Array.prototype.map.call(
      document.querySelectorAll('input[name="' + nome + '"]:checked'),
      function (i) { return i.value; }
    );
  }

  function lerPreco(id) {
    var v = document.getElementById(id).value;
    return v === "" || isNaN(Number(v)) ? null : Math.max(0, Number(v));
  }

  /* ---------- Eventos ---------- */
  function ligarEventos() {
    document.getElementById("filtros").addEventListener("change", function (ev) {
      var alvo = ev.target;
      if (alvo.name === "categoria") estado.categorias = valoresMarcados("categoria");
      if (alvo.name === "publico") {
        estado.publico = alvo.value;
        if (estado.publico !== "crianca") estado.idades = [];
        sincronizarControlos();
      }
      if (alvo.name === "idade") estado.idades = valoresMarcados("idade");
      if (alvo.name === "tamanho") estado.tamanhos = valoresMarcados("tamanho");
      if (alvo.id === "filtro-promo") estado.promo = alvo.checked;
      if (alvo.id === "filtro-novo") estado.novo = alvo.checked;
      if (alvo.id === "preco-min") estado.min = lerPreco("preco-min");
      if (alvo.id === "preco-max") estado.max = lerPreco("preco-max");
      desenhar();
    });

    // Preço atualiza enquanto escreve (com pequena pausa)
    var pausa;
    ["preco-min", "preco-max"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", function () {
        clearTimeout(pausa);
        pausa = setTimeout(function () {
          estado.min = lerPreco("preco-min");
          estado.max = lerPreco("preco-max");
          desenhar();
        }, 400);
      });
    });

    document.getElementById("ordenar").addEventListener("change", function (ev) {
      estado.ordem = ev.target.value;
      desenhar();
    });

    document.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-limpar]")) {
        estado.q = "";
        estado.categorias = [];
        estado.publico = "";
        estado.idades = [];
        estado.tamanhos = [];
        estado.min = null;
        estado.max = null;
        estado.promo = false;
        estado.novo = false;
        sincronizarControlos();
        desenhar();
        return;
      }

      var chip = ev.target.closest("[data-remover]");
      if (!chip) return;
      var tipo = chip.getAttribute("data-remover");
      var valor = chip.getAttribute("data-valor");
      if (tipo === "q") estado.q = "";
      if (tipo === "publico") { estado.publico = ""; estado.idades = []; }
      if (tipo === "idade") estado.idades = estado.idades.filter(function (i) { return i !== valor; });
      if (tipo === "categoria") estado.categorias = estado.categorias.filter(function (c) { return c !== valor; });
      if (tipo === "tamanho") estado.tamanhos = estado.tamanhos.filter(function (t) { return t !== valor; });
      if (tipo === "min") estado.min = null;
      if (tipo === "max") estado.max = null;
      if (tipo === "promo") estado.promo = false;
      if (tipo === "novo") estado.novo = false;
      sincronizarControlos();
      desenhar();
    });
  }

  /* ---------- Arranque ---------- */
  // Ignora categorias inválidas vindas da URL
  estado.categorias = estado.categorias.filter(function (id) { return RJS.obterCategoria(id); });
  if (!RJS.obterPublico(estado.publico)) estado.publico = "";
  estado.idades = estado.idades.filter(function (id) { return RJS.obterIdade(id); });
  if (estado.idades.length) estado.publico = "crianca";

  montarPublicos();
  montarIdades();
  montarCategorias();
  montarTamanhos();
  montarNotaPrecos();
  sincronizarControlos();
  ligarEventos();
  ligarMenusSuspensos();
  desenhar();

  // Mantém a pesquisa do cabeçalho preenchida com o termo atual
  var campoPesquisa = document.getElementById("campo-pesquisa");
  if (campoPesquisa && estado.q) campoPesquisa.value = estado.q;
})();
