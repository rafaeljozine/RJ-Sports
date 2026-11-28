/* ==========================================================
   RJ SPORTS — código da página index.html
   (fora do HTML para a Content-Security-Policy não precisar
   de permitir scripts embutidos)
   ========================================================== */

(function () {
  montarSlideHero();

  /* ---------- Slide do topo ---------- */
  function montarSlideHero() {
    var hero = document.getElementById("hero");
    var caixa = document.getElementById("hero-slides");
    var pontos = document.getElementById("hero-pontos");
    var slides = RJS.imagens.heroSlides || [{ src: RJS.imagens.hero }];
    var INTERVALO = 6000;
    var atual = 0;
    var temporizador = null;
    var parado = false;

    // Só a primeira foto é descarregada já; as outras ficam em data-* e
    // são carregadas um pouco antes de aparecerem (ver carregarSlide).
    // No telemóvel (ecrã alto) usa o recorte vertical srcMovel.
    var retrato = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    caixa.innerHTML = slides.map(function (s, i) {
      var attrs = RJS.atributosImagem(retrato && s.srcMovel ? s.srcMovel : s.src, "100vw");
      var srcset = i === 0 ? attrs : attrs.replace(/ (src|srcset|sizes)="/g, " data-$1=\"");
      var estilo = "";
      if (s.posicao) estilo += "--posicao:" + s.posicao + ";";
      if (s.posicaoMovel) estilo += "--posicao-movel:" + s.posicaoMovel + ";";
      return (
        '<div class="hero__slide' + (i === 0 ? " ativo" : "") + (s.espelhar ? " hero__slide--espelhar" : "") +
        '" style="' + estilo + '" aria-hidden="' + (i !== 0) + '">' +
        '<img' + srcset + ' alt="" ' + (i === 0 ? 'fetchpriority="high"' : 'decoding="async"') +
        ' data-falha="remover-pai"></div>'
      );
    }).join("");

    if (slides.length < 2) return;

    var elementos = caixa.querySelectorAll(".hero__slide");

    /** Passa os data-src/srcset/sizes para os atributos reais (uma só vez) */
    function carregarSlide(slide) {
      var img = slide && slide.querySelector("img[data-src]");
      if (!img) return;
      ["sizes", "srcset", "src"].forEach(function (a) {
        var v = img.getAttribute("data-" + a);
        if (v) img.setAttribute(a, v);
        img.removeAttribute("data-" + a);
      });
    }
    // a 2.ª foto só depois de a página acabar de carregar
    if (document.readyState === "complete") carregarSlide(elementos[1]);
    else window.addEventListener("load", function () { carregarSlide(elementos[1]); });
    document.getElementById("hero-controlos").hidden = false;
    pontos.innerHTML = slides.map(function (s, i) {
      return '<button class="hero__ponto' + (i === 0 ? " ativo" : "") + '" role="tab" aria-selected="' + (i === 0) +
        '" aria-label="Foto ' + (i + 1) + ' de ' + slides.length + '" data-ir="' + i + '"><span></span></button>';
    }).join("");
    var botoesPonto = pontos.querySelectorAll(".hero__ponto");

    function mostrar(n) {
      var total = elementos.length;
      n = (n + total) % total;
      elementos[atual].classList.remove("ativo");
      elementos[atual].setAttribute("aria-hidden", "true");
      botoesPonto[atual].classList.remove("ativo");
      botoesPonto[atual].setAttribute("aria-selected", "false");
      atual = n;
      // carrega já a imagem seguinte para não haver espera
      carregarSlide(elementos[(n + 1) % total]);
      elementos[atual].classList.add("ativo");
      elementos[atual].setAttribute("aria-hidden", "false");
      botoesPonto[atual].classList.add("ativo");
      botoesPonto[atual].setAttribute("aria-selected", "true");
      reiniciar();
    }

    function reiniciar() {
      clearTimeout(temporizador);
      // reinicia a barra de progresso do ponto ativo
      hero.style.setProperty("--intervalo", INTERVALO + "ms");
      botoesPonto[atual].classList.remove("ativo");
      void botoesPonto[atual].offsetWidth;
      botoesPonto[atual].classList.add("ativo");
      if (!parado) temporizador = setTimeout(function () { mostrar(atual + 1); }, INTERVALO);
    }

    function pausar(estado) {
      parado = estado;
      hero.classList.toggle("pausado", estado);
      if (estado) clearTimeout(temporizador);
      else reiniciar();
    }

    hero.addEventListener("click", function (ev) {
      var seta = ev.target.closest("[data-slide]");
      if (seta) mostrar(atual + (seta.getAttribute("data-slide") === "seguinte" ? 1 : -1));
      var ponto = ev.target.closest("[data-ir]");
      if (ponto) mostrar(Number(ponto.getAttribute("data-ir")));
    });

    // continua a passar com o rato por cima; só pausa quando o separador não está visível
    document.addEventListener("visibilitychange", function () { pausar(document.hidden); });

    // deslizar com o dedo no telemóvel
    var inicioX = null;
    hero.addEventListener("touchstart", function (ev) { inicioX = ev.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (ev) {
      if (inicioX === null) return;
      var dx = ev.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      inicioX = null;
    });

    reiniciar();
  }
  RJS.aplicarImagem(document.getElementById("imagem-corrida"), RJS.imagens.corrida, "(max-width: 900px) 100vw, 50vw");

  var seta ='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  document.getElementById("grelha-categorias").innerHTML = RJS.categorias.map(function (c) {
    return (
      '<a class="cartao-categoria cartao-categoria--' + c.id + '" href="loja.html?c=' + c.id + '">' +
      '  <img' + RJS.atributosImagem(RJS.imagens.categorias[c.id], "(max-width: 700px) 50vw, 25vw") + ' alt="" loading="lazy" decoding="async" data-falha="remover">' +
      '  <span class="cartao-categoria__seta" aria-hidden="true">' + seta + "</span>" +
      "  <div><h3>" + c.nome + "</h3><p>" + c.descricao + "</p></div>" +
      "</a>"
    );
  }).join("");

  document.getElementById("grelha-destaques").innerHTML = RJS.produtos
    .filter(function (p) { return p.destaque; }).slice(0, 4).map(RJS.cartaoProduto).join("");

  document.getElementById("grelha-novidades").innerHTML = RJS.produtos
    .filter(function (p) { return p.novo; }).slice(0, 4).map(RJS.cartaoProduto).join("");

  document.getElementById("link-whatsapp").href =
    "https://wa.me/" + RJS.loja.whatsapp + "?text=" + encodeURIComponent("Olá RJ Sports, tenho uma dúvida.");
})();
