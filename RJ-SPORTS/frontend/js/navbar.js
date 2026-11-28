/* ==========================================================
   RJ SPORTS — Cabeçalho, pesquisa, menu móvel e carrinho lateral
   Cada página só precisa de <div id="cabecalho"></div>.
   ========================================================== */

(function () {
  var ICONES = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    pesquisa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    saco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  RJS.icones = ICONES;

  var LINKS = [
    { href: "index.html", texto: "Início" },
    { href: "loja.html", texto: "Loja" },
    { href: "categoria.html", texto: "Categorias" },
    { href: "acompanhar.html", texto: "Acompanhar" },
    { href: "contactos.html", texto: "Contactos" }
  ];

  var MENSAGENS_ANUNCIO = [
    "Pagamento na entrega",
    "Entregas em todo Moçambique",
    "Encomende hoje, receba em casa",
    "Apoio por WhatsApp"
  ];

  var paginaAtual = location.pathname.split("/").pop() || "index.html";

  function htmlLinks() {
    return LINKS.map(function (l) {
      var atual = l.href === paginaAtual ? ' aria-current="page"' : "";
      return '<a href="' + l.href + '"' + atual + ">" + l.texto + "</a>";
    }).join("");
  }

  function htmlAnuncio() {
    // A lista é duplicada para a animação rodar sem cortes
    var itens = MENSAGENS_ANUNCIO.concat(MENSAGENS_ANUNCIO, MENSAGENS_ANUNCIO, MENSAGENS_ANUNCIO)
      .map(function (m) { return '<span class="anuncio__item">' + m + "</span>"; })
      .join("");
    return '<div class="anuncio" role="region" aria-label="Avisos"><div class="anuncio__faixa">' + itens + "</div></div>";
  }

  function montar() {
    var alvo = document.getElementById("cabecalho");
    if (!alvo) return;

    alvo.outerHTML =
      htmlAnuncio() +
      '<header class="cabecalho" id="cabecalho-site">' +
      '  <div class="container cabecalho__interior">' +
      '    <button class="icone-btn cabecalho__menu-btn" data-abrir="menu-movel" aria-label="Abrir menu">' + ICONES.menu + "</button>" +
      '    <nav class="cabecalho__nav" aria-label="Principal">' + htmlLinks() + "</nav>" +
      '    <a href="index.html" class="logotipo" aria-label="RJ Sports — início">R<span>J.</span>Sports</a>' +
      '    <div class="cabecalho__acoes">' +
      '      <button class="icone-btn" data-pesquisa aria-label="Pesquisar" aria-expanded="false">' + ICONES.pesquisa + "</button>" +
      '      <button class="icone-btn" data-abrir="mini-carrinho" aria-label="Abrir carrinho">' + ICONES.saco +
      '        <span class="contador" data-contador data-vazio="true">0</span>' +
      "      </button>" +
      "    </div>" +
      "  </div>" +
      '  <div class="pesquisa" id="pesquisa">' +
      '    <div class="container">' +
      '      <form action="loja.html" role="search">' +
      '        <label for="campo-pesquisa" class="visualmente-oculto">Pesquisar produtos</label>' +
      '        <input id="campo-pesquisa" name="q" type="search" placeholder="O que procura? Ex.: chuteiras" autocomplete="off">' +
      '        <button class="btn" type="submit">Pesquisar</button>' +
      "      </form>" +
      "    </div>" +
      "  </div>" +
      "</header>" +
      // Menu móvel
      '<aside class="painel painel--esquerda" id="menu-movel" aria-label="Menu" aria-hidden="true">' +
      '  <div class="painel__topo"><span class="logotipo">R<span>J.</span>Sports</span>' +
      '    <button class="icone-btn" data-fechar aria-label="Fechar menu">' + ICONES.fechar + "</button></div>" +
      '  <div class="painel__corpo">' +
      '    <nav class="menu-movel__links">' + htmlLinks() + '<a href="sobre.html">Sobre nós</a></nav>' +
      '    <div class="menu-movel__info"><p>Pagamento na entrega em todo Moçambique.</p></div>' +
      "  </div>" +
      "</aside>" +
      // Carrinho lateral
      '<aside class="painel painel--direita" id="mini-carrinho" aria-label="Carrinho" aria-hidden="true">' +
      '  <div class="painel__topo"><h2>Carrinho <span data-contador-texto></span></h2>' +
      '    <button class="icone-btn" data-fechar aria-label="Fechar carrinho">' + ICONES.fechar + "</button></div>" +
      '  <div class="painel__corpo" data-mini-carrinho-corpo></div>' +
      '  <div class="painel__rodape" data-mini-carrinho-rodape></div>' +
      "</aside>" +
      '<div class="sobreposicao" data-sobreposicao></div>';

    ligarEventos();
    atualizarCarrinho();
  }

  /* ---------- Abrir / fechar painéis ---------- */
  var painelAberto = null;

  function abrirPainel(id) {
    var painel = document.getElementById(id);
    if (!painel) return;
    fecharPainel();
    painel.classList.add("aberto");
    painel.setAttribute("aria-hidden", "false");
    document.querySelector("[data-sobreposicao]").classList.add("visivel");
    document.body.classList.add("sem-scroll");
    painelAberto = painel;
    var foco = painel.querySelector("[data-fechar]");
    if (foco) foco.focus();
  }

  function fecharPainel() {
    if (!painelAberto) return;
    painelAberto.classList.remove("aberto");
    painelAberto.setAttribute("aria-hidden", "true");
    document.querySelector("[data-sobreposicao]").classList.remove("visivel");
    document.body.classList.remove("sem-scroll");
    painelAberto = null;
  }

  RJS.abrirCarrinho = function () { abrirPainel("mini-carrinho"); };

  function ligarEventos() {
    document.addEventListener("click", function (e) {
      var abrir = e.target.closest("[data-abrir]");
      if (abrir) {
        abrirPainel(abrir.getAttribute("data-abrir"));
        return;
      }
      if (e.target.closest("[data-fechar]") || e.target.closest("[data-sobreposicao]")) {
        fecharPainel();
        return;
      }

      var pesquisaBtn = e.target.closest("[data-pesquisa]");
      if (pesquisaBtn) {
        var caixa = document.getElementById("pesquisa");
        var aberta = caixa.classList.toggle("aberta");
        pesquisaBtn.setAttribute("aria-expanded", String(aberta));
        if (aberta) document.getElementById("campo-pesquisa").focus();
        return;
      }

      // Ações dentro do carrinho lateral
      var acao = e.target.closest("[data-carrinho-acao]");
      if (acao) {
        var id = acao.getAttribute("data-id");
        var tamanho = acao.getAttribute("data-tamanho");
        var qtd = Number(acao.getAttribute("data-qtd"));
        var tipo = acao.getAttribute("data-carrinho-acao");
        if (tipo === "mais") RJS.carrinho.alterarQuantidade(id, tamanho, qtd + 1);
        if (tipo === "menos") RJS.carrinho.alterarQuantidade(id, tamanho, qtd - 1);
        if (tipo === "remover") RJS.carrinho.remover(id, tamanho);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        fecharPainel();
        var caixa = document.getElementById("pesquisa");
        if (caixa) caixa.classList.remove("aberta");
      }
    });

    var cabecalho = document.getElementById("cabecalho-site");
    window.addEventListener("scroll", function () {
      cabecalho.classList.toggle("rolado", window.scrollY > 10);
    }, { passive: true });

    document.addEventListener("carrinho:atualizado", atualizarCarrinho);
  }

  /* ---------- Conteúdo do carrinho lateral ---------- */
  function atualizarCarrinho() {
    var contagem = RJS.carrinho.contagem();
    document.querySelectorAll("[data-contador]").forEach(function (el) {
      el.textContent = contagem;
      el.setAttribute("data-vazio", String(contagem === 0));
    });
    var textoContador = document.querySelector("[data-contador-texto]");
    if (textoContador) textoContador.textContent = contagem ? "(" + contagem + ")" : "";

    var corpo = document.querySelector("[data-mini-carrinho-corpo]");
    var rodape = document.querySelector("[data-mini-carrinho-rodape]");
    if (!corpo) return;

    var linhas = RJS.carrinho.linhas();
    if (!linhas.length) {
      corpo.innerHTML =
        '<div class="mini-carrinho__vazio"><p>O seu carrinho está vazio.</p>' +
        '<a class="btn" href="loja.html">Ver produtos</a></div>';
      rodape.innerHTML = "";
      rodape.hidden = true;
      return;
    }

    var e = RJS.escapar;
    corpo.innerHTML = linhas.map(function (l) {
      var p = l.produto;
      var dados = ' data-id="' + e(p.id) + '" data-tamanho="' + e(l.tamanho) + '" data-qtd="' + l.quantidade + '"';
      return (
        '<div class="linha-carrinho">' +
        '  <a class="linha-carrinho__media" href="produto.html?id=' + encodeURIComponent(p.id) + '">' +
        '    <span class="cartao-produto__marcador" style="font-size:1.25rem">' + e(RJS.iniciais(p.nome)) + "</span>" +
        '    <img' + RJS.atributosImagem(p.imagem, "80px") + ' alt="" loading="lazy" decoding="async" data-falha="remover">' +
        "  </a>" +
        "  <div>" +
        '    <div class="linha-carrinho__nome">' + e(p.nome) + "</div>" +
        '    <div class="linha-carrinho__variante">' + (l.tamanho ? "Tamanho: " + e(l.tamanho) + " · " : "") + RJS.formatarPreco(p.preco) + "</div>" +
        '    <div class="linha-carrinho__acoes">' +
        '      <div class="quantidade">' +
        '        <button data-carrinho-acao="menos"' + dados + ' aria-label="Diminuir quantidade">−</button>' +
        "        <span>" + l.quantidade + "</span>" +
        '        <button data-carrinho-acao="mais"' + dados + ' aria-label="Aumentar quantidade">+</button>' +
        "      </div>" +
        '      <button class="linha-carrinho__remover" data-carrinho-acao="remover"' + dados + ">Remover</button>" +
        "    </div>" +
        "  </div>" +
        "</div>"
      );
    }).join("");

    rodape.hidden = false;
    rodape.innerHTML =
      '<div class="mini-carrinho__total"><span>Total</span><span>' + RJS.formatarPreco(RJS.carrinho.total()) + "</span></div>" +
      '<p class="mini-carrinho__nota">Paga apenas quando receber. A taxa de entrega é confirmada por telefone.</p>' +
      '<div class="mini-carrinho__botoes">' +
      '  <a class="btn btn--destaque btn--bloco" href="checkout.html">Finalizar encomenda</a>' +
      '  <a class="btn btn--contorno btn--bloco" href="carrinho.html">Ver carrinho</a>' +
      "</div>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
