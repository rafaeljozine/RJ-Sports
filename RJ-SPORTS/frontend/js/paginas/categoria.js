/* ==========================================================
   RJ SPORTS — código da página categoria.html
   (fora do HTML para a Content-Security-Policy não precisar
   de permitir scripts embutidos)
   ========================================================== */

(function () {
  var e = RJS.escapar;
  var seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function contar(filtro) {
    var n = RJS.produtos.filter(filtro).length;
    return n === 1 ? "1 produto" : n + " produtos";
  }

  // Para quem
  document.getElementById("grelha-publicos").innerHTML = RJS.publicos.map(function (p) {
    return (
      '<a class="cartao-publico" href="loja.html?p=' + p.id + '">' +
      '  <img' + RJS.atributosImagem(RJS.imagens.publicos[p.id], "(max-width: 700px) 100vw, 33vw") + ' alt="" loading="lazy" decoding="async" data-falha="remover">' +
      '  <span class="cartao-publico__contagem">' + contar(function (x) { return (x.publico || []).indexOf(p.id) > -1; }) + "</span>" +
      "  <h3>" + e(p.nome) + "</h3>" +
      "  <p>" + e(p.descricao) + "</p>" +
      '  <span class="cartao-publico__link">Ver produtos ' + seta + "</span>" +
      "</a>"
    );
  }).join("");

  // Por desporto
  document.getElementById("grelha-desportos").innerHTML = RJS.categorias.map(function (c) {
    return (
      '<a class="cartao-categoria cartao-categoria--' + c.id + '" href="loja.html?c=' + c.id + '">' +
      '  <img' + RJS.atributosImagem(RJS.imagens.categorias[c.id], "(max-width: 700px) 50vw, 25vw") + ' alt="" loading="lazy" decoding="async" data-falha="remover">' +
      '  <span class="cartao-categoria__seta" aria-hidden="true">' + seta + "</span>" +
      "  <div><h3>" + e(c.nome) + "</h3><p>" + e(c.descricao) + "</p>" +
      '  <span class="cartao-categoria__contagem">' + contar(function (x) { return x.categoria === c.id; }) + "</span></div>" +
      "</a>"
    );
  }).join("");

  // Crianças por idade
  document.getElementById("grelha-idades").innerHTML = RJS.idades.map(function (i) {
    return (
      '<a class="cartao-idade" href="loja.html?p=crianca&i=' + i.id + '">' +
      "  <strong>" + e(i.nome) + "</strong>" +
      "  <span>" + contar(function (x) { return (x.idades || []).indexOf(i.id) > -1; }) + "</span>" +
      "</a>"
    );
  }).join("");
})();
