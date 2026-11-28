/* ==========================================================
   RJ SPORTS — Carrinho (guardado no navegador)
   Cada linha: { id, tamanho, quantidade }
   Sempre que muda, dispara o evento "carrinho:atualizado".
   ========================================================== */

window.RJS = window.RJS || {};

RJS.carrinho = (function () {
  var CHAVE = "rjs_carrinho";
  var itens = ler();

  function ler() {
    try {
      var dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch (e) {
      /* navegador sem armazenamento: o carrinho dura só esta visita */
    }
    document.dispatchEvent(new CustomEvent("carrinho:atualizado"));
  }

  function procurar(id, tamanho) {
    return itens.findIndex(function (i) {
      return i.id === id && (i.tamanho || "") === (tamanho || "");
    });
  }

  return {
    /** Linhas do carrinho já com os dados do produto */
    linhas: function () {
      return itens
        .map(function (i) {
          var produto = RJS.obterProduto(i.id);
          return produto ? Object.assign({}, i, { produto: produto, subtotal: produto.preco * i.quantidade }) : null;
        })
        .filter(Boolean);
    },

    adicionar: function (id, quantidade, tamanho) {
      if (!RJS.obterProduto(id)) return;
      var pos = procurar(id, tamanho);
      if (pos > -1) {
        itens[pos].quantidade += quantidade || 1;
      } else {
        itens.push({ id: id, tamanho: tamanho || "", quantidade: quantidade || 1 });
      }
      guardar();
    },

    alterarQuantidade: function (id, tamanho, quantidade) {
      var pos = procurar(id, tamanho);
      if (pos === -1) return;
      if (quantidade <= 0) {
        itens.splice(pos, 1);
      } else {
        itens[pos].quantidade = Math.min(quantidade, 20);
      }
      guardar();
    },

    remover: function (id, tamanho) {
      var pos = procurar(id, tamanho);
      if (pos > -1) {
        itens.splice(pos, 1);
        guardar();
      }
    },

    limpar: function () {
      itens = [];
      guardar();
    },

    contagem: function () {
      return this.linhas().reduce(function (soma, l) { return soma + l.quantidade; }, 0);
    },

    total: function () {
      return this.linhas().reduce(function (soma, l) { return soma + l.subtotal; }, 0);
    }
  };
})();

/* Mantém o carrinho igual entre separadores abertos */
window.addEventListener("storage", function (e) {
  if (e.key === "rjs_carrinho") location.reload();
});

/* ==========================================================
   Ícones partilhados pelas páginas de carrinho e checkout
   ========================================================== */
RJS.iconesCompra = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2Z"/></svg>',
  dinheiro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  saco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
};

/** Linhas de texto com os artigos do carrinho (para mensagens de WhatsApp) */
RJS.textoArtigos = function (linhas) {
  return linhas.map(function (l) {
    return "• " + l.quantidade + "x " + l.produto.nome +
      (l.tamanho ? " (Tam. " + l.tamanho + ")" : "") +
      " — " + RJS.formatarPreco(l.subtotal);
  }).join("\n");
};

/* ==========================================================
   Página do carrinho (carrinho.html)
   ========================================================== */
(function () {
  function desenharPagina() {
    var alvo = document.getElementById("pagina-carrinho");
    if (!alvo) return;

    var e = RJS.escapar;
    var ic = RJS.iconesCompra;
    var linhas = RJS.carrinho.linhas();
    var contagem = RJS.carrinho.contagem();

    document.getElementById("contagem-carrinho").textContent =
      contagem ? "(" + contagem + (contagem === 1 ? " artigo)" : " artigos)") : "";

    if (!linhas.length) {
      alvo.innerHTML =
        '<div class="carrinho-vazio">' + ic.saco +
        "<h2>O seu carrinho está vazio</h2>" +
        "<p>Explore a loja e adicione os produtos que quer receber em casa.</p>" +
        '<a class="btn btn--destaque" href="loja.html">Ir para a loja</a></div>';
      return;
    }

    var itens = linhas.map(function (l) {
      var p = l.produto;
      var dados = ' data-id="' + e(p.id) + '" data-tamanho="' + e(l.tamanho) + '" data-qtd="' + l.quantidade + '"';
      var url = "produto.html?id=" + encodeURIComponent(p.id);
      return (
        '<div class="item-carrinho">' +
        '  <div class="item-carrinho__produto">' +
        '    <a class="item-carrinho__media" href="' + url + '">' +
        '      <span class="cartao-produto__marcador" aria-hidden="true">' + e(RJS.iniciais(p.nome)) + "</span>" +
        '      <img' + RJS.atributosImagem(p.imagem, "120px") + ' alt="" loading="lazy" decoding="async" onerror="this.remove()">' +
        "    </a>" +
        "    <div>" +
        '      <a class="item-carrinho__nome" href="' + url + '">' + e(p.nome) + "</a>" +
        '      <div class="item-carrinho__detalhe">' + (l.tamanho ? "Tamanho: " + e(l.tamanho) + " · " : "") + RJS.formatarPreco(p.preco) + "</div>" +
        '      <button class="item-carrinho__remover" data-carrinho-acao="remover"' + dados + ">Remover</button>" +
        "    </div>" +
        "  </div>" +
        '  <div class="quantidade" aria-label="Quantidade">' +
        '    <button data-carrinho-acao="menos"' + dados + ' aria-label="Diminuir quantidade">−</button>' +
        "    <span>" + l.quantidade + "</span>" +
        '    <button data-carrinho-acao="mais"' + dados + ' aria-label="Aumentar quantidade">+</button>' +
        "  </div>" +
        '  <div class="item-carrinho__total">' + RJS.formatarPreco(l.subtotal) + "</div>" +
        "</div>"
      );
    }).join("");

    var total = RJS.carrinho.total();
    var mensagem = "Olá RJ Sports! Quero encomendar:\n" + RJS.textoArtigos(linhas) +
      "\nTotal: " + RJS.formatarPreco(total);

    alvo.innerHTML =
      '<div class="carrinho">' +
      "  <section aria-label=\"Artigos\">" +
      '    <div class="carrinho__cabecalho"><span>Produto</span><span>Quantidade</span><span>Total</span></div>' +
      itens +
      '    <a class="link-sublinhado carrinho__continuar" href="loja.html">← Continuar a comprar</a>' +
      "  </section>" +
      '  <aside class="resumo" aria-label="Resumo">' +
      "    <h2>Resumo</h2>" +
      '    <div class="resumo__linha"><span>Subtotal</span><span>' + RJS.formatarPreco(total) + "</span></div>" +
      '    <div class="resumo__linha"><span>Entrega</span><span>Confirmada por telefone</span></div>' +
      '    <div class="resumo__linha resumo__linha--total"><span>Total</span><span>' + RJS.formatarPreco(total) + "</span></div>" +
      '    <p class="resumo__nota">' + ic.dinheiro + "<span><strong>Paga só quando receber.</strong> Não precisa de cartão: paga em numerário ou M-Pesa / e-Mola na entrega.</span></p>" +
      '    <div class="resumo__botoes">' +
      '      <a class="btn btn--destaque btn--bloco" href="checkout.html">Finalizar encomenda</a>' +
      '      <a class="btn btn--whatsapp btn--bloco" target="_blank" rel="noopener" href="https://wa.me/' + RJS.loja.whatsapp +
      "?text=" + encodeURIComponent(mensagem) + '">' + ic.whatsapp + " Encomendar pelo WhatsApp</a>" +
      "    </div>" +
      "  </aside>" +
      "</div>";
  }

  // Os botões +, − e Remover já são tratados em navbar.js (data-carrinho-acao)
  document.addEventListener("carrinho:atualizado", desenharPagina);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", desenharPagina);
  } else {
    desenharPagina();
  }
})();
