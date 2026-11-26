/* ==========================================================
   RJ SPORTS — Funções partilhadas por todas as páginas
   (rodapé, cartão de produto, aviso, adicionar rápido)
   ========================================================== */

(function () {
  RJS.loja = {
    nome: "RJ Sports",
    telefone: "+258 82 914 9042",
    whatsapp: "258829149042",
    // Endereços provisórios das redes sociais — troque pelos reais
    // Horário de atendimento provisório — confirme e ajuste
    horario: [
      ["Segunda a Sexta", "08:00 – 18:00"],
      ["Sábado", "08:00 – 13:00"],
      ["Domingo e feriados", "Só WhatsApp"]
    ],
    instagram: "https://instagram.com/rjsports",
    facebook: "https://facebook.com/rjsports",
    cidade: "Maputo, Moçambique"
  };

  // Dados alterados em Admin → Configurações (guardados neste navegador)
  Object.keys(RJS.lojaAdmin || {}).forEach(function (chave) {
    var valor = RJS.lojaAdmin[chave];
    if (valor !== "" && valor != null) RJS.loja[chave] = valor;
  });

  /* ---------- Cartão de produto (usado na home, loja, categoria) ---------- */
  RJS.cartaoProduto = function (p) {
    var e = RJS.escapar;
    var categoria = RJS.obterCategoria(p.categoria);
    var emPromo = p.precoAntigo && p.precoAntigo > p.preco;
    var etiquetas = "";
    if (emPromo) {
      var desconto = Math.round((1 - p.preco / p.precoAntigo) * 100);
      etiquetas += '<span class="etiqueta etiqueta--promo">-' + desconto + "%</span>";
    }
    if (p.novo) etiquetas += '<span class="etiqueta etiqueta--novo">Novo</span>';

    var url = "produto.html?id=" + encodeURIComponent(p.id);
    var botao = p.tamanhos && p.tamanhos.length
      ? '<a class="btn btn--claro cartao-produto__rapido" href="' + url + '">Escolher tamanho</a>'
      : '<button class="btn btn--claro cartao-produto__rapido" data-adicionar="' + e(p.id) + '">Adicionar ao carrinho</button>';

    return (
      '<article class="cartao-produto">' +
      '  <div class="cartao-produto__media">' +
      '    <span class="cartao-produto__marcador" aria-hidden="true">' + e(RJS.iniciais(p.nome)) + "</span>" +
      '    <img src="' + e(p.imagem) + '" alt="' + e(p.nome) + '" loading="lazy" onerror="this.remove()">' +
      '    <div class="cartao-produto__etiquetas">' + etiquetas + "</div>" +
      botao +
      "  </div>" +
      '  <div class="cartao-produto__info">' +
      (categoria ? '<div class="cartao-produto__categoria">' + e(categoria.nome) + "</div>" : "") +
      '    <h3 class="cartao-produto__nome"><a href="' + url + '">' + e(p.nome) + "</a></h3>" +
      '    <div class="preco' + (emPromo ? " preco--promo" : "") + '">' +
      '      <span class="preco__atual">' + RJS.formatarPreco(p.preco) + "</span>" +
      (emPromo ? '<span class="preco__antigo">' + RJS.formatarPreco(p.precoAntigo) + "</span>" : "") +
      "    </div>" +
      "  </div>" +
      "</article>"
    );
  };

  /* ---------- Aviso rápido (toast) ---------- */
  var temporizador;
  RJS.aviso = function (mensagem) {
    var el = document.querySelector(".aviso");
    if (!el) {
      el = document.createElement("div");
      el.className = "aviso";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = mensagem;
    el.classList.add("visivel");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { el.classList.remove("visivel"); }, 2600);
  };

  /* ---------- Animação de entrada dos cartões de produto ----------
     Os cartões aparecem com um leve deslize quando chegam ao ecrã,
     um de cada vez dentro da mesma linha. Funciona também para os
     cartões desenhados depois (filtros da loja, relacionados…). */
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.12 });

    var prepararCartoes = function (raiz) {
      var cartoes = (raiz.querySelectorAll ? raiz : document).querySelectorAll(".cartao-produto:not(.revelar)");
      cartoes.forEach(function (cartao) {
        var irmaos = cartao.parentNode ? Array.prototype.indexOf.call(cartao.parentNode.children, cartao) : 0;
        cartao.style.setProperty("--atraso", (irmaos % 4) * 80 + "ms");
        cartao.classList.add("revelar");
        observador.observe(cartao);
      });
    };

    new MutationObserver(function (mudancas) {
      mudancas.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches(".cartao-produto")) prepararCartoes(n.parentNode);
          else if (n.querySelector && n.querySelector(".cartao-produto")) prepararCartoes(n);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });

    prepararCartoes(document);
  }

  /* ---------- Adicionar rápido (produtos sem tamanho) ---------- */
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-adicionar]");
    if (!btn) return;
    ev.preventDefault();
    RJS.carrinho.adicionar(btn.getAttribute("data-adicionar"), 1, "");
    if (RJS.abrirCarrinho) RJS.abrirCarrinho();
  });

  /* ---------- Rodapé ---------- */
  var ICONES_SOCIAIS = {
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2Z"/></svg>'
  };

  function montarRodape() {
    var alvo = document.getElementById("rodape");
    if (!alvo) return;
    var l = RJS.loja;
    var categorias = RJS.categorias.map(function (c) {
      return '<li><a href="loja.html?c=' + c.id + '">' + c.nome + "</a></li>";
    }).join("");

    alvo.outerHTML =
      '<footer class="rodape">' +
      '  <div class="container">' +
      '    <div class="rodape__grelha">' +
      '      <div class="rodape__marca">' +
      '        <a href="index.html" class="logotipo">R<span>J.</span>Sports</a>' +
      '        <p class="rodape__descricao">Artigos de desporto com entrega em todo Moçambique. Encomende online e pague apenas quando receber.</p>' +
      '        <div class="rodape__sociais">' +
      '          <a href="' + l.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICONES_SOCIAIS.instagram + "</a>" +
      '          <a href="' + l.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICONES_SOCIAIS.facebook + "</a>" +
      '          <a href="https://wa.me/' + l.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICONES_SOCIAIS.whatsapp + "</a>" +
      "        </div>" +
      "      </div>" +
      "      <div><h3>Comprar</h3><ul class=\"rodape__links\">" + categorias + '<li><a href="loja.html">Ver tudo</a></li></ul></div>' +
      '      <div><h3>Ajuda</h3><ul class="rodape__links">' +
      '        <li><a href="acompanhar.html">Acompanhar encomenda</a></li>' +
      '        <li><a href="sobre.html">Sobre nós</a></li>' +
      '        <li><a href="contactos.html">Contactos</a></li>' +
      "      </ul></div>" +
      '      <div><h3>Fale connosco</h3><ul class="rodape__links">' +
      '        <li><a href="https://wa.me/' + l.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
      '        <li><a href="tel:' + l.telefone.replace(/\s/g, "") + '">' + l.telefone + "</a></li>" +
      "        <li><span>" + l.cidade + "</span></li>" +
      "      </ul></div>" +
      "    </div>" +
      '    <div class="rodape__base">' +
      "      <span>© " + new Date().getFullYear() + " " + l.nome + ". Todos os direitos reservados.</span>" +
      "      <span>Preços em meticais (MT)</span>" +
      "    </div>" +
      "  </div>" +
      "</footer>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montarRodape);
  } else {
    montarRodape();
  }
})();
