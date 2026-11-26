/* ==========================================================
   RJ SPORTS — Página de produto (produto.html?id=...)
   ========================================================== */

(function () {
  var alvo = document.getElementById("produto");
  if (!alvo) return;

  var e = RJS.escapar;
  var id = new URLSearchParams(location.search).get("id");
  var p = id ? RJS.obterProduto(id) : null;

  var ICONES = {
    dinheiro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
    camiao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/></svg>',
    telefone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.8-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2Z"/></svg>'
  };

  /* ---------- Produto inexistente ---------- */
  if (!p) {
    alvo.innerHTML =
      '<div class="produto-vazio">' +
      "<h1>Produto não encontrado</h1>" +
      "<p>Este produto pode ter sido removido ou o endereço está incorreto.</p>" +
      '<a class="btn" href="loja.html">Ver todos os produtos</a></div>';
    document.title = "Produto não encontrado — RJ Sports";
    return;
  }

  var categoria = RJS.obterCategoria(p.categoria);
  var temTamanhos = p.tamanhos && p.tamanhos.length > 0;
  var emPromo = p.precoAntigo && p.precoAntigo > p.preco;
  var estado = { tamanho: "", quantidade: 1 };

  document.title = p.nome + " — RJ Sports";

  /* "Para: Homem · Mulher" e, para criança, as idades */
  function htmlPublico() {
    var publicos = (p.publico || []).map(function (id) {
      var x = RJS.obterPublico(id);
      return x ? '<a href="loja.html?p=' + id + '">' + e(x.nome) + "</a>" : "";
    }).filter(Boolean);
    var idades = (p.idades || []).map(function (id) {
      var x = RJS.obterIdade(id);
      return x ? e(x.nome) : "";
    }).filter(Boolean);
    if (!publicos.length && !idades.length) return "";
    return (
      '<ul class="produto__publico">' +
      (publicos.length ? "<li><span>Para:</span> " + publicos.join(" · ") + "</li>" : "") +
      (idades.length ? "<li><span>Idades:</span> " + idades.join(", ") + "</li>" : "") +
      "</ul>"
    );
  }

  /* ---------- Desenhar ---------- */
  var etiquetas = "";
  if (emPromo) etiquetas += '<span class="etiqueta etiqueta--promo">-' + Math.round((1 - p.preco / p.precoAntigo) * 100) + "%</span>";
  if (p.novo) etiquetas += '<span class="etiqueta etiqueta--novo">Novo</span>';

  var tamanhosHtml = temTamanhos
    ? '<div class="produto__bloco">' +
      '  <div class="produto__rotulo"><span>Tamanho: <strong id="tamanho-escolhido">escolha um</strong></span></div>' +
      '  <div class="produto__tamanhos" id="tamanhos" role="radiogroup" aria-label="Tamanho">' +
      p.tamanhos.map(function (t) {
        return '<label class="chip-tamanho"><input type="radio" name="tamanho" value="' + e(t) + '"><span>' + e(t) + "</span></label>";
      }).join("") +
      "  </div>" +
      '  <p class="produto__erro" id="erro-tamanho" role="alert" hidden>Escolha um tamanho para continuar.</p>' +
      "</div>"
    : "";

  alvo.innerHTML =
    '<nav class="migalhas" aria-label="Caminho">' +
    '  <a href="index.html">Início</a><span aria-hidden="true">/</span>' +
    '  <a href="loja.html">Loja</a><span aria-hidden="true">/</span>' +
    (categoria ? '<a href="loja.html?c=' + categoria.id + '">' + e(categoria.nome) + '</a><span aria-hidden="true">/</span>' : "") +
    "  <span>" + e(p.nome) + "</span>" +
    "</nav>" +

    '<div class="produto">' +
    '  <div class="produto__media">' +
    '    <div class="produto__imagem" id="imagem-produto">' +
    '      <span class="cartao-produto__marcador" aria-hidden="true">' + e(RJS.iniciais(p.nome)) + "</span>" +
    '      <img src="' + e(p.imagem) + '" alt="' + e(p.nome) + '" onerror="this.remove()">' +
    '      <div class="cartao-produto__etiquetas">' + etiquetas + "</div>" +
    "    </div>" +
    "  </div>" +

    '  <div class="produto__info">' +
    (categoria ? '<a class="produto__categoria" href="loja.html?c=' + categoria.id + '">' + e(categoria.nome) + "</a>" : "") +
    "    <h1>" + e(p.nome) + "</h1>" +
    htmlPublico() +
    '    <div class="preco produto__preco' + (emPromo ? " preco--promo" : "") + '">' +
    '      <span class="preco__atual">' + RJS.formatarPreco(p.preco) + "</span>" +
    (emPromo ? '<span class="preco__antigo">' + RJS.formatarPreco(p.precoAntigo) + "</span>" : "") +
    "    </div>" +
    '    <p class="produto__nota-pagamento">' + ICONES.dinheiro + " Paga apenas quando receber. Taxa de entrega confirmada por telefone.</p>" +
    (p.descricao ? '<p class="produto__resumo">' + e(p.descricao) + "</p>" : "") +
    tamanhosHtml +

    '    <div class="produto__bloco">' +
    '      <div class="produto__compra">' +
    '        <div class="quantidade" aria-label="Quantidade">' +
    '          <button type="button" data-qtd="-1" aria-label="Diminuir quantidade">−</button>' +
    '          <span id="quantidade">1</span>' +
    '          <button type="button" data-qtd="1" aria-label="Aumentar quantidade">+</button>' +
    "        </div>" +
    '        <button class="btn btn--destaque" id="adicionar">Adicionar ao carrinho</button>' +
    "      </div>" +
    '      <div class="produto__botoes">' +
    '        <button class="btn btn--contorno btn--bloco" id="encomendar">Encomendar já</button>' +
    '        <a class="btn btn--whatsapp btn--bloco" id="whatsapp" target="_blank" rel="noopener">' + ICONES.whatsapp + " Encomendar pelo WhatsApp</a>" +
    "      </div>" +
    "    </div>" +

    '    <ul class="produto__garantias">' +
    "      <li>" + ICONES.dinheiro + "<div><strong>Pagamento na entrega</strong><span>Em numerário ou M-Pesa / e-Mola, quando receber.</span></div></li>" +
    "      <li>" + ICONES.camiao + "<div><strong>Entregas em todo Moçambique</strong><span>Enviamos para todas as províncias.</span></div></li>" +
    "      <li>" + ICONES.telefone + "<div><strong>Confirmação por telefone</strong><span>Ligamos para confirmar a encomenda antes de enviar.</span></div></li>" +
    "    </ul>" +

    '    <div class="acordeao">' +
    "      <details open><summary>Descrição</summary>" +
    '        <div class="acordeao__corpo"><p>' + e(p.descricao || "Sem descrição.") + "</p></div></details>" +
    "      <details><summary>Entrega e pagamento</summary>" +
    '        <div class="acordeao__corpo"><ul>' +
    "          <li>Depois de encomendar, ligamos para confirmar os dados e a taxa de entrega.</li>" +
    "          <li>O prazo de entrega depende da sua província e é indicado na confirmação.</li>" +
    "          <li>Paga apenas no momento em que recebe o produto.</li>" +
    "        </ul></div></details>" +
    "    </div>" +
    "  </div>" +
    "</div>" +

    // Barra de compra fixa (só telemóvel)
    '<div class="barra-compra" id="barra-compra">' +
    '  <div class="barra-compra__info">' +
    '    <div class="barra-compra__nome">' + e(p.nome) + "</div>" +
    '    <div class="barra-compra__preco">' + RJS.formatarPreco(p.preco) + "</div>" +
    "  </div>" +
    '  <button class="btn btn--destaque" id="adicionar-barra">Adicionar</button>' +
    "</div>";

  /* ---------- Lógica ---------- */
  var elQtd = document.getElementById("quantidade");
  var elErro = document.getElementById("erro-tamanho");
  var elTamanhos = document.getElementById("tamanhos");
  var elWhats = document.getElementById("whatsapp");

  function atualizarWhatsapp() {
    var linhas = [
      "Olá RJ Sports! Quero encomendar:",
      "• " + p.nome + (estado.tamanho ? " (Tamanho " + estado.tamanho + ")" : ""),
      "• Quantidade: " + estado.quantidade,
      "• Preço: " + RJS.formatarPreco(p.preco * estado.quantidade),
      location.href
    ];
    elWhats.href = "https://wa.me/" + RJS.loja.whatsapp + "?text=" + encodeURIComponent(linhas.join("\n"));
  }

  function validarTamanho() {
    if (!temTamanhos || estado.tamanho) return true;
    elErro.hidden = false;
    elTamanhos.classList.remove("abanar");
    void elTamanhos.offsetWidth; // reinicia a animação
    elTamanhos.classList.add("abanar");
    elTamanhos.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  function adicionar() {
    if (!validarTamanho()) return false;
    RJS.carrinho.adicionar(p.id, estado.quantidade, estado.tamanho);
    return true;
  }

  if (elTamanhos) {
    elTamanhos.addEventListener("change", function (ev) {
      estado.tamanho = ev.target.value;
      document.getElementById("tamanho-escolhido").textContent = estado.tamanho;
      elErro.hidden = true;
      atualizarWhatsapp();
    });
  }

  alvo.addEventListener("click", function (ev) {
    var botaoQtd = ev.target.closest("[data-qtd]");
    if (botaoQtd) {
      estado.quantidade = Math.min(20, Math.max(1, estado.quantidade + Number(botaoQtd.getAttribute("data-qtd"))));
      elQtd.textContent = estado.quantidade;
      atualizarWhatsapp();
    }
  });

  document.getElementById("adicionar").addEventListener("click", function () {
    if (adicionar()) RJS.abrirCarrinho();
  });

  document.getElementById("adicionar-barra").addEventListener("click", function () {
    if (adicionar()) RJS.abrirCarrinho();
  });

  document.getElementById("encomendar").addEventListener("click", function () {
    if (adicionar()) location.href = "checkout.html";
  });

  elWhats.addEventListener("click", function (ev) {
    if (!validarTamanho()) ev.preventDefault();
  });

  atualizarWhatsapp();

  /* Zoom da imagem ao passar o rato (só em ecrãs com rato) */
  var caixaImagem = document.getElementById("imagem-produto");
  if (window.matchMedia("(hover: hover) and (min-width: 901px)").matches) {
    caixaImagem.addEventListener("mousemove", function (ev) {
      var img = caixaImagem.querySelector("img");
      if (!img) return;
      var r = caixaImagem.getBoundingClientRect();
      img.style.transformOrigin = ((ev.clientX - r.left) / r.width) * 100 + "% " + ((ev.clientY - r.top) / r.height) * 100 + "%";
      caixaImagem.classList.add("zoom");
    });
    caixaImagem.addEventListener("mouseleave", function () {
      caixaImagem.classList.remove("zoom");
    });
  }

  /* Barra fixa no telemóvel: aparece quando o botão principal sai do ecrã */
  var barra = document.getElementById("barra-compra");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      var e0 = entradas[0];
      barra.classList.toggle("visivel", !e0.isIntersecting && e0.boundingClientRect.top < 0);
    }).observe(document.getElementById("adicionar"));
  }

  /* ---------- Relacionados ---------- */
  var mesmos = RJS.produtos.filter(function (x) { return x.id !== p.id && x.categoria === p.categoria; });
  var outros = RJS.produtos.filter(function (x) { return x.id !== p.id && x.categoria !== p.categoria; });
  var relacionados = mesmos.concat(outros).slice(0, 4);
  if (relacionados.length) {
    document.getElementById("grelha-relacionados").innerHTML = relacionados.map(RJS.cartaoProduto).join("");
    document.getElementById("relacionados").hidden = false;
  }
})();
